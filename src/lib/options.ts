/** Choice options with labels and spoken synonyms (romanised + native script). */
import { hasAny } from "./intents";
import type { Lang } from "./types";

export interface ChoiceOption {
  value: string;
  label: Record<Lang, string>;
  synonyms: string[];
}

const o = (value: string, label: Record<Lang, string>, synonyms: string[]): ChoiceOption => ({
  value,
  label,
  synonyms,
});

/** The 5 home tiles. Spoken requests go through INTENTS (more specific, with presets). */
export const TASK_OPTIONS: ChoiceOption[] = [
  o("deposit", { hi: "पैसे जमा करना", kn: "ಹಣ ಜಮಾ", en: "Deposit cash" }, [
    "deposit", "jama", "jamaa", "जमा", "ಜಮಾ", "deposit cash", "cash deposit", "paise dalne", "paisa dalna", "ಹಣ ಕಟ್ಟಬೇಕು",
    "kattabeku", "ಕಟ್ಟಬೇಕು", "deposit slip",
  ]),
  o("account_open", { hi: "नया खाता खोलना", kn: "ಹೊಸ ಖಾತೆ ತೆರೆಯುವುದು", en: "Open new account" }, [
    "open account", "open an account", "khata kholna", "khaata kholna", "kholna", "खोलना", "नया खाता", "naya khata", "new account",
    "hosa khate", "ಹೊಸ ಖಾತೆ", "terebeku", "ತೆರೆಯಬೇಕು", "ತೆರೆಯಲು", "account opening", "खाता खोलना",
  ]),
  o("scheme_enroll", { hi: "बीमा और पेंशन", kn: "ವಿಮೆ ಮತ್ತು ಪಿಂಚಣಿ", en: "Insurance & pension" }, [
    "insurance", "bima", "beema", "बीमा", "vime", "ವಿಮೆ", "pension", "पेंशन", "ಪಿಂಚಣಿ", "yojana", "योजना", "ಯೋಜನೆ", "scheme",
  ]),
  o("update_details", { hi: "जानकारी बदलें", kn: "ವಿವರ ಬದಲಿಸಿ", en: "Update my details" }, [
    "update", "change", "badalna", "badalni", "बदलना", "बदलनी", "बदलवाना", "badalisu", "ಬದಲಿಸಬೇಕು", "ಬದಲಾವಣೆ", "kyc",
  ]),
  o("service_request", { hi: "कार्ड, चेक, शिकायत", kn: "ಕಾರ್ಡ್, ಚೆಕ್, ದೂರು", en: "Card, cheque, complaint" }, [
    "card", "cheque", "check book", "complaint", "shikayat", "शिकायत", "ದೂರು", "passbook", "balance", "बैलेंस", "ಬ್ಯಾಲೆನ್ಸ್",
  ]),
];

export const SCHEME_OPTIONS: ChoiceOption[] = [
  o("pmjjby", { hi: "जीवन बीमा (PMJJBY) ₹436/साल", kn: "ಜೀವ ವಿಮೆ (PMJJBY) ₹436/ವರ್ಷ", en: "Life cover PMJJBY · ₹436/yr" }, [
    "pmjjby", "jeevan jyoti", "जीवन ज्योति", "jeevan bima", "जीवन बीमा", "life insurance", "life", "jeeva vime", "ಜೀವ ವಿಮೆ", "436",
  ]),
  o("pmsby", { hi: "दुर्घटना बीमा (PMSBY) ₹20/साल", kn: "ಅಪಘಾತ ವಿಮೆ (PMSBY) ₹20/ವರ್ಷ", en: "Accident cover PMSBY · ₹20/yr" }, [
    "pmsby", "suraksha", "सुरक्षा", "accident", "durghatna", "दुर्घटना", "apaghata", "ಅಪಘಾತ", "20 rupaye", "₹20",
  ]),
  o("apy", { hi: "अटल पेंशन योजना", kn: "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ", en: "Atal Pension Yojana" }, [
    "apy", "atal", "अटल", "ಅಟಲ್", "pension", "पेंशन", "ಪಿಂಚಣಿ",
  ]),
];

export const FACILITY_OPTIONS: ChoiceOption[] = [
  o("atm_card", { hi: "ATM कार्ड", kn: "ATM ಕಾರ್ಡ್", en: "ATM / RuPay card" }, ["atm", "card", "कार्ड", "ಕಾರ್ಡ್", "debit card", "rupay"]),
  o("cheque_book", { hi: "चेक बुक", kn: "ಚೆಕ್ ಪುಸ್ತಕ", en: "Cheque book" }, ["cheque", "check book", "चेक", "ಚೆಕ್"]),
  o("sms", { hi: "SMS अलर्ट", kn: "SMS ಸಂದೇಶ", en: "SMS alerts" }, ["sms", "message", "मैसेज", "ಸಂದೇಶ", "alert", "alerts"]),
  o("mobile_banking", { hi: "मोबाइल बैंकिंग", kn: "ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್", en: "Mobile banking" }, [
    "mobile banking", "मोबाइल बैंकिंग", "ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್", "app", "upi",
  ]),
  o("none", { hi: "कुछ नहीं", kn: "ಏನೂ ಬೇಡ", en: "None of these" }, ["none", "nothing", "kuch nahi", "कुछ नहीं", "ಏನೂ ಬೇಡ", "beda"]),
];

export const PENSION_OPTIONS: ChoiceOption[] = [1000, 2000, 3000, 4000, 5000].map((n) =>
  o(String(n), { hi: `₹${n} / महीना`, kn: `₹${n} / ತಿಂಗಳು`, en: `₹${n} / month` }, []),
);

export const UPDATE_OPTIONS: ChoiceOption[] = [
  o("mobile", { hi: "मोबाइल नंबर", kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", en: "Mobile number" }, [
    "mobile", "phone", "number", "मोबाइल", "फोन", "ಮೊಬೈಲ್", "ಫೋನ್",
  ]),
  o("address", { hi: "पता", kn: "ವಿಳಾಸ", en: "Address" }, ["address", "pata", "पता", "vilasa", "ವಿಳಾಸ", "ghar badla"]),
  o("nominee", { hi: "नॉमिनी", kn: "ನಾಮಿನಿ", en: "Nominee" }, ["nominee", "नॉमिनी", "ನಾಮಿನಿ", "vaaris", "वारिस"]),
  o("rekyc", { hi: "री-KYC", kn: "ಮರು-KYC", en: "Re-KYC" }, ["kyc", "re kyc", "rekyc", "केवाईसी", "ಕೆವೈಸಿ"]),
];

export const REQUEST_OPTIONS: ChoiceOption[] = [
  o("block_card", { hi: "ATM कार्ड बंद करें", kn: "ATM ಕಾರ್ಡ್ ಬ್ಲಾಕ್", en: "Block ATM card" }, [
    "block", "blocked", "lost card", "card lost", "card kho", "kho gaya", "खो गया", "चोरी", "chori", "stolen", "band karo",
    "बंद", "ಕಳೆದುಹೋಗಿದೆ", "ಕಳೆದು", "ಬ್ಲಾಕ್", "ಕಳ್ಳತನ",
  ]),
  o("cheque_book", { hi: "चेक बुक", kn: "ಚೆಕ್ ಪುಸ್ತಕ", en: "Cheque book" }, [
    "cheque", "check book", "cheque book", "chequebook", "चेक", "ಚೆಕ್",
  ]),
  o("passbook", { hi: "पासबुक अपडेट", kn: "ಪಾಸ್‌ಬುಕ್ ಅಪ್‌ಡೇಟ್", en: "Passbook update" }, [
    "passbook", "pass book", "पासबुक", "ಪಾಸ್‌ಬುಕ್", "ಪಾಸ್ ಬುಕ್", "entry",
  ]),
  o("balance", { hi: "बैलेंस / स्टेटमेंट", kn: "ಬ್ಯಾಲೆನ್ಸ್ / ಸ್ಟೇಟ್‌ಮೆಂಟ್", en: "Balance / statement" }, [
    "balance", "बैलेंस", "ಬ್ಯಾಲೆನ್ಸ್", "kitna paisa", "कितना पैसा", "statement", "स्टेटमेंट", "ಎಷ್ಟು ಹಣ",
  ]),
  o("complaint", { hi: "शिकायत", kn: "ದೂರು", en: "Complaint" }, [
    "complaint", "complain", "complaining", "shikayat", "शिकायत", "doru", "ದೂರು", "problem", "समस्या", "ಸಮಸ್ಯೆ",
    "debited", "deducted", "kat gaya", "कट गया", "कट गए", "ಕಡಿತ", "ಕಡಿತವಾಯಿತು", "not received", "nahi mila", "नहीं मिला",
  ]),
];

export const CHEQUE_LEAVES_OPTIONS: ChoiceOption[] = [
  o("10", { hi: "10 पन्ने", kn: "10 ಹಾಳೆ", en: "10 leaves" }, ["10", "das", "दस", "hattu", "ಹತ್ತು", "ten"]),
  o("25", { hi: "25 पन्ने", kn: "25 ಹಾಳೆ", en: "25 leaves" }, ["25", "pachchis", "pachees", "पच्चीस", "ಇಪ್ಪತ್ತೈದು", "twenty five"]),
  o("50", { hi: "50 पन्ने", kn: "50 ಹಾಳೆ", en: "50 leaves" }, ["50", "pachas", "pachaas", "पचास", "ಐವತ್ತು", "fifty"]),
];

export const CHEQUE_DELIVERY_OPTIONS: ChoiceOption[] = [
  o("branch", { hi: "ब्रांच से लूँगा", kn: "ಶಾಖೆಯಲ್ಲಿ ಪಡೆಯುವೆ", en: "Collect at branch" }, [
    "branch", "bank", "ब्रांच", "बैंक", "शाखा", "ಶಾಖೆ", "ಬ್ಯಾಂಕ್", "collect", "khud", "खुद",
  ]),
  o("home", { hi: "घर भेजें", kn: "ಮನೆಗೆ ಕಳುಹಿಸಿ", en: "Send to home" }, [
    "home", "ghar", "घर", "mane", "ಮನೆ", "courier", "post", "send",
  ]),
];

export const CARD_REASON_OPTIONS: ChoiceOption[] = [
  o("stolen", { hi: "चोरी हुआ", kn: "ಕಳ್ಳತನ", en: "Stolen" }, ["stolen", "chori", "चोरी", "ಕಳ್ಳತನ", "kallatana"]),
  o("lost", { hi: "खो गया", kn: "ಕಳೆದುಹೋಗಿದೆ", en: "Lost" }, ["lost", "kho", "खो", "ಕಳೆದು", "ಕಳೆದುಹೋಗಿದೆ", "missing"]),
  o("damaged", { hi: "खराब हो गया", kn: "ಹಾಳಾಗಿದೆ", en: "Damaged" }, [
    "damaged", "broken", "kharab", "खराब", "toot", "टूट", "ಹಾಳಾಗಿದೆ", "ಹಾಳು", "not working",
  ]),
];

export const COMPLAINT_OPTIONS: ChoiceOption[] = [
  o("atm_debit", { hi: "पैसा कटा, मिला नहीं", kn: "ಹಣ ಕಡಿತ, ಸಿಗಲಿಲ್ಲ", en: "Money debited, not received" }, [
    "atm", "kat gaya", "कट गया", "deducted", "debited", "nahi mila", "नहीं मिला", "ಕಡಿತ", "ಸಿಗಲಿಲ್ಲ", "upi",
  ]),
  o("account", { hi: "खाता / पासबुक", kn: "ಖಾತೆ / ಪಾಸ್‌ಬುಕ್", en: "Account / passbook" }, [
    "account", "खाता", "khata", "passbook", "पासबुक", "ಖಾತೆ", "ಪಾಸ್‌ಬುಕ್", "interest", "byaj", "ब्याज",
  ]),
  o("staff", { hi: "स्टाफ़ का व्यवहार", kn: "ಸಿಬ್ಬಂದಿ ವರ್ತನೆ", en: "Staff behaviour" }, [
    "staff", "behaviour", "व्यवहार", "rude", "ಸಿಬ್ಬಂದಿ", "ವರ್ತನೆ",
  ]),
  o("loan", { hi: "लोन / सब्सिडी", kn: "ಸಾಲ / ಸಬ್ಸಿಡಿ", en: "Loan / subsidy" }, [
    "loan", "लोन", "karz", "कर्ज", "subsidy", "सब्सिडी", "ಸಾಲ", "ಸಬ್ಸಿಡಿ", "kisan credit",
  ]),
  o("other", { hi: "कुछ और", kn: "ಬೇರೆ", en: "Something else" }, ["other", "kuch aur", "कुछ और", "ಬೇರೆ"]),
];

/** Spoken-request router: service + optional preset sub-choice. Specific intents first. */
export interface Intent {
  service: string;
  preset?: Record<string, unknown>;
  synonyms: string[];
}

export const INTENTS: Intent[] = [
  { service: "service_request", preset: { requestType: "block_card" }, synonyms: REQUEST_OPTIONS[0].synonyms.filter((s) => s !== "बंद") },
  { service: "service_request", preset: { requestType: "cheque_book" }, synonyms: REQUEST_OPTIONS[1].synonyms },
  { service: "service_request", preset: { requestType: "passbook" }, synonyms: REQUEST_OPTIONS[2].synonyms },
  { service: "service_request", preset: { requestType: "balance" }, synonyms: REQUEST_OPTIONS[3].synonyms },
  { service: "service_request", preset: { requestType: "complaint" }, synonyms: REQUEST_OPTIONS[4].synonyms },
  { service: "scheme_enroll", preset: { scheme: "pmjjby" }, synonyms: SCHEME_OPTIONS[0].synonyms.filter((s) => s !== "life") },
  { service: "scheme_enroll", preset: { scheme: "pmsby" }, synonyms: SCHEME_OPTIONS[1].synonyms },
  { service: "scheme_enroll", preset: { scheme: "apy" }, synonyms: ["apy", "atal", "अटल", "ಅಟಲ್", "pension yojana", "पेंशन योजना"] },
  { service: "update_details", preset: { updateWhat: ["nominee"] }, synonyms: ["nominee", "नॉमिनी", "ನಾಮಿನಿ", "वारिस"] },
  { service: "update_details", preset: { updateWhat: ["mobile"] }, synonyms: [
    "mobile number badalna", "number change", "naya number", "नया नंबर", "mobile badalna", "मोबाइल नंबर बदलना", "ಹೊಸ ಮೊಬೈಲ್", "change mobile",
  ] },
  { service: "update_details", preset: { updateWhat: ["address"] }, synonyms: [
    "address change", "pata badalna", "पता बदलना", "ವಿಳಾಸ ಬದಲಿಸ", "new address", "naya pata", "नया पता", "change address",
  ] },
  { service: "update_details", preset: { updateWhat: ["rekyc"] }, synonyms: ["rekyc", "re kyc", "kyc update", "kyc", "केवाईसी"] },
  ...TASK_OPTIONS.map((t) => ({ service: t.value, synonyms: [...t.synonyms, ...Object.values(t.label)] })),
];

export function matchIntent(text: string): Intent | null {
  return INTENTS.find((intent) => hasAny(text, intent.synonyms)) ?? null;
}

/** All options mentioned ("mobile aur pata" → [mobile, address]). */
export function matchAllOptions(text: string, options: ChoiceOption[]): ChoiceOption[] {
  return options.filter((opt) =>
    hasAny(text, [...opt.synonyms, opt.value, ...Object.values(opt.label).map((l) => l.toLowerCase())]),
  );
}

export const GENDER_OPTIONS: ChoiceOption[] = [
  o("female", { hi: "महिला", kn: "ಮಹಿಳೆ", en: "Female" }, [
    "female", "woman", "lady", "mahila", "aurat", "stri", "महिला", "औरत", "स्त्री", "hennu", "ಹೆಣ್ಣು", "ಮಹಿಳೆ",
  ]),
  o("male", { hi: "पुरुष", kn: "ಪುರುಷ", en: "Male" }, [
    "male", "man", "purush", "aadmi", "mard", "पुरुष", "आदमी", "gandasu", "ಗಂಡು", "ಪುರುಷ", "ಗಂಡಸು",
  ]),
  o("other", { hi: "अन्य", kn: "ಇತರೆ", en: "Other" }, ["other", "transgender", "anya", "अन्य", "itare", "ಇತರೆ"]),
];

