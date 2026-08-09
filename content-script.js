/**
 * Content Script for AI Language Learning Assistant (Manifest V3)
 * Renders in-page Floating Translate Badge & Translation Card Modal using Shadow DOM
 */

(function () {
  'use me';
  
  if (window.__aiLangAssistantInjected) return;
  window.__aiLangAssistantInjected = true;

  let shadowHost = null;
  let shadowRoot = null;
  let currentSelectionText = '';
  let selectionRect = null;
  let activeModalData = null;
  let isSaved = false;

  const SUPPORTED_LANGS = [
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ta', name: 'Tamil' },
    { code: 'si', name: 'Sinhala' }
  ];

  // Initialize Shadow DOM Container
  function initShadowDOM() {
    if (shadowHost) return;

    shadowHost = document.createElement('div');
    shadowHost.id = 'ai-lang-assistant-root';
    shadowHost.style.position = 'absolute';
    shadowHost.style.top = '0';
    shadowHost.style.left = '0';
    shadowHost.style.width = '0';
    shadowHost.style.height = '0';
    shadowHost.style.zIndex = '2147483647';

    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Load styles into Shadow DOM
    const styleEl = document.createElement('style');
    styleEl.textContent = getShadowStyles();
    shadowRoot.appendChild(styleEl);

    const container = document.createElement('div');
    container.className = 'ailang-container';
    
    // Auto detect dark theme from system or host page
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      container.classList.add('dark-theme');
    }

    shadowRoot.appendChild(container);
    document.body.appendChild(shadowHost);
  }

  function getContainer() {
    initShadowDOM();
    return shadowRoot.querySelector('.ailang-container');
  }

  function removeUI() {
    if (!shadowRoot) return;
    const container = shadowRoot.querySelector('.ailang-container');
    if (container) container.innerHTML = '';
  }

  // Handle Text Selection
  document.addEventListener('mouseup', (e) => {
    // Ignore clicks inside our own Shadow DOM
    if (shadowHost && shadowHost.contains(e.target)) return;

    setTimeout(() => {
      handleTextSelection(e);
    }, 10);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeUI();
    }
  });

  function handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length < 1) {
      // Don't remove UI immediately if user clicked inside the open modal
      if (shadowRoot && shadowRoot.querySelector('.ailang-card')) return;
      removeUI();
      return;
    }

    // Ignore editable form inputs if typing
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      // Allow selection translation in inputs if text is selected
    }

    currentSelectionText = selectedText;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        selectionRect = rect;
        showFloatingBadge(rect.left + window.scrollX + rect.width / 2, rect.bottom + window.scrollY + 6);
      }
    }
  }

  // Render Floating Badge Button
  function showFloatingBadge(x, y) {
    const container = getContainer();
    container.innerHTML = '';

    const badge = document.createElement('div');
    badge.className = 'ailang-badge';
    badge.style.left = `${Math.max(10, Math.min(window.innerWidth - 120, x - 40))}px`;
    badge.style.top = `${y}px`;

    badge.innerHTML = `
      <svg class="ailang-badge-icon" viewBox="0 0 24 24">
        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2.1l1.1-3h4.6l1.1 3H23l-4.5-12zm-2.62 7l1.62-4.41L19.12 17h-3.24z"/>
      </svg>
      <span>Translate</span>
    `;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerTranslation(currentSelectionText);
    });

    container.appendChild(badge);
  }

  // Trigger Translation Process
  async function triggerTranslation(text, customTargetLang = null) {
    if (!text) return;

    showLoadingState(text);

    try {
      chrome.runtime.sendMessage(
        { action: 'TRANSLATE_TEXT', text: text, targetLang: customTargetLang },
        (response) => {
          if (chrome.runtime.lastError) {
            showErrorModal(chrome.runtime.lastError.message || 'Extension runtime error.');
            return;
          }
          if (response && response.success) {
            activeModalData = response.data;
            isSaved = false;
            renderTranslationCard(response.data);
          } else {
            showErrorModal(response?.error || 'Failed to complete translation.');
          }
        }
      );
    } catch (err) {
      showErrorModal(err.message || 'Network error.');
    }
  }

  // Render Loading Card State
  function showLoadingState(originalText) {
    const container = getContainer();
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'ailang-card';
    positionCard(card);

    card.innerHTML = `
      <div class="ailang-card-header">
        <div class="ailang-header-left">
          <div class="ailang-logo-tag">
            <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>AI Assistant</span>
          </div>
        </div>
        <button class="ailang-close-btn" id="ailang-close">✕</button>
      </div>
      <div class="ailang-card-body">
        <div class="ailang-section">
          <div class="ailang-label">Original Text</div>
          <div class="ailang-original-text">${escapeHtml(originalText)}</div>
        </div>
        <div class="ailang-loading-box">
          <div class="ailang-shimmer" style="width: 40%"></div>
          <div class="ailang-shimmer" style="width: 85%"></div>
          <div class="ailang-shimmer" style="width: 65%"></div>
        </div>
      </div>
    `;

    card.querySelector('#ailang-close').addEventListener('click', removeUI);
    container.appendChild(card);
  }

  // Render Full Translation Result Card Modal
  function renderTranslationCard(data) {
    const container = getContainer();
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'ailang-card';
    positionCard(card);

    const langOptionsHtml = SUPPORTED_LANGS.map(
      l => `<option value="${l.code}" ${l.code === data.targetLang ? 'selected' : ''}>${l.name}</option>`
    ).join('');

    card.innerHTML = `
      <div class="ailang-card-header">
        <div class="ailang-header-left">
          <div class="ailang-logo-tag">
            <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>AI Assistant</span>
          </div>
          <span class="ailang-lang-badge">${escapeHtml(data.detectedLanguage || 'Detected')}</span>
        </div>
        <button class="ailang-close-btn" id="ailang-close">✕</button>
      </div>
      <div class="ailang-card-body">
        <div class="ailang-section">
          <div class="ailang-label">Original</div>
          <div class="ailang-original-text">${escapeHtml(data.originalText)}</div>
        </div>

        <div class="ailang-section">
          <div class="ailang-target-row">
            <div class="ailang-label">Translation</div>
            <select class="ailang-select-lang" id="ailang-target-lang">
              ${langOptionsHtml}
            </select>
          </div>
          <div class="ailang-translated-box">${escapeHtml(data.translatedText)}</div>
          ${data.phonetic ? `<div class="ailang-phonetic">/${escapeHtml(data.phonetic)}/</div>` : ''}
        </div>

        ${data.grammarTip ? `
        <div class="ailang-grammar-tip">
          💡 <strong>Tip:</strong> ${escapeHtml(data.grammarTip)}
        </div>
        ` : ''}

        <div class="ailang-actions-row">
          <button class="ailang-btn" id="ailang-btn-speak">
            🔊 Speak
          </button>
          <button class="ailang-btn" id="ailang-btn-copy">
            📋 Copy
          </button>
          <button class="ailang-btn ${isSaved ? 'ailang-btn-saved' : 'ailang-btn-primary'}" id="ailang-btn-save">
            ${isSaved ? 'Saved ✓' : '💾 Save'}
          </button>
        </div>
      </div>
    `;

    // Event Listeners
    card.querySelector('#ailang-close').addEventListener('click', removeUI);

    // Change target language dropdown
    const langSelect = card.querySelector('#ailang-target-lang');
    langSelect.addEventListener('change', (e) => {
      triggerTranslation(data.originalText, e.target.value);
    });

    // Speak Button (TTS)
    card.querySelector('#ailang-btn-speak').addEventListener('click', () => {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.translatedText);
        utterance.lang = data.targetLang || 'en';
        window.speechSynthesis.speak(utterance);
      } else {
        chrome.runtime.sendMessage({ action: 'TTS_SPEAK', text: data.translatedText, lang: data.targetLang });
      }
      showToast('Playing audio...');
    });

    // Copy Button
    card.querySelector('#ailang-btn-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.translatedText);
        showToast('Copied to clipboard!');
      } catch (e) {
        showToast('Copy failed.');
      }
    });

    // Save Button
    const saveBtn = card.querySelector('#ailang-btn-save');
    saveBtn.addEventListener('click', () => {
      if (isSaved) {
        showToast('Already saved to vocabulary!');
        return;
      }

      chrome.runtime.sendMessage({
        action: 'SAVE_VOCAB',
        item: {
          originalText: data.originalText,
          translation: data.translatedText,
          sourceLang: data.sourceLangCode || 'auto',
          targetLang: data.targetLang,
          phonetic: data.phonetic,
          grammarTip: data.grammarTip,
          exampleSentence: data.exampleSentence
        }
      }, (resp) => {
        if (resp && resp.success) {
          isSaved = true;
          saveBtn.classList.add('ailang-btn-saved');
          saveBtn.classList.remove('ailang-btn-primary');
          saveBtn.textContent = 'Saved ✓';
          showToast('Saved to vocabulary list!');
        }
      });
    });

    container.appendChild(card);
  }

  // Render Error Modal
  function showErrorModal(errorMsg) {
    const container = getContainer();
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'ailang-card';
    positionCard(card);

    card.innerHTML = `
      <div class="ailang-card-header">
        <div class="ailang-header-left">
          <span style="color:#ef4444;font-weight:700">⚠️ Translation Error</span>
        </div>
        <button class="ailang-close-btn" id="ailang-close">✕</button>
      </div>
      <div class="ailang-card-body">
        <div style="color:var(--text-secondary);line-height:1.4">
          ${escapeHtml(errorMsg)}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">
          Check your network or update your API key in the extension settings popup.
        </div>
      </div>
    `;

    card.querySelector('#ailang-close').addEventListener('click', removeUI);
    container.appendChild(card);
  }

  // Toast Notification Helper inside Shadow DOM
  function showToast(msg) {
    const container = getContainer();
    const existing = container.querySelector('.ailang-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ailang-toast';
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // Calculate position near text selection bounds
  function positionCard(cardElement) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let posX = selectionRect ? selectionRect.left + scrollX : scrollX + 50;
    let posY = selectionRect ? selectionRect.bottom + scrollY + 8 : scrollY + 50;

    // Ensure it doesn't overflow right edge
    const cardWidth = 350;
    if (posX + cardWidth > window.innerWidth + scrollX - 20) {
      posX = Math.max(10, window.innerWidth + scrollX - cardWidth - 20);
    }

    cardElement.style.left = `${posX}px`;
    cardElement.style.top = `${posY}px`;
  }

  // Helpers
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Service Worker Messages
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'SHOW_TRANSLATION_MODAL') {
      activeModalData = request.data;
      isSaved = false;
      renderTranslationCard(request.data);
    } else if (request.action === 'SHOW_TRANSLATION_ERROR') {
      showErrorModal(request.error);
    }
  });

  // Inject CSS String generator into Shadow DOM
  function getShadowStyles() {
    return `
      :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .ailang-container {
        --bg-card: #ffffff;
        --bg-header: #f8fafc;
        --bg-secondary: #f1f5f9;
        --bg-hover: #e2e8f0;
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-muted: #94a3b8;
        --accent-color: #6366f1;
        --accent-hover: #4f46e5;
        --accent-light: #e0e7ff;
        --success-color: #10b981;
        --success-bg: #d1fae5;
        --border-color: #e2e8f0;
        --shadow-main: 0 10px 30px -5px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.1);
        --shadow-badge: 0 4px 14px rgba(99, 102, 241, 0.35);
        --radius-sm: 6px;
        --radius-md: 10px;
        --radius-lg: 16px;
      }
      .ailang-container.dark-theme {
        --bg-card: #1e1b4b;
        --bg-header: #1e1b4b;
        --bg-secondary: #2e2a72;
        --bg-hover: #3730a3;
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --accent-color: #818cf8;
        --accent-hover: #6366f1;
        --accent-light: rgba(129, 140, 248, 0.2);
        --success-color: #34d399;
        --success-bg: rgba(52, 211, 153, 0.15);
        --border-color: rgba(255, 255, 255, 0.12);
        --shadow-main: 0 16px 40px -6px rgba(0, 0, 0, 0.7);
      }
      .ailang-badge {
        position: absolute; z-index: 2147483647; display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff;
        font-weight: 600; font-size: 13px; border-radius: 20px; box-shadow: var(--shadow-badge);
        cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.3); user-select: none;
        animation: ailangPopIn 0.2s ease forwards; transition: transform 0.15s ease;
      }
      .ailang-badge:hover { transform: scale(1.06) translateY(-2px); }
      .ailang-badge-icon { width: 15px; height: 15px; fill: currentColor; }
      .ailang-card {
        position: absolute; z-index: 2147483647; width: 350px; max-width: calc(100vw - 32px);
        background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-main); overflow: hidden;
        animation: ailangFadeSlideIn 0.22s ease forwards; font-size: 13px;
      }
      .ailang-card-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-header); border-bottom: 1px solid var(--border-color); }
      .ailang-header-left { display: flex; align-items: center; gap: 8px; }
      .ailang-logo-tag { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 12px; color: var(--accent-color); }
      .ailang-lang-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; background: var(--accent-light); color: var(--accent-color); border-radius: 12px; }
      .ailang-close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 50%; font-size: 14px; }
      .ailang-close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
      .ailang-card-body { padding: 14px; display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto; }
      .ailang-section { display: flex; flex-direction: column; gap: 4px; }
      .ailang-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
      .ailang-original-text { color: var(--text-secondary); font-style: italic; background: var(--bg-secondary); padding: 8px 10px; border-radius: var(--radius-sm); word-break: break-word; line-height: 1.4; border-left: 3px solid var(--text-muted); }
      .ailang-target-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .ailang-select-lang { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px; font-size: 12px; font-weight: 600; cursor: pointer; outline: none; }
      .ailang-translated-box { background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; font-weight: 600; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--accent-light); line-height: 1.45; word-break: break-word; }
      .ailang-phonetic { font-size: 11px; color: var(--accent-color); font-family: monospace; margin-top: 2px; }
      .ailang-grammar-tip { font-size: 11px; color: var(--text-secondary); background: var(--bg-secondary); padding: 8px 10px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-color); }
      .ailang-loading-box { display: flex; flex-direction: column; gap: 8px; padding: 10px 0; }
      .ailang-shimmer { height: 14px; background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-hover) 50%, var(--bg-secondary) 75%); background-size: 200% 100%; animation: ailangShimmer 1.5s infinite; border-radius: 4px; }
      .ailang-actions-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-top: 6px; border-top: 1px solid var(--border-color); }
      .ailang-btn { display: flex; align-items: center; justify-content: center; gap: 5px; flex: 1; padding: 7px 10px; font-size: 12px; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; }
      .ailang-btn:hover { background: var(--bg-hover); }
      .ailang-btn-primary { background: var(--accent-color); color: #ffffff; border: none; }
      .ailang-btn-primary:hover { background: #4f46e5; }
      .ailang-btn-saved { background: var(--success-bg); color: var(--success-color); border-color: var(--success-color); }
      .ailang-toast { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.9); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; z-index: 2147483647; }
      @keyframes ailangPopIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      @keyframes ailangFadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ailangShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    `;
  }
})();
