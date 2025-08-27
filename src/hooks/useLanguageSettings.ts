// src/hooks/useLanguageSettings.ts
'use client'

import { useState, useEffect } from 'react'

export interface LanguageSettings {
    sourceLanguage: string
    targetLanguage: string
}

export function useLanguageSettings() {
    const [settings, setSettings] = useState<LanguageSettings>({
        sourceLanguage: 'en-US',
        targetLanguage: 'es-ES'
    })

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedSettings = localStorage.getItem('languageSettings')
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings))
            } catch (error) {
                console.error('Error parsing saved language settings:', error)
            }
        }
        setIsLoaded(true)
    }, [])

    const updateSettings = (newSettings: Partial<LanguageSettings>) => {
        const updatedSettings = { ...settings, ...newSettings }
        setSettings(updatedSettings)
        localStorage.setItem('languageSettings', JSON.stringify(updatedSettings))
    }

    return {
        settings,
        updateSettings,
        isLoaded
    }
}