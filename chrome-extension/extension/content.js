// Femstral Health Aid - Content Script for Reddit
// Scans Reddit comments for health claims and misinformation using
// multi-signal scoring with subreddit-specific calibration

(function () {
  'use strict';

  let isEnabled = true;
  let processedElements = new WeakSet();
  let sessionClaimsScanned = 0;
  let sessionFlagsRaised = 0;
  let sessionMisinfoDetected = 0;
  let sessionMythsDetected = 0;

  // Shield SVG icon used throughout
  const SHIELD_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#a855f7"/>
    <path d="M9.5 12.5l2 2 3.5-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  // Status icons
  const STATUS_ICONS = {
    supported: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/><path d="M8 12l3 3 5-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    partial: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" fill="#fef9c3" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
    unsupported: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/><path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>`
  };

  // Risk level icons
  const RISK_ICONS = {
    low: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" fill="#fef9c3" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
    medium: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" fill="#ffedd5" stroke="#f97316" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="#f97316" stroke-width="2" stroke-linecap="round"/></svg>`,
    high: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>`,
    critical: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/><path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>`
  };

  const STATUS_LABELS = {
    supported: 'Supported by Clinical Evidence',
    partial: 'Partially Supported',
    unsupported: 'Not Evidence-Based'
  };

  const STATUS_COLORS = {
    supported: { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' },
    partial: { bg: '#fef9c3', border: '#fde68a', text: '#854d0e' },
    unsupported: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' }
  };

  const RISK_COLORS = {
    low: { bg: '#fef9c3', border: '#fde68a', text: '#854d0e' },
    medium: { bg: '#ffedd5', border: '#fed7aa', text: '#9a3412' },
    high: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' },
    critical: { bg: '#fee2e2', border: '#fca5a5', text: '#7f1d1d' }
  };

  // ─── Initialization ──────────────────────────────────────────────

  function init() {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        isEnabled = response.enabled;
      }
      if (isEnabled) {
        scanPage();
        observeDOM();
      }
    });
  }

  // Listen for toggle messages from popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_FEMSTRAL') {
      isEnabled = message.enabled;
      if (isEnabled) {
        scanPage();
        observeDOM();
      } else {
        removeAllPanels();
      }
    }
  });

  // ─── DOM Scanning ────────────────────────────────────────────────

  function scanPage() {
    if (!isEnabled) return;

    // Reddit New UI (2024+ "shreddit") — comments rendered as <shreddit-comment>
    const shredditComments = document.querySelectorAll('shreddit-comment');
    shredditComments.forEach((comment) => processShredditComment(comment));

    // Reddit Redesign — comments with data-testid
    const redesignComments = document.querySelectorAll('[data-testid="comment"]');
    redesignComments.forEach((comment) => processRedesignComment(comment));

    // Old Reddit — .comment elements
    const oldComments = document.querySelectorAll('.thing.comment');
    oldComments.forEach((comment) => processOldRedditComment(comment));

    // Generic fallback: any <p> within common Reddit containers
    if (shredditComments.length === 0 && redesignComments.length === 0 && oldComments.length === 0) {
      processFallback();
    }

    updateStats();
  }

  // ─── Shreddit (New Reddit 2024+) ─────────────────────────────────

  function processShredditComment(commentEl) {
    if (processedElements.has(commentEl)) return;
    processedElements.add(commentEl);

    let text = '';
    const shadowRoot = commentEl.shadowRoot;

    if (shadowRoot) {
      const contentSlot = shadowRoot.querySelector('slot');
      if (contentSlot) {
        const assignedNodes = contentSlot.assignedNodes();
        assignedNodes.forEach(node => {
          text += node.textContent || '';
        });
      }
      if (!text) {
        text = shadowRoot.textContent || '';
      }
    }

    if (!text) {
      const paragraphs = commentEl.querySelectorAll('p, [slot="comment"], .md, .RichTextJSON-root');
      paragraphs.forEach(p => {
        text += ' ' + (p.textContent || '');
      });
    }

    if (!text) {
      text = commentEl.textContent || '';
    }

    analyzeAndInject(commentEl, text);
  }

  // ─── Reddit Redesign ─────────────────────────────────────────────

  function processRedesignComment(commentEl) {
    if (processedElements.has(commentEl)) return;
    processedElements.add(commentEl);

    const contentEl = commentEl.querySelector('[data-testid="comment"] p, .RichTextJSON-root, .md p, [id^="t1_"] p');
    let text = '';

    if (contentEl) {
      text = contentEl.closest('.md, .RichTextJSON-root, [data-testid="comment"]')?.textContent || contentEl.textContent || '';
    } else {
      const allP = commentEl.querySelectorAll('p');
      allP.forEach(p => { text += ' ' + p.textContent; });
    }

    if (!text) {
      text = commentEl.textContent || '';
    }

    analyzeAndInject(commentEl, text);
  }

  // ─── Old Reddit ──────────────────────────────────────────────────

  function processOldRedditComment(commentEl) {
    if (processedElements.has(commentEl)) return;
    processedElements.add(commentEl);

    const mdEl = commentEl.querySelector('.md');
    const text = mdEl ? mdEl.textContent : commentEl.textContent || '';

    analyzeAndInject(commentEl, text);
  }

  // ─── Fallback for unknown Reddit layouts ─────────────────────────

  function processFallback() {
    const selectors = [
      'main p',
      '[role="main"] p',
      '.Post p',
      'article p',
      '.Comment p',
      '.comment p'
    ];

    const allParagraphs = document.querySelectorAll(selectors.join(', '));
    const parentMap = new Map();

    allParagraphs.forEach(p => {
      const parent = p.closest('[class*="comment"], [class*="Comment"], [data-testid], article, .thing') || p.parentElement;
      if (parent && !processedElements.has(parent)) {
        if (!parentMap.has(parent)) {
          parentMap.set(parent, '');
        }
        parentMap.set(parent, parentMap.get(parent) + ' ' + p.textContent);
      }
    });

    parentMap.forEach((text, el) => {
      processedElements.add(el);
      analyzeAndInject(el, text);
    });
  }

  // ─── Unified Analysis & Injection ────────────────────────────────

  function analyzeAndInject(commentEl, text) {
    if (!text || text.length < 20) return;

    // Run the multi-signal fact checker
    const analysis = window.FemstralFactChecker
      ? window.FemstralFactChecker.analyzeComment(text)
      : null;

    // Fall back to legacy matching if fact checker isn't loaded
    if (!analysis) {
      const legacyClaims = matchHealthClaimsLegacy(text);
      if (legacyClaims.length > 0) {
        sessionClaimsScanned++;
        injectLegacyFactCheckButton(commentEl, legacyClaims);
      }
      return;
    }

    sessionClaimsScanned++;

    // Determine what to show
    const hasLegacyClaims = analysis.legacyClaims.length > 0;
    const hasMyths = analysis.myths.length > 0;
    const hasMisinfoSignals = analysis.signals.length > 0;

    if (hasLegacyClaims || hasMyths || hasMisinfoSignals) {
      sessionFlagsRaised++;
      if (hasMyths) sessionMythsDetected += analysis.myths.length;
      if (hasMisinfoSignals) sessionMisinfoDetected++;
      injectFactCheckButton(commentEl, analysis);
    }
  }

  // ─── Legacy Health Claim Matching (fallback) ────────────────────

  function matchHealthClaimsLegacy(text) {
    if (!text || text.length < 20 || !window.HEALTH_CLAIMS_DB) return [];

    const matches = [];
    const matchedIds = new Set();

    for (const claim of window.HEALTH_CLAIMS_DB) {
      if (matchedIds.has(claim.id)) continue;
      for (const pattern of claim.patterns) {
        if (pattern.test(text)) {
          matches.push(claim);
          matchedIds.add(claim.id);
          break;
        }
      }
    }

    matches.sort((a, b) => {
      const order = { unsupported: 0, partial: 1, supported: 2 };
      return order[a.status] - order[b.status];
    });

    return matches;
  }

  // ─── UI Injection ────────────────────────────────────────────────

  function injectFactCheckButton(commentEl, analysis) {
    if (commentEl.querySelector('.femstral-btn')) return;

    const { risk, confidence, signals, myths, legacyClaims, claimTypes, categorySummary } = analysis;

    // Determine badge style based on risk level or legacy claims
    let badgeLabel, badgeBg, badgeColor, badgeBorder;

    if (risk && signals.length > 0) {
      const colors = RISK_COLORS[risk.level] || RISK_COLORS.low;
      badgeLabel = risk.label;
      badgeBg = colors.bg;
      badgeColor = colors.text;
      badgeBorder = colors.border;
    } else if (legacyClaims.length > 0) {
      const primary = legacyClaims[0];
      const colors = STATUS_COLORS[primary.status];
      badgeLabel = `${legacyClaims.length} claim${legacyClaims.length === 1 ? '' : 's'}`;
      badgeBg = colors.bg;
      badgeColor = colors.text;
      badgeBorder = colors.border;
    } else if (myths.length > 0) {
      badgeLabel = `${myths.length} myth${myths.length === 1 ? '' : 's'}`;
      badgeBg = '#fee2e2';
      badgeColor = '#991b1b';
      badgeBorder = '#fecaca';
    } else {
      return;
    }

    const totalItems = (legacyClaims?.length || 0) + (myths?.length || 0) + (signals.length > 0 ? 1 : 0);

    // Create button
    const btn = document.createElement('button');
    btn.className = 'femstral-btn';
    btn.innerHTML = `
      ${SHIELD_SVG}
      <span class="femstral-btn-label">Femstral</span>
      <span class="femstral-btn-badge" style="background:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder}">
        ${badgeLabel}
      </span>
    `;

    // Create the panel
    const panel = createFactCheckPanel(analysis);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      btn.classList.toggle('femstral-btn-active', !isVisible);
    });

    const targetParent = findInjectionPoint(commentEl);
    const wrapper = document.createElement('div');
    wrapper.className = 'femstral-wrapper';
    wrapper.appendChild(btn);
    wrapper.appendChild(panel);
    targetParent.appendChild(wrapper);
  }

  function injectLegacyFactCheckButton(commentEl, claims) {
    if (commentEl.querySelector('.femstral-btn')) return;
    sessionFlagsRaised++;
    const primaryClaim = claims[0];

    const btn = document.createElement('button');
    btn.className = 'femstral-btn';
    btn.setAttribute('data-status', primaryClaim.status);
    btn.innerHTML = `
      ${SHIELD_SVG}
      <span class="femstral-btn-label">Femstral</span>
      <span class="femstral-btn-badge" style="background:${STATUS_COLORS[primaryClaim.status].bg};color:${STATUS_COLORS[primaryClaim.status].text};border:1px solid ${STATUS_COLORS[primaryClaim.status].border}">
        ${claims.length} ${claims.length === 1 ? 'claim' : 'claims'}
      </span>
    `;

    const panel = createLegacyPanel(claims);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      btn.classList.toggle('femstral-btn-active', !isVisible);
    });

    const targetParent = findInjectionPoint(commentEl);
    const wrapper = document.createElement('div');
    wrapper.className = 'femstral-wrapper';
    wrapper.appendChild(btn);
    wrapper.appendChild(panel);
    targetParent.appendChild(wrapper);
  }

  function findInjectionPoint(commentEl) {
    const candidates = [
      commentEl.querySelector('.flat-list'),
      commentEl.querySelector('[class*="action"]'),
      commentEl.querySelector('.md'),
      commentEl.querySelector('.RichTextJSON-root'),
      commentEl.querySelector('[slot="comment"]'),
      commentEl
    ];

    for (const candidate of candidates) {
      if (candidate) return candidate;
    }
    return commentEl;
  }

  // ─── Fact-Check Panel (New Multi-Signal) ─────────────────────────

  function createFactCheckPanel(analysis) {
    const { score, confidence, risk, signals, myths, legacyClaims, claimTypes, categorySummary, context, subreddit } = analysis;
    const panel = document.createElement('div');
    panel.className = 'femstral-panel';
    panel.style.display = 'none';

    let sectionsHTML = '';

    // ── Risk Score & Confidence Header ──
    if (signals.length > 0 && risk) {
      const riskColors = RISK_COLORS[risk.level] || RISK_COLORS.low;
      const riskIcon = RISK_ICONS[risk.level] || RISK_ICONS.low;

      sectionsHTML += `
        <div class="femstral-claim">
          <div class="femstral-claim-header">
            <div class="femstral-claim-badge" style="background:${riskColors.bg};color:${riskColors.text};border:1px solid ${riskColors.border}">
              ${riskIcon}
              <span>${risk.label} — Misinformation Score: ${score}</span>
            </div>
            <span class="femstral-confidence">${confidence}% confidence</span>
          </div>
          ${subreddit ? `<p class="femstral-summary" style="font-size:11px;color:#7c3aed;margin-bottom:6px;">Calibrated for ${subreddit}</p>` : ''}
          ${context.isPersonalExperience && !context.isGivingAdvice
            ? '<p class="femstral-summary" style="font-size:11px;color:#64748b;margin-bottom:6px;">Note: This appears to be a personal experience, not medical advice. Risk score adjusted down.</p>'
            : ''}
          ${context.isGivingAdvice
            ? '<p class="femstral-summary" style="font-size:11px;color:#f97316;margin-bottom:6px;">This comment appears to give medical advice to others.</p>'
            : ''}
      `;

      // Claim types
      if (claimTypes.length > 0) {
        sectionsHTML += `
          <div class="femstral-citations" style="margin-bottom:8px;">
            ${claimTypes.map(t => `<span class="femstral-cite" style="background:#faf5ff;border-color:#e9d5ff;color:#7c3aed;">${t}</span>`).join('')}
          </div>
        `;
      }

      // Signal breakdown by category
      const CATEGORY_DISPLAY = window.FemstralFactChecker?.CATEGORY_DISPLAY || {};
      const sortedCategories = Object.entries(categorySummary)
        .sort((a, b) => b[1].totalWeight - a[1].totalWeight)
        .slice(0, 5);

      if (sortedCategories.length > 0) {
        sectionsHTML += `<div style="margin-bottom:10px;">`;
        for (const [cat, data] of sortedCategories) {
          const display = CATEGORY_DISPLAY[cat] || { name: cat };
          const barWidth = Math.min(Math.round((data.totalWeight / score) * 100), 100);
          sectionsHTML += `
            <div style="margin-bottom:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                <span style="font-size:11px;font-weight:600;color:#475569;">${display.name}</span>
                <span style="font-size:10px;color:#94a3b8;">${data.labels.length} signal${data.labels.length === 1 ? '' : 's'}</span>
              </div>
              <div style="height:4px;background:#f1f5f9;border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${barWidth}%;background:${risk.color};border-radius:2px;transition:width 0.3s;"></div>
              </div>
            </div>
          `;
        }
        sectionsHTML += `</div>`;
      }

      // Top signals detected
      const topSignals = signals.slice(0, 5);
      if (topSignals.length > 0) {
        sectionsHTML += `
          <div style="margin-bottom:8px;">
            <p style="font-size:11px;font-weight:600;color:#475569;margin:0 0 4px 0;">Signals Detected:</p>
            ${topSignals.map(s => `
              <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${risk.color};flex-shrink:0;"></span>
                <span style="font-size:11px;color:#64748b;">${s.label}</span>
              </div>
            `).join('')}
            ${signals.length > 5 ? `<p style="font-size:10px;color:#94a3b8;margin:4px 0 0;">+${signals.length - 5} more signals detected</p>` : ''}
          </div>
        `;
      }

      sectionsHTML += `</div>`;
    }

    // ── Recurring Myth Sections ──
    if (myths.length > 0) {
      for (const myth of myths) {
        sectionsHTML += `
          <div class="femstral-claim ${sectionsHTML ? 'femstral-claim-border' : ''}">
            <div class="femstral-claim-header">
              <div class="femstral-claim-badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca">
                ${STATUS_ICONS.unsupported}
                <span>Known Recurring Myth</span>
              </div>
            </div>
            <p class="femstral-summary" style="font-weight:600;font-size:12px;color:#991b1b;margin-bottom:4px;">
              Myth: "${myth.myth}"
            </p>
            <p class="femstral-summary">${myth.reality}</p>
            <div class="femstral-citations" style="margin-bottom:4px;">
              ${myth.citations.map(c => `<span class="femstral-cite">${c}</span>`).join('')}
            </div>
            ${myth.subreddits ? `
              <div style="margin-bottom:6px;">
                <span style="font-size:10px;color:#94a3b8;">Also seen in: ${myth.subreddits.join(', ')}</span>
              </div>
            ` : ''}
            <a href="${myth.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
              View Trusted Resource
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        `;
      }
    }

    // ── Legacy Health Claim Sections ──
    if (legacyClaims.length > 0) {
      for (const claim of legacyClaims) {
        const colors = STATUS_COLORS[claim.status];
        sectionsHTML += `
          <div class="femstral-claim ${sectionsHTML ? 'femstral-claim-border' : ''}">
            <div class="femstral-claim-header">
              <div class="femstral-claim-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
                ${STATUS_ICONS[claim.status]}
                <span>${STATUS_LABELS[claim.status]}</span>
              </div>
              <span class="femstral-confidence">${claim.confidence}% confidence</span>
            </div>
            <p class="femstral-summary">${claim.summary}</p>
            <div class="femstral-citations">
              ${claim.citations.map(c => `<span class="femstral-cite">${c}</span>`).join('')}
            </div>
            <a href="${claim.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
              View Trusted Resource
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        `;
      }
    }

    panel.innerHTML = `
      <div class="femstral-panel-header">
        <div class="femstral-logo-row">
          ${SHIELD_SVG}
          <span class="femstral-panel-title">Femstral Health Aid</span>
        </div>
        <button class="femstral-close" title="Close panel">&times;</button>
      </div>
      <div class="femstral-panel-body">
        ${sectionsHTML}
      </div>
      <div class="femstral-panel-footer">
        <span class="femstral-disclaimer">This is not medical advice. Always consult a healthcare professional. Fact-check analysis uses multi-signal scoring across ${signals.length} detected signals.</span>
      </div>
    `;

    panel.querySelector('.femstral-close').addEventListener('click', (e) => {
      e.stopPropagation();
      panel.style.display = 'none';
      const btn = panel.parentElement?.querySelector('.femstral-btn');
      if (btn) btn.classList.remove('femstral-btn-active');
    });

    return panel;
  }

  function createLegacyPanel(claims) {
    const panel = document.createElement('div');
    panel.className = 'femstral-panel';
    panel.style.display = 'none';

    let claimsHTML = claims.map((claim, i) => {
      const colors = STATUS_COLORS[claim.status];
      return `
        <div class="femstral-claim ${i > 0 ? 'femstral-claim-border' : ''}">
          <div class="femstral-claim-header">
            <div class="femstral-claim-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
              ${STATUS_ICONS[claim.status]}
              <span>${STATUS_LABELS[claim.status]}</span>
            </div>
            <span class="femstral-confidence">${claim.confidence}% confidence</span>
          </div>
          <p class="femstral-summary">${claim.summary}</p>
          <div class="femstral-citations">
            ${claim.citations.map(c => `<span class="femstral-cite">${c}</span>`).join('')}
          </div>
          <a href="${claim.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
            View Trusted Resource
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="femstral-panel-header">
        <div class="femstral-logo-row">
          ${SHIELD_SVG}
          <span class="femstral-panel-title">Femstral Health Aid</span>
        </div>
        <button class="femstral-close" title="Close panel">&times;</button>
      </div>
      <div class="femstral-panel-body">
        ${claimsHTML}
      </div>
      <div class="femstral-panel-footer">
        <span class="femstral-disclaimer">This is not medical advice. Always consult a healthcare professional.</span>
      </div>
    `;

    panel.querySelector('.femstral-close').addEventListener('click', (e) => {
      e.stopPropagation();
      panel.style.display = 'none';
      const btn = panel.parentElement?.querySelector('.femstral-btn');
      if (btn) btn.classList.remove('femstral-btn-active');
    });

    return panel;
  }

  // ─── Floating Action Button ───────────────────────────────────────

  function createFloatingButton() {
    if (document.querySelector('.femstral-fab')) return;

    const subreddit = window.FemstralFactChecker
      ? window.FemstralFactChecker.detectSubreddit()
      : null;

    const fab = document.createElement('div');
    fab.className = 'femstral-fab';
    fab.innerHTML = `
      <button class="femstral-fab-btn" title="Femstral Health Aid">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#a855f7"/>
          <path d="M12 4L5 8v5c0 4.52 3.13 8.75 7 9.8V4z" fill="#7c3aed" opacity="0.3"/>
          <path d="M9.5 12.5l2 2 3.5-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="femstral-fab-tooltip" style="display:none">
        <div class="femstral-fab-tooltip-header">
          ${SHIELD_SVG}
          <span>Femstral Health Aid</span>
        </div>
        ${subreddit ? `<p style="font-size:11px;color:#7c3aed;margin:0 0 6px 0;font-weight:600;">Monitoring: ${subreddit.name} (Risk: ${subreddit.riskMultiplier}x)</p>` : ''}
        <p class="femstral-fab-tooltip-status">Scanning for health claims and misinformation...</p>
        <div class="femstral-fab-tooltip-stats">
          <span><strong id="femstral-fab-scanned">0</strong> scanned</span>
          <span><strong id="femstral-fab-flagged">0</strong> flagged</span>
          <span><strong id="femstral-fab-misinfo">0</strong> misinfo</span>
          <span><strong id="femstral-fab-myths">0</strong> myths</span>
        </div>
        <div id="femstral-fab-subreddit-info" style="margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;display:none;">
          <p style="font-size:10px;color:#94a3b8;margin:0;">Subreddit-specific calibration active</p>
        </div>
      </div>
    `;

    const btnEl = fab.querySelector('.femstral-fab-btn');
    const tooltip = fab.querySelector('.femstral-fab-tooltip');

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = tooltip.style.display !== 'none';
      tooltip.style.display = visible ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      tooltip.style.display = 'none';
    });

    document.body.appendChild(fab);
  }

  function updateFABStats() {
    const scannedEl = document.getElementById('femstral-fab-scanned');
    const flaggedEl = document.getElementById('femstral-fab-flagged');
    const misinfoEl = document.getElementById('femstral-fab-misinfo');
    const mythsEl = document.getElementById('femstral-fab-myths');
    const statusEl = document.querySelector('.femstral-fab-tooltip-status');
    const subInfoEl = document.getElementById('femstral-fab-subreddit-info');

    if (scannedEl) scannedEl.textContent = sessionClaimsScanned;
    if (flaggedEl) flaggedEl.textContent = sessionFlagsRaised;
    if (misinfoEl) misinfoEl.textContent = sessionMisinfoDetected;
    if (mythsEl) mythsEl.textContent = sessionMythsDetected;

    if (statusEl) {
      if (sessionFlagsRaised > 0) {
        const parts = [];
        if (sessionFlagsRaised > 0) parts.push(`${sessionFlagsRaised} comment${sessionFlagsRaised === 1 ? '' : 's'} with health claims`);
        if (sessionMisinfoDetected > 0) parts.push(`${sessionMisinfoDetected} with misinformation signals`);
        if (sessionMythsDetected > 0) parts.push(`${sessionMythsDetected} known myth${sessionMythsDetected === 1 ? '' : 's'}`);
        statusEl.textContent = `Found ${parts.join(', ')}`;
      } else if (sessionClaimsScanned > 0) {
        statusEl.textContent = 'Scanning complete — no health misinformation detected on this page';
      } else {
        statusEl.textContent = 'Scanning for health claims and misinformation...';
      }
    }

    // Show subreddit info if we're in a monitored subreddit
    if (subInfoEl) {
      const subreddit = window.FemstralFactChecker
        ? window.FemstralFactChecker.detectSubreddit()
        : null;
      if (subreddit && sessionFlagsRaised > 0) {
        subInfoEl.style.display = 'block';
        subInfoEl.innerHTML = `<p style="font-size:10px;color:#7c3aed;margin:0;">Calibrated for ${subreddit.name} — Risk multiplier: ${subreddit.riskMultiplier}x</p>`;
      }
    }
  }

  // ─── Utility ──────────────────────────────────────────────────────

  function removeAllPanels() {
    document.querySelectorAll('.femstral-wrapper').forEach(el => el.remove());
    document.querySelectorAll('.femstral-fab').forEach(el => el.remove());
  }

  function updateStats() {
    chrome.runtime.sendMessage({
      type: 'UPDATE_STATS',
      claimsScanned: sessionClaimsScanned,
      flagsRaised: sessionFlagsRaised,
      sessionCount: sessionFlagsRaised,
      misinfoDetected: sessionMisinfoDetected,
      mythsDetected: sessionMythsDetected
    }).catch(() => {});

    updateFABStats();
  }

  // ─── DOM Observer (for dynamically loaded comments) ───────────────

  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;

      let shouldScan = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.matches?.('shreddit-comment, [data-testid="comment"], .thing.comment, .Comment') ||
              node.querySelector?.('shreddit-comment, [data-testid="comment"], .thing.comment, .Comment, p')
            ) {
              shouldScan = true;
              break;
            }
          }
        }
        if (shouldScan) break;
      }

      if (shouldScan) {
        clearTimeout(observeDOM._timeout);
        observeDOM._timeout = setTimeout(() => scanPage(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ─── Text Selection Insight ──────────────────────────────────────

  function setupTextSelection() {
    let selectionPopup = null;

    document.addEventListener('mouseup', (e) => {
      if (!isEnabled) return;

      if (selectionPopup) {
        selectionPopup.remove();
        selectionPopup = null;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 15) return;

      // Try multi-signal analysis first
      let popupContent = null;

      if (window.FemstralFactChecker) {
        const analysis = window.FemstralFactChecker.analyzeComment(text);
        if (analysis) {
          popupContent = buildSelectionPopupContent(analysis);
        }
      }

      // Fall back to legacy matching
      if (!popupContent) {
        const claims = matchHealthClaimsLegacy(text);
        if (claims.length > 0) {
          popupContent = buildLegacySelectionPopupContent(claims[0]);
        }
      }

      if (!popupContent) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      selectionPopup = document.createElement('div');
      selectionPopup.className = 'femstral-selection-popup';
      selectionPopup.style.top = `${rect.bottom + window.scrollY + 8}px`;
      selectionPopup.style.left = `${rect.left + window.scrollX}px`;
      selectionPopup.innerHTML = popupContent;

      selectionPopup.querySelector('.femstral-selection-close').addEventListener('click', () => {
        selectionPopup.remove();
        selectionPopup = null;
      });

      document.body.appendChild(selectionPopup);
    });

    document.addEventListener('mousedown', (e) => {
      if (selectionPopup && !selectionPopup.contains(e.target)) {
        selectionPopup.remove();
        selectionPopup = null;
      }
    });
  }

  function buildSelectionPopupContent(analysis) {
    const { risk, confidence, signals, myths, legacyClaims, claimTypes } = analysis;

    let body = '';

    // Show risk level
    if (risk && signals.length > 0) {
      const riskColors = RISK_COLORS[risk.level] || RISK_COLORS.low;
      const riskIcon = RISK_ICONS[risk.level] || RISK_ICONS.low;
      body += `
        <div class="femstral-claim-badge" style="background:${riskColors.bg};color:${riskColors.text};border:1px solid ${riskColors.border};margin-bottom:8px;">
          ${riskIcon}
          <span>${risk.label} — Score: ${analysis.score}</span>
        </div>
        <p style="font-size:11px;color:#94a3b8;margin:0 0 6px;">${confidence}% confidence | ${signals.length} signal${signals.length === 1 ? '' : 's'} detected</p>
      `;

      // Show top signals
      const topSignals = signals.slice(0, 3);
      if (topSignals.length > 0) {
        body += topSignals.map(s => `
          <div style="display:flex;align-items:center;gap:6px;padding:2px 0;">
            <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${risk.color};flex-shrink:0;"></span>
            <span style="font-size:11px;color:#64748b;">${s.label}</span>
          </div>
        `).join('');
      }
    }

    // Show myth info
    if (myths.length > 0) {
      const myth = myths[0];
      body += `
        <div class="femstral-claim-badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca;margin:8px 0;">
          ${STATUS_ICONS.unsupported}
          <span>Known Myth</span>
        </div>
        <p class="femstral-selection-summary" style="font-weight:600;color:#991b1b;margin-bottom:4px;">"${myth.myth}"</p>
        <p class="femstral-selection-summary">${myth.reality}</p>
        <a href="${myth.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
          Learn More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      `;
    }

    // Show legacy claim
    if (legacyClaims.length > 0 && myths.length === 0) {
      const claim = legacyClaims[0];
      const colors = STATUS_COLORS[claim.status];
      body += `
        <div class="femstral-claim-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};margin:8px 0;">
          ${STATUS_ICONS[claim.status]}
          <span>${STATUS_LABELS[claim.status]}</span>
        </div>
        <p class="femstral-selection-summary">${claim.summary}</p>
        <a href="${claim.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
          Learn More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      `;
    }

    if (!body) return null;

    return `
      <div class="femstral-selection-header">
        ${SHIELD_SVG}
        <span>Femstral Fact Check</span>
        <button class="femstral-selection-close">&times;</button>
      </div>
      ${body}
    `;
  }

  function buildLegacySelectionPopupContent(claim) {
    const colors = STATUS_COLORS[claim.status];
    return `
      <div class="femstral-selection-header">
        ${SHIELD_SVG}
        <span>Femstral Insight</span>
        <button class="femstral-selection-close">&times;</button>
      </div>
      <div class="femstral-claim-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
        ${STATUS_ICONS[claim.status]}
        <span>${STATUS_LABELS[claim.status]}</span>
      </div>
      <p class="femstral-selection-summary">${claim.summary}</p>
      <a href="${claim.resourceUrl}" target="_blank" rel="noopener noreferrer" class="femstral-resource-link">
        Learn More
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    `;
  }

  // ─── Start ───────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      createFloatingButton();
      setupTextSelection();
    });
  } else {
    init();
    createFloatingButton();
    setupTextSelection();
  }

})();
