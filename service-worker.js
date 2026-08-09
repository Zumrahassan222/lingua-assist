/**
 * Background Service Worker for AI Language Learning Assistant (Manifest V3)
 */

import { StorageService } from '../services/storage-service.js';
import { TranslatorService } from '../services/translator-service.js';

// Setup Context Menus on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate_selection',
    title: 'Translate "%s" with AI Assistant',
    contexts: ['selection']
  });
  console.log('AI Language Learning Assistant extension installed successfully.');
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'translate_selection' && info.selectionText && tab?.id) {
    try {
      const settings = await StorageService.getSettings();
      const translationResult = await TranslatorService.translate(
        info.selectionText,
        settings.targetLang,
        settings
      );
      
      await StorageService.recordTranslationEvent();

      // Send result back to content script to present modal
      chrome.tabs.sendMessage(tab.id, {
        action: 'SHOW_TRANSLATION_MODAL',
        data: translationResult
      });
    } catch (err) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'SHOW_TRANSLATION_ERROR',
        error: err.message
      });
    }
  }
});

// Runtime Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === 'TRANSLATE_TEXT') {
        const settings = await StorageService.getSettings();
        const targetLang = request.targetLang || settings.targetLang;
        
        const result = await TranslatorService.translate(
          request.text,
          targetLang,
          settings
        );
        
        await StorageService.recordTranslationEvent();
        sendResponse({ success: true, data: result });
      } 
      else if (request.action === 'SAVE_VOCAB') {
        const savedItem = await StorageService.saveVocabItem(request.item);
        sendResponse({ success: true, data: savedItem });
      } 
      else if (request.action === 'GET_SETTINGS') {
        const settings = await StorageService.getSettings();
        sendResponse({ success: true, data: settings });
      }
      else if (request.action === 'SAVE_SETTINGS') {
        const updated = await StorageService.saveSettings(request.settings);
        sendResponse({ success: true, data: updated });
      }
      else if (request.action === 'GET_VOCAB_LIST') {
        const list = await StorageService.getVocabList();
        sendResponse({ success: true, data: list });
      }
      else if (request.action === 'REMOVE_VOCAB') {
        const updated = await StorageService.removeVocabItem(request.id);
        sendResponse({ success: true, data: updated });
      }
      else if (request.action === 'UPDATE_VOCAB_STATUS') {
        const updated = await StorageService.updateVocabStatus(request.id, request.status);
        sendResponse({ success: true, data: updated });
      }
      else if (request.action === 'GET_STATS') {
        const stats = await StorageService.getStats();
        sendResponse({ success: true, data: stats });
      }
      else if (request.action === 'TTS_SPEAK') {
        if (chrome.tts) {
          chrome.tts.speak(request.text, {
            lang: request.lang || 'en',
            rate: 0.9,
            enqueue: false
          });
        }
        sendResponse({ success: true });
      }
      else {
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Service worker error handling action:', request.action, error);
      sendResponse({ success: false, error: error.message || 'An unexpected error occurred.' });
    }
  })();
  return true; // Keep message channel open for async response
});
