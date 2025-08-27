/**
 * Masks sensitive information in transcripts
 * For demo purposes only - not a replacement for proper data anonymization
 */

// Patterns for sensitive data detection
export const maskSensitiveData = (text: string): string => {
    if (!text) return text;

    let maskedText = text;

    // Mask phone numbers
    maskedText = maskedText.replace(/(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})/g, '[PHONE]');

    // Mask email addresses
    maskedText = maskedText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

    // Mask patient IDs (common patterns like MRN numbers)
    maskedText = maskedText.replace(/\b\d{5,10}\b/g, (match) => {
        // Only mask numbers that look like IDs, not general numbers
        return match.length >= 5 ? '[ID]' : match;
    });

    // Mask dates (partial masking)
    maskedText = maskedText.replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, '[DATE]');

    // Mask common healthcare identifiers
    const healthPatterns = [
        /\bMRN\s*\:?\s*\d+\b/gi,
        /\bSSN\s*\:?\s*\d{3}-\d{2}-\d{4}\b/gi,
        /\bDOB\s*\:?\s*[\d\/\-]+\b/gi,
    ];

    healthPatterns.forEach(pattern => {
        maskedText = maskedText.replace(pattern, '[REDACTED]');
    });

    return maskedText;
};