// Femstral Health Aid - Multi-Signal Fact-Checking Engine
// Analyzes Reddit comments using weighted multi-signal scoring across
// misinformation categories, with subreddit-specific calibration and
// contextual awareness.

const FemstralFactChecker = (function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Minimum total risk score to flag a comment
    flagThreshold: 4.0,
    // Minimum text length to analyze
    minTextLength: 20,
    // Maximum signals to report per comment
    maxSignalsPerComment: 10,
    // Score ranges for risk levels
    riskLevels: {
      low: { min: 4.0, max: 7.0, label: 'Low Risk', color: '#f59e0b' },
      medium: { min: 7.0, max: 12.0, label: 'Medium Risk', color: '#f97316' },
      high: { min: 12.0, max: 18.0, label: 'High Risk', color: '#ef4444' },
      critical: { min: 18.0, max: Infinity, label: 'Critical Risk', color: '#dc2626' }
    },
    // Weight for context modifiers
    contextModifiers: {
      personalExperience: 0.6,   // Reduce weight when sharing personal experience
      medicalAdvice: 1.4,        // Increase weight when giving medical advice
      urgentLanguage: 1.3,       // Increase weight when using urgent language
      productPromotion: 1.5      // Increase weight when promoting products
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // SUBREDDIT DETECTION
  // ═══════════════════════════════════════════════════════════════════

  function detectSubreddit() {
    const url = window.location.href;
    const match = url.match(/reddit\.com\/r\/([^\/\?#]+)/i);
    if (!match) return null;

    const subredditName = match[1];
    const patterns = window.MISINFO_PATTERNS;
    if (!patterns || !patterns.subredditCalibration) return null;

    // Check for exact match or case-insensitive match
    for (const key of Object.keys(patterns.subredditCalibration)) {
      if (key.toLowerCase() === subredditName.toLowerCase()) {
        return {
          key: key,
          ...patterns.subredditCalibration[key]
        };
      }
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT ANALYSIS
  // ═══════════════════════════════════════════════════════════════════

  function analyzeContext(text) {
    const context = {
      isPersonalExperience: false,
      isGivingAdvice: false,
      hasUrgentLanguage: false,
      hasProductPromotion: false,
      contextMultiplier: 1.0
    };

    // Detect personal experience framing
    const personalPatterns = [
      /\b(I|my|me)\s+(tried|took|used|started|did|found|discovered|experienced|had|was)\b/i,
      /\b(for me|in my (experience|case)|personally|what worked for me)\b/i,
      /\b(I.?m\s+(not|no)\s+(a\s+)?doctor)\b/i,
      /\b(just\s+my\s+(experience|opinion|story))\b/i
    ];

    // Detect advice-giving framing
    const advicePatterns = [
      /\b(you\s+should|you\s+need\s+to|you\s+must|you\s+have\s+to|try\s+this|do\s+this)\b/i,
      /\b(take|start\s+taking|stop\s+taking|switch\s+to|get\s+off)\b/i,
      /\b(here.?s\s+(what|how)|this\s+is\s+(what|how)\s+you)\b/i,
      /\b(trust\s+me|listen\s+to\s+me|I.?m\s+telling\s+you)\b/i,
      /\b(don.?t\s+(take|use|trust|listen|go|see|visit))\b/i
    ];

    // Detect urgent language
    const urgentPatterns = [
      /\b(immediately|right\s+now|ASAP|urgent|emergency)\b/i,
      /\b(stop\s+(taking|using|doing)\s+(this|it|that)\s+(right\s+now|immediately|now|today))\b/i,
      /\b(before\s+it.?s\s+too\s+late)\b/i,
      /!!+/
    ];

    // Detect product promotion
    const promoPatterns = [
      /\b(DM\s+me|link\s+in\s+(my\s+)?(bio|profile)|use\s+my\s+(code|link|referral))\b/i,
      /\b(check\s+out\s+my|affiliate|discount\s+code|promo\s+code)\b/i,
      /\b(brand|product|company)\s+(name|called|link)/i
    ];

    for (const p of personalPatterns) {
      if (p.test(text)) { context.isPersonalExperience = true; break; }
    }
    for (const p of advicePatterns) {
      if (p.test(text)) { context.isGivingAdvice = true; break; }
    }
    for (const p of urgentPatterns) {
      if (p.test(text)) { context.hasUrgentLanguage = true; break; }
    }
    for (const p of promoPatterns) {
      if (p.test(text)) { context.hasProductPromotion = true; break; }
    }

    // Calculate context multiplier
    let multiplier = 1.0;

    if (context.isPersonalExperience && !context.isGivingAdvice) {
      multiplier *= CONFIG.contextModifiers.personalExperience;
    }
    if (context.isGivingAdvice) {
      multiplier *= CONFIG.contextModifiers.medicalAdvice;
    }
    if (context.hasUrgentLanguage) {
      multiplier *= CONFIG.contextModifiers.urgentLanguage;
    }
    if (context.hasProductPromotion) {
      multiplier *= CONFIG.contextModifiers.productPromotion;
    }

    context.contextMultiplier = multiplier;
    return context;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIGNAL SCANNING
  // ═══════════════════════════════════════════════════════════════════

  function scanPatternGroup(text, patterns, groupWeight, groupCategory) {
    const signals = [];
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        signals.push({
          category: groupCategory || pattern.category,
          label: pattern.label,
          weight: pattern.weight * (groupWeight || 1.0),
          rawWeight: pattern.weight
        });
      }
    }
    return signals;
  }

  function scanAllSignals(text) {
    const patterns = window.MISINFO_PATTERNS;
    if (!patterns) return [];

    let allSignals = [];

    // 1. Anti-establishment phrases
    if (patterns.antiEstablishment) {
      allSignals = allSignals.concat(
        scanPatternGroup(text, patterns.antiEstablishment.patterns, 1.0, 'anti_establishment')
      );
    }

    // 2. Overclaiming language
    if (patterns.overclaiming) {
      allSignals = allSignals.concat(
        scanPatternGroup(text, patterns.overclaiming.patterns, 1.0, 'overclaiming')
      );
    }

    // 3. Pseudo-scientific terminology
    if (patterns.pseudoScience) {
      allSignals = allSignals.concat(
        scanPatternGroup(text, patterns.pseudoScience.patterns, 1.0, 'pseudo_science')
      );
    }

    // 4. Empowerment-framed misinformation
    if (patterns.empowermentMisinfo) {
      allSignals = allSignals.concat(
        scanPatternGroup(text, patterns.empowermentMisinfo.patterns, 1.0, 'empowerment_misinfo')
      );
    }

    // 5. Keyword clusters
    if (patterns.keywordClusters) {
      for (const [clusterName, cluster] of Object.entries(patterns.keywordClusters)) {
        allSignals = allSignals.concat(
          scanPatternGroup(text, cluster.patterns, 1.0, cluster.category)
        );
      }
    }

    // 6. Misinformation formats
    if (patterns.misinfoFormats) {
      for (const [formatName, format] of Object.entries(patterns.misinfoFormats)) {
        allSignals = allSignals.concat(
          scanPatternGroup(text, format.patterns, 1.0, format.category)
        );
      }
    }

    // 7. Emotional tone patterns
    if (patterns.emotionalTone) {
      for (const [toneName, tone] of Object.entries(patterns.emotionalTone)) {
        allSignals = allSignals.concat(
          scanPatternGroup(text, tone.patterns, 1.0, tone.category)
        );
      }
    }

    return allSignals;
  }

  // ═══════════════════════════════════════════════════════════════════
  // MYTH DETECTION
  // ═══════════════════════════════════════════════════════════════════

  function scanForMyths(text, subreddit) {
    const patterns = window.MISINFO_PATTERNS;
    if (!patterns || !patterns.recurringMyths) return [];

    const mythMatches = [];
    for (const myth of patterns.recurringMyths) {
      for (const pattern of myth.patterns) {
        if (pattern.test(text)) {
          let relevanceBoost = 1.0;
          // Boost if this myth is known to be common in the current subreddit
          if (subreddit && myth.subreddits) {
            const subredditName = 'r/' + subreddit.key;
            if (myth.subreddits.includes(subredditName)) {
              relevanceBoost = 1.3;
            }
          }

          mythMatches.push({
            id: myth.id,
            myth: myth.myth,
            reality: myth.reality,
            weight: myth.weight * relevanceBoost,
            citations: myth.citations,
            resourceUrl: myth.resourceUrl,
            subreddits: myth.subreddits
          });
          break;
        }
      }
    }
    return mythMatches;
  }

  // ═══════════════════════════════════════════════════════════════════
  // LEGACY HEALTH CLAIMS MATCHING
  // ═══════════════════════════════════════════════════════════════════

  function matchLegacyHealthClaims(text) {
    if (!window.HEALTH_CLAIMS_DB) return [];

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

    return matches;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════════════

  function calculateScore(signals, context, subreddit) {
    if (signals.length === 0) return 0;

    let totalScore = 0;
    const categoryScores = {};

    // Sum weighted signals
    for (const signal of signals) {
      const cat = signal.category;
      if (!categoryScores[cat]) categoryScores[cat] = 0;
      categoryScores[cat] += signal.weight;
      totalScore += signal.weight;
    }

    // Apply context multiplier
    totalScore *= context.contextMultiplier;

    // Apply subreddit calibration
    if (subreddit) {
      totalScore *= subreddit.riskMultiplier;

      // Extra boost if signals match the subreddit's high-risk topics
      for (const [cat, score] of Object.entries(categoryScores)) {
        if (subreddit.highRiskTopics && subreddit.highRiskTopics.includes(cat)) {
          totalScore += score * 0.2; // 20% bonus for high-risk-topic matches
        }
      }
    }

    return Math.round(totalScore * 100) / 100;
  }

  function determineRiskLevel(score) {
    for (const [level, range] of Object.entries(CONFIG.riskLevels)) {
      if (score >= range.min && score < range.max) {
        return { level, ...range };
      }
    }
    return null;
  }

  function calculateConfidence(signals, myths, legacyClaims, textLength) {
    // Base confidence from signal count and diversity
    const categorySet = new Set(signals.map(s => s.category));
    const categoryDiversity = categorySet.size;

    let confidence = 0;

    // More categories matched = higher confidence in the analysis
    confidence += Math.min(categoryDiversity * 12, 48);

    // More total signals = higher confidence
    confidence += Math.min(signals.length * 5, 25);

    // Myth matches are high confidence
    confidence += Math.min(myths.length * 15, 30);

    // Legacy claim matches add baseline confidence
    confidence += Math.min(legacyClaims.length * 8, 16);

    // Longer text generally provides more confident analysis
    if (textLength > 200) confidence += 5;
    if (textLength > 500) confidence += 5;

    // Cap at 97 (never 100% certain)
    return Math.min(Math.max(confidence, 35), 97);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CLAIM TYPE CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════════

  function classifyClaimTypes(signals, myths) {
    const types = new Set();

    const categoryToClaimType = {
      'anti_establishment': 'Anti-Medical Framing',
      'overclaiming': 'Treatment Efficacy',
      'pseudo_science': 'Pseudoscientific Claims',
      'empowerment_misinfo': 'Empowerment Misinformation',
      'unproven_treatment': 'Unproven Treatment',
      'supplement_overclaim': 'Supplement Promotion',
      'unrecognized_diagnosis': 'Unrecognized Diagnosis',
      'anti_medical': 'Anti-Medical Framing',
      'natural_superiority': 'Natural Superiority Claims',
      'testimonial_as_proof': 'Anecdotal Evidence',
      'single_study': 'Misinterpreted Research',
      'doctor_was_wrong': 'Anti-Medical Framing',
      'product_promotion': 'Product Promotion',
      'fear_based': 'Fear-Based Warning',
      'fear_tone': 'Fear-Based Warning',
      'empowerment_tone': 'Empowerment Misinformation',
      'anti_pharma_tone': 'Anti-Medical Framing',
      'community_validation_tone': 'Community Validation'
    };

    for (const signal of signals) {
      const claimType = categoryToClaimType[signal.category];
      if (claimType) types.add(claimType);
    }

    for (const myth of myths) {
      types.add('Known Recurring Myth');
    }

    return Array.from(types);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUILD CATEGORY SUMMARY
  // ═══════════════════════════════════════════════════════════════════

  function buildCategorySummary(signals) {
    const summary = {};

    for (const signal of signals) {
      if (!summary[signal.category]) {
        summary[signal.category] = {
          count: 0,
          totalWeight: 0,
          labels: []
        };
      }
      summary[signal.category].count++;
      summary[signal.category].totalWeight += signal.weight;
      if (!summary[signal.category].labels.includes(signal.label)) {
        summary[signal.category].labels.push(signal.label);
      }
    }

    return summary;
  }

  // Category display names
  const CATEGORY_DISPLAY = {
    'anti_establishment': { name: 'Anti-Establishment Language', icon: 'warning' },
    'overclaiming': { name: 'Overclaiming / Absolute Language', icon: 'alert' },
    'pseudo_science': { name: 'Pseudo-Scientific Terminology', icon: 'flask' },
    'empowerment_misinfo': { name: 'Empowerment-Framed Misinformation', icon: 'shield' },
    'unproven_treatment': { name: 'Unproven Treatment', icon: 'pill' },
    'supplement_overclaim': { name: 'Supplement Overclaims', icon: 'pill' },
    'unrecognized_diagnosis': { name: 'Unrecognized Diagnosis', icon: 'stethoscope' },
    'anti_medical': { name: 'Anti-Medical Framing', icon: 'hospital' },
    'natural_superiority': { name: 'Natural Superiority Claims', icon: 'leaf' },
    'testimonial_as_proof': { name: 'Personal Testimonial as Proof', icon: 'quote' },
    'single_study': { name: 'Misinterpreted Research', icon: 'book' },
    'doctor_was_wrong': { name: 'Doctor Was Wrong Narrative', icon: 'hospital' },
    'product_promotion': { name: 'Product/Supplement Promotion', icon: 'cart' },
    'fear_based': { name: 'Fear-Based Warning', icon: 'danger' },
    'fear_tone': { name: 'Fear-Based Tone', icon: 'danger' },
    'empowerment_tone': { name: 'Empowerment Tone', icon: 'shield' },
    'anti_pharma_tone': { name: 'Anti-Pharma Tone', icon: 'warning' },
    'community_validation_tone': { name: 'Community Validation', icon: 'people' }
  };

  // ═══════════════════════════════════════════════════════════════════
  // MAIN ANALYSIS FUNCTION
  // ═══════════════════════════════════════════════════════════════════

  function analyzeComment(text) {
    if (!text || text.length < CONFIG.minTextLength) {
      return null;
    }

    // 1. Detect current subreddit
    const subreddit = detectSubreddit();

    // 2. Analyze context (personal experience vs advice)
    const context = analyzeContext(text);

    // 3. Scan all misinformation signals
    const signals = scanAllSignals(text);

    // 4. Scan for known recurring myths
    const myths = scanForMyths(text, subreddit);

    // 5. Match legacy health claims database
    const legacyClaims = matchLegacyHealthClaims(text);

    // 6. Calculate composite score
    const score = calculateScore(signals, context, subreddit);

    // 7. Determine risk level
    const risk = determineRiskLevel(score);

    // If score is below threshold AND no legacy claims, return null
    if (score < CONFIG.flagThreshold && legacyClaims.length === 0 && myths.length === 0) {
      return null;
    }

    // 8. Calculate confidence
    const confidence = calculateConfidence(signals, myths, legacyClaims, text.length);

    // 9. Classify claim types
    const claimTypes = classifyClaimTypes(signals, myths);

    // 10. Build category summary
    const categorySummary = buildCategorySummary(signals);

    // 11. Limit signals reported
    const topSignals = signals
      .sort((a, b) => b.weight - a.weight)
      .slice(0, CONFIG.maxSignalsPerComment);

    return {
      score,
      confidence,
      risk: risk || { level: 'low', label: 'Low Risk', color: '#f59e0b' },
      signals: topSignals,
      signalCount: signals.length,
      myths,
      legacyClaims,
      claimTypes,
      categorySummary,
      context,
      subreddit: subreddit ? subreddit.name : null,
      subredditKey: subreddit ? subreddit.key : null
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════

  return {
    analyzeComment,
    detectSubreddit,
    analyzeContext,
    CONFIG,
    CATEGORY_DISPLAY,
    // Expose for testing
    _scanAllSignals: scanAllSignals,
    _scanForMyths: scanForMyths,
    _calculateScore: calculateScore,
    _determineRiskLevel: determineRiskLevel
  };

})();

// Make available globally
if (typeof window !== 'undefined') {
  window.FemstralFactChecker = FemstralFactChecker;
}
