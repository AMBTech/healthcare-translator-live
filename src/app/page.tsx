// src/app/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Recorder from './components/Recorder'
import TranscriptDisplay from './components/TranscriptDisplay'
import { useLanguageSettings } from '@/hooks/useLanguageSettings'
import { useSessionManagement } from '@/hooks/useSessionManagement'
import { maskSensitiveData } from '@/utils/maskSensitiveData'
import PrivacyDisclaimer from './components/PrivacyDisclaimer'
import { ArrowLeftRight } from 'lucide-react'

declare global {
  interface Window {
    __speakingTimeout?: number
  }
}

// Debounce function to limit API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Translator() {
  const { settings, updateSettings, isLoaded } = useLanguageSettings()
  const { saveTemporaryData, loadTemporaryData, clearTemporaryData } = useSessionManagement()
  const [originalTranscript, setOriginalTranscript] = useState('')
  const [translatedTranscript, setTranslatedTranscript] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)

  // Refs to track the last request and prevent duplicate calls
  const lastRequestRef = useRef<{
    text: string
    sourceLanguage: string
    targetLanguage: string
  } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isSpeakingRef = useRef(false)

  // Debounce the original transcript to prevent excessive API calls
  const debouncedTranscript = useDebounce(originalTranscript, 1500) // 1.5 second delay

  // Load temporary data on component mount
  useEffect(() => {
    const savedData = loadTemporaryData<{
      original: string
      translated: string
    }>('transcriptData')

    if (savedData) {
      setOriginalTranscript(savedData.original)
      setTranslatedTranscript(savedData.translated)
    }
  }, [loadTemporaryData])

  // Save data to session storage whenever it changes
  useEffect(() => {
    if (originalTranscript || translatedTranscript) {
      saveTemporaryData('transcriptData', {
        original: originalTranscript,
        translated: translatedTranscript
      })
    } else {
      clearTemporaryData('transcriptData')
    }
  }, [originalTranscript, translatedTranscript, saveTemporaryData, clearTemporaryData])

  // Real-time translation with OpenAI
  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
    if (!text.trim()) {
      setTranslatedTranscript('')
      lastRequestRef.current = null
      return
    }

    // Don't translate while user is still speaking (unless it's a language change)
    if (isSpeakingRef.current && sourceLang === lastRequestRef.current?.sourceLanguage) {
      return
    }

    // Check if this is a duplicate request
    const currentRequest = { text, sourceLanguage: sourceLang, targetLanguage: targetLang }
    if (lastRequestRef.current &&
      lastRequestRef.current.text === currentRequest.text &&
      lastRequestRef.current.sourceLanguage === currentRequest.sourceLanguage &&
      lastRequestRef.current.targetLanguage === currentRequest.targetLanguage) {
      return // Skip duplicate request
    }

    lastRequestRef.current = currentRequest

    // Abort previous request if it's still ongoing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setIsTranslating(true)
    setTranslationError(null)

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Apply masking AFTER translation
      const maskedTranslation = maskSensitiveData(data.translation)
      setTranslatedTranscript(maskedTranslation)
    } catch (error: unknown | any) {
      // Don't show errors for aborted requests
      if (error.name === 'AbortError') {
        console.log('Translation request aborted')
        return
      }

      console.error('Translation error:', error)
      setTranslationError(error instanceof Error ? error.message : 'Translation failed')
      setTranslatedTranscript('Translation unavailable. Please try again.')
    } finally {
      setIsTranslating(false)
      abortControllerRef.current = null
    }
  }, [])

  // Effect to handle translation when debounced transcript changes
  useEffect(() => {
    if (debouncedTranscript.trim()) {
      translateText(debouncedTranscript, settings.sourceLanguage, settings.targetLanguage)
    } else {
      setTranslatedTranscript('')
    }
  }, [debouncedTranscript, settings.sourceLanguage, settings.targetLanguage, translateText])

  // Effect to handle immediate translation on language changes
  useEffect(() => {
    if (originalTranscript.trim()) {
      // Force immediate translation when languages change
      translateText(originalTranscript, settings.sourceLanguage, settings.targetLanguage)
    }
  }, [settings.sourceLanguage, settings.targetLanguage, originalTranscript, translateText])

  const handleTranscriptChange = useCallback((newTranscript: string) => {
    // Mask sensitive data in the original transcript display
    const maskedTranscript = maskSensitiveData(newTranscript)
    setOriginalTranscript(maskedTranscript)

    // Set speaking state based on whether transcript is changing rapidly
    isSpeakingRef.current = true
    // clearTimeout(isSpeakingRef.current as any)
    // isSpeakingRef.current = setTimeout(() => {
    //   isSpeakingRef.current = false
    // }, 2000) as any
    if (typeof window !== 'undefined') {
      window.clearTimeout(window.__speakingTimeout)
      window.__speakingTimeout = window.setTimeout(() => {
        isSpeakingRef.current = false;
      }, 2000)
    }
  }, [])

  const handleSourceLanguageChange = (newLanguage: string) => {
    if (settings.sourceLanguage !== newLanguage) {
      updateSettings({ sourceLanguage: newLanguage })
    }
  }

  const handleTargetLanguageChange = (newLanguage: string) => {
    if (settings.targetLanguage !== newLanguage) {
      updateSettings({ targetLanguage: newLanguage })
    }
  }

  // Switch languages between source and target
  const switchLanguages = () => {
    const currentSource = settings.sourceLanguage
    const currentTarget = settings.targetLanguage

    if (currentSource !== currentTarget) {
      updateSettings({
        sourceLanguage: currentTarget,
        targetLanguage: currentSource
      })

      // Also swap the transcripts if we have content
      if (originalTranscript && translatedTranscript) {
        setOriginalTranscript(translatedTranscript)
        setTranslatedTranscript(originalTranscript)
      }
    }
  }

  // Clear all data function
  const clearAllData = () => {
    setOriginalTranscript('')
    setTranslatedTranscript('')
    clearTemporaryData('transcriptData')
    setTranslationError(null)
    lastRequestRef.current = null
    isSpeakingRef.current = false

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Healthcare Translator</h1>
              <p className="text-gray-600 text-sm mt-1">Real-time medical translation with speech recognition</p>
            </div>
            <button
              onClick={clearAllData}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          </div>

          {/* Security Status */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-800">
                Security enabled • No permanent storage • Translation debounced
              </span>
            </div>
          </div>

          {/* Error Message */}
          {translationError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-800 text-sm">
              {translationError}
              <button
                onClick={() => setTranslationError(null)}
                className="ml-2 text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Transcript Display */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <TranscriptDisplay
              originalTranscript={originalTranscript}
              translatedTranscript={translatedTranscript}
              onSourceLanguageChange={handleSourceLanguageChange}
              onTargetLanguageChange={handleTargetLanguageChange}
              sourceLanguage={settings.sourceLanguage}
              targetLanguage={settings.targetLanguage}
              isTranslating={isTranslating}
              onSwitchLanguages={switchLanguages}
            />
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            {/* Speech Recorder */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Speech Recognition
              </h3>
              <Recorder
                onTranscriptChange={handleTranscriptChange}
                language={settings.sourceLanguage}
              />
            </div>

            {/* Manual Input */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Manual Input
              </h3>
              <textarea
                value={originalTranscript}
                onChange={(e) => setOriginalTranscript(maskSensitiveData(e.target.value))}
                placeholder="Type text to translate here... (sensitive data will be masked)"
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Translation will occur 1.5 seconds after you stop typing
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Disclaimer */}
        <PrivacyDisclaimer />
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isTranslating ? 'Translating...' :
                originalTranscript ? `${originalTranscript.split(/\s+/).filter(word => word.length > 0).length} words` :
                  'Ready to translate'}
              {isSpeakingRef.current && ' • Speaking...'}
            </div>

            <div className="flex items-center space-x-3">
              {/* Switch Languages Button */}
              <button
                onClick={switchLanguages}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                title="Switch languages"
              >
                <ArrowLeftRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}