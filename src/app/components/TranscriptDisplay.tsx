'use client'

import { useState } from 'react'
import { Volume2, Copy, RotateCw, ArrowLeftRight } from 'lucide-react'

interface LanguageOption {
    code: string
    name: string
    flag: string
}

interface TranscriptDisplayProps {
    originalTranscript: string
    translatedTranscript: string
    onSourceLanguageChange: (language: string) => void
    onTargetLanguageChange: (language: string) => void
    sourceLanguage: string
    targetLanguage: string
    isTranslating?: boolean
    onSwitchLanguages?: () => void;
}

const languageOptions: LanguageOption[] = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
]

export default function TranscriptDisplay({
    originalTranscript,
    translatedTranscript,
    onSourceLanguageChange,
    onTargetLanguageChange,
    onSwitchLanguages,
    sourceLanguage,
    targetLanguage,
    isTranslating = false,
}: TranscriptDisplayProps) {
    const [copiedOriginal, setCopiedOriginal] = useState(false)
    const [copiedTranslated, setCopiedTranslated] = useState(false)

    const handleCopy = (text: string, setCopied: (value: boolean) => void) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }


    const playAudio = (text: any, code: string) => {
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}&lang=${code}`)
        audio.play();
    }

    const handleSpeak = (text: string, lang: string) => {
        playAudio(text, lang);
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative">
                {/* Source Language Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                Source Language
                            </label>
                            <div className="relative w-48">
                                <select
                                    name="languageSelector"
                                    value={sourceLanguage}
                                    onChange={(e) => onSourceLanguageChange(e.target.value)}
                                    className="w-full pl-3 pr-10 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                >
                                    {languageOptions.map((language) => (
                                        <option key={language.code} value={language.code}>
                                            {language.flag} {language.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="relative min-h-[200px]">
                            <div className="absolute inset-0 overflow-y-auto max-h-[200px]">
                                {originalTranscript ? (
                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {originalTranscript}
                                    </p>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 italic text-center">
                                            Speak to see transcript here...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                {originalTranscript.split(/\s+/).filter(word => word.length > 0).length} words
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleCopy(originalTranscript, setCopiedOriginal)}
                                    disabled={!originalTranscript}
                                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Copy text"
                                >
                                    <Copy size={16} />
                                    {copiedOriginal && (
                                        <span className="absolute -top-2 -right-2 text-xs text-green-600 font-medium">
                                            ✓
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleSpeak(originalTranscript, sourceLanguage)}
                                    disabled={!originalTranscript}
                                    className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Listen"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Switch Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <button
                        onClick={onSwitchLanguages}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full shadow-md transition-colors"
                        title="Switch languages"
                    >
                        <ArrowLeftRight size={20} className="text-white" />
                    </button>
                </div>

                {/* Target Language Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                Translation
                            </label>
                            <div className="relative w-48">
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => onTargetLanguageChange(e.target.value)}
                                    className="w-full pl-3 pr-10 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                >
                                    {languageOptions.map((language) => (
                                        <option key={language.code} value={language.code}>
                                            {language.flag} {language.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="relative min-h-[200px]">
                            {isTranslating && !translatedTranscript ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <RotateCw size={16} className="animate-spin" />
                                        <span className="text-sm">Translating...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 overflow-y-auto max-h-[200px]">
                                    {translatedTranscript ? (
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {translatedTranscript}
                                        </p>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-400 italic text-center">
                                                Translation will appear here...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                {translatedTranscript.split(/\s+/).filter(word => word.length > 0).length} words
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleCopy(translatedTranscript, setCopiedTranslated)}
                                    disabled={!translatedTranscript}
                                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Copy translation"
                                >
                                    <Copy size={16} />
                                    {copiedTranslated && (
                                        <span className="absolute -top-2 -right-2 text-xs text-green-600 font-medium">
                                            ✓
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleSpeak(translatedTranscript, targetLanguage)}
                                    disabled={!translatedTranscript}
                                    className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Listen to translation"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Arrow */}
            <div className="hidden md:flex items-center justify-center my-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    )
}