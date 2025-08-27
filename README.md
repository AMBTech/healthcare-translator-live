# Healthcare Translator 🌐🏥

A modern, privacy-focused medical translation web application built with Next.js 14, featuring real-time speech recognition and AI-powered translation for healthcare professionals.

![Healthcare Translator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎤 Speech Recognition
- Real-time speech-to-text using Web Speech API
- Continuous listening with automatic restart
- Multi-language support for input
- Mobile and desktop compatible

### 🌍 AI-Powered Translation
- OpenAI GPT-4 integration for accurate medical translations
- Support for 12+ languages including:
  - English, Spanish, French, German
  - Italian, Portuguese, Chinese, Japanese
  - Russian, Urdu, Hindi, Arabic
- Real-time translation with debounced API calls

### 🔒 Privacy & Security
- **No data storage** - All transcripts cleared on refresh
- **Sensitive data masking** - Automatic detection and redaction of:
  - Patient IDs and medical record numbers
  - Phone numbers and email addresses
  - Dates of birth and other identifiers
- **Local storage only** - No data sent to external servers beyond translation API

### 💻 Modern UI/UX
- Mobile-first responsive design
- Clean, healthcare-professional interface
- Sticky footer with easy microphone access
- Dual transcript cards with language switching
- Real-time visual feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Modern browser with speech recognition support (Chrome, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AMBTech/healthcare-translator-live.git
   cd healthcare-translator-live
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE=path_to_your_service_account_key_json_file
   
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/translate/          # OpenAI translation API route
│   ├── components/
│   │   ├── Recorder.tsx        # Speech recognition component
│   │   ├── TranscriptDisplay.tsx # Dual transcript UI
│   │   └── PrivacyDisclaimer.tsx
│   ├── hooks/
│   │   ├── useLanguageSettings.ts
│   │   ├── useSessionManagement.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   └── maskSensitiveData.ts
│   └── page.tsx                # Main application component
```

## 🎯 Usage

### Basic Translation
1. **Select languages** - Choose source and target languages from dropdowns
2. **Speak or type** - Use the microphone button or type manually
3. **View translation** - See real-time results in the translation panel

### Speech Recognition
- Click the microphone button to start recording
- Speak clearly in your selected source language
- Transcript appears in real-time with automatic translation
- Click again to stop recording

### Language Management
- Use the swap button (↔️) to quickly switch between source and target languages
- Language preferences are saved in local storage
- Settings persist between sessions

## 🔧 Configuration

### Supported Languages
The application supports translation between these languages:
- `en-US` - English (US)
- `es-ES` - Spanish
- `fr-FR` - French
- `de-DE` - German
- `it-IT` - Italian
- `pt-PT` - Portuguese
- `zh-CN` - Chinese
- `ja-JP` - Japanese
- `ru-RU` - Russian
- `ur-PK` - Urdu
- `hi-IN` - Hindi
- `ar-SA` - Arabic

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for translation | Yes |

## 🛡️ Privacy & Security

### Data Protection
- **No permanent storage** - All data cleared on browser refresh
- **Session-only storage** - Transcripts persist only during current session
- **Auto-cleanup** - Data automatically cleared after 30 minutes of inactivity

### Sensitive Data Handling
- Patient IDs → `[ID]`
- Phone numbers → `[PHONE]`
- Email addresses → `[EMAIL]`
- Dates → `[DATE]`
- All masked before API transmission

### Browser Requirements
- Microphone permissions required
- Modern browser with Web Speech API support
- Chrome/Edge recommended for best performance

## 🚨 Important Notice

**⚠️ FOR DEMONSTRATION PURPOSES ONLY**

This application is designed as a prototype and should not be used for actual medical translation or with real patient data. Always use certified medical interpreters for clinical situations.

## 🐛 Troubleshooting

### Common Issues

1. **Speech recognition not working**
   - Ensure microphone permissions are granted
   - Use Chrome or Edge for best compatibility
   - Check browser console for errors

2. **Translation API errors**
   - Verify OpenAI API key is correctly set
   - Check API quota and billing status

3. **Mobile device issues**
   - Ensure modern mobile browser
   - Grant microphone permissions

### Browser Support
- ✅ Chrome 70+ (recommended)
- ✅ Edge 79+
- ✅ Safari 13+ (limited speech recognition)
- ⚠️ Firefox (limited speech recognition)

## 📈 Performance

- Debounced API calls (1.5s delay)
- Abort controller for duplicate requests
- Efficient re-rendering with React hooks
- Optimized for mobile devices

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain responsive design principles
3. Ensure accessibility standards
4. Add appropriate error handling
5. Update documentation accordingly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for translation API
- **Web Speech API** for speech recognition
- **Next.js** and **Vercel** for the amazing framework
- **TailwindCSS** for styling utilities

## 📞 Support

For questions or support:
1. Check the [troubleshooting](#troubleshooting) section
2. Review open [issues](../../issues)
3. Create a new issue with detailed information

---

**Disclaimer**: This is a demonstration prototype. Not for use in actual medical practice. Always use professional medical interpreters for patient care.