document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const statsSection = document.getElementById('statsSection');
  const notReddit = document.getElementById('notReddit');
  const claimsScanned = document.getElementById('claimsScanned');
  const flagsRaised = document.getElementById('flagsRaised');
  const misinfoDetected = document.getElementById('misinfoDetected');
  const mythsDetected = document.getElementById('mythsDetected');
  const statusCard = document.getElementById('statusCard');

  // Check if we're on Reddit
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isReddit = tab && tab.url && tab.url.includes('reddit.com');

    if (!isReddit) {
      statusCard.style.display = 'none';
      statsSection.style.display = 'none';
      notReddit.style.display = 'block';
    }
  });

  // Load saved state
  chrome.storage.local.get(['enabled', 'stats'], (result) => {
    const enabled = result.enabled !== false; // default true
    enableToggle.checked = enabled;
    updateStatusUI(enabled);

    if (result.stats) {
      claimsScanned.textContent = result.stats.claimsScanned || 0;
      flagsRaised.textContent = result.stats.flagsRaised || 0;
      misinfoDetected.textContent = result.stats.misinfoDetected || 0;
      mythsDetected.textContent = result.stats.mythsDetected || 0;
    }
  });

  // Toggle handler
  enableToggle.addEventListener('change', () => {
    const enabled = enableToggle.checked;
    chrome.storage.local.set({ enabled });
    updateStatusUI(enabled);

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_FEMSTRAL',
          enabled
        }).catch(() => {});
      }
    });
  });

  function updateStatusUI(enabled) {
    statusDot.className = 'status-dot' + (enabled ? ' active' : '');
    statusText.textContent = enabled ? 'Active on Reddit' : 'Paused';
  }

  // Listen for stat updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.stats) {
      const stats = changes.stats.newValue;
      claimsScanned.textContent = stats.claimsScanned || 0;
      flagsRaised.textContent = stats.flagsRaised || 0;
      misinfoDetected.textContent = stats.misinfoDetected || 0;
      mythsDetected.textContent = stats.mythsDetected || 0;
    }
  });
});
