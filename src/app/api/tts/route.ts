import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'en-US';

    if (!text) {
        return NextResponse.json({ error: 'Missing "text" query param' }, { status: 400 });
    }

    // get the google service account key
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE;

    // if not config found
    if (!serviceAccountKey) {
        return NextResponse.json(
            { error: 'TTS service not configured' },
            { status: 500 }
        );
    }

    // this file will be in string format, so parse it to proper json format
    let credentials;
    try {
        credentials = JSON.parse(serviceAccountKey);
    } catch (parseError) {
        return NextResponse.json(
            { error: 'Invalid service account config' },
            { status: 500 }
        );
    }

    const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');

    const client = new TextToSpeechClient({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key.replace(/\\n/g, '\n')
        },
        projectId: credentials.project_id
    });

    try {
        const request = {
            input: { text },
            voice: { languageCode: lang, ssmlGender: 'NEUTRAL' as const },
            audioConfig: { audioEncoding: 'MP3' as const }
        };

        const [response] = await client.synthesizeSpeech(request);

        return new NextResponse(Buffer.from(response.audioContent as Uint8Array), {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'inline; filename="speech.mp3'
            }
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }
}
