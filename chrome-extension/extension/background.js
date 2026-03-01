// Femstral Health Aid - Background Service Worker

// Initialize default state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    stats: {
      claimsScanned: 0,
      flagsRaised: 0,
      sessionCount: 0,
      misinfoDetected: 0,
      mythsDetected: 0
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STATS') {
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || { claimsScanned: 0, flagsRaised: 0, sessionCount: 0, misinfoDetected: 0, mythsDetected: 0 };
      stats.claimsScanned += message.claimsScanned || 0;
      stats.flagsRaised += message.flagsRaised || 0;
      stats.sessionCount = message.sessionCount || stats.sessionCount;
      stats.misinfoDetected += message.misinfoDetected || 0;
      stats.mythsDetected += message.mythsDetected || 0;
      chrome.storage.local.set({ stats });
      sendResponse({ success: true });
    });
    return true; // async response
  }

  if (message.type === 'GET_STATE') {
    chrome.storage.local.get(['enabled'], (result) => {
      sendResponse({ enabled: result.enabled !== false });
    });
    return true;
  }
});
