// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting setup
const rateLimitMap = new Map();
const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // maximum requests per window
};

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check (basic implementation)
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0] || realIP || 'unknown';
        const now = Date.now();
        const windowStart = now - RATE_LIMIT.windowMs;

        // Clean up old entries
        for (const [key, timestamps] of rateLimitMap.entries()) {
            rateLimitMap.set(key, timestamps.filter((time: number) => time > windowStart));
        }

        // Check rate limit
        const requestTimestamps = rateLimitMap.get(ip) || [];
        if (requestTimestamps.length >= RATE_LIMIT.maxRequests) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        requestTimestamps.push(now);
        rateLimitMap.set(ip, requestTimestamps);

        const { text, sourceLanguage, targetLanguage } = await request.json()

        if (!text || !sourceLanguage || !targetLanguage) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Additional validation
        if (text.length > 1000) {
            return NextResponse.json(
                { error: 'Text too long. Maximum 1000 characters allowed.' },
                { status: 400 }
            )
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        // Get language names for better prompting
        const languageMap: { [key: string]: string } = {
            'en-US': 'English',
            'es-ES': 'Spanish',
            'fr-FR': 'French',
            'de-DE': 'German',
            'it-IT': 'Italian',
            'pt-PT': 'Portuguese',
            'zh-CN': 'Chinese',
            'ja-JP': 'Japanese',
            'ru-RU': 'Russian',
            'ur-PK': 'Urdu',
            'hi-IN': 'Hindi',
            'ar-SA': 'Arabic'
        }

        const sourceLangName = languageMap[sourceLanguage] || sourceLanguage
        const targetLangName = languageMap[targetLanguage] || targetLanguage

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a professional medical translator. Translate the following text from ${sourceLangName} to ${targetLangName}. Provide only the translation without any additional text or explanations. Maintain medical terminology accuracy.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 1000,
            temperature: 0.1, // Low temperature for accurate translations
        })

        const translation = response.choices[0]?.message?.content?.trim()

        if (!translation) {
            throw new Error('No translation received from OpenAI')
        }

        return NextResponse.json({ translation })
    } catch (error) {
        console.error('Translation error:', error)
        return NextResponse.json(
            { error: 'Failed to translate text' },
            { status: 500 }
        )
    }
}