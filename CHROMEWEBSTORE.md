# Chrome Web Store Metadata & Publishing Guide

**Extension Name**: AI Language Learning Assistant  
**Short Description**: Highlight any text on any webpage to translate instantly, listen to TTS pronunciation, save vocabulary, and practice flashcards powered by xAI Grok API.  
**Version**: 1.0.0  
**Manifest Version**: 3  
**Category**: Education / Productivity  
**Last Updated**: 2026-08-08  

---

## Chrome Developer Dashboard Copy

### Detailed Description

> **AI Language Learning Assistant** is a powerful Manifest V3 browser extension designed to help you master new languages while reading online content. Highlight words, sentences, or paragraphs on any website to get instant, context-aware translations powered by **xAI Grok API**, **OpenAI**, or built-in **Free Translation Engines**.

#### Key Features:
- ⚡ **Instant In-Page Translation**: Highlight text on any website to reveal a sleek floating translate button and translation modal card directly beside your selection.
- 🤖 **xAI Grok & AI Integration**: Support for xAI Grok API (`grok-2-1212`, `grok-beta`) and OpenAI API keys for context-rich translations, phonetic guides, and grammar tips.
- 🆓 **Zero Setup Free Engine**: Built-in free translation fallbacks (MyMemory & Lingva) so the extension works out-of-the-box without requiring an API key.
- 🔊 **Text-to-Speech Pronunciation**: Listen to accurate native pronunciations using Web Speech and Chrome TTS APIs.
- 💾 **Personal Vocabulary Builder**: Save translated words and phrases to a local vocabulary list stored securely in your browser.
- 🎴 **Interactive Flashcards Mode**: Practice saved vocabulary with interactive 3D flip flashcards to reinforce memory and track mastered words.
- 🌙 **Dark & Light Themes**: Beautiful glassmorphic UI supporting dark and light themes with smooth animations.
- 🛡️ **Privacy-First**: Your saved vocabulary and API keys remain stored locally in your browser using `chrome.storage.local`.

---

## Permissions Justification

| Permission | Category | Plain-English Reason for Reviewers |
| :--- | :--- | :--- |
| `storage` | Permission | Required to store saved user vocabulary items, streak counters, and extension preferences (default target language, API provider, theme) locally on the device using `chrome.storage.local`. |
| `activeTab` | Permission | Required to detect user text selections on the active webpage tab when the user clicks the floating translation trigger or context menu item. |
| `scripting` | Permission | Required to inject and render the in-page Shadow DOM translation card modal near selected text. |
| `contextMenus` | Permission | Required to add a right-click context menu item ("Translate selection with AI Assistant") for quick text translation without clicking the floating badge. |
| `tts` | Permission | Required to provide native Text-to-Speech audio playback for translated words and phrases across languages. |
| `https://*/*` | Host Permission | Required to connect to translation API services (xAI Grok API at `https://api.x.ai`, OpenAI API at `https://api.openai.com`, and MyMemory translation API) to process text translation requests. |

---

## Privacy & Data Usage Disclosures

- **Data Collection**: The extension does **NOT** collect, sell, or transmit any personally identifiable information (PII) to external tracking servers.
- **Data Storage**: User settings, API keys, and saved vocabulary items are stored exclusively in local browser storage (`chrome.storage.local`).
- **Network Requests**: Text translation requests are sent directly to the selected API provider (xAI Grok API, OpenAI, or MyMemory translation engine) solely to generate text translations.

---

## Pre-Submission Verification Checklist

- [x] `manifest.json` specifies `"manifest_version": 3`.
- [x] All icon files referenced in `manifest.json` exist (`icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`).
- [x] Background service worker registered in `background/service-worker.js`.
- [x] Content script UI rendered inside an isolated Shadow DOM (`content/content-script.js`).
- [x] Every permission in `manifest.json` has a clear, detailed justification in this document.
- [x] No `eval()` or unsanitized inline scripts.
