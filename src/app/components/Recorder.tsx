// src/app/components/Recorder.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Square, RotateCw, VolumeX } from 'lucide-react'

interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor
        webkitSpeechRecognition: SpeechRecognitionConstructor
    }
}

interface RecorderProps {
    onTranscriptChange: (transcript: string) => void
    language?: string
}

export default function Recorder({ onTranscriptChange, language = 'en-US' }: RecorderProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const finalTranscriptRef = useRef('')

    const initializeRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
            setError('Speech recognition is not supported in your browser.')
            return null
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = language

        recognition.onstart = () => {
            setIsProcessing(false)
            setError(null)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const currentTranscript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += currentTranscript + ' '
                } else {
                    interimTranscript += currentTranscript
                }
            }

            const fullTranscript = finalTranscriptRef.current + interimTranscript
            setTranscript(fullTranscript)
            onTranscriptChange(fullTranscript)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error)

            // Don't show "no-speech" errors as they're common during pauses
            if (event.error !== 'no-speech') {
                setError(`Speech recognition error: ${event.error}`)
            }

            setIsListening(false)
            setIsProcessing(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            setIsProcessing(false)
        }

        return recognition
    }, [language, onTranscriptChange])

    useEffect(() => {
        if (!isSupported) return

        // Initialize recognition on mount
        recognitionRef.current = initializeRecognition()

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null // Prevent memory leaks
                recognitionRef.current.stop()
            }
        }
    }, [isSupported, initializeRecognition])

    const toggleListening = () => {
        if (!isSupported) return

        const recognition = recognitionRef.current
        if (!recognition) return

        if (!isListening) {
            try {
                // Reset transcript when starting new recording
                finalTranscriptRef.current = ''
                setTranscript('')
                onTranscriptChange('')

                // Reinitialize recognition to avoid "aborted" error
                recognitionRef.current = initializeRecognition()
                recognitionRef.current?.start()
                setIsListening(true)
                setError(null)
            } catch (error) {
                setError('Failed to start speech recognition. Please try again.')
                console.error('Error starting speech recognition:', error)
                setIsListening(false)
            }
        } else {
            try {
                recognition.stop()
                setIsListening(false)
                setIsProcessing(false)
            } catch (error) {
                console.error('Error stopping speech recognition:', error)
                setIsListening(false)
                setIsProcessing(false)
            }
        }
    }

    const clearTranscript = () => {
        finalTranscriptRef.current = ''
        setTranscript('')
        onTranscriptChange('')
    }

    const resetRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = initializeRecognition()
            setError(null)
        }
    }

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800">
                <p className="font-medium">Browser Not Supported</p>
                <p className="text-sm mt-1">
                    Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-800 text-sm">
                    <div className="flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={resetRecognition}
                            className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Transcript Display */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live Transcript
                </label>
                <div className="min-h-[100px] p-3 border border-gray-300 rounded-lg bg-white text-black">
                    {transcript || (
                        <p className="text-gray-500 italic">
                            {isListening ? 'Listening... Speak now.' : 'Click the microphone to start speaking...'}
                        </p>
                    )}
                </div>

                {/* Word count */}
                {transcript && (
                    <div className="text-xs text-gray-500 mt-1">
                        {transcript.split(/\s+/).filter(word => word.length > 0).length} words
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${isListening
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                >
                    {isProcessing ? (
                        <RotateCw size={20} className="animate-spin" />
                    ) : isListening ? (
                        <Square size={20} className="fill-current" />
                    ) : (
                        <Mic size={20} />
                    )}
                </button>

                {transcript && (
                    <button
                        onClick={clearTranscript}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Clear
                    </button>
                )}

                <div className="text-sm text-gray-600">
                    {isProcessing ? (
                        <div className="flex items-center">
                            <RotateCw size={14} className="animate-spin mr-2" />
                            Processing...
                        </div>
                    ) : isListening ? (
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                            Listening...
                        </div>
                    ) : (
                        'Ready to record'
                    )}
                </div>
            </div>

            {/* Tips for better recognition */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-semibold mb-1">Tips for better recognition:</p>
                <ul className="text-xs text-blue-800 list-disc list-inside space-y-1">
                    <li>Speak clearly and at a moderate pace</li>
                    <li>Use a quiet environment</li>
                    <li>Keep the microphone close to your mouth</li>
                    <li>Allow microphone permissions in your browser</li>
                    <li>If errors occur, click "Reset" to restart recognition</li>
                </ul>
            </div>
        </div>
    )
}