// Femstral Health Aid - Health Claims Knowledge Base
// Pattern-matched health claim detection and evidence-based responses

const HEALTH_CLAIMS_DB = [
  // === PERIMENOPAUSE & MENOPAUSE ===
  {
    id: 'estrogen-joint-pain',
    patterns: [/estrogen.{0,30}(anti.?inflammat|inflammat|joint)/i, /perimenopause.{0,40}joint\s*pain/i, /menopaus.{0,30}joint/i, /declin.{0,20}estrogen.{0,30}(pain|inflam)/i],
    status: 'supported',
    summary: 'Declining estrogen levels during perimenopause are associated with increased joint pain and inflammation. Research confirms estrogen\'s anti-inflammatory role and the prevalence of musculoskeletal symptoms during menopausal transition.',
    confidence: 89,
    citations: ['Mayo Clinic', 'NIH', 'ACOG'],
    resourceUrl: 'https://www.mayoclinic.org/diseases-conditions/perimenopause/symptoms-causes/syc-20354666'
  },
  {
    id: 'hrt-joint-pain',
    patterns: [/\bHRT\b.{0,30}(joint|pain|help|inflamm)/i, /hormone\s*(replacement|therapy).{0,30}(joint|pain|help)/i],
    status: 'supported',
    summary: 'Hormone Replacement Therapy (HRT) has clinical evidence supporting its use for managing perimenopausal joint pain. Multiple studies show HRT can reduce musculoskeletal symptoms by restoring estrogen levels.',
    confidence: 85,
    citations: ['ACOG', 'NIH', 'Cochrane Library'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/hormone-therapy-for-menopause'
  },
  {
    id: 'hot-flashes-perimenopause',
    patterns: [/hot\s*flash.{0,30}(perimenopause|menopaus|normal|common)/i, /perimenopaus.{0,30}hot\s*flash/i],
    status: 'supported',
    summary: 'Hot flashes are one of the most common symptoms of perimenopause, experienced by up to 80% of women. They are caused by hormonal changes affecting the body\'s temperature regulation.',
    confidence: 95,
    citations: ['Mayo Clinic', 'NIH', 'ACOG'],
    resourceUrl: 'https://www.mayoclinic.org/diseases-conditions/hot-flashes/symptoms-causes/syc-20352790'
  },
  {
    id: 'perimenopause-mood',
    patterns: [/perimenopaus.{0,30}(mood|depress|anxiety|irritab)/i, /menopaus.{0,30}(mood\s*swing|depress|anxiety)/i, /(mood|depress|anxiety).{0,30}(perimenopaus|menopaus)/i],
    status: 'supported',
    summary: 'Mood changes, depression, and anxiety are well-documented during perimenopause. Fluctuating hormone levels, particularly estrogen and progesterone, affect neurotransmitters that regulate mood.',
    confidence: 88,
    citations: ['NIH', 'Mayo Clinic', 'NAMS'],
    resourceUrl: 'https://www.nih.gov/news-events/nih-research-matters/menopause-depression'
  },
  {
    id: 'perimenopause-brain-fog',
    patterns: [/perimenopaus.{0,30}(brain\s*fog|memory|cognitive|forget)/i, /menopaus.{0,30}(brain\s*fog|memory|think)/i, /(brain\s*fog|memory\s*(loss|problem)).{0,30}(perimenopaus|menopaus|hormon)/i],
    status: 'supported',
    summary: 'Cognitive changes including "brain fog" and memory difficulties are recognized symptoms of perimenopause. Research shows estrogen plays a role in cognitive function, and its decline can affect memory and concentration.',
    confidence: 82,
    citations: ['NIH', 'Mayo Clinic'],
    resourceUrl: 'https://www.nih.gov/news-events/nih-research-matters/menopause-brain'
  },
  {
    id: 'perimenopause-weight',
    patterns: [/perimenopaus.{0,30}(weight|gain|metabol)/i, /menopaus.{0,30}(weight\s*gain|belly\s*fat)/i, /(weight\s*gain|metaboli).{0,30}(perimenopaus|menopaus)/i],
    status: 'supported',
    summary: 'Weight gain during perimenopause is common and linked to hormonal changes, decreased metabolism, and redistribution of body fat. However, lifestyle factors also play a significant role.',
    confidence: 84,
    citations: ['Mayo Clinic', 'NIH'],
    resourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menopause-weight-gain/art-20046058'
  },

  // === SUPPLEMENTS - EVIDENCE-BASED ===
  {
    id: 'magnesium-supplement',
    patterns: [/magnesium.{0,30}(supplement|take|daily|mg|help|benefit)/i, /take.{0,20}magnesium/i],
    status: 'partial',
    summary: 'Magnesium supplementation at recommended doses (310-420mg/day for adults) has some evidence for musculoskeletal benefit, sleep improvement, and general health. However, it is not a proven treatment specifically for perimenopausal symptoms.',
    confidence: 72,
    citations: ['NIH Office of Dietary Supplements', 'Mayo Clinic'],
    resourceUrl: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/'
  },
  {
    id: 'vitamin-d',
    patterns: [/vitamin\s*d.{0,30}(supplement|take|bone|deficien|help)/i, /take.{0,20}vitamin\s*d/i],
    status: 'partial',
    summary: 'Vitamin D supplementation is well-supported for bone health, especially during menopause when osteoporosis risk increases. However, mega-doses are not recommended and testing for deficiency first is advised.',
    confidence: 80,
    citations: ['NIH', 'Mayo Clinic', 'Endocrine Society'],
    resourceUrl: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'
  },
  {
    id: 'omega3-inflammation',
    patterns: [/omega.?3.{0,30}(inflamm|joint|pain|help)/i, /fish\s*oil.{0,30}(inflamm|joint|pain)/i],
    status: 'partial',
    summary: 'Omega-3 fatty acids have modest anti-inflammatory properties supported by research. However, they are not a standalone treatment for joint conditions and their effect size is generally small.',
    confidence: 70,
    citations: ['NIH', 'Cochrane Library'],
    resourceUrl: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/'
  },

  // === SUPPLEMENTS - UNSUPPORTED CLAIMS ===
  {
    id: 'turmeric-cure',
    patterns: [/turmeric.{0,30}(cure|replace|fix|eliminat|completely)/i, /curcumin.{0,30}(cure|replace|eliminat)/i],
    status: 'unsupported',
    summary: 'While turmeric (curcumin) has some anti-inflammatory properties in lab studies, claims that it can "cure" conditions or "replace" medical treatments are not supported. Bioavailability is low and clinical evidence for therapeutic use is limited.',
    confidence: 91,
    citations: ['NCCIH', 'NIH', 'Cochrane Library'],
    resourceUrl: 'https://www.nccih.nih.gov/health/turmeric'
  },
  {
    id: 'turmeric-general',
    patterns: [/turmeric.{0,30}(anti.?inflamm|inflamm|help|pain)/i, /curcumin.{0,30}(anti.?inflamm|inflamm|help)/i],
    status: 'partial',
    summary: 'Turmeric contains curcumin which has shown some anti-inflammatory activity in studies. However, clinical evidence in humans is mixed, and bioavailability is a significant limitation. It should not replace proven medical treatments.',
    confidence: 68,
    citations: ['NCCIH', 'NIH'],
    resourceUrl: 'https://www.nccih.nih.gov/health/turmeric'
  },
  {
    id: 'black-cohosh-estrogen',
    patterns: [/black\s*cohosh.{0,30}(estrogen|replace|hormone|menopaus)/i],
    status: 'partial',
    summary: 'Black cohosh has been studied for menopausal symptoms with mixed results. It does NOT replace estrogen and does not function as a phytoestrogen. Some studies show modest relief for hot flashes, but evidence is inconsistent.',
    confidence: 75,
    citations: ['NCCIH', 'NIH', 'Cochrane Library'],
    resourceUrl: 'https://www.nccih.nih.gov/health/black-cohosh'
  },
  {
    id: 'replace-estrogen-naturally',
    patterns: [/replace\s*estrogen.{0,20}natural/i, /natural.{0,20}replace.{0,15}estrogen/i, /natural.{0,15}estrogen\s*replacement/i],
    status: 'unsupported',
    summary: 'No supplement or natural remedy can "replace" estrogen. While some plant compounds (phytoestrogens) have weak estrogenic activity, they are not equivalent to endogenous estrogen or HRT. Claims of natural estrogen replacement are medically inaccurate.',
    confidence: 94,
    citations: ['ACOG', 'NIH', 'NCCIH'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/hormone-therapy-for-menopause'
  },
  {
    id: 'supplements-cure-week',
    patterns: [/cure.{0,20}(within|in)\s*(a\s*)?week/i, /week.{0,15}(cure|fix|eliminat|gone)/i, /(supplement|herb|vitamin).{0,30}(cure|eliminat|eradicat)/i],
    status: 'unsupported',
    summary: 'Claims of curing conditions within a week using supplements are not supported by medical evidence. Legitimate health interventions typically require sustained use and work gradually. Be cautious of miracle cure claims.',
    confidence: 96,
    citations: ['FDA', 'NIH', 'FTC'],
    resourceUrl: 'https://www.fda.gov/consumers/consumer-updates/health-fraud-scams'
  },

  // === EXERCISE & LIFESTYLE ===
  {
    id: 'exercise-joint-health',
    patterns: [/exercise.{0,30}(joint|arthrit|pain|stiff)/i, /(swim|yoga|walk|low.?impact).{0,30}(joint|pain|help|stiff)/i, /low.?impact.{0,20}exercise/i],
    status: 'supported',
    summary: 'Regular low-impact exercise such as swimming, walking, and yoga is well-supported for maintaining joint health, reducing stiffness, and managing pain. It is recommended by major medical organizations.',
    confidence: 92,
    citations: ['Mayo Clinic', 'NIH', 'ACR'],
    resourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389'
  },
  {
    id: 'diet-inflammation',
    patterns: [/(anti.?inflammat|mediterran).{0,20}diet/i, /diet.{0,30}(inflammat|joint|pain)/i, /nightshade.{0,30}(inflammat|pain|avoid|elimin)/i],
    status: 'partial',
    summary: 'Anti-inflammatory diets (like Mediterranean diet) have some evidence for reducing systemic inflammation. However, eliminating specific food groups like nightshades lacks strong clinical evidence. Diet changes alone may not resolve significant symptoms.',
    confidence: 65,
    citations: ['NIH', 'Mayo Clinic'],
    resourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/anti-inflammatory-diet/art-20045478'
  },

  // === BIG PHARMA / CONSPIRACY ===
  {
    id: 'big-pharma',
    patterns: [/big\s*pharma.{0,30}(doesn.?t|don.?t|won.?t|hide|secret|suppress)/i, /pharma.{0,20}(conspiracy|cover|hide|secret|suppress|want\s*you)/i, /doctors?\s*(don.?t|won.?t).{0,20}(tell|want|know)/i],
    status: 'unsupported',
    summary: 'Claims that pharmaceutical companies or doctors are hiding effective treatments are not supported by evidence. Medical research undergoes peer review and clinical trials. While the healthcare system has legitimate criticisms, conspiracy-framed health claims often promote unproven alternatives.',
    confidence: 93,
    citations: ['NIH', 'WHO', 'FDA'],
    resourceUrl: 'https://www.nih.gov/health-information'
  },

  // === SLEEP ===
  {
    id: 'melatonin-sleep',
    patterns: [/melatonin.{0,30}(sleep|insomnia|help|take)/i],
    status: 'partial',
    summary: 'Melatonin may help with short-term sleep issues, particularly jet lag and delayed sleep phase. Evidence for long-term insomnia treatment is limited. It is generally considered safe for short-term use but should not replace good sleep hygiene.',
    confidence: 73,
    citations: ['NCCIH', 'NIH'],
    resourceUrl: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know'
  },
  {
    id: 'perimenopause-sleep',
    patterns: [/perimenopaus.{0,30}(sleep|insomnia|wake|night\s*sweat)/i, /menopaus.{0,30}(sleep|insomnia)/i, /(insomnia|sleep\s*problem).{0,30}(perimenopaus|menopaus|hormon)/i],
    status: 'supported',
    summary: 'Sleep disturbances are a well-documented symptom of perimenopause, affecting up to 60% of women. Night sweats, hormonal fluctuations, and mood changes all contribute to disrupted sleep during this transition.',
    confidence: 87,
    citations: ['NIH', 'Sleep Foundation', 'NAMS'],
    resourceUrl: 'https://www.sleepfoundation.org/menopause-and-sleep'
  },

  // === PCOS ===
  {
    id: 'pcos-insulin',
    patterns: [/PCOS.{0,30}(insulin|metformin|blood\s*sugar|diabet)/i, /polycystic.{0,30}(insulin|metformin)/i],
    status: 'supported',
    summary: 'Insulin resistance is a key feature of PCOS in many women. Metformin and lifestyle modifications targeting insulin sensitivity are evidence-based treatments. However, not all PCOS patients have insulin resistance.',
    confidence: 86,
    citations: ['ACOG', 'NIH', 'Endocrine Society'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos'
  },
  {
    id: 'pcos-diet-cure',
    patterns: [/PCOS.{0,30}(cure|eliminat|reverse|heal).{0,20}(diet|food|eating)/i, /(cure|reverse|heal).{0,20}PCOS/i],
    status: 'partial',
    summary: 'While diet and lifestyle changes can significantly improve PCOS symptoms and hormonal balance, PCOS is a chronic condition that cannot be "cured" by diet alone. Weight management can help regulate cycles and improve symptoms.',
    confidence: 78,
    citations: ['ACOG', 'NIH'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos'
  },

  // === ENDOMETRIOSIS ===
  {
    id: 'endometriosis-pain',
    patterns: [/endometrios.{0,30}(pain|cramp|severe|debilit)/i, /(severe|extreme)\s*(period|menstrual)\s*(pain|cramp).{0,30}(normal|fine)/i],
    status: 'supported',
    summary: 'Endometriosis causes significant pain that goes beyond normal menstrual cramps. It is a medical condition where tissue similar to the uterine lining grows outside the uterus. Severe period pain should be evaluated by a healthcare provider.',
    confidence: 91,
    citations: ['ACOG', 'NIH', 'WHO'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/endometriosis'
  },

  // === GENERAL MISINFORMATION PATTERNS ===
  {
    id: 'detox-cleanse',
    patterns: [/(detox|cleanse|flush).{0,30}(toxin|body|liver|kidney)/i, /(juice|tea|water).{0,15}(detox|cleanse)/i],
    status: 'unsupported',
    summary: 'The concept of "detoxing" or "cleansing" the body with special diets, juices, or supplements is not supported by medical science. The liver and kidneys naturally filter toxins. Most detox products have no proven health benefits.',
    confidence: 92,
    citations: ['NCCIH', 'NIH', 'Mayo Clinic'],
    resourceUrl: 'https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know'
  },
  {
    id: 'alkaline-water',
    patterns: [/alkaline\s*water.{0,30}(health|cure|benefit|cancer|ph)/i, /body.{0,15}(ph|acid).{0,30}(disease|cancer|health)/i],
    status: 'unsupported',
    summary: 'Claims that alkaline water has special health benefits or can prevent disease are not supported by scientific evidence. The body tightly regulates its pH regardless of what you eat or drink.',
    confidence: 90,
    citations: ['Mayo Clinic', 'NIH'],
    resourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/alkaline-water/faq-20418381'
  },
  {
    id: 'essential-oils-cure',
    patterns: [/essential\s*oil.{0,30}(cure|treat|heal|kill\s*bacter|antibiotic)/i, /(lavender|tea\s*tree|eucalyptus).{0,30}(cure|treat|heal|replace)/i],
    status: 'unsupported',
    summary: 'Essential oils may provide relaxation benefits through aromatherapy, but claims that they can cure diseases, replace antibiotics, or treat medical conditions are not supported by clinical evidence.',
    confidence: 89,
    citations: ['NCCIH', 'NIH'],
    resourceUrl: 'https://www.nccih.nih.gov/health/aromatherapy'
  },
  {
    id: 'collagen-supplements',
    patterns: [/collagen.{0,30}(supplement|powder|peptide).{0,30}(skin|joint|wrinkle|youth)/i, /take.{0,15}collagen.{0,30}(skin|joint)/i],
    status: 'partial',
    summary: 'Collagen supplements have limited but growing evidence for skin hydration and joint comfort. However, many marketing claims exaggerate the benefits. Collagen is broken down during digestion, and results vary significantly.',
    confidence: 62,
    citations: ['NIH', 'Dermatology Research'],
    resourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6835901/'
  },
  {
    id: 'probiotics-gut',
    patterns: [/probiotic.{0,30}(gut|digest|health|immune|cure|fix)/i, /gut\s*health.{0,30}(probiotic|ferment)/i],
    status: 'partial',
    summary: 'Probiotics show promise for certain digestive conditions (like antibiotic-associated diarrhea), but claims about curing diseases or broadly fixing gut health are overstated. Strain-specific research is still evolving.',
    confidence: 67,
    citations: ['NIH', 'NCCIH', 'WHO'],
    resourceUrl: 'https://www.nccih.nih.gov/health/probiotics-what-you-need-to-know'
  },

  // === FERTILITY & REPRODUCTIVE HEALTH ===
  {
    id: 'fertility-age',
    patterns: [/fertil.{0,30}(age|declin|after\s*3[5-9]|older)/i, /(age|older|over\s*3[5-9]).{0,30}fertil/i],
    status: 'supported',
    summary: 'Fertility does decline with age, particularly after 35, due to decreasing egg quantity and quality. However, many women conceive naturally after 35. Individual variation is significant and a fertility specialist can provide personalized assessment.',
    confidence: 90,
    citations: ['ACOG', 'NIH', 'ASRM'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/having-a-baby-after-age-35'
  },

  // === IRON & ANEMIA ===
  {
    id: 'iron-deficiency-periods',
    patterns: [/iron.{0,30}(deficien|anemia|period|menstruat|heavy\s*bleed)/i, /(heavy\s*(period|bleed|menstruat)).{0,30}(iron|anemi)/i, /anemia.{0,30}(period|menstruat|women)/i],
    status: 'supported',
    summary: 'Iron deficiency anemia is common in women with heavy menstrual bleeding. Regular monitoring of iron levels and appropriate supplementation (under medical guidance) is recommended for women with heavy periods.',
    confidence: 91,
    citations: ['NIH', 'Mayo Clinic', 'ACOG'],
    resourceUrl: 'https://www.mayoclinic.org/diseases-conditions/iron-deficiency-anemia/symptoms-causes/syc-20355034'
  },

  // === THYROID ===
  {
    id: 'thyroid-women',
    patterns: [/thyroid.{0,30}(women|female|symptom|perimenopaus|menopaus)/i, /(perimenopaus|menopaus).{0,30}thyroid/i, /thyroid.{0,30}(weight|fatigue|hair|mood)/i],
    status: 'supported',
    summary: 'Thyroid disorders are significantly more common in women, and symptoms can overlap with perimenopause. Thyroid function should be tested when evaluating perimenopausal symptoms as both conditions can coexist.',
    confidence: 88,
    citations: ['ATA', 'NIH', 'Mayo Clinic'],
    resourceUrl: 'https://www.thyroid.org/thyroid-and-menopause/'
  },

  // === BIRTH CONTROL ===
  {
    id: 'birth-control-perimenopause',
    patterns: [/birth\s*control.{0,30}perimenopaus/i, /perimenopaus.{0,30}(birth\s*control|contracepti|pill)/i, /(iud|pill|patch).{0,30}perimenopaus/i],
    status: 'supported',
    summary: 'Hormonal birth control can help manage perimenopausal symptoms including irregular periods, heavy bleeding, and hot flashes. Low-dose options are often recommended for perimenopausal women. Discuss options with your healthcare provider.',
    confidence: 85,
    citations: ['ACOG', 'Mayo Clinic'],
    resourceUrl: 'https://www.acog.org/womens-health/faqs/birth-control'
  },

  // === BONE HEALTH ===
  {
    id: 'osteoporosis-menopause',
    patterns: [/osteoporos.{0,30}(menopaus|perimenopaus|estrogen|bone)/i, /(menopaus|perimenopaus).{0,30}(bone|osteoporos)/i, /bone\s*(density|loss|health).{0,30}(menopaus|estrogen|women)/i],
    status: 'supported',
    summary: 'Bone density loss accelerates during and after menopause due to declining estrogen. Weight-bearing exercise, calcium, vitamin D, and potentially medication (like bisphosphonates or HRT) are evidence-based approaches to bone health.',
    confidence: 93,
    citations: ['NOF', 'NIH', 'ACOG'],
    resourceUrl: 'https://www.bones.nih.gov/health-info/bone/osteoporosis'
  }
];

// Make available globally for the content script
if (typeof window !== 'undefined') {
  window.HEALTH_CLAIMS_DB = HEALTH_CLAIMS_DB;
}
