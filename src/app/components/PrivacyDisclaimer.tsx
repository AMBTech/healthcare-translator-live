// src/app/components/PrivacyDisclaimer.tsx
export default function PrivacyDisclaimer() {
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Privacy & Security Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p className="font-semibold">For demo purposes only. Not for official medical use.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>No data is permanently stored</li>
                            <li>Sensitive information is automatically masked</li>
                            <li>Do not enter real patient information</li>
                            <li>Not for actual medical translation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}