# QuickGist - Chrome AI Challenge 2025 Submission

> AI-powered YouTube video summarizer using Chrome's Built-in AI APIs (Gemini Nano)

## 🎯 Overview

QuickGist is a Chrome extension that provides instant AI-powered summaries of YouTube videos using Chrome's built-in AI capabilities. It leverages the Summarizer API and Prompt API (Gemini Nano) running locally in the browser, with Gemini API as a fallback.

## ✨ Features

- **🤖 Chrome Built-in AI**: Uses Gemini Nano for local, privacy-preserving summarization
- **📝 Multiple Summary Styles**: Bullet points, paragraphs, or detailed analysis
- **⚡ Smart Caching**: Stores transcripts and summaries locally for 24 hours
- **🔐 Privacy-First**: API keys stored locally, AI processing happens on-device
- **💾 Export Options**: Copy or download summaries as Markdown

## 🏗️ Architecture

```
YouTube Page
    ↓
Content Script (injects sidebar)
    ↓
Background Script (message handler)
    ↓
1. Fetch Transcript → tube-text.vercel.app
2. Summarize → Chrome AI (Gemini Nano) ← Primary
    ↓ (fallback if unavailable)
3. Summarize → Gemini API ← Fallback
    ↓
Cache & Display in Sidebar
```

## 🚀 Tech Stack

- **Framework**: WXT (Web Extension Tools) + React + TypeScript
- **Styling**: Tailwind CSS + Material Design 3 principles
- **Icons**: Lucide React
- **AI APIs**:
  - Chrome Summarizer API (Gemini Nano)
  - Chrome Prompt API (fallback)
  - Gemini API (fallback)
- **Storage**: chrome.storage.local
- **Transcript Source**:  api.scrapingdog.com

## 📁 Project Structure

```
quickgist/
├── entrypoints/
│   ├── popup/
│   │   └── App.tsx              # Main popup UI
│   ├── content/
│   │   └── index.tsx            # Content script (YouTube injection)
│   └── background/
│       └── index.ts             # Background service worker
├── components/
│   ├── Dashboard.tsx            # API key management & stats
│   ├── Settings.tsx             # User preferences
│   ├── SidebarModal.tsx         # YouTube sidebar component
│   └── Loader.tsx               # Loading state
├── hooks/
│   └── useApiKey.ts             # API key management hook
├── lib/
│   ├── chromeAI.ts              # Chrome AI integration
│   ├── services.ts              # Transcript & summary fetching
│   └── storage.ts               # Cache management
└── styles/
    └── globals.css              # Global styles
```

## 🔧 Setup Instructions

### Prerequisites

```bash
# Node.js 18+ and pnpm
node --version  # v18+
pnpm --version  # 8+
```

### Installation

```bash
# Clone repository
git clone https://github.com/m1rak/ytquickgist.git
cd quickgist

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env
```

### Environment Variables

```env
# .env (optional - for development)
# Not needed for production build
```

### Development

```bash
# Start development server
pnpm dev

# Open chrome://extensions
# Enable "Developer mode"
# Click "Load unpacked"
# Select the .output/chrome-mv3 directory
```

### Production Build

```bash
# Build for Chrome
pnpm build

# Build for Firefox
pnpm build:firefox

# Output: .output/chrome-mv3 or .output/firefox-mv2
```

## 🎮 Usage

