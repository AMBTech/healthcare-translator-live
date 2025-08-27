'use client'

import { useEffect, useCallback } from 'react'

export function useSessionManagement() {
    // Clear all sensitive data on page refresh or close
    const clearSessionData = useCallback(() => {
        localStorage.removeItem('transcriptData');
        sessionStorage.removeItem('transcriptData');
    }, []);

    // Save data temporarily (only for current session)
    const saveTemporaryData = useCallback((key: string, data: unknown) => {
        sessionStorage.setItem(key, JSON.stringify(data));
    }, []);

    // Load temporary data
    const loadTemporaryData = useCallback(<T>(key: string): T | null => {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }, []);

    // Clear specific temporary data
    const clearTemporaryData = useCallback((key: string) => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(key);
        }
    }, []);

    // Clear all data on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            clearSessionData();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearSessionData();
        };
    }, [clearSessionData]);

    // Auto-clear after 30 minutes of inactivity
    useEffect(() => {
        const inactivityTimer = setTimeout(() => {
            clearSessionData();
        }, 30 * 60 * 1000); // 30 minutes

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            setTimeout(() => {
                clearSessionData();
            }, 30 * 60 * 1000);
        };

        // Reset timer on user activity
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer);

        return () => {
            clearTimeout(inactivityTimer);
            window.removeEventListener('mousedown', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [clearSessionData]);

    return {
        clearSessionData,
        saveTemporaryData,
        loadTemporaryData,
        clearTemporaryData
    };
}