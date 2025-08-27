// src/app/settings/page.tsx
'use client'

import { Check } from 'lucide-react'
import { useLanguageSettings } from '@/hooks/useLanguageSettings'

const languages = [
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

export default function Settings() {
    const { settings, updateSettings, isLoaded } = useLanguageSettings()

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Source Language Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Input Language</h2>
                <div className="space-y-2">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => updateSettings({ sourceLanguage: language.code })}
                            className={`w-full p-3 rounded-lg border transition-colors ${settings.sourceLanguage === language.code
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{language.flag}</span>
                                    <span className="text-left">{language.name}</span>
                                </div>
                                {settings.sourceLanguage === language.code && (
                                    <Check size={20} className="text-blue-600" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Target Language Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Output Language</h2>
                <div className="space-y-2">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => updateSettings({ targetLanguage: language.code })}
                            className={`w-full p-3 rounded-lg border transition-colors ${settings.targetLanguage === language.code
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{language.flag}</span>
                                    <span className="text-left">{language.name}</span>
                                </div>
                                {settings.targetLanguage === language.code && (
                                    <Check size={20} className="text-blue-600" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">App Information</h2>
                <p className="text-gray-600 text-sm">
                    Healthcare Translator v1.0.0
                </p>
                <p className="text-gray-600 text-sm mt-2">
                    Powered by OpenAI for accurate medical translations.
                </p>
            </div>
        </div>
    )
}