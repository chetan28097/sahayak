/** Rule-based intent detection in hi / kn / en. Runs before (and without) the LLM. */
import { asciiDigits } from "./numbers";

export function tokens(text: string): string[] {
  return asciiDigits(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\d]+/gu, " ")
    .split(" ")
    .filter(Boolean);
}

/** Matches whole tokens or whole multi-word phrases. */
export function hasAny(text: string, phrases: readonly string[]): boolean {
  const padded = ` ${tokens(text).join(" ")} `;
  return phrases.some((p) => {
    const phrase = tokens(p).join(" ");
    return phrase.length > 0 && padded.includes(` ${phrase} `);
  });
}

const YES = [
  "yes", "yeah", "yep", "yup", "correct", "right", "ok", "okay", "sure", "haan", "han", "ha", "haa",
  "haanji", "ji", "jee", "sahi", "theek", "thik", "bilkul", "हाँ", "हां", "हा", "जी", "सही", "ठीक",
  "बिल्कुल", "houdu", "haudu", "howdu", "hoon", "hu", "sari", "ಹೌದು", "ಹೂಂ", "ಹೂ", "ಸರಿ", "ಓಕೆ",
];
const NO = [
  "no", "nope", "wrong", "incorrect", "not", "nahi", "nahin", "nai", "na", "galat", "ghalat",
  "नहीं", "नही", "ना", "गलत", "ग़लत", "illa", "beda", "tappu", "ಇಲ್ಲ", "ಬೇಡ", "ತಪ್ಪು",
];

export function detectYesNo(text: string): "yes" | "no" | null {
  if (hasAny(text, NO)) return "no";
  if (hasAny(text, YES)) return "yes";
  return null;
}

export type GlobalIntent = "repeat" | "staff" | "skip" | "unknown" | "back";

const GLOBALS: [GlobalIntent, string[]][] = [
  ["unknown", [
    "pata nahi", "pata nahin", "nahi pata", "maloom nahi", "malum nahi", "पता नहीं", "मालूम नहीं",
    "don't know", "dont know", "do not know", "not sure", "gottilla", "ಗೊತ್ತಿಲ್ಲ", "gotilla",
    "yaad nahi", "yaad nahin", "याद नहीं", "don't remember", "dont remember", "nenapilla", "ನೆನಪಿಲ್ಲ", "maalum nahi",
  ]],
  ["repeat", [
    "repeat", "again", "phir se", "fir se", "dobara", "फिर से", "दोबारा", "matte", "innomme",
    "ಮತ್ತೆ", "ಇನ್ನೊಮ್ಮೆ", "samajh nahi", "समझ नहीं",
  ]],
  ["staff", [
    "staff", "manager", "madad", "मदद", "sahayata", "सहायता", "sahaya", "ಸಹಾಯ", "help me",
  ]],
  ["skip", ["skip", "chhodo", "chodo", "छोड़ो", "छोड़ दो", "bidi", "ಬಿಡಿ", "biDi"]],
  ["back", ["go back", "peeche", "पीछे", "hinde", "ಹಿಂದೆ"]],
];

export function detectGlobal(text: string): GlobalIntent | null {
  for (const [intent, phrases] of GLOBALS) if (hasAny(text, phrases)) return intent;
  return null;
}

const QUESTION_WORDS = [
  "why", "what is", "what's", "kyon", "kyun", "kyu", "क्यों", "क्यूँ", "matlab kya", "मतलब क्या",
  "kya matlab", "yaake", "yake", "ಯಾಕೆ", "enu artha", "ಏನು ಅರ್ಥ", "artha enu",
];

export function isQuestion(text: string): boolean {
  return /\?\s*$/.test(text.trim()) || hasAny(text, QUESTION_WORDS);
}

const NO_PAN = [
  "no pan", "pan nahi", "pan nahin", "pan illa", "ಪ್ಯಾನ್ ಇಲ್ಲ", "पैन नहीं", "form 60", "form sixty",
  "nahi hai", "नहीं है", "illa", "ಇಲ್ಲ", "don't have", "dont have",
];
export function saysNoPan(text: string): boolean {
  return hasAny(text, NO_PAN);
}

