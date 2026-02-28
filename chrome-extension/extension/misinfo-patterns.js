// Femstral Health Aid - Misinformation Pattern Database
// Comprehensive pattern library for detecting health misinformation
// across women's health subreddits: r/PCOS, r/Endo, r/BabyBumps, r/birthcontrol,
// r/Menopause, r/infertility, r/Healthyhooha, r/WomensHealth, r/TwoXChromosomes,
// r/Perimenopause, r/TryingForABaby

const MISINFO_PATTERNS = {

  // ═══════════════════════════════════════════════════════════════════
  // 1. ANTI-ESTABLISHMENT PHRASES
  // ═══════════════════════════════════════════════════════════════════
  antiEstablishment: {
    weight: 3.0,
    category: 'anti_establishment',
    patterns: [
      { regex: /doctors?\s*(don.?t|doesn.?t|won.?t)\s*(want|let)\s*you\s*(to\s*)?(know|find\s*out)/i, weight: 3.5, label: 'Doctors hiding information' },
      { regex: /big\s*pharma\s*(is|are)?\s*(hiding|suppress|conceal|cover)/i, weight: 3.5, label: 'Big Pharma conspiracy' },
      { regex: /they\s*(profit|make\s*money)\s*from\s*(keeping|making)\s*you\s*sick/i, weight: 3.0, label: 'Profit from illness' },
      { regex: /conventional\s*medicine\s*has\s*failed/i, weight: 2.5, label: 'Medicine has failed' },
      { regex: /wake\s*up\s*to\s*what\s*they.{0,10}(not|aren.?t)\s*telling\s*you/i, weight: 3.0, label: 'Wake up narrative' },
      { regex: /medical.?industrial\s*complex/i, weight: 2.5, label: 'Medical-industrial complex' },
      { regex: /pharma.{0,20}(doesn.?t|don.?t)\s*(care|want)/i, weight: 2.5, label: 'Pharma doesn\'t care' },
      { regex: /suppressed\s*(cure|treatment|remedy)/i, weight: 3.5, label: 'Suppressed cure' },
      { regex: /what\s*(your\s*)?doctor.{0,15}(won.?t|doesn.?t|isn.?t)\s*tell/i, weight: 3.0, label: 'Doctor won\'t tell you' },
      { regex: /profit\s*over\s*patients/i, weight: 2.5, label: 'Profit over patients' },
      { regex: /big\s*pharma/i, weight: 1.5, label: 'Big Pharma mention' },
      { regex: /medical\s*establishment\s*(doesn.?t|don.?t|won.?t|refuse|fail)/i, weight: 2.5, label: 'Medical establishment failing' },
      { regex: /mainstream\s*medicine\s*(ignor|dismiss|refus|fail|won.?t)/i, weight: 2.0, label: 'Mainstream medicine critique' },
      { regex: /they\s*don.?t\s*want\s*you\s*to\s*know/i, weight: 3.0, label: 'They don\'t want you to know' },
      { regex: /the\s*truth\s*(about|behind)\s*(your\s*)?(health|medicine|pharma|doctor)/i, weight: 2.0, label: 'Hidden truth framing' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // 2. ABSOLUTE / OVERCLAIMING LANGUAGE
  // ═══════════════════════════════════════════════════════════════════
  overclaiming: {
    weight: 2.5,
    category: 'overclaiming',
    patterns: [
      { regex: /cured\s*my\s*\w+\s*(naturally|completely|forever)/i, weight: 3.0, label: 'Cured naturally claim' },
      { regex: /reversed?\s*my\s*\w+\s*(completely|totally|100)/i, weight: 3.0, label: 'Reversed condition claim' },
      { regex: /this\s*is\s*the\s*only\s*thing\s*that\s*(work|help)/i, weight: 2.5, label: 'Only thing that worked' },
      { regex: /100\s*%\s*(natural|safe|effective)/i, weight: 2.5, label: '100% natural/safe claim' },
      { regex: /guaranteed\s*to\s*(work|help|cure|fix|heal)/i, weight: 3.0, label: 'Guaranteed cure' },
      { regex: /miracle\s*(cure|treatment|remedy|supplement|product)/i, weight: 3.0, label: 'Miracle cure' },
      { regex: /completely\s*(cured|healed|fixed|reversed|eliminated)/i, weight: 2.5, label: 'Complete cure claim' },
      { regex: /never\s*(need|have\s*to|had\s*to)\s*(see|visit)\s*(a\s*)?(doctor|physician|specialist)/i, weight: 2.0, label: 'Never need doctor again' },
      { regex: /will\s*(definitely|absolutely|certainly)\s*(cure|fix|heal|work)/i, weight: 2.5, label: 'Definite cure claim' },
      { regex: /instant(ly)?\s*(relief|cure|fix|result)/i, weight: 2.0, label: 'Instant cure claim' },
      { regex: /works?\s*(every|each)\s*(single\s*)?time/i, weight: 2.0, label: 'Works every time' },
      { regex: /the\s*(real|actual|true)\s*(cure|answer|solution|fix)/i, weight: 2.0, label: 'The real cure' },
      { regex: /all\s*you\s*need\s*(is|to\s*do)/i, weight: 1.5, label: 'All you need' },
      { regex: /no\s*(side\s*)?effects?\s*(at\s*all|whatsoever|ever)/i, weight: 2.0, label: 'No side effects claim' },
      { regex: /permanently\s*(cure|fix|heal|resolve|eliminate)/i, weight: 3.0, label: 'Permanent cure' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // 3. VAGUE PSEUDO-SCIENTIFIC TERMINOLOGY
  // ═══════════════════════════════════════════════════════════════════
  pseudoScience: {
    weight: 2.0,
    category: 'pseudo_science',
    patterns: [
      { regex: /balance\s*(your|my|the)?\s*hormones?\s*(naturally|with|using|through)/i, weight: 2.0, label: 'Balance hormones naturally' },
      { regex: /detox\s*(your|my|the)?\s*(liver|kidney|body|uterus|womb|ovari)/i, weight: 2.5, label: 'Organ detox' },
      { regex: /root\s*cause\s*(healing|medicine|approach|protocol)/i, weight: 2.0, label: 'Root cause healing' },
      { regex: /toxins?\s*(in|inside|building\s*up\s*in)\s*(your|my|the)?\s*body/i, weight: 2.0, label: 'Toxins in body' },
      { regex: /heal\s*(from\s*the\s*inside|yourself|your\s*body)\s*(out|naturally)/i, weight: 2.0, label: 'Heal from inside' },
      { regex: /energy\s*(healing|medicine|field|work|blockage)/i, weight: 2.5, label: 'Energy healing' },
      { regex: /alkalin(e|ize|ity)\s*(your|the)?\s*(body|blood|ph)/i, weight: 2.5, label: 'Alkalinize body' },
      { regex: /cellular\s*(detox|cleans|regenerat|heal)/i, weight: 2.0, label: 'Cellular detox' },
      { regex: /gut.?brain\s*(axis|connection).{0,30}(cause|cure|fix|heal)/i, weight: 1.5, label: 'Gut-brain cure claim' },
      { regex: /inflammation\s*(is\s*the\s*)?root\s*(cause|of\s*(all|every))/i, weight: 2.0, label: 'Inflammation root cause' },
      { regex: /holistic\s*(cure|healing|approach|protocol)\s*(for|to)\s*(cure|fix|heal)/i, weight: 1.5, label: 'Holistic cure' },
      { regex: /quantum\s*(healing|medicine|therapy)/i, weight: 3.0, label: 'Quantum healing' },
      { regex: /vibrational\s*(healing|frequency|medicine)/i, weight: 3.0, label: 'Vibrational healing' },
      { regex: /reset\s*(your|my|the)?\s*(hormones?|adrenals?|thyroid|metabolism)/i, weight: 2.0, label: 'Hormone reset' },
      { regex: /clean(s)?e\s*(your|my|the)?\s*(blood|lymph|system|gut|colon)/i, weight: 2.0, label: 'System cleanse' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // 4. EMPOWERMENT-FRAMED MISINFORMATION
  // ═══════════════════════════════════════════════════════════════════
  empowermentMisinfo: {
    weight: 1.5,
    category: 'empowerment_misinfo',
    patterns: [
      { regex: /take\s*(back)?\s*control\s*of\s*(your|my)\s*health/i, weight: 1.0, label: 'Take control of health' },
      { regex: /be\s*your\s*own\s*(doctor|physician|healer)/i, weight: 2.5, label: 'Be your own doctor' },
      { regex: /do\s*your\s*own\s*research/i, weight: 1.5, label: 'Do your own research' },
      { regex: /DYOR/i, weight: 1.5, label: 'DYOR' },
      { regex: /question\s*everything\s*(your\s*)?(doctor|physician|OB|gyno)/i, weight: 2.0, label: 'Question your doctor' },
      { regex: /you\s*(are|.?re)\s*your\s*(own\s*)?(best|only)\s*(doctor|advocate|healer)/i, weight: 2.0, label: 'You are your own doctor' },
      { regex: /stop\s*(blindly\s*)?(trusting|listening\s*to|following)\s*(your\s*)?(doctor|physician|OB)/i, weight: 2.5, label: 'Stop trusting doctors' },
      { regex: /educate\s*yourself\s*(before|instead\s*of)\s*(seeing|going|trusting)/i, weight: 2.0, label: 'Educate instead of doctor' },
      { regex: /I\s*know\s*my\s*(own\s*)?body\s*better\s*than\s*(any|my)\s*(doctor|physician)/i, weight: 1.5, label: 'Know body better' },
      { regex: /don.?t\s*let\s*(your\s*)?(doctor|physician|OB)\s*(bully|pressure|force|scare)/i, weight: 2.0, label: 'Don\'t let doctor pressure' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5. HIGH-SIGNAL KEYWORD CLUSTERS
  // ═══════════════════════════════════════════════════════════════════
  keywordClusters: {

    unprovenTreatments: {
      weight: 2.5,
      category: 'unproven_treatment',
      patterns: [
        { regex: /seed\s*cycling/i, weight: 2.0, label: 'Seed cycling' },
        { regex: /liver\s*detox/i, weight: 2.5, label: 'Liver detox' },
        { regex: /castor\s*oil\s*pack/i, weight: 2.0, label: 'Castor oil pack' },
        { regex: /essential\s*oils?\s*(for|to|cure|treat|help\s*with)\s*(PCOS|endo|infertil|menopaus|period|cramp|fertil|hormone)/i, weight: 2.5, label: 'Essential oils for condition' },
        { regex: /boric\s*acid.{0,20}vagin/i, weight: 2.0, label: 'Boric acid vaginal use' },
        { regex: /coffee\s*enema/i, weight: 3.0, label: 'Coffee enema' },
        { regex: /yoni\s*(steam|egg|pearl|detox)/i, weight: 3.0, label: 'Yoni treatment' },
        { regex: /womb\s*(healing|detox|steam|cleans)/i, weight: 2.5, label: 'Womb detox' },
        { regex: /vaginal\s*(steam|garlic|cucumber|detox)/i, weight: 3.0, label: 'Vaginal steaming/insertion' },
        { regex: /fertility\s*(cleans|detox|flush)/i, weight: 2.5, label: 'Fertility cleanse' },
        { regex: /uterine?\s*(cleans|detox|flush)/i, weight: 2.5, label: 'Uterine cleanse' },
        { regex: /hormone\s*(detox|cleans|flush|reset)/i, weight: 2.5, label: 'Hormone detox' },
        { regex: /ovarian?\s*(cleans|detox|flush)/i, weight: 2.5, label: 'Ovarian cleanse' },
        { regex: /parasite\s*(cleans|detox)/i, weight: 2.5, label: 'Parasite cleanse' },
        { regex: /turpentine\s*(cure|treatment|protocol)/i, weight: 3.5, label: 'Turpentine treatment' },
        { regex: /borax\s*(supplement|drink|cure|detox)/i, weight: 3.5, label: 'Borax ingestion' },
        { regex: /MMS|miracle\s*mineral\s*(solution|supplement)/i, weight: 3.5, label: 'MMS/Miracle Mineral' },
        { regex: /black\s*salve/i, weight: 3.0, label: 'Black salve' },
        { regex: /apricot\s*kernel.{0,15}(cancer|cure|treat)/i, weight: 3.0, label: 'Apricot kernel cure' },
        { regex: /colloidal\s*silver.{0,20}(cure|treat|antibiotic|kill)/i, weight: 3.0, label: 'Colloidal silver cure' }
      ]
    },

    supplementOverclaims: {
      weight: 2.5,
      category: 'supplement_overclaim',
      patterns: [
        { regex: /inositol\s*(cure|cured|fix|fixed|reverse|reversed)/i, weight: 2.5, label: 'Inositol cure claim' },
        { regex: /DIM\s*(fix|balance|cure|correct).{0,15}estrogen/i, weight: 2.0, label: 'DIM estrogen claim' },
        { regex: /maca\s*(balance|fix|cure|correct).{0,15}hormone/i, weight: 2.0, label: 'Maca hormone claim' },
        { regex: /vitex\s*(fix|increase|boost|cure|correct).{0,15}progesterone/i, weight: 2.0, label: 'Vitex progesterone claim' },
        { regex: /CoQ10\s*(reverse|fix|cure).{0,15}(fertil|egg|ovari|age)/i, weight: 2.0, label: 'CoQ10 fertility cure' },
        { regex: /NAC\s*(cure|fix|reverse).{0,15}PCOS/i, weight: 2.0, label: 'NAC PCOS cure' },
        { regex: /berberine\s*(replace|same\s*as|just\s*like|better\s*than)\s*metformin/i, weight: 2.5, label: 'Berberine replaces metformin' },
        { regex: /ashwagandha\s*(cure|fix|balance|correct).{0,15}(thyroid|cortisol|adrenal)/i, weight: 2.0, label: 'Ashwagandha cure claim' },
        { regex: /evening\s*primrose\s*(oil)?\s*(induce|start|trigger)\s*(labor|birth|contraction)/i, weight: 2.5, label: 'EPO induces labor' },
        { regex: /raspberry\s*leaf\s*(tea)?\s*(induce|start|cause)\s*(labor|birth|contraction)/i, weight: 2.0, label: 'Red raspberry leaf labor' },
        { regex: /spearmint\s*(tea)?\s*(cure|fix|lower|eliminate)\s*(androgens?|testosterone|PCOS)/i, weight: 2.0, label: 'Spearmint cures PCOS' },
        { regex: /saw\s*palmetto\s*(cure|fix|block|eliminate).{0,15}(androgen|testosterone|PCOS|hair)/i, weight: 2.0, label: 'Saw palmetto cure' },
        { regex: /black\s*seed\s*(oil)?\s*(cure|fix|treat|heal)\s*(everything|anything|PCOS|endo|infertil)/i, weight: 2.5, label: 'Black seed oil cure-all' },
        { regex: /supplement.{0,10}(protocol|stack|regimen)\s*(cured|fixed|reversed|healed)/i, weight: 2.5, label: 'Supplement protocol cure' }
      ]
    },

    unrecognizedDiagnoses: {
      weight: 2.0,
      category: 'unrecognized_diagnosis',
      patterns: [
        { regex: /adrenal\s*fatigue/i, weight: 2.0, label: 'Adrenal fatigue' },
        { regex: /leaky\s*gut.{0,20}hormon/i, weight: 2.0, label: 'Leaky gut hormones' },
        { regex: /estrogen\s*dominance/i, weight: 1.5, label: 'Estrogen dominance' },
        { regex: /progesterone\s*deficiency\s*(is|causes?|explains?)/i, weight: 1.5, label: 'Progesterone deficiency claim' },
        { regex: /cortisol\s*(imbalance|dysregulation)\s*(caus|is\s*why|explains?|makes?)/i, weight: 1.5, label: 'Cortisol imbalance' },
        { regex: /chronic\s*candida\s*(caus|is\s*the\s*reason|explains?)/i, weight: 2.0, label: 'Chronic candida cause' },
        { regex: /sluggish\s*liver\s*(caus|is\s*why|explains?)/i, weight: 2.0, label: 'Sluggish liver' },
        { regex: /copper\s*toxicity\s*(caus|is\s*why|explains?)/i, weight: 2.0, label: 'Copper toxicity cause' },
        { regex: /histamine\s*intolerance\s*(caus|is\s*(the\s*)?(root|real|true|actual)\s*(cause|reason))/i, weight: 1.5, label: 'Histamine intolerance root cause' },
        { regex: /mold\s*(illness|toxicity)\s*(caus|is\s*why|explains?)\s*(your|my|the)?\s*(PCOS|endo|infertil|menopaus|hormone)/i, weight: 2.0, label: 'Mold toxicity cause' }
      ]
    },

    antiMedicalFraming: {
      weight: 2.0,
      category: 'anti_medical',
      patterns: [
        { regex: /(the\s*)?pill\s*(ruined|destroyed|damaged|wrecked)\s*(my|me|her)/i, weight: 2.0, label: 'Pill ruined me' },
        { regex: /IUD\s*(damaged|ruined|destroyed|wrecked|poisoned)/i, weight: 2.0, label: 'IUD damaged claim' },
        { regex: /vaccine.{0,20}(infertil|miscarriage|sterile|barren)/i, weight: 3.0, label: 'Vaccine infertility' },
        { regex: /doctors?\s*(dismissed|ignored|gaslight|don.?t\s*listen|don.?t\s*care|don.?t\s*believe)/i, weight: 1.0, label: 'Doctor dismissal' },
        { regex: /gaslight(ed|ing)?\s*by\s*(my\s*)?(OB|doctor|physician|gyno|GYN)/i, weight: 1.0, label: 'Gaslighted by doctor' },
        { regex: /medical\s*trauma/i, weight: 1.0, label: 'Medical trauma mention' },
        { regex: /birth\s*control\s*(cause|caus(ed|es|ing))\s*(permanent\s*)?(infertil|damage|harm)/i, weight: 2.5, label: 'BC causes infertility' },
        { regex: /Gardasil\s*(cause|caus(ed|es|ing))\s*(infertil|damage|harm|autoimmune|POF)/i, weight: 3.0, label: 'Gardasil harm claim' },
        { regex: /COVID\s*(vacc|jab|shot).{0,20}(infertil|miscarriage|sterile|period|menstrua|cycle)/i, weight: 3.0, label: 'COVID vaccine fertility claim' },
        { regex: /flu\s*(shot|vacc).{0,20}(miscarriage|infertil|sterile)/i, weight: 2.5, label: 'Flu vaccine fertility claim' },
        { regex: /HPV\s*(vacc|shot).{0,20}(infertil|ovari|damage|harm)/i, weight: 3.0, label: 'HPV vaccine harm' },
        { regex: /Depo\s*(Provera)?\s*(cause|caus(ed|es|ing))\s*(permanent\s*)?(infertil|damage|bone)/i, weight: 2.0, label: 'Depo permanent harm claim' }
      ]
    },

    naturalSuperiorityClaims: {
      weight: 2.0,
      category: 'natural_superiority',
      patterns: [
        { regex: /bioidentical.{0,15}(natural|safer|better|only\s*safe)/i, weight: 2.0, label: 'Bioidentical natural claim' },
        { regex: /pharmaceutical\s*(poison|toxic|chemical|garbage)/i, weight: 2.5, label: 'Pharmaceutical poison' },
        { regex: /chemical\s*birth\s*control/i, weight: 1.5, label: 'Chemical birth control framing' },
        { regex: /synthetic\s*hormones?\s*(are\s*)?(dangerous|poison|toxic|harmful|bad)/i, weight: 2.0, label: 'Synthetic hormones dangerous' },
        { regex: /natural\s*(is\s*)?always\s*(better|safer|superior)/i, weight: 2.0, label: 'Natural always better' },
        { regex: /your\s*body\s*(doesn.?t|can.?t)\s*(recognize|process|handle)\s*(synthetic|chemical|pharmaceutical)/i, weight: 2.0, label: 'Body can\'t process synthetic' },
        { regex: /god.?s\s*(medicine|pharmacy|way|design)/i, weight: 1.5, label: 'God\'s medicine' },
        { regex: /nature\s*(has|provides?)\s*(everything|all)\s*(we|you)\s*need/i, weight: 1.5, label: 'Nature provides all' },
        { regex: /(plant|herb|botanical)\s*based\s*(medicine|healing|cure)\s*(is\s*)?(always|superior|better|safer)/i, weight: 2.0, label: 'Plant medicine superiority' },
        { regex: /food\s*(as|is)\s*(the\s*)?(best|only|real)\s*medicine/i, weight: 1.5, label: 'Food is medicine' }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // 6. COMMON MISINFORMATION FORMATS
  // ═══════════════════════════════════════════════════════════════════
  misinfoFormats: {

    personalTestimonialAsProof: {
      weight: 1.5,
      category: 'testimonial_as_proof',
      patterns: [
        { regex: /I\s*(had|have|was\s*diagnosed\s*with)\s*(PCOS|endo|infertil|menopaus).{0,50}(tried|took|used|did).{0,50}(cured|fixed|healed|reversed|gone)/i, weight: 2.0, label: 'Personal cure testimonial' },
        { regex: /here.?s\s*(exactly|precisely)\s*what\s*I\s*(did|took|used)/i, weight: 1.5, label: 'Here\'s exactly what I did' },
        { regex: /my\s*(exact\s*)?(protocol|regimen|routine|stack)\s*(that|which)\s*(cured|fixed|healed|reversed)/i, weight: 2.0, label: 'My protocol that cured' },
        { regex: /if\s*it\s*worked\s*for\s*me.{0,10}(it\s*)?will\s*work\s*for\s*(you|everyone)/i, weight: 2.0, label: 'Worked for me = works for all' },
        { regex: /I.{0,5}(m\s*)?living\s*proof\s*(that|it\s*work)/i, weight: 2.0, label: 'Living proof' }
      ]
    },

    singleStudyClaims: {
      weight: 1.5,
      category: 'single_study',
      patterns: [
        { regex: /I\s*found\s*a\s*study\s*(that|which)\s*(proves?|shows?|confirms?)/i, weight: 1.5, label: 'Single study proves claim' },
        { regex: /research\s*(proves?|shows?|confirms?)\s*(that\s*)?(doctors?\s*(are|were)\s*wrong|medicine\s*is\s*wrong)/i, weight: 2.0, label: 'Research proves doctors wrong' },
        { regex: /studies?\s*(show|prove|confirm)\s*(this|it)\s*(works?|is\s*(safe|effective))/i, weight: 1.0, label: 'Studies show it works' },
        { regex: /peer.?reviewed\s*(study|paper|article).{0,20}(prove|confirm|show)/i, weight: 1.0, label: 'Peer-reviewed proves' },
        { regex: /look\s*(up|at)\s*(the|this)\s*(study|research|paper|evidence)/i, weight: 1.0, label: 'Look up this study' }
      ]
    },

    doctorWasWrong: {
      weight: 1.5,
      category: 'doctor_was_wrong',
      patterns: [
        { regex: /my\s*doctor\s*(was|were)\s*wrong.{0,30}(and\s*)?I\s*(found|discovered|figured)/i, weight: 2.0, label: 'Doctor wrong, I found answer' },
        { regex: /doctor.{0,20}(dismissed|ignored|misdiagnos).{0,40}(I\s*)?(then\s*)?(found|discovered|tried|took)/i, weight: 1.5, label: 'Doctor dismissed, found cure' },
        { regex: /doctor.{0,15}(had\s*no\s*idea|couldn.?t\s*(figure|help|explain)|gave\s*up)/i, weight: 1.5, label: 'Doctor had no idea' },
        { regex: /after\s*(years?\s*of\s*)?(doctors?\s*)?failing.{0,30}(I\s*)?(finally\s*)?(found|discovered|tried)/i, weight: 1.5, label: 'After doctors failing' },
        { regex: /no\s*doctor\s*(could|would|was\s*able\s*to)\s*(help|fix|cure|figure)/i, weight: 1.5, label: 'No doctor could help' }
      ]
    },

    productPromotion: {
      weight: 2.0,
      category: 'product_promotion',
      patterns: [
        { regex: /I.?m\s*not\s*(affiliated|sponsored|paid).{0,20}(but|however).{0,20}(changed|saved|transformed)\s*my\s*life/i, weight: 2.5, label: 'Not affiliated but life-changing' },
        { regex: /use\s*my\s*(code|link|discount|referral)/i, weight: 3.0, label: 'Referral link' },
        { regex: /DM\s*me\s*(for|about)\s*(the|more\s*info|details|what\s*I\s*(use|took))/i, weight: 2.5, label: 'DM for product info' },
        { regex: /this\s*(brand|product|supplement|company)\s*(literally\s*)?(changed|saved|transformed)\s*my\s*life/i, weight: 2.0, label: 'Product changed my life' },
        { regex: /link\s*in\s*(my\s*)?(bio|profile|comment)/i, weight: 2.5, label: 'Link in bio' },
        { regex: /(check\s*out|look\s*at)\s*my\s*(blog|website|channel|page|instagram|tiktok)/i, weight: 2.0, label: 'Check my page' }
      ]
    },

    fearBasedWarning: {
      weight: 2.5,
      category: 'fear_based',
      patterns: [
        { regex: /STOP\s*(taking|using)\s*.{0,30}immediately/i, weight: 2.5, label: 'Stop immediately warning' },
        { regex: /WARNING.{0,5}(:|!).{0,30}(is\s*)?(destroying|damaging|ruining|poisoning|killing)/i, weight: 2.5, label: 'Warning destruction claim' },
        { regex: /(is\s*)?destroying\s*(your|my|the)\s*(body|health|fertil|uterus|ovari|gut|liver|hormone)/i, weight: 2.5, label: 'Destroying your body' },
        { regex: /before\s*it.?s\s*too\s*late/i, weight: 2.0, label: 'Before it\'s too late' },
        { regex: /you\s*(need|have)\s*to\s*know\s*(the\s*)?truth\s*(about|before)/i, weight: 1.5, label: 'Need to know the truth' },
        { regex: /please\s*(share|spread|warn|tell)\s*(this|everyone|your\s*friends)/i, weight: 1.5, label: 'Share this warning' },
        { regex: /this\s*(could|will|is\s*going\s*to)\s*(kill|harm|damage|destroy|ruin)/i, weight: 2.0, label: 'This will harm you' },
        { regex: /don.?t\s*say\s*I\s*didn.?t\s*warn/i, weight: 1.5, label: 'Don\'t say I didn\'t warn' }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // 7. CROSS-SUBREDDIT RECURRING MYTHS
  // ═══════════════════════════════════════════════════════════════════
  recurringMyths: [
    {
      id: 'myth-seed-cycling',
      patterns: [/seed\s*cycling\s*(balance|regulat|fix|cure|help).{0,20}(hormone|cycle|period|ovulat)/i, /seed\s*cycling\s*(for|to\s*(help|fix|balance|regulat))\s*(PCOS|hormone|period|cycle)/i],
      weight: 2.0,
      myth: 'Seed cycling balances hormones and regulates cycles',
      reality: 'No clinical evidence supports seed cycling for hormone regulation. While seeds are nutritious, the specific rotational protocol has no scientific backing for hormonal effects.',
      subreddits: ['r/PCOS', 'r/TryingForABaby', 'r/WomensHealth', 'r/Menopause'],
      citations: ['ACOG', 'NIH', 'Endocrine Society'],
      resourceUrl: 'https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos'
    },
    {
      id: 'myth-bc-infertility',
      patterns: [/birth\s*control\s*(caus|lead|result).{0,15}(permanent\s*)?(infertil|sterile|barren|can.?t\s*(get|become)\s*pregnant)/i, /(pill|IUD|Depo|hormonal\s*contracepti).{0,20}(made|make|caus).{0,15}(me\s*)?(infertile|sterile|barren)/i],
      weight: 2.5,
      myth: 'Birth control causes permanent infertility',
      reality: 'No form of hormonal birth control causes permanent infertility. Fertility typically returns within 1-3 months after stopping most methods (longer for Depo-Provera). Multiple large studies confirm no long-term fertility impact.',
      subreddits: ['r/birthcontrol', 'r/PCOS', 'r/TryingForABaby', 'r/infertility'],
      citations: ['ACOG', 'WHO', 'Planned Parenthood'],
      resourceUrl: 'https://www.acog.org/womens-health/faqs/birth-control'
    },
    {
      id: 'myth-natural-progesterone',
      patterns: [/natural\s*progesterone\s*(cream|oil).{0,20}(same\s*as|equal|replace|substitute|instead\s*of|better\s*than)\s*(HRT|prescribed|prescription|pharmaceutical)/i, /progesterone\s*cream\s*(is\s*)?(all\s*you\s*need|enough|replace)/i],
      weight: 2.0,
      myth: '"Natural" progesterone cream equals prescribed HRT',
      reality: 'Over-the-counter progesterone creams are NOT equivalent to prescribed HRT. They have variable absorption, unregulated dosing, and are not FDA-approved for menopausal symptoms or endometrial protection. Prescribed micronized progesterone is different from OTC creams.',
      subreddits: ['r/Menopause', 'r/PCOS', 'r/WomensHealth'],
      citations: ['NAMS', 'FDA', 'ACOG'],
      resourceUrl: 'https://www.menopause.org/for-women'
    },
    {
      id: 'myth-doctor-dismissal-avoid-care',
      patterns: [/doctors?\s*(always|just|only)\s*(dismiss|ignore|gaslight).{0,30}(so|therefore|that.?s\s*why)\s*(I|you\s*should)\s*(stop|avoid|don.?t|skip)\s*(going|seeing|visit)/i, /(don.?t|stop|avoid)\s*(bother\s*)?(going|seeing|visit).{0,20}(doctor|physician|OB|gyno).{0,20}(they\s*)?just\s*(dismiss|ignore|gaslight)/i],
      weight: 2.0,
      myth: 'Doctors always dismiss women\'s pain (used to justify avoiding all care)',
      reality: 'While gender bias in healthcare is a real and documented problem, the solution is finding better providers and advocating within the medical system—not avoiding medical care entirely. Untreated conditions like endometriosis, PCOS, and cancer worsen without proper medical management.',
      subreddits: ['r/Endo', 'r/PCOS', 'r/Menopause', 'r/WomensHealth'],
      citations: ['NIH', 'WHO', 'ACOG'],
      resourceUrl: 'https://www.nih.gov/news-events/nih-research-matters'
    },
    {
      id: 'myth-vaccine-infertility',
      patterns: [/vaccin.{0,20}(caus|lead|result).{0,15}(infertil|miscarriage|sterile|barren)/i, /(COVID|HPV|flu)\s*(vacc|shot|jab).{0,20}(infertil|miscarriage|sterile)/i],
      weight: 3.0,
      myth: 'Vaccines cause infertility or miscarriage',
      reality: 'Extensive research shows vaccines (including COVID-19, HPV, and flu vaccines) do not cause infertility or increase miscarriage risk. The American College of Obstetricians and Gynecologists recommends vaccination during pregnancy for flu and COVID-19.',
      subreddits: ['r/BabyBumps', 'r/TryingForABaby', 'r/infertility'],
      citations: ['ACOG', 'CDC', 'WHO', 'NIH'],
      resourceUrl: 'https://www.acog.org/clinical/clinical-guidance/practice-advisory/articles/2020/12/covid-19-vaccination-considerations-for-obstetric-gynecologic-care'
    },
    {
      id: 'myth-adrenal-fatigue',
      patterns: [/adrenal\s*fatigue\s*(is\s*why|caus|explains?|is\s*the\s*reason)/i, /you\s*(probably\s*)?have\s*adrenal\s*fatigue/i, /adrenal\s*fatigue\s*(is\s*)?real/i],
      weight: 2.0,
      myth: 'Adrenal fatigue explains unexplained symptoms',
      reality: '"Adrenal fatigue" is not a recognized medical diagnosis. The Endocrine Society states it is not a real condition. Symptoms attributed to it may indicate other treatable conditions like thyroid disorders, depression, sleep apnea, or actual adrenal insufficiency (Addison\'s disease), which requires proper testing.',
      subreddits: ['r/PCOS', 'r/Menopause', 'r/WomensHealth'],
      citations: ['Endocrine Society', 'Mayo Clinic', 'NIH'],
      resourceUrl: 'https://www.endocrine.org/patient-engagement/endocrine-library/adrenal-fatigue'
    },
    {
      id: 'myth-inositol-cure-pcos',
      patterns: [/inositol\s*(cure|cured|fix|fixed|reverse|reversed|eliminat)\s*(my\s*)?(PCOS|polycystic)/i, /inositol\s*(is\s*)?(the\s*)?(cure|answer|solution)\s*(for|to)\s*PCOS/i],
      weight: 2.0,
      myth: 'Inositol is a cure (not a symptom manager) for PCOS',
      reality: 'Inositol (particularly myo-inositol and D-chiro-inositol) shows promise for improving insulin sensitivity and ovulation in some PCOS patients, but it is NOT a cure. PCOS is a chronic condition. Inositol is a supplement that may help manage symptoms under medical supervision, not eliminate the condition.',
      subreddits: ['r/PCOS', 'r/TryingForABaby'],
      citations: ['NIH', 'Cochrane Library', 'Endocrine Society'],
      resourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5040057/'
    },
    {
      id: 'myth-castor-oil-fertility',
      patterns: [/castor\s*oil\s*(pack|wrap).{0,20}(fertil|conceiv|pregnan|implant|ovulat|endometri)/i, /castor\s*oil\s*(pack|wrap).{0,20}(break|dissolve|shrink).{0,15}(cyst|fibroid|adhesion)/i],
      weight: 2.0,
      myth: 'Castor oil packs improve fertility or dissolve cysts',
      reality: 'No clinical evidence supports castor oil packs for improving fertility, dissolving ovarian cysts, or treating endometriosis adhesions. While external application is generally harmless, these claims have no scientific basis.',
      subreddits: ['r/TryingForABaby', 'r/Endo', 'r/PCOS', 'r/infertility'],
      citations: ['ACOG', 'ASRM', 'NIH'],
      resourceUrl: 'https://www.asrm.org/topics/topics-index/complementary-and-alternative-medicine/'
    },
    {
      id: 'myth-boric-acid-cure',
      patterns: [/boric\s*acid\s*(cure|cured|fix|treat|eliminate).{0,15}(BV|yeast|infection|vaginosis|candida)/i, /boric\s*acid\s*(suppress|capsule).{0,15}(daily|regular|ongoing|maintenan)/i],
      weight: 1.5,
      myth: 'Boric acid cures recurrent vaginal infections',
      reality: 'Boric acid suppositories have limited evidence for recurrent yeast infections (particularly non-albicans species) as an adjunct to standard treatment, but they are NOT a first-line cure and should only be used under medical supervision. They can be toxic if ingested and should never be used during pregnancy.',
      subreddits: ['r/Healthyhooha', 'r/WomensHealth', 'r/TwoXChromosomes'],
      citations: ['CDC', 'ACOG', 'NIH'],
      resourceUrl: 'https://www.cdc.gov/sti-treatment/clinical-care/vulvovaginal-candidiasis.html'
    },
    {
      id: 'myth-estrogen-dominance',
      patterns: [/estrogen\s*dominance\s*(is\s*)(causing|why|the\s*reason|behind|responsible)/i, /you\s*(have|probably\s*have|might\s*have)\s*estrogen\s*dominance/i, /test\s*(for|your)\s*estrogen\s*dominance/i],
      weight: 1.5,
      myth: 'Estrogen dominance is a recognized medical condition causing your symptoms',
      reality: '"Estrogen dominance" is not a recognized medical diagnosis. While relative estrogen-progesterone imbalances exist in specific clinical contexts (e.g., anovulatory cycles), the term as used in wellness culture is vague and often used to sell supplements. Actual hormonal evaluation should be done by an endocrinologist.',
      subreddits: ['r/PCOS', 'r/WomensHealth', 'r/Menopause', 'r/Perimenopause'],
      citations: ['Endocrine Society', 'ACOG', 'Mayo Clinic'],
      resourceUrl: 'https://www.endocrine.org/'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  // 8. EMOTIONAL TONE PATTERNS
  // ═══════════════════════════════════════════════════════════════════
  emotionalTone: {

    fearBased: {
      weight: 1.5,
      category: 'fear_tone',
      patterns: [
        { regex: /(is\s*)?(dangerous|toxic|poison|destroying|harming|ruining|killing)/i, weight: 1.0, label: 'Fear language' },
        { regex: /stop\s*immediately/i, weight: 2.0, label: 'Urgent stop' },
        { regex: /warn\s*(your|all|every)\s*(friend|family|sister|daughter|mother)/i, weight: 1.5, label: 'Warn others' },
        { regex: /(before|until)\s*it.?s\s*too\s*late/i, weight: 1.5, label: 'Too late urgency' },
        { regex: /you\s*need\s*to\s*(stop|quit|throw\s*away|get\s*off)\s*(this\s*)?(right\s*now|immediately|today|ASAP)/i, weight: 2.0, label: 'Urgent action demand' },
        { regex: /this\s*is\s*(literally\s*)?(poison|toxic|killing|destroying)/i, weight: 2.0, label: 'This is poison' }
      ]
    },

    empowermentFramed: {
      weight: 1.0,
      category: 'empowerment_tone',
      patterns: [
        { regex: /take\s*(back)?\s*control/i, weight: 0.5, label: 'Take back control' },
        { regex: /be\s*your\s*own\s*advocate/i, weight: 0.5, label: 'Be your own advocate' },
        { regex: /they\s*(don.?t|won.?t)\s*want\s*you\s*to\s*know/i, weight: 2.0, label: 'They don\'t want you to know' },
        { regex: /you\s*deserve\s*(to\s*know|better|the\s*truth)/i, weight: 0.5, label: 'You deserve to know' },
        { regex: /empower\s*(yourself|your\s*health|your\s*body)/i, weight: 0.5, label: 'Empower yourself' }
      ]
    },

    antiPharma: {
      weight: 2.0,
      category: 'anti_pharma_tone',
      patterns: [
        { regex: /big\s*pharma\s*(want|need|require|depend)/i, weight: 2.0, label: 'Big Pharma wants' },
        { regex: /profit\s*over\s*patients/i, weight: 2.0, label: 'Profit over patients' },
        { regex: /medical.?industrial\s*complex/i, weight: 2.0, label: 'Medical-industrial complex' },
        { regex: /they\s*(make|earn)\s*(billions?|millions?)\s*(from|off|on)\s*(your|our|keeping)/i, weight: 2.0, label: 'They profit from sickness' },
        { regex: /follow\s*the\s*money/i, weight: 1.5, label: 'Follow the money' }
      ]
    },

    communityValidation: {
      weight: 1.0,
      category: 'community_validation_tone',
      patterns: [
        { regex: /thousands?\s*(of\s*)?(women|people|members?)\s*(here|on\s*this\s*sub).{0,15}(have\s*)?(done|tried|used|agree)/i, weight: 1.5, label: 'Thousands have done this' },
        { regex: /the\s*upvotes\s*(speak|prove|show)/i, weight: 1.5, label: 'Upvotes prove it' },
        { regex: /this\s*(community|sub|subreddit)\s*(agrees?|knows?|proves?|confirms?)/i, weight: 1.5, label: 'Community agrees' },
        { regex: /so\s*many\s*(women|people|of\s*us)\s*(have|can.?t\s*be\s*wrong)/i, weight: 1.5, label: 'So many can\'t be wrong' },
        { regex: /everyone\s*(here|in\s*this\s*(sub|community|thread))\s*(says?|recommends?|agrees?|knows?)/i, weight: 1.0, label: 'Everyone here says' }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // 9. SUBREDDIT-SPECIFIC RISK CALIBRATION
  // ═══════════════════════════════════════════════════════════════════
  subredditCalibration: {
    'PCOS': {
      name: 'r/PCOS',
      riskMultiplier: 1.3,
      highRiskTopics: ['supplement_overclaim', 'unproven_treatment', 'unrecognized_diagnosis', 'natural_superiority'],
      commonMisinfoIds: ['myth-seed-cycling', 'myth-inositol-cure-pcos', 'myth-adrenal-fatigue', 'myth-estrogen-dominance']
    },
    'Endo': {
      name: 'r/Endo',
      riskMultiplier: 1.2,
      highRiskTopics: ['unproven_treatment', 'anti_medical', 'fear_based'],
      commonMisinfoIds: ['myth-doctor-dismissal-avoid-care', 'myth-castor-oil-fertility']
    },
    'BabyBumps': {
      name: 'r/BabyBumps',
      riskMultiplier: 1.4,
      highRiskTopics: ['anti_medical', 'fear_based', 'supplement_overclaim'],
      commonMisinfoIds: ['myth-vaccine-infertility']
    },
    'birthcontrol': {
      name: 'r/birthcontrol',
      riskMultiplier: 1.3,
      highRiskTopics: ['anti_medical', 'fear_based', 'natural_superiority'],
      commonMisinfoIds: ['myth-bc-infertility']
    },
    'Menopause': {
      name: 'r/Menopause',
      riskMultiplier: 1.2,
      highRiskTopics: ['supplement_overclaim', 'unrecognized_diagnosis', 'natural_superiority'],
      commonMisinfoIds: ['myth-seed-cycling', 'myth-natural-progesterone', 'myth-adrenal-fatigue']
    },
    'infertility': {
      name: 'r/infertility',
      riskMultiplier: 1.4,
      highRiskTopics: ['unproven_treatment', 'supplement_overclaim', 'anti_medical'],
      commonMisinfoIds: ['myth-vaccine-infertility', 'myth-bc-infertility', 'myth-castor-oil-fertility']
    },
    'Healthyhooha': {
      name: 'r/Healthyhooha',
      riskMultiplier: 1.2,
      highRiskTopics: ['unproven_treatment', 'pseudo_science'],
      commonMisinfoIds: ['myth-boric-acid-cure']
    },
    'WomensHealth': {
      name: 'r/WomensHealth',
      riskMultiplier: 1.0,
      highRiskTopics: ['pseudo_science', 'unrecognized_diagnosis', 'supplement_overclaim'],
      commonMisinfoIds: ['myth-seed-cycling', 'myth-doctor-dismissal-avoid-care', 'myth-estrogen-dominance']
    },
    'TwoXChromosomes': {
      name: 'r/TwoXChromosomes',
      riskMultiplier: 0.8,
      highRiskTopics: ['anti_establishment', 'fear_based'],
      commonMisinfoIds: ['myth-boric-acid-cure']
    },
    'Perimenopause': {
      name: 'r/Perimenopause',
      riskMultiplier: 1.2,
      highRiskTopics: ['supplement_overclaim', 'unrecognized_diagnosis', 'natural_superiority'],
      commonMisinfoIds: ['myth-natural-progesterone', 'myth-adrenal-fatigue', 'myth-estrogen-dominance']
    },
    'TryingForABaby': {
      name: 'r/TryingForABaby',
      riskMultiplier: 1.3,
      highRiskTopics: ['unproven_treatment', 'supplement_overclaim', 'anti_medical'],
      commonMisinfoIds: ['myth-seed-cycling', 'myth-bc-infertility', 'myth-vaccine-infertility', 'myth-castor-oil-fertility', 'myth-inositol-cure-pcos']
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.MISINFO_PATTERNS = MISINFO_PATTERNS;
}