export const OCCUPATION_OPTIONS: ChoiceOption[] = [
  o("farmer", { hi: "किसान / खेती", kn: "ರೈತ / ಕೃಷಿ", en: "Farmer" }, [
    "farmer", "farming", "agriculture", "kisan", "kheti", "किसान", "खेती", "raitha", "raita", "ರೈತ", "ಕೃಷಿ", "krishi",
  ]),
  o("labour", { hi: "मज़दूरी", kn: "ಕೂಲಿ", en: "Daily wage / labour" }, [
    "labour", "labourer", "worker", "daily wage", "mazdoor", "majdoor", "मज़दूर", "मजदूर", "मज़दूरी", "coolie",
    "kooli", "ಕೂಲಿ",
  ]),
  o("salaried", { hi: "नौकरी", kn: "ನೌಕರಿ / ಸಂಬಳ", en: "Salaried job" }, [
    "job", "salary", "salaried", "service", "naukri", "नौकरी", "ನೌಕರಿ", "ಸಂಬಳ", "udyoga", "ಉದ್ಯೋಗ",
  ]),
  o("business", { hi: "दुकान / व्यापार", kn: "ಅಂಗಡಿ / ವ್ಯಾಪಾರ", en: "Shop / business" }, [
    "business", "shop", "self employed", "dukaan", "dukan", "दुकान", "vyapar", "व्यापार", "angadi", "ಅಂಗಡಿ",
    "vyapara", "ವ್ಯಾಪಾರ",
  ]),
  o("homemaker", { hi: "गृहिणी", kn: "ಗೃಹಿಣಿ", en: "Homemaker" }, [
    "homemaker", "housewife", "grihini", "गृहिणी", "ghar ka kaam", "घर का काम", "ಗೃಹಿಣಿ", "manekelasa", "ಮನೆಕೆಲಸ",
  ]),
  o("student", { hi: "विद्यार्थी", kn: "ವಿದ್ಯಾರ್ಥಿ", en: "Student" }, [
    "student", "vidyarthi", "विद्यार्थी", "padhai", "पढ़ाई", "ವಿದ್ಯಾರ್ಥಿ",
  ]),
  o("retired", { hi: "रिटायर / पेंशन", kn: "ನಿವೃತ್ತ / ಪಿಂಚಣಿ", en: "Retired / pension" }, [
    "retired", "pension", "pensioner", "रिटायर", "पेंशन", "सेवानिवृत्त", "nivrutta", "ನಿವೃತ್ತ", "ಪಿಂಚಣಿ",
  ]),
  o("other", { hi: "अन्य", kn: "ಇತರೆ", en: "Other" }, ["other", "anya", "अन्य", "ಇತರೆ", "itare"]),
];

export const INCOME_OPTIONS: ChoiceOption[] = [
  o("lt1", { hi: "1 लाख से कम", kn: "1 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ", en: "Below ₹1 lakh" }, [
    "less than 1 lakh", "below 1 lakh", "1 lakh se kam", "ek lakh se kam", "bahut kam", "ಕಡಿಮೆ",
  ]),
  o("1to5", { hi: "1 से 5 लाख", kn: "1 ರಿಂದ 5 ಲಕ್ಷ", en: "₹1–5 lakh" }, []),
  o("5to10", { hi: "5 से 10 लाख", kn: "5 ರಿಂದ 10 ಲಕ್ಷ", en: "₹5–10 lakh" }, []),
  o("gt10", { hi: "10 लाख से ज़्यादा", kn: "10 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು", en: "Above ₹10 lakh" }, []),
];

export const MARITAL_OPTIONS: ChoiceOption[] = [
  o("single", { hi: "अविवाहित", kn: "ಅವಿವಾಹಿತ", en: "Single" }, [
    "single", "unmarried", "not married", "avivahit", "अविवाहित", "kunwara", "कुंवारा", "shaadi nahi", "शादी नहीं",
    "ಅವಿವಾಹಿತ", "maduve agilla", "ಮದುವೆ ಆಗಿಲ್ಲ",
  ]),
  o("widowed", { hi: "विधवा / विधुर", kn: "ವಿಧವೆ / ವಿಧುರ", en: "Widowed" }, [
    "widow", "widowed", "widower", "vidhwa", "vidhva", "विधवा", "विधुर", "vidhave", "ವಿಧವೆ", "ವಿಧುರ",
  ]),
  o("divorced", { hi: "तलाकशुदा", kn: "ವಿಚ್ಛೇದಿತ", en: "Divorced" }, [
    "divorce", "divorced", "talaq", "talak", "तलाक", "तलाकशुदा", "ವಿಚ್ಛೇದನ", "ವಿಚ್ಛೇದಿತ",
  ]),
  o("married", { hi: "विवाहित", kn: "ವಿವಾಹಿತ", en: "Married" }, [
    "married", "vivahit", "विवाहित", "shaadishuda", "शादीशुदा", "shaadi hui", "शादी हुई", "ವಿವಾಹಿತ",
    "maduve agide", "ಮದುವೆ ಆಗಿದೆ",
  ]),
];

