# 🌐 AI Language Learning Assistant

<div align="center">

![Extension Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=for-the-badge)
![Manifest Version](https://img.shields.io/badge/Manifest-V3-4f46e5?style=for-the-badge&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-16+-f59e0b?style=for-the-badge)
![API](https://img.shields.io/badge/Powered%20by-xAI%20Grok-000000?style=for-the-badge)

**A powerful Manifest V3 Chrome Extension that brings AI-powered translation, pronunciation, vocabulary building, and flashcard practice directly into your browser.**

[Features](#-features) • [Installation](#-installation) • [API Setup](#-api-setup) • [Usage](#-usage) • [Languages](#-supported-languages) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔤 Instant In-Page Translation
- Highlight **any text** on any webpage to reveal a floating **Translate** button
- Clean translation card modal appears directly beside your selection
- Supports words, sentences, and full paragraphs
- **Shadow DOM isolation** — never conflicts with host page styles

### 🤖 Multiple AI Providers
| Provider | Model | Notes |
|----------|-------|-------|
| **xAI Grok** *(Primary)* | `grok-2-1212`, `grok-beta` | Context-rich translations, grammar tips |
| **OpenAI** | `gpt-4o-mini`, `gpt-3.5-turbo` | Alternative AI provider |
| **Free Engine** *(Fallback)* | MyMemory + Lingva | Works with zero setup, no API key needed |

### 🔊 Text-to-Speech Pronunciation
- Listen to native-sounding pronunciation of any translation
- Uses Web Speech API + Chrome TTS API
- Supports all 16+ languages

### 💾 Personal Vocabulary Builder
- Save translated words and phrases with one click
- Stores locally in `chrome.storage.local` — fully private
- View, search, filter, and manage your saved words in the popup dashboard

### 🎴 Interactive Flashcard Study Mode
- 3D flip card animations for immersive learning
- **"Mastered"** / **"Review Again"** progress tracking
- Track your learning streak day by day

### 🌙 Beautiful UI with Dark & Light Themes
- Glassmorphic design with smooth micro-animations
- Auto-detects system theme preference
- Premium indigo/violet color palette

### ⚙️ Right-Click Context Menu
- Right-click any selected text → **"Translate with AI Assistant"**
- Works even without clicking the floating badge

---

## 📸 Screenshots

| Floating Translate Button | Translation Card Modal | Popup Dashboard |
|:---:|:---:|:---:|
| Appears near selected text | Shows original, translation, grammar tip | Manage vocab, flashcards & settings |

---

## 🛠️ Installation

### Method 1: Load Unpacked (Developer Mode)

1. **Clone this repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-language-learning-assistant.git
   cd ai-language-learning-assistant
   ```

2. **Generate extension icons** *(one-time setup)*
   ```bash
   node scripts/generate-icons.js
   ```

3. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions`
   - Or go to Menu → More Tools → Extensions

4. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner

5. **Load the extension**
   - Click **"Load unpacked"**
   - Select the cloned project folder (e.g., `D:\ai-language-learning-assistant`)

6. **Pin the extension**
   - Click the puzzle icon 🧩 in Chrome toolbar
   - Pin **AI Language Learning Assistant**

---

## 🔑 API Setup

### Option A: xAI Grok API *(Recommended)*

1. Get your API key from [console.x.ai](https://console.x.ai)
2. Click the extension icon → **⚙️ Settings** tab
3. Set **AI Provider** → `xAI Grok API`
4. Paste your key: `xai-xxxxxxxxxxxxxxxxxxxx`
5. Select model: `grok-2-1212` *(recommended)*
6. Click **💾 Save Settings**

### Option B: OpenAI API

1. Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Set **AI Provider** → `OpenAI API`
3. Paste your key: `sk-proj-xxxxxxxx`
4. Select model: `gpt-4o-mini`
5. Click **💾 Save Settings**

### Option C: Free Engine (No Setup Required)

- Works **instantly with zero configuration**
- Uses MyMemory and Lingva public translation APIs
- Falls back automatically if AI provider fails

> **💡 Tip:** The extension always falls back to the Free Engine if your API key is missing or a request fails — so it always works!

---

## 🚀 Usage

### Translating Selected Text

1. Visit any website
2. **Highlight** a word, sentence, or paragraph
3. A floating **🌐 Translate** button appears near your selection
4. Click it — the AI translation card opens instantly
5. Use the action buttons:
   - **🔊 Speak** — Listen to the translation
   - **📋 Copy** — Copy to clipboard
   - **💾 Save** — Save to your vocabulary list
6. Switch the **target language** from the dropdown inside the card

### Using the Context Menu

1. Select any text on a webpage
2. **Right-click** the selection
3. Choose **"Translate '[text]' with AI Assistant"**
4. The translation card appears automatically

### Managing Vocabulary

1. Click the extension icon in the toolbar
2. Go to **📚 Vocab** tab
3. Search, filter, listen, mark as mastered, or delete saved words

### Practicing with Flashcards

1. Open the extension popup
2. Go to **🎴 Flashcards** tab
3. Click the card to **flip** and reveal the translation
4. Press **✅ Mastered** or **❌ Need Review** to track progress

---

## 🌍 Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | `en` | Arabic | `ar` |
| Spanish | `es` | Hindi | `hi` |
| French | `fr` | **Tamil** | `ta` |
| German | `de` | **Sinhala** | `si` |
| Italian | `it` | Dutch | `nl` |
| Portuguese | `pt` | Turkish | `tr` |
| Chinese (Simplified) | `zh` | Polish | `pl` |
| Japanese | `ja` | Swedish | `sv` |
| Korean | `ko` | Vietnamese | `vi` |
| Russian | `ru` | — | — |

---

## 📁 Project Structure

```
ai-language-learning-assistant/
│
├── manifest.json                    # Manifest V3 configuration
│
├── background/
│   └── service-worker.js           # Background service worker (message routing, context menu)
│
├── content/
│   ├── content-script.js           # In-page Shadow DOM UI (floating badge + translation card)
│   └── content-style.css           # Isolated CSS styles for content UI
│
├── popup/
│   ├── popup.html                  # Extension dashboard HTML
│   ├── popup.css                   # Dashboard styling (dark/light themes, 3D flashcards)
│   └── popup.js                    # Dashboard logic (vocab list, flashcards, settings)
│
├── services/
│   ├── translator-service.js       # Grok API + OpenAI + Free engine translation logic
│   └── storage-service.js          # Chrome storage wrapper (vocab, settings, stats)
│
├── icons/
│   ├── icon-16.png                 # 16×16 extension icon
│   ├── icon-48.png                 # 48×48 extension icon
│   └── icon-128.png                # 128×128 extension icon
│
├── scripts/
│   └── generate-icons.js           # Node.js script to regenerate PNG icons
│
├── CHROMEWEBSTORE.md               # Chrome Web Store listing & permissions guide
└── README.md                       # This file
```

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Webpage (Any Site)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Shadow DOM (#ai-lang-assistant-root)     │   │
│  │  ┌──────────────┐    ┌───────────────────────┐  │   │
│  │  │ Floating     │───▶│  Translation Card     │  │   │
│  │  │ Badge Button │    │  (modal popup UI)     │  │   │
│  │  └──────────────┘    └───────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│         │  content-script.js (Content Script)           │
└─────────┼───────────────────────────────────────────────┘
          │ chrome.runtime.sendMessage
          ▼
┌─────────────────────────────────────────────────────────┐
│              Background Service Worker                  │
│  ┌─────────────────┐    ┌───────────────────────────┐  │
│  │ Message Handler │    │   TranslatorService        │  │
│  │ (TRANSLATE_TEXT │───▶│ Grok API / OpenAI /        │  │
│  │  SAVE_VOCAB     │    │ Free Engine (fallback)     │  │
│  │  GET_SETTINGS)  │    └───────────────────────────┘  │
│  └─────────────────┘                                    │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────┐    ┌───────────────────────────┐  │
│  │ StorageService  │    │  chrome.storage.local      │  │
│  │ (vocab, stats,  │───▶│  (saved words, settings,  │  │
│  │  settings)      │    │   learning streak)         │  │
│  └─────────────────┘    └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                Extension Popup Dashboard                │
│  📚 Vocabulary │ 🎴 Flashcards │ 💡 Insights │ ⚙️ Settings │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Privacy & Security

- ✅ **No data collection** — the extension does not track, collect, or sell any user data
- ✅ **Local storage only** — vocabulary, settings, and API keys are stored exclusively in your browser using `chrome.storage.local`
- ✅ **API keys stay on your device** — keys are never sent to any server other than the selected AI provider's official API endpoint
- ✅ **Shadow DOM isolation** — the in-page UI cannot be read or manipulated by website scripts
- ✅ **No eval()** — strict Manifest V3 CSP compliance, no unsafe code execution

---

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- Google Chrome or Chromium browser

### Regenerate Icons

```bash
node scripts/generate-icons.js
```

### Reload After Changes

After modifying any file, go to `chrome://extensions` and click the **🔄 refresh icon** on the extension card.

### Key Files to Modify

| Task | File |
|------|------|
| Add a new language | `services/translator-service.js`, `content/content-script.js`, `popup/popup.html` |
| Change AI prompt | `services/translator-service.js` → `translateWithGrok()` |
| Modify in-page UI | `content/content-script.js` → `renderTranslationCard()` |
| Modify popup dashboard | `popup/popup.html` + `popup/popup.css` + `popup/popup.js` |
| Add new message actions | `background/service-worker.js` |

---

## 🗺️ Roadmap

- [ ] Grammar explanations panel
- [ ] Pronunciation guide with IPA phonetics (full AI-powered)
- [ ] AI Chat for language practice
- [ ] Learning history & analytics
- [ ] Word of the Day notifications
- [ ] Export vocabulary to CSV / Anki
- [ ] Firefox / Edge support
- [ ] Offline mode with cached translations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
style:    UI/CSS changes
docs:     Documentation updates
refactor: Code refactoring
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [xAI Grok API](https://x.ai) — Primary AI translation provider
- [MyMemory Translation API](https://mymemory.translated.net) — Free translation fallback
- [Lingva Translate](https://lingva.ml) — Secondary free fallback engine
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — Text-to-speech pronunciation
- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/) — Extension platform

---

<div align="center">

Made with ❤️ for language learners everywhere

**⭐ Star this repo if it helped you learn a new language!**

</div>