/** Field keywords used to spot corrections like "amount galat hai, 12000". Order matters. */
const FIELD_WORDS: [string, string[]][] = [
  ["nominee1Relation", ["rishta", "रिश्ता", "relation", "sambandha", "ಸಂಬಂಧ"]],
  ["nominee1Dob", ["nominee dob", "nominee birth", "nominee janm", "नॉमिनी जन्म", "ನಾಮಿನಿ ಹುಟ್ಟಿದ"]],
  ["nominee1Name", ["nominee", "नॉमिनी", "ನಾಮಿನಿ", "nomini", "vaaris", "वारिस"]],
  ["nominee1Guardian", ["guardian", "abhibhavak", "अभिभावक", "poshaka", "ಪೋಷಕ"]],
  ["motherName", ["mother", "maa ka naam", "माँ का नाम", "mata", "ತಾಯಿಯ ಹೆಸರು", "ತಾಯಿ"]],
  ["fatherOrSpouse", ["father", "pita", "पिता", "pati ka naam", "पति का नाम", "ತಂದೆ"]],
  ["scheme", ["scheme", "yojana", "योजना", "ಯೋಜನೆ"]],
  ["pensionSlab", ["pension", "पेंशन", "ಪಿಂಚಣಿ"]],
  ["chequeLeaves", ["leaves", "panne", "पन्ने", "ಹಾಳೆ"]],
  ["complaintText", ["complaint", "shikayat", "शिकायत", "ದೂರು"]],
  ["accountNumber", ["account", "khata", "khaata", "खाता", "ಖಾತೆ", "khaate"]],
  ["notes", ["note", "notes", "नोट", "ನೋಟು", "notu"]],
  ["amount", ["amount", "rakam", "raqam", "paisa", "paise", "रकम", "राशि", "rashi", "ಮೊತ್ತ", "motta", "hana", "ಹಣ"]],
  ["depositorPhone", ["phone", "mobile", "फोन", "मोबाइल", "ಫೋನ್", "ಮೊಬೈಲ್"]],
  ["pan", ["pan", "पैन", "ಪ್ಯಾನ್"]],
  ["dob", ["janm", "janam", "birth", "जन्म", "dob", "huttida", "ಹುಟ್ಟಿದ"]],
  ["address", ["address", "pata", "पता", "vilasa", "ವಿಳಾಸ"]],
  ["gender", ["gender", "ling", "लिंग", "ಲಿಂಗ"]],
  ["occupation", ["occupation", "kaam", "काम", "naukri", "नौकरी", "kelasa", "ಕೆಲಸ"]],
  ["income", ["income", "aay", "आय", "aamdani", "आमदनी", "aadaya", "ಆದಾಯ"]],
  ["marital", ["shaadi", "शादी", "marital", "married", "maduve", "ಮದುವೆ"]],
  ["accountType", ["account type", "jan dhan", "जन धन", "savings", "बचत", "ಉಳಿತಾಯ"]],
  ["name", ["naam", "name", "नाम", "hesaru", "ಹೆಸರು"]],
];

/** Returns the first field id mentioned that exists in `allowed`. */
export function detectFieldMention(text: string, allowed: readonly string[]): string | null {
  for (const [field, words] of FIELD_WORDS) {
    if (!hasAny(text, words)) continue;
    if (allowed.includes(field)) return field;
    if (field === "name" && allowed.includes("depositorName")) return "depositorName";
    if (field === "depositorPhone" && allowed.includes("mobile")) return "mobile";
    if (field === "depositorPhone" && allowed.includes("newMobile")) return "newMobile";
    if (field === "address" && allowed.includes("newAddress")) return "newAddress";
    if (field === "address" && allowed.includes("currentAddress")) return "currentAddress";
  }
  return null;
}

/** Strips "my name is" style fillers around a spoken name/value. */
const NAME_FILLERS = [
  "my", "name", "is", "his", "her", "mera", "meraa", "meri", "naam", "hai", "ka", "ki", "uska",
  "unka", "usaka", "मेरा", "मेरी", "नाम", "है", "का", "की", "उसका", "उनका", "nanna", "hesaru",
  "avara", "avaru", "ivaru", "ನನ್ನ", "ಹೆಸರು", "ಅವರ", "ಅವರು", "galat", "गलत", "tappu", "ತಪ್ಪು",
  "nominee", "नॉमिनी", "ನಾಮಿನಿ", "guardian", "the", "it", "its", "wrong", "incorrect", "should", "be",
  "change", "to", "no", "not", "nahi", "नहीं", "badlo", "बदलो", "hona", "chahiye", "होना", "चाहिए", "ghalat",
  "ग़लत", "illa", "ಇಲ್ಲ", "agabeku", "ಆಗಬೇಕು", "address", "pata", "पता", "ವಿಳಾಸ",
];
export function stripFillers(text: string): string {
  return text
    .replace(/[.,!?।]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !NAME_FILLERS.includes(w.toLowerCase()))
    .join(" ")
    .trim();
}