export const RELATION_OPTIONS: ChoiceOption[] = [
  o("spouse", { hi: "पति / पत्नी", kn: "ಗಂಡ / ಹೆಂಡತಿ", en: "Spouse" }, [
    "spouse", "wife", "husband", "pati", "patni", "पति", "पत्नी", "biwi", "बीवी", "gharwali", "gharwala",
    "hendati", "ಹೆಂಡತಿ", "ganda", "ಗಂಡ", "patni ji",
  ]),
  o("son", { hi: "बेटा", kn: "ಮಗ", en: "Son" }, ["son", "beta", "बेटा", "ladka", "putra", "maga", "ಮಗ"]),
  o("daughter", { hi: "बेटी", kn: "ಮಗಳು", en: "Daughter" }, [
    "daughter", "beti", "बेटी", "ladki", "putri", "magalu", "ಮಗಳು",
  ]),
  o("mother", { hi: "माँ", kn: "ತಾಯಿ", en: "Mother" }, [
    "mother", "mom", "maa", "mummy", "माँ", "मां", "mata", "amma", "ಅಮ್ಮ", "tayi", "ತಾಯಿ",
  ]),
  o("father", { hi: "पिता", kn: "ತಂದೆ", en: "Father" }, [
    "father", "dad", "papa", "pitaji", "पिता", "पिताजी", "baap", "appa", "ಅಪ್ಪ", "tande", "ತಂದೆ",
  ]),
  o("brother", { hi: "भाई", kn: "ಸಹೋದರ", en: "Brother" }, [
    "brother", "bhai", "भाई", "anna", "ಅಣ್ಣ", "tamma", "ತಮ್ಮ", "ಸಹೋದರ",
  ]),
  o("sister", { hi: "बहन", kn: "ಸಹೋದರಿ", en: "Sister" }, [
    "sister", "behen", "bahan", "बहन", "akka", "ಅಕ್ಕ", "tangi", "ತಂಗಿ", "ಸಹೋದರಿ",
  ]),
  o("other", { hi: "अन्य", kn: "ಇತರೆ", en: "Other" }, ["other", "anya", "अन्य", "ಇತರೆ"]),
];

export const ACCOUNT_TYPE_OPTIONS: ChoiceOption[] = [
  o("savings", { hi: "बचत खाता", kn: "ಉಳಿತಾಯ ಖಾತೆ", en: "Savings account" }, [
    "savings", "saving", "bachat", "बचत", "ulitaya", "ಉಳಿತಾಯ",
  ]),
  o("jandhan", { hi: "जन धन खाता", kn: "ಜನ್ ಧನ್ ಖಾತೆ", en: "Jan Dhan account" }, [
    "jan dhan", "jandhan", "जन धन", "जनधन", "ಜನ್ ಧನ್", "ಜನಧನ್", "zero balance", "bsbd",
  ]),
];

export function matchOption(text: string, options: ChoiceOption[]): ChoiceOption | null {
  const lower = text.toLowerCase();
  for (const opt of options) {
    const words = [...opt.synonyms, opt.value, ...Object.values(opt.label).map((l) => l.toLowerCase())];
    if (hasAny(lower, words)) return opt;
  }
  return null;
}

export function optionLabel(options: ChoiceOption[], value: string | undefined, lang: Lang): string {
  if (!value) return "";
  return options.find((x) => x.value === value)?.label[lang] ?? value;
}

/** Annual income bucket from a spoken figure ("mahine ka 10 hazaar" is multiplied by 12). */
export function incomeBucket(annualRupees: number): string {
  if (annualRupees <= 1_00_000) return "lt1";
  if (annualRupees <= 5_00_000) return "1to5";
  if (annualRupees <= 10_00_000) return "5to10";
  return "gt10";
}