### 1. Install Extension
- Load the extension in Chrome (chrome://extensions)
- Pin the extension to your toolbar

### 2. Configure API Key
- Click the QuickGist extension icon
- Enter your Gemini API key (get one at https://aistudio.google.com/apikey)
- Click "Save API Key"

### 3. Summarize Videos
- Visit any YouTube video
- Look for the QuickGist sidebar below the video
- Click "Summarize" for instant AI summary
- Click "Transcript" to view full transcript

### 4. Customize Settings
- Click settings icon in popup
- Configure:
  - Auto-summarize on video load
  - Summary style (bullet/paragraph/detailed)
  - Summary length (short/medium/long)
  - Summary language

## 🧠 Chrome AI Integration

### Checking AI Availability

```typescript
import { checkAIAvailability } from '@/lib/chromeAI'

const isAvailable = await checkAIAvailability()
// Returns: true if Chrome AI is ready, false otherwise
```

### Summarizing with Chrome AI

```typescript
import { summarizeWithChromeAI } from '@/lib/chromeAI'

const summary = await summarizeWithChromeAI(transcript, {
  type: 'key-points',
  format: 'markdown',
  length: 'medium'
})
```

### Fallback Logic

1. **Primary**: Chrome Summarizer API (Gemini Nano)
2. **Secondary**: Chrome Prompt API
3. **Tertiary**: Gemini API (requires API key)

## 📦 Storage Schema

```typescript
// chrome.storage.local
{
  // API Key
  geminiApiKey: string,

  // User Settings
  settings: {
    autoSummarize: boolean,
    summaryStyle: 'bullet' | 'paragraph' | 'detailed',
    summaryLength: 'short' | 'medium' | 'long',
    summaryLanguage: string
  },

  // Transcript Cache (24h TTL)
  transcriptCache: {
    [videoId]: {
      data: { transcript, videoId },
      timestamp: number
    }
  },

  // Summary Cache (24h TTL)
  summaryCache: {
    [videoId:mode]: {
      data: { summary, videoId, mode, source },
      timestamp: number
    }
  }
}
```

## 🎨 Design System

### Colors

```css
/* Primary */
--blue-500: #3b82f6;
--blue-600: #2563eb;

/* Neutral */
--gray-50: #f9fafb;
--gray-900: #111827;

/* Status */
--green-500: #10b981;  /* Success */
--red-500: #ef4444;    /* Error */
--amber-500: #f59e0b;  /* Warning */
```

### Components

- **Buttons**: Rounded-lg, 2.5rem height, medium font weight
- **Cards**: Rounded-xl, border, shadow-sm
- **Inputs**: Rounded-lg, focus:ring-2
- **Typography**: System font stack, clear hierarchy

## 🔒 Privacy & Security

- ✅ API keys stored locally (chrome.storage.local)
- ✅ Chrome AI runs entirely on-device
- ✅ No data sent to external servers (except transcript fetching)
- ✅ Cache cleared automatically after 24 hours
- ✅ No tracking or analytics

## 🐛 Troubleshooting

### Chrome AI Not Available

**Problem**: "Chrome AI not available" error

**Solutions**:
1. Update Chrome to version 127+ (Chrome Dev/Canary)
2. Enable Chrome AI flags:
   - `chrome://flags/#optimization-guide-on-device-model`
   - `chrome://flags/#prompt-api-for-gemini-nano`
3. Restart Chrome
4. Extension will fallback to Gemini API

### Transcript Fetch Failed

**Problem**: "Transcript unavailable" error

**Causes**:
- Video has no captions
- Video is private/age-restricted
- tube-text.vercel.app is down

**Solution**: Try a different video with captions enabled

### API Key Invalid

**Problem**: "Invalid API key" error

**Solutions**:
1. Get new key from https://aistudio.google.com/apikey
2. Ensure key starts with "AIza"
3. Check for extra spaces when pasting
4. Re-enter key in extension popup

## 🏆 Chrome AI Challenge Compliance

### Required Components
- ✅ Uses Chrome's Built-in AI APIs (Summarizer API, Prompt API)
- ✅ Practical use case (YouTube video summarization)
- ✅ Public open-source repository
- ✅ Demo video (TODO: record and upload)
- ✅ Proper documentation

### Submission Checklist
- [x] Public GitHub repository
- [x] README with setup instructions
- [ ] Demo video (2-3 minutes)
- [ ] Screenshots
- [ ] Devpost submission
- [x] License file (MIT)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📧 Contact

For questions or support:
- GitHub Issues: [github.com/m1rak/ytquickgist/issues]
- Email: abdullahiismail1105@gmail.com

## 🙏 Acknowledgments

- Chrome AI Challenge Team
- WXT Framework
- tube-text.vercel.app for transcript service
- Lucide Icons
- Tailwind CSS
