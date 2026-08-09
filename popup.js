/**
 * Extension Popup Dashboard Controller for AI Language Learning Assistant
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const vocabList = document.getElementById('vocab-list');
  const vocabEmpty = document.getElementById('vocab-empty');
  const vocabCount = document.getElementById('vocab-count');
  const vocabSearch = document.getElementById('vocab-search');
  const vocabFilterStatus = document.getElementById('vocab-filter-status');
  const streakCount = document.getElementById('streak-count');
  const themeToggle = document.getElementById('theme-toggle');

  // Flashcard Elements
  const flashcardWrapper = document.getElementById('flashcard-wrapper');
  const flashcard = document.getElementById('flashcard');
  const fcCurrent = document.getElementById('fc-current');
  const fcTotal = document.getElementById('fc-total');
  const fcFrontWord = document.getElementById('fc-front-word');
  const fcBackWord = document.getElementById('fc-back-word');
  const fcBackPhonetic = document.getElementById('fc-back-phonetic');
  const fcBackTip = document.getElementById('fc-back-tip');
  const fcBtnReview = document.getElementById('fc-btn-review');
  const fcBtnSpeak = document.getElementById('fc-btn-speak');
  const fcBtnKnow = document.getElementById('fc-btn-know');
  const fcEmpty = document.getElementById('fc-empty');
  const flashcardContainer = document.getElementById('flashcard-container');

  // Settings Form Elements
  const settingsForm = document.getElementById('settings-form');
  const targetLangSelect = document.getElementById('target-lang');
  const apiProviderSelect = document.getElementById('api-provider');
  const grokSettingsGroup = document.getElementById('grok-settings');
  const grokApiKeyInput = document.getElementById('grok-api-key');
  const grokModelSelect = document.getElementById('grok-model');
  const openaiSettingsGroup = document.getElementById('openai-settings');
  const openaiApiKeyInput = document.getElementById('openai-api-key');
  const openaiModelSelect = document.getElementById('openai-model');
  const autoSpeakCheck = document.getElementById('auto-speak');
  const showFloatingButtonCheck = document.getElementById('show-floating-button');
  const maxInputLengthInput = document.getElementById('max-input-length');
  const popupToast = document.getElementById('popup-toast');

  // Practice AI Elements
  const btnGenSentence = document.getElementById('btn-gen-sentence');
  const practiceResult = document.getElementById('practice-result');

  // State Variables
  let allVocabItems = [];
  let currentFcIndex = 0;
  let activeTheme = 'dark';

  // Initialize Dashboard
  init();

  async function init() {
    setupTabNavigation();
    setupThemeToggle();
    setupSettingsEvents();
    setupFlashcardEvents();
    setupAIPracticeEvents();

    await loadSettings();
    await loadStats();
    await loadVocabList();
  }

  // Navigation Tab Handler
  function setupTabNavigation() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        navTabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`tab-${targetTab}`).classList.add('active');

        if (targetTab === 'flashcards') {
          renderFlashcards();
        }
      });
    });
  }

  // Theme Toggle Handler
  function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(activeTheme);
      chrome.runtime.sendMessage({
        action: 'SAVE_SETTINGS',
        settings: { theme: activeTheme }
      });
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      themeToggle.textContent = '🌙';
    }
  }

  // Load Settings into Form
  async function loadSettings() {
    chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (response) => {
      if (response && response.success) {
        const s = response.data;
        targetLangSelect.value = s.targetLang || 'es';
        apiProviderSelect.value = s.apiProvider || 'free';
        grokApiKeyInput.value = s.grokApiKey || '';
        grokModelSelect.value = s.grokModel || 'grok-2-1212';
        openaiApiKeyInput.value = s.openaiApiKey || '';
        openaiModelSelect.value = s.openaiModel || 'gpt-4o-mini';
        autoSpeakCheck.checked = !!s.autoSpeak;
        showFloatingButtonCheck.checked = s.showFloatingButton !== false;
        maxInputLengthInput.value = s.maxInputLength || 1000;

        activeTheme = s.theme || 'dark';
        applyTheme(activeTheme);

        toggleProviderVisibility(s.apiProvider);
      }
    });
  }

  function toggleProviderVisibility(provider) {
    if (provider === 'grok') {
      grokSettingsGroup.classList.remove('hidden');
      openaiSettingsGroup.classList.add('hidden');
    } else if (provider === 'openai') {
      grokSettingsGroup.classList.add('hidden');
      openaiSettingsGroup.classList.remove('hidden');
    } else {
      grokSettingsGroup.classList.add('hidden');
      openaiSettingsGroup.classList.add('hidden');
    }
  }

  function setupSettingsEvents() {
    apiProviderSelect.addEventListener('change', (e) => {
      toggleProviderVisibility(e.target.value);
    });

    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedSettings = {
        targetLang: targetLangSelect.value,
        apiProvider: apiProviderSelect.value,
        grokApiKey: grokApiKeyInput.value.trim(),
        grokModel: grokModelSelect.value,
        openaiApiKey: openaiApiKeyInput.value.trim(),
        openaiModel: openaiModelSelect.value,
        autoSpeak: autoSpeakCheck.checked,
        showFloatingButton: showFloatingButtonCheck.checked,
        maxInputLength: parseInt(maxInputLengthInput.value, 10) || 1000,
        theme: activeTheme
      };

      chrome.runtime.sendMessage({ action: 'SAVE_SETTINGS', settings: updatedSettings }, (resp) => {
        if (resp && resp.success) {
          showToast('Settings saved successfully!');
        } else {
          showToast('Failed to save settings.');
        }
      });
    });
  }

  // Load Daily Stats
  async function loadStats() {
    chrome.runtime.sendMessage({ action: 'GET_STATS' }, (resp) => {
      if (resp && resp.success && resp.data) {
        streakCount.textContent = resp.data.streakDays || 1;
      }
    });
  }

  // Load Vocabulary List
  async function loadVocabList() {
    chrome.runtime.sendMessage({ action: 'GET_VOCAB_LIST' }, (resp) => {
      if (resp && resp.success) {
        allVocabItems = resp.data || [];
        vocabCount.textContent = allVocabItems.length;
        renderVocabList();
      }
    });
  }

  // Search & Filter Listeners
  vocabSearch.addEventListener('input', renderVocabList);
  vocabFilterStatus.addEventListener('change', renderVocabList);

  function renderVocabList() {
    const query = vocabSearch.value.toLowerCase().trim();
    const statusFilter = vocabFilterStatus.value;

    const filtered = allVocabItems.filter(item => {
      const matchesSearch = item.originalText.toLowerCase().includes(query) || item.translation.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    vocabList.innerHTML = '';

    if (filtered.length === 0) {
      vocabEmpty.classList.remove('hidden');
      vocabList.classList.add('hidden');
      return;
    }

    vocabEmpty.classList.add('hidden');
    vocabList.classList.remove('hidden');

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div class="vocab-card-header">
          <div class="vocab-word">${escapeHtml(item.originalText)}</div>
          <span class="vocab-status ${item.status === 'mastered' ? 'status-mastered' : 'status-learning'}">
            ${item.status === 'mastered' ? 'Mastered' : 'Learning'}
          </span>
        </div>
        <div class="vocab-translation">➡️ ${escapeHtml(item.translation)}</div>
        ${item.grammarTip ? `<div class="vocab-meta">💡 ${escapeHtml(item.grammarTip)}</div>` : ''}
        <div class="vocab-actions">
          <button class="vocab-act-btn btn-speak" data-text="${escapeHtml(item.translation)}" data-lang="${item.targetLang}">
            🔊 Listen
          </button>
          <button class="vocab-act-btn btn-toggle-status" data-id="${item.id}" data-status="${item.status}">
            ${item.status === 'mastered' ? '🔄 Re-learn' : '✅ Mark Mastered'}
          </button>
          <button class="vocab-act-btn btn-delete" data-id="${item.id}" style="color:var(--danger)">
            🗑️ Delete
          </button>
        </div>
      `;

      // Speak Action
      card.querySelector('.btn-speak').addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-text');
        const lang = e.currentTarget.getAttribute('data-lang');
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = lang || 'en';
          window.speechSynthesis.speak(u);
        } else {
          chrome.runtime.sendMessage({ action: 'TTS_SPEAK', text, lang });
        }
      });

      // Toggle Status Action
      card.querySelector('.btn-toggle-status').addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const currentStatus = e.currentTarget.getAttribute('data-status');
        const newStatus = currentStatus === 'mastered' ? 'learning' : 'mastered';

        chrome.runtime.sendMessage({ action: 'UPDATE_VOCAB_STATUS', id, status: newStatus }, () => {
          loadVocabList();
          showToast(`Marked as ${newStatus}`);
        });
      });

      // Delete Action
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        chrome.runtime.sendMessage({ action: 'REMOVE_VOCAB', id }, () => {
          loadVocabList();
          showToast('Vocabulary deleted');
        });
      });

      vocabList.appendChild(card);
    });
  }

  // Flashcards Interactive Logic
  function setupFlashcardEvents() {
    flashcardWrapper.addEventListener('click', () => {
      flashcard.classList.toggle('flipped');
    });

    fcBtnReview.addEventListener('click', () => {
      advanceFlashcard(false);
    });

    fcBtnKnow.addEventListener('click', () => {
      const currentItem = allVocabItems[currentFcIndex];
      if (currentItem) {
        chrome.runtime.sendMessage({ action: 'UPDATE_VOCAB_STATUS', id: currentItem.id, status: 'mastered' });
      }
      advanceFlashcard(true);
    });

    fcBtnSpeak.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentItem = allVocabItems[currentFcIndex];
      if (currentItem && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(currentItem.translation);
        u.lang = currentItem.targetLang || 'en';
        window.speechSynthesis.speak(u);
      }
    });
  }

  function renderFlashcards() {
    if (!allVocabItems || allVocabItems.length === 0) {
      flashcardContainer.classList.add('hidden');
      fcEmpty.classList.remove('hidden');
      return;
    }

    flashcardContainer.classList.remove('hidden');
    fcEmpty.classList.add('hidden');

    if (currentFcIndex >= allVocabItems.length) {
      currentFcIndex = 0;
    }

    const item = allVocabItems[currentFcIndex];
    fcCurrent.textContent = currentFcIndex + 1;
    fcTotal.textContent = allVocabItems.length;

    flashcard.classList.remove('flipped');
    fcFrontWord.textContent = item.originalText;
    fcBackWord.textContent = item.translation;
    fcBackPhonetic.textContent = item.phonetic ? `/${item.phonetic}/` : '';
    fcBackTip.textContent = item.grammarTip || 'Click card to flip';
  }

  function advanceFlashcard(mastered) {
    showToast(mastered ? 'Great job! Mastered ✅' : 'Added for review 🔄');
    currentFcIndex++;
    if (currentFcIndex >= allVocabItems.length) {
      currentFcIndex = 0;
    }
    renderFlashcards();
  }

  // Quick AI Practice Generator
  function setupAIPracticeEvents() {
    const practiceSentences = [
      { text: "El conocimiento es poder.", trans: "Knowledge is power.", lang: "Spanish" },
      { text: "L'apprentissage est un voyage continu.", trans: "Learning is a continuous journey.", lang: "French" },
      { text: "Übung macht den Meister.", trans: "Practice makes perfect.", lang: "German" },
      { text: " La perseverancia abre todas las puertas.", trans: "Perseverance opens all doors.", lang: "Spanish" }
    ];

    btnGenSentence.addEventListener('click', () => {
      const randomItem = practiceSentences[Math.floor(Math.random() * practiceSentences.length)];
      practiceResult.innerHTML = `
        <strong>[${randomItem.lang}]</strong> ${escapeHtml(randomItem.text)}<br>
        <em style="color:var(--accent-primary)">"${escapeHtml(randomItem.trans)}"</em>
      `;
      practiceResult.classList.remove('hidden');
    });
  }

  // Toast Helper
  function showToast(msg) {
    popupToast.textContent = msg;
    popupToast.classList.remove('hidden');
    setTimeout(() => {
      popupToast.classList.add('hidden');
    }, 2000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
