// src/app/components/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages, Settings } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg">
            <div className="container mx-auto">
                <div className="flex justify-around">
                    <Link
                        href="/"
                        className={`flex flex-col items-center p-3 ${pathname === '/' ? 'text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        <Languages size={24} />
                        <span className="text-xs mt-1">Translator</span>
                    </Link>
                    <Link
                        href="/settings"
                        className={`flex flex-col items-center p-3 ${pathname === '/settings' ? 'text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        <Settings size={24} />
                        <span className="text-xs mt-1">Settings</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}