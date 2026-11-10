/**
 * Customer-portal copy in Kannada, Hindi and English. One language is shown at a time
 * (chosen in the header). Plain words, short sentences, no banking jargon without an explanation.
 */
import type { Lang, ServiceId } from "../types";

export interface ServiceCopy {
  name: string;
  short: string;
  time: string;
  asks: string[];
  bring: string[];
  facts: string[];
}

export interface PortalCopy {
  nav: { services: string; how: string; help: string; track: string; start: string; staff: string; about: string };
  hero: { title: string; sub: string; cta: string; secondary: string };
  demo: {
    label: string;
    hear: string;
    replay: string;
    lines: { who: "bot" | "you"; text: string }[];
    fields: { label: string; value: string; after: number }[];
    ready: string;
  };
  services: { title: string; sub: string; open: string; start: string; ask: string; bring: string; good: string; minutes: string; items: Record<ServiceId, ServiceCopy> };
  how: { title: string; steps: { title: string; body: string }[] };
  words: { title: string; sub: string; terms: { term: string; plain: string; example: string }[]; more: string };
  promises: { title: string; items: { title: string; body: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  track: { title: string; sub: string; label: string; button: string };
  final: { title: string; sub: string };
  footer: { note: string };
  help: { title: string; sub: string; mic: { title: string; steps: string[] }; person: { title: string; body: string } };
}

const en: PortalCopy = {
  nav: { services: "Services", how: "How it works", help: "Help", track: "Check application", start: "Start talking", staff: "Bank staff", about: "About" },
  hero: {
    title: "Bank forms, filled by talking.",
    sub: "Say what you need in Kannada, Hindi or English. Sahayak asks one simple question at a time and fills the form for you.",
    cta: "Start talking",
    secondary: "See what it can do",
  },
  demo: {
    label: "Try it",
    hear: "Hear it",
    replay: "Play again",
    lines: [
      { who: "bot", text: "Namaste! What do you need today?" },
      { who: "you", text: "I want to deposit money." },
      { who: "bot", text: "Please say your account number." },
      { who: "you", text: "3021 4567 891" },
      { who: "bot", text: "Account ending 7891, Lakshmamma. Is that right?" },
      { who: "you", text: "Yes." },
      { who: "bot", text: "How much are you depositing?" },
      { who: "you", text: "Twelve thousand five hundred." },
    ],
    fields: [
      { label: "Account", value: "3021 4567 891", after: 3 },
      { label: "Name", value: "Lakshmamma", after: 4 },
      { label: "Amount", value: "₹12,500", after: 7 },
      { label: "In words", value: "Twelve thousand five hundred only", after: 7 },
    ],
    ready: "Slip ready. Token NRT-4RU",
  },
  services: {
    title: "What you can do here",
    sub: "Pick one, or just say it in your own words.",
    open: "What to expect",
    start: "Start this",
    ask: "What we will ask you",
    bring: "Bring with you",
    good: "Good to know",
    minutes: "About {n} minutes",
    items: {
      deposit: {
        name: "Deposit cash",
        short: "Put money in your account or a family member's.",
        time: "2",
        asks: ["Account number, or show the passbook", "How much money", "How many notes of each kind", "PAN card, only for ₹50,000 or more", "Your name, if it is someone else's account"],
        bring: ["The cash", "PAN card, if the amount is ₹50,000 or more"],
        facts: ["We count the notes with you, so mistakes are caught before the counter.", "Without a PAN card, you can sign Form 60 at the counter."],
      },
      account_open: {
        name: "Open a new account",
        short: "Savings or Jan Dhan account, with your nominee.",
        time: "6",
        asks: ["Do you already bank with us?", "Show your Aadhaar card to the camera", "Father's or husband's name, and mother's name", "Mobile number, work and rough income", "ATM card, cheque book or SMS alerts", "Who gets the money after you (nominee)"],
        bring: ["Original Aadhaar card", "PAN card, or sign Form 60", "One passport-size photo"],
        facts: ["Already a customer? We reuse your details and ask only what is new.", "Jan Dhan accounts need no minimum balance."],
      },
      scheme_enroll: {
        name: "Insurance and pension",
        short: "Government schemes: life cover, accident cover, Atal Pension.",
        time: "3",
        asks: ["Which scheme you want", "Your age is checked from bank records", "For pension: how much you want each month", "Who gets the money (nominee)", "Your permission for the yearly or monthly payment"],
        bring: ["Enough balance for the first payment"],
        facts: ["PMJJBY pays ₹2 lakh to your family. PMSBY covers accidents for ₹20 a year.", "Atal Pension is for ages 18 to 40 who do not pay income tax."],
      },
      update_details: {
        name: "Change my details",
        short: "New mobile number, new address, nominee or re-KYC.",
        time: "3",
        asks: ["What you want to change, one or more things", "The new mobile number or address", "New nominee details, if changing"],
        bring: ["Your phone, to receive an OTP", "Aadhaar card, for a new address"],
        facts: ["We show your current details first, so you only tell us what changed."],
      },
      service_request: {
        name: "Card, cheque, complaint",
        short: "Block a lost card, ask for a cheque book, or raise a complaint.",
        time: "2",
        asks: ["What happened, or what you need", "For a lost card: was any money taken?", "For a complaint: the date and amount"],
        bring: ["Nothing for a card block", "Passbook, for a passbook update"],
        facts: ["Lost card requests go to the front of the queue.", "If money was taken, report it quickly so the bank can refund you."],
      },
    },
  },
  how: {
    title: "A visit, start to finish",
    steps: [
      { title: "Say what you need", body: "Tap your language and talk. Or tap a picture if you prefer." },
      { title: "Listen and say yes", body: "Every name, number and amount is read back. Fix anything just by saying it." },
      { title: "Take your token to the counter", body: "The cashier scans it and sees your form, already filled. Bring the things on your slip." },
    ],
  },
  words: {
    title: "Banking words, in plain language",
    sub: "Tap a word to see what it means.",
    terms: [
      { term: "Nominee", plain: "The person who gets the money in your account after you.", example: "Most people choose a son, daughter or spouse." },
      { term: "KYC", plain: "The bank checking who you are, usually with your Aadhaar card.", example: "Done once, and refreshed every few years." },
      { term: "PAN card", plain: "A tax ID card. Needed for big cash deposits.", example: "For deposits of ₹50,000 or more." },
      { term: "Form 60", plain: "A form you sign if you do not have a PAN card.", example: "Staff help you fill it at the counter." },
      { term: "Auto-debit", plain: "The bank takes a fixed amount from your account automatically.", example: "Used for insurance and pension payments." },
      { term: "Re-KYC", plain: "Updating your identity details with the bank again.", example: "The bank may ask for it every few years." },
    ],
    more: "All words and help",
  },
  promises: {
    title: "Your information stays safe",
    items: [
      { title: "Nothing sent without your yes", body: "We read everything back. Only when you say yes does it go to the counter." },
      { title: "Aadhaar stays hidden", body: "Only the last four digits are ever shown or stored." },
      { title: "Your voice is not kept", body: "We turn speech into text and delete the recording." },
      { title: "Balance never spoken aloud", body: "It appears on the screen, so people nearby cannot hear it." },
    ],
  },
  faq: {
    title: "Questions people ask",
    items: [
      { q: "Do I need to read or write?", a: "No. You can do everything by talking and tapping pictures. Staff can type for you if needed." },
      { q: "What if it does not understand me?", a: "It asks again, gives an example, and if it still does not work, a staff member comes to help." },
      { q: "Can I change an answer?", a: "Yes. Say what is wrong, like 'amount is wrong, 12,000', or tap that line when everything is read back." },
      { q: "Is my money deposited when I get the token?", a: "Not yet. The token sends your filled form to the counter. The cashier completes it." },
      { q: "Can I do two things in one visit?", a: "Yes. After each slip, Sahayak asks if there is anything else, without asking your account number again." },
    ],
  },
  track: { title: "Check an application", sub: "Type the 6-letter token from your slip.", label: "Token", button: "Check" },
  final: { title: "Ready when you are.", sub: "Choose your language above, then tap start." },
  footer: { note: "Sahayak Grameen Bank is a demo bank. Account records and KYC checks are simulated; card photos only fill forms." },
  help: {
    title: "Help",
    sub: "How to use Sahayak, and what banking words mean.",
    mic: { title: "Talking to Sahayak", steps: ["Tap the big orange button and speak.", "Stop talking and it listens no more. Or tap again.", "Not sure what a question means? Tap 'What does this mean?'", "Tap 'Call a staff member' anytime. Someone will come to you."] },
    person: { title: "Prefer a person?", body: "Every branch counter can help you directly. Sahayak only makes the form faster." },
  },
};

const hi: PortalCopy = {
  nav: { services: "सेवाएँ", how: "कैसे काम करता है", help: "मदद", track: "आवेदन देखें", start: "बात शुरू करें", staff: "बैंक स्टाफ़", about: "परिचय" },
  hero: {
    title: "बैंक फ़ॉर्म, बस बोलकर।",
    sub: "कन्नड़, हिंदी या अंग्रेज़ी में बताइए। सहायक एक-एक आसान सवाल पूछकर आपका फ़ॉर्म भर देगा।",
    cta: "बात शुरू करें",
    secondary: "क्या-क्या कर सकते हैं",
  },
  demo: {
    label: "आज़माकर देखें",
    hear: "सुनिए",
    replay: "फिर से चलाएँ",
    lines: [
      { who: "bot", text: "नमस्ते! आज क्या करना है?" },
      { who: "you", text: "पैसे जमा करने हैं।" },
      { who: "bot", text: "अपना खाता नंबर बोलिए।" },
      { who: "you", text: "3021 4567 891" },
      { who: "bot", text: "खाता 7891 पर खत्म, लक्ष्मम्मा के नाम। सही है?" },
      { who: "you", text: "हाँ।" },
      { who: "bot", text: "कितने रुपये जमा करने हैं?" },
      { who: "you", text: "बारह हज़ार पाँच सौ।" },
    ],
    fields: [
      { label: "खाता", value: "3021 4567 891", after: 3 },
      { label: "नाम", value: "लक्ष्मम्मा", after: 4 },
      { label: "रकम", value: "₹12,500", after: 7 },
      { label: "शब्दों में", value: "बारह हज़ार पाँच सौ रुपये", after: 7 },
    ],
    ready: "पर्ची तैयार। टोकन NRT-4RU",
  },
  services: {
    title: "यहाँ क्या कर सकते हैं",
    sub: "एक चुनिए, या अपने शब्दों में बोल दीजिए।",
    open: "क्या होगा",
    start: "यह शुरू करें",
    ask: "हम क्या पूछेंगे",
    bring: "साथ लाएँ",
    good: "जानने लायक",
    minutes: "लगभग {n} मिनट",
    items: {
      deposit: {
        name: "पैसे जमा करें",
        short: "अपने या परिवार के खाते में पैसे डालें।",
        time: "2",
        asks: ["खाता नंबर, या पासबुक दिखाएँ", "कितने रुपये", "किस नोट के कितने नोट", "पैन कार्ड, सिर्फ़ ₹50,000 या ज़्यादा पर", "आपका नाम, अगर खाता किसी और का है"],
        bring: ["नकद पैसे", "पैन कार्ड, अगर रकम ₹50,000 या ज़्यादा है"],
        facts: ["हम आपके साथ नोट गिनते हैं, ताकि गलती काउंटर से पहले पकड़ी जाए।", "पैन कार्ड न हो तो काउंटर पर फ़ॉर्म 60 भर सकते हैं।"],
      },
      account_open: {
        name: "नया खाता खोलें",
        short: "बचत या जन धन खाता, नॉमिनी के साथ।",
        time: "6",
        asks: ["क्या आपका यहाँ पहले से खाता है?", "आधार कार्ड कैमरे को दिखाएँ", "पिता या पति का नाम, और माँ का नाम", "मोबाइल नंबर, काम और लगभग कमाई", "ATM कार्ड, चेक बुक या SMS अलर्ट", "आपके बाद पैसा किसे मिले (नॉमिनी)"],
        bring: ["असली आधार कार्ड", "पैन कार्ड, या फ़ॉर्म 60", "एक पासपोर्ट फ़ोटो"],
        facts: ["पहले से ग्राहक हैं? हम आपकी जानकारी दोबारा नहीं पूछते।", "जन धन खाते में न्यूनतम बैलेंस नहीं चाहिए।"],
      },
      scheme_enroll: {
        name: "बीमा और पेंशन",
        short: "सरकारी योजनाएँ: जीवन बीमा, दुर्घटना बीमा, अटल पेंशन।",
        time: "3",
        asks: ["कौन सी योजना चाहिए", "उम्र बैंक रिकॉर्ड से जाँची जाती है", "पेंशन के लिए: हर महीने कितनी चाहिए", "पैसा किसे मिले (नॉमिनी)", "हर साल या महीने कटौती की अनुमति"],
        bring: ["पहली किस्त के लिए खाते में पैसा"],
        facts: ["PMJJBY में परिवार को ₹2 लाख मिलते हैं। PMSBY ₹20 साल में दुर्घटना बीमा।", "अटल पेंशन 18 से 40 साल के उन लोगों के लिए जो इनकम टैक्स नहीं भरते।"],
      },
      update_details: {
        name: "जानकारी बदलें",
        short: "नया मोबाइल नंबर, नया पता, नॉमिनी या री-KYC।",
        time: "3",
        asks: ["क्या बदलना है, एक या ज़्यादा", "नया मोबाइल नंबर या पता", "नए नॉमिनी की जानकारी, अगर बदल रहे हैं"],
        bring: ["अपना फ़ोन, OTP के लिए", "आधार कार्ड, नए पते के लिए"],
        facts: ["हम पहले आपकी मौजूदा जानकारी दिखाते हैं, आप सिर्फ़ बदलाव बताइए।"],
      },
      service_request: {
        name: "कार्ड, चेक, शिकायत",
        short: "खोया कार्ड बंद करें, चेक बुक माँगें, या शिकायत दर्ज करें।",
        time: "2",
        asks: ["क्या हुआ, या क्या चाहिए", "खोए कार्ड के लिए: कोई पैसा निकला?", "शिकायत के लिए: तारीख और रकम"],
        bring: ["कार्ड बंद करने के लिए कुछ नहीं", "पासबुक अपडेट के लिए पासबुक"],
        facts: ["खोए कार्ड के अनुरोध सबसे पहले देखे जाते हैं।", "पैसा निकला हो तो जल्दी बताइए, ताकि बैंक लौटा सके।"],
      },
    },
  },
  how: {
    title: "शुरू से आखिर तक",
    steps: [
      { title: "बताइए क्या चाहिए", body: "अपनी भाषा दबाइए और बोलिए। चाहें तो तस्वीर दबाइए।" },
      { title: "सुनिए और हाँ कहिए", body: "हर नाम, नंबर और रकम पढ़कर सुनाई जाती है। गलती बोलकर ठीक कीजिए।" },
      { title: "टोकन काउंटर पर ले जाइए", body: "कैशियर स्कैन करके भरा हुआ फ़ॉर्म देखता है। पर्ची पर लिखी चीज़ें साथ लाइए।" },
    ],
  },
  words: {
    title: "बैंक के शब्द, आसान भाषा में",
    sub: "मतलब देखने के लिए शब्द दबाइए।",
    terms: [
      { term: "नॉमिनी", plain: "वह व्यक्ति जिसे आपके बाद खाते का पैसा मिलता है।", example: "ज़्यादातर लोग बेटा, बेटी या पति/पत्नी चुनते हैं।" },
      { term: "KYC", plain: "बैंक का आपकी पहचान जाँचना, अक्सर आधार कार्ड से।", example: "एक बार होता है, कुछ सालों में फिर से।" },
      { term: "पैन कार्ड", plain: "टैक्स का पहचान कार्ड। बड़ी नकद जमा पर चाहिए।", example: "₹50,000 या ज़्यादा जमा करने पर।" },
      { term: "फ़ॉर्म 60", plain: "पैन कार्ड न होने पर भरा जाने वाला फ़ॉर्म।", example: "काउंटर पर स्टाफ़ मदद करता है।" },
      { term: "ऑटो-डेबिट", plain: "बैंक अपने आप खाते से तय रकम काटता है।", example: "बीमा और पेंशन की किस्त के लिए।" },
      { term: "री-KYC", plain: "बैंक में अपनी पहचान की जानकारी फिर से ताज़ा करना।", example: "बैंक कुछ सालों में माँग सकता है।" },
    ],
    more: "सारे शब्द और मदद",
  },
  promises: {
    title: "आपकी जानकारी सुरक्षित",
    items: [
      { title: "आपकी 'हाँ' के बिना कुछ नहीं जाता", body: "हम सब पढ़कर सुनाते हैं। आप 'हाँ' कहें तभी काउंटर पर जाता है।" },
      { title: "आधार छिपा रहता है", body: "सिर्फ़ आखिरी चार अंक दिखते और रखे जाते हैं।" },
      { title: "आपकी आवाज़ नहीं रखी जाती", body: "बोली को लिखकर रिकॉर्डिंग मिटा दी जाती है।" },
      { title: "बैलेंस ज़ोर से नहीं बोला जाता", body: "स्क्रीन पर दिखता है, ताकि पास के लोग न सुनें।" },
    ],
  },
  faq: {
    title: "लोग क्या पूछते हैं",
    items: [
      { q: "क्या पढ़ना-लिखना आना ज़रूरी है?", a: "नहीं। सब कुछ बोलकर और तस्वीर दबाकर हो जाता है। ज़रूरत हो तो स्टाफ़ टाइप कर देगा।" },
      { q: "अगर समझ न आए तो?", a: "फिर से पूछेगा, उदाहरण देगा, और फिर भी न हो तो स्टाफ़ मदद के लिए आएगा।" },
      { q: "क्या जवाब बदल सकते हैं?", a: "हाँ। बोलिए क्या गलत है, जैसे 'रकम गलत है, 12000', या पढ़कर सुनाते समय उस लाइन को दबाइए।" },
      { q: "टोकन मिलते ही पैसा जमा हो गया?", a: "अभी नहीं। टोकन आपका भरा फ़ॉर्म काउंटर पर भेजता है। कैशियर काम पूरा करता है।" },
      { q: "एक बार में दो काम हो सकते हैं?", a: "हाँ। हर पर्ची के बाद पूछा जाता है कि और कुछ है क्या, खाता नंबर दोबारा पूछे बिना।" },
    ],
  },
  track: { title: "आवेदन देखें", sub: "पर्ची पर लिखा 6 अक्षर का टोकन लिखिए।", label: "टोकन", button: "देखें" },
  final: { title: "जब चाहें, शुरू करें।", sub: "ऊपर अपनी भाषा चुनिए, फिर शुरू दबाइए।" },
  footer: { note: "सहायक ग्रामीण बैंक एक डेमो बैंक है। खाते और KYC जाँच नकली हैं; कार्ड की फ़ोटो सिर्फ़ फ़ॉर्म भरती है।" },
  help: {
    title: "मदद",
    sub: "सहायक कैसे इस्तेमाल करें, और बैंक के शब्दों का मतलब।",
    mic: { title: "सहायक से बात करना", steps: ["बड़ा नारंगी बटन दबाइए और बोलिए।", "बोलना बंद करते ही सुनना रुक जाता है। या फिर से दबाइए।", "सवाल समझ न आए तो 'इसका मतलब?' दबाइए।", "कभी भी 'स्टाफ़ को बुलाएँ' दबाइए। कोई आपके पास आएगा।"] },
    person: { title: "किसी व्यक्ति से बात करनी है?", body: "हर काउंटर पर स्टाफ़ सीधे मदद करता है। सहायक बस फ़ॉर्म जल्दी भरता है।" },
  },
};

const kn: PortalCopy = {
  nav: { services: "ಸೇವೆಗಳು", how: "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", help: "ಸಹಾಯ", track: "ಅರ್ಜಿ ನೋಡಿ", start: "ಮಾತು ಆರಂಭಿಸಿ", staff: "ಬ್ಯಾಂಕ್ ಸಿಬ್ಬಂದಿ", about: "ಪರಿಚಯ" },
  hero: {
    title: "ಬ್ಯಾಂಕ್ ಫಾರ್ಮ್, ಮಾತಿನಲ್ಲೇ.",
    sub: "ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಹೇಳಿ. ಸಹಾಯಕ ಒಂದೊಂದೇ ಸುಲಭ ಪ್ರಶ್ನೆ ಕೇಳಿ ನಿಮ್ಮ ಫಾರ್ಮ್ ತುಂಬುತ್ತದೆ.",
    cta: "ಮಾತು ಆರಂಭಿಸಿ",
    secondary: "ಏನೇನು ಮಾಡಬಹುದು",
  },
  demo: {
    label: "ಪ್ರಯತ್ನಿಸಿ",
    hear: "ಕೇಳಿ",
    replay: "ಮತ್ತೆ ಆಡಿಸಿ",
    lines: [
      { who: "bot", text: "ನಮಸ್ಕಾರ! ಇಂದು ಏನು ಮಾಡಬೇಕು?" },
      { who: "you", text: "ಹಣ ಜಮಾ ಮಾಡಬೇಕು." },
      { who: "bot", text: "ನಿಮ್ಮ ಖಾತೆ ಸಂಖ್ಯೆ ಹೇಳಿ." },
      { who: "you", text: "3021 4567 891" },
      { who: "bot", text: "7891 ರಲ್ಲಿ ಕೊನೆಯಾಗುವ ಖಾತೆ, ಲಕ್ಷ್ಮಮ್ಮ ಅವರ ಹೆಸರಿನಲ್ಲಿ. ಸರಿಯೇ?" },
      { who: "you", text: "ಹೌದು." },
      { who: "bot", text: "ಎಷ್ಟು ರೂಪಾಯಿ ಜಮಾ ಮಾಡಬೇಕು?" },
      { who: "you", text: "ಹನ್ನೆರಡು ಸಾವಿರದ ಐನೂರು." },
    ],
    fields: [
      { label: "ಖಾತೆ", value: "3021 4567 891", after: 3 },
      { label: "ಹೆಸರು", value: "ಲಕ್ಷ್ಮಮ್ಮ", after: 4 },
      { label: "ಮೊತ್ತ", value: "₹12,500", after: 7 },
      { label: "ಅಕ್ಷರಗಳಲ್ಲಿ", value: "ಹನ್ನೆರಡು ಸಾವಿರದ ಐನೂರು ರೂಪಾಯಿ", after: 7 },
    ],
    ready: "ಚೀಟಿ ಸಿದ್ಧ. ಟೋಕನ್ NRT-4RU",
  },
  services: {
    title: "ಇಲ್ಲಿ ಏನು ಮಾಡಬಹುದು",
    sub: "ಒಂದನ್ನು ಆರಿಸಿ, ಅಥವಾ ನಿಮ್ಮ ಮಾತಿನಲ್ಲೇ ಹೇಳಿ.",
    open: "ಏನಾಗುತ್ತದೆ",
    start: "ಇದನ್ನು ಆರಂಭಿಸಿ",
    ask: "ನಾವು ಕೇಳುವುದು",
    bring: "ಜೊತೆಗೆ ತನ್ನಿ",
    good: "ತಿಳಿದಿರಲಿ",
    minutes: "ಸುಮಾರು {n} ನಿಮಿಷ",
    items: {
      deposit: {
        name: "ಹಣ ಜಮಾ",
        short: "ನಿಮ್ಮ ಅಥವಾ ಕುಟುಂಬದವರ ಖಾತೆಗೆ ಹಣ ಹಾಕಿ.",
        time: "2",
        asks: ["ಖಾತೆ ಸಂಖ್ಯೆ, ಅಥವಾ ಪಾಸ್‌ಬುಕ್ ತೋರಿಸಿ", "ಎಷ್ಟು ಹಣ", "ಯಾವ ನೋಟು ಎಷ್ಟು", "ಪ್ಯಾನ್ ಕಾರ್ಡ್, ₹50,000 ಅಥವಾ ಹೆಚ್ಚಿಗೆ ಮಾತ್ರ", "ನಿಮ್ಮ ಹೆಸರು, ಖಾತೆ ಬೇರೆಯವರದಾಗಿದ್ದರೆ"],
        bring: ["ನಗದು ಹಣ", "ಪ್ಯಾನ್ ಕಾರ್ಡ್, ಮೊತ್ತ ₹50,000 ಅಥವಾ ಹೆಚ್ಚಿದ್ದರೆ"],
        facts: ["ನಾವು ನಿಮ್ಮ ಜೊತೆ ನೋಟು ಎಣಿಸುತ್ತೇವೆ, ತಪ್ಪು ಕೌಂಟರ್‌ಗೂ ಮೊದಲೇ ಸಿಗುತ್ತದೆ.", "ಪ್ಯಾನ್ ಇಲ್ಲದಿದ್ದರೆ ಕೌಂಟರ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ 60 ಸಹಿ ಮಾಡಬಹುದು."],
      },
      account_open: {
        name: "ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ",
        short: "ಉಳಿತಾಯ ಅಥವಾ ಜನ್ ಧನ್ ಖಾತೆ, ನಾಮಿನಿ ಜೊತೆ.",
        time: "6",
        asks: ["ಈಗಾಗಲೇ ಇಲ್ಲಿ ಖಾತೆ ಇದೆಯೇ?", "ಆಧಾರ್ ಕಾರ್ಡ್ ಕ್ಯಾಮೆರಾಗೆ ತೋರಿಸಿ", "ತಂದೆ ಅಥವಾ ಗಂಡನ ಹೆಸರು, ತಾಯಿಯ ಹೆಸರು", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ಕೆಲಸ, ಸುಮಾರು ಆದಾಯ", "ATM ಕಾರ್ಡ್, ಚೆಕ್ ಪುಸ್ತಕ ಅಥವಾ SMS", "ನಿಮ್ಮ ನಂತರ ಹಣ ಯಾರಿಗೆ (ನಾಮಿನಿ)"],
        bring: ["ಮೂಲ ಆಧಾರ್ ಕಾರ್ಡ್", "ಪ್ಯಾನ್ ಕಾರ್ಡ್, ಅಥವಾ ಫಾರ್ಮ್ 60", "ಒಂದು ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ"],
        facts: ["ಈಗಾಗಲೇ ಗ್ರಾಹಕರೇ? ನಿಮ್ಮ ವಿವರ ಮತ್ತೆ ಕೇಳುವುದಿಲ್ಲ.", "ಜನ್ ಧನ್ ಖಾತೆಗೆ ಕನಿಷ್ಠ ಬ್ಯಾಲೆನ್ಸ್ ಬೇಕಿಲ್ಲ."],
      },
      scheme_enroll: {
        name: "ವಿಮೆ ಮತ್ತು ಪಿಂಚಣಿ",
        short: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು: ಜೀವ ವಿಮೆ, ಅಪಘಾತ ವಿಮೆ, ಅಟಲ್ ಪಿಂಚಣಿ.",
        time: "3",
        asks: ["ಯಾವ ಯೋಜನೆ ಬೇಕು", "ವಯಸ್ಸನ್ನು ಬ್ಯಾಂಕ್ ದಾಖಲೆಯಿಂದ ನೋಡುತ್ತೇವೆ", "ಪಿಂಚಣಿಗೆ: ತಿಂಗಳಿಗೆ ಎಷ್ಟು ಬೇಕು", "ಹಣ ಯಾರಿಗೆ (ನಾಮಿನಿ)", "ವರ್ಷದ ಅಥವಾ ತಿಂಗಳ ಕಡಿತಕ್ಕೆ ಅನುಮತಿ"],
        bring: ["ಮೊದಲ ಕಂತಿಗೆ ಖಾತೆಯಲ್ಲಿ ಹಣ"],
        facts: ["PMJJBY ಕುಟುಂಬಕ್ಕೆ ₹2 ಲಕ್ಷ ಕೊಡುತ್ತದೆ. PMSBY ವರ್ಷಕ್ಕೆ ₹20ಕ್ಕೆ ಅಪಘಾತ ವಿಮೆ.", "ಅಟಲ್ ಪಿಂಚಣಿ 18 ರಿಂದ 40 ವರ್ಷದ, ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟದವರಿಗೆ."],
      },
      update_details: {
        name: "ವಿವರ ಬದಲಿಸಿ",
        short: "ಹೊಸ ಮೊಬೈಲ್, ಹೊಸ ವಿಳಾಸ, ನಾಮಿನಿ ಅಥವಾ ಮರು-KYC.",
        time: "3",
        asks: ["ಏನು ಬದಲಿಸಬೇಕು, ಒಂದು ಅಥವಾ ಹೆಚ್ಚು", "ಹೊಸ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ವಿಳಾಸ", "ಹೊಸ ನಾಮಿನಿ ವಿವರ, ಬದಲಿಸುತ್ತಿದ್ದರೆ"],
        bring: ["ನಿಮ್ಮ ಫೋನ್, OTPಗಾಗಿ", "ಆಧಾರ್ ಕಾರ್ಡ್, ಹೊಸ ವಿಳಾಸಕ್ಕೆ"],
        facts: ["ಮೊದಲು ನಿಮ್ಮ ಈಗಿನ ವಿವರ ತೋರಿಸುತ್ತೇವೆ, ನೀವು ಬದಲಾವಣೆ ಮಾತ್ರ ಹೇಳಿ."],
      },
      service_request: {
        name: "ಕಾರ್ಡ್, ಚೆಕ್, ದೂರು",
        short: "ಕಳೆದ ಕಾರ್ಡ್ ಬ್ಲಾಕ್, ಚೆಕ್ ಪುಸ್ತಕ, ಅಥವಾ ದೂರು ದಾಖಲಿಸಿ.",
        time: "2",
        asks: ["ಏನಾಯಿತು, ಅಥವಾ ಏನು ಬೇಕು", "ಕಳೆದ ಕಾರ್ಡ್‌ಗೆ: ಯಾವುದಾದರೂ ಹಣ ಹೋಯಿತೇ?", "ದೂರಿಗೆ: ದಿನಾಂಕ ಮತ್ತು ಮೊತ್ತ"],
        bring: ["ಕಾರ್ಡ್ ಬ್ಲಾಕ್‌ಗೆ ಏನೂ ಬೇಡ", "ಪಾಸ್‌ಬುಕ್ ಅಪ್‌ಡೇಟ್‌ಗೆ ಪಾಸ್‌ಬುಕ್"],
        facts: ["ಕಳೆದ ಕಾರ್ಡ್ ವಿನಂತಿಗಳು ಸಾಲಿನಲ್ಲಿ ಮೊದಲು.", "ಹಣ ಹೋಗಿದ್ದರೆ ಬೇಗ ತಿಳಿಸಿ, ಬ್ಯಾಂಕ್ ವಾಪಸ್ ಕೊಡಬಹುದು."],
      },
    },
  },
  how: {
    title: "ಆರಂಭದಿಂದ ಕೊನೆಯವರೆಗೆ",
    steps: [
      { title: "ಏನು ಬೇಕು ಹೇಳಿ", body: "ನಿಮ್ಮ ಭಾಷೆ ಒತ್ತಿ ಮಾತನಾಡಿ. ಬೇಕಾದರೆ ಚಿತ್ರ ಒತ್ತಿ." },
      { title: "ಕೇಳಿ, ಹೌದು ಎನ್ನಿ", body: "ಪ್ರತಿ ಹೆಸರು, ಸಂಖ್ಯೆ, ಮೊತ್ತವನ್ನು ಓದಿ ಹೇಳುತ್ತೇವೆ. ತಪ್ಪನ್ನು ಮಾತಿನಲ್ಲೇ ಸರಿಪಡಿಸಿ." },
      { title: "ಟೋಕನ್ ಕೌಂಟರ್‌ಗೆ ತನ್ನಿ", body: "ಕ್ಯಾಷಿಯರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ತುಂಬಿದ ಫಾರ್ಮ್ ನೋಡುತ್ತಾರೆ. ಚೀಟಿಯಲ್ಲಿರುವುದನ್ನು ತನ್ನಿ." },
    ],
  },
  words: {
    title: "ಬ್ಯಾಂಕ್ ಪದಗಳು, ಸರಳವಾಗಿ",
    sub: "ಅರ್ಥ ನೋಡಲು ಪದ ಒತ್ತಿ.",
    terms: [
      { term: "ನಾಮಿನಿ", plain: "ನಿಮ್ಮ ನಂತರ ಖಾತೆಯ ಹಣ ಪಡೆಯುವ ವ್ಯಕ್ತಿ.", example: "ಹೆಚ್ಚಿನವರು ಮಗ, ಮಗಳು ಅಥವಾ ಸಂಗಾತಿಯನ್ನು ಆರಿಸುತ್ತಾರೆ." },
      { term: "KYC", plain: "ಬ್ಯಾಂಕ್ ನಿಮ್ಮ ಗುರುತು ಪರಿಶೀಲಿಸುವುದು, ಸಾಮಾನ್ಯವಾಗಿ ಆಧಾರ್‌ನಿಂದ.", example: "ಒಮ್ಮೆ ಆಗುತ್ತದೆ, ಕೆಲವು ವರ್ಷಗಳಿಗೊಮ್ಮೆ ನವೀಕರಣ." },
      { term: "ಪ್ಯಾನ್ ಕಾರ್ಡ್", plain: "ತೆರಿಗೆ ಗುರುತಿನ ಕಾರ್ಡ್. ದೊಡ್ಡ ನಗದು ಜಮೆಗೆ ಬೇಕು.", example: "₹50,000 ಅಥವಾ ಹೆಚ್ಚು ಜಮೆಗೆ." },
      { term: "ಫಾರ್ಮ್ 60", plain: "ಪ್ಯಾನ್ ಇಲ್ಲದಿದ್ದಾಗ ಸಹಿ ಮಾಡುವ ಫಾರ್ಮ್.", example: "ಕೌಂಟರ್‌ನಲ್ಲಿ ಸಿಬ್ಬಂದಿ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ." },
      { term: "ಆಟೋ-ಡೆಬಿಟ್", plain: "ಬ್ಯಾಂಕ್ ತಾನಾಗಿಯೇ ನಿಗದಿತ ಹಣ ಖಾತೆಯಿಂದ ಕಡಿತ ಮಾಡುವುದು.", example: "ವಿಮೆ ಮತ್ತು ಪಿಂಚಣಿ ಕಂತಿಗೆ." },
      { term: "ಮರು-KYC", plain: "ನಿಮ್ಮ ಗುರುತಿನ ವಿವರವನ್ನು ಬ್ಯಾಂಕಿನಲ್ಲಿ ಮತ್ತೆ ನವೀಕರಿಸುವುದು.", example: "ಕೆಲವು ವರ್ಷಗಳಿಗೊಮ್ಮೆ ಕೇಳಬಹುದು." },
    ],
    more: "ಎಲ್ಲ ಪದಗಳು ಮತ್ತು ಸಹಾಯ",
  },
  promises: {
    title: "ನಿಮ್ಮ ಮಾಹಿತಿ ಸುರಕ್ಷಿತ",
    items: [
      { title: "ನಿಮ್ಮ 'ಹೌದು' ಇಲ್ಲದೆ ಏನೂ ಹೋಗುವುದಿಲ್ಲ", body: "ಎಲ್ಲವನ್ನೂ ಓದಿ ಹೇಳುತ್ತೇವೆ. ನೀವು 'ಹೌದು' ಎಂದಾಗ ಮಾತ್ರ ಕೌಂಟರ್‌ಗೆ." },
      { title: "ಆಧಾರ್ ಮರೆಯಾಗಿರುತ್ತದೆ", body: "ಕೊನೆಯ ನಾಲ್ಕು ಅಂಕಿಗಳು ಮಾತ್ರ ಕಾಣುತ್ತವೆ, ಉಳಿಯುತ್ತವೆ." },
      { title: "ನಿಮ್ಮ ಧ್ವನಿ ಉಳಿಸುವುದಿಲ್ಲ", body: "ಮಾತನ್ನು ಅಕ್ಷರಕ್ಕೆ ಬದಲಿಸಿ ರೆಕಾರ್ಡಿಂಗ್ ಅಳಿಸುತ್ತೇವೆ." },
      { title: "ಬ್ಯಾಲೆನ್ಸ್ ಜೋರಾಗಿ ಹೇಳುವುದಿಲ್ಲ", body: "ಪರದೆಯಲ್ಲಿ ಮಾತ್ರ, ಹತ್ತಿರದವರಿಗೆ ಕೇಳುವುದಿಲ್ಲ." },
    ],
  },
  faq: {
    title: "ಜನ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
    items: [
      { q: "ಓದು-ಬರಹ ಬರಬೇಕೇ?", a: "ಬೇಡ. ಎಲ್ಲವನ್ನೂ ಮಾತು ಮತ್ತು ಚಿತ್ರ ಒತ್ತುವ ಮೂಲಕ ಮಾಡಬಹುದು. ಬೇಕಾದರೆ ಸಿಬ್ಬಂದಿ ಟೈಪ್ ಮಾಡುತ್ತಾರೆ." },
      { q: "ಅರ್ಥವಾಗದಿದ್ದರೆ?", a: "ಮತ್ತೆ ಕೇಳುತ್ತದೆ, ಉದಾಹರಣೆ ಕೊಡುತ್ತದೆ, ಆದರೂ ಆಗದಿದ್ದರೆ ಸಿಬ್ಬಂದಿ ಬರುತ್ತಾರೆ." },
      { q: "ಉತ್ತರ ಬದಲಿಸಬಹುದೇ?", a: "ಹೌದು. ಏನು ತಪ್ಪು ಎಂದು ಹೇಳಿ, ಉದಾ 'ಮೊತ್ತ ತಪ್ಪು, 12000', ಅಥವಾ ಓದುವಾಗ ಆ ಸಾಲು ಒತ್ತಿ." },
      { q: "ಟೋಕನ್ ಸಿಕ್ಕ ಕೂಡಲೇ ಹಣ ಜಮಾ ಆಯಿತೇ?", a: "ಇನ್ನೂ ಇಲ್ಲ. ಟೋಕನ್ ತುಂಬಿದ ಫಾರ್ಮ್ ಅನ್ನು ಕೌಂಟರ್‌ಗೆ ಕಳುಹಿಸುತ್ತದೆ. ಕ್ಯಾಷಿಯರ್ ಮುಗಿಸುತ್ತಾರೆ." },
      { q: "ಒಮ್ಮೆಲೇ ಎರಡು ಕೆಲಸ ಮಾಡಬಹುದೇ?", a: "ಹೌದು. ಪ್ರತಿ ಚೀಟಿಯ ನಂತರ ಇನ್ನೇನಾದರೂ ಇದೆಯೇ ಎಂದು ಕೇಳುತ್ತದೆ, ಖಾತೆ ಸಂಖ್ಯೆ ಮತ್ತೆ ಕೇಳದೆ." },
    ],
  },
  track: { title: "ಅರ್ಜಿ ನೋಡಿ", sub: "ಚೀಟಿಯಲ್ಲಿರುವ 6 ಅಕ್ಷರದ ಟೋಕನ್ ಬರೆಯಿರಿ.", label: "ಟೋಕನ್", button: "ನೋಡಿ" },
  final: { title: "ನೀವು ಸಿದ್ಧರಾದಾಗ.", sub: "ಮೇಲೆ ನಿಮ್ಮ ಭಾಷೆ ಆರಿಸಿ, ನಂತರ ಆರಂಭಿಸಿ ಒತ್ತಿ." },
  footer: { note: "ಸಹಾಯಕ ಗ್ರಾಮೀಣ ಬ್ಯಾಂಕ್ ಡೆಮೊ ಬ್ಯಾಂಕ್. ಖಾತೆ ಮತ್ತು KYC ಪರಿಶೀಲನೆ ನಕಲಿ; ಕಾರ್ಡ್ ಫೋಟೋ ಫಾರ್ಮ್ ಮಾತ್ರ ತುಂಬುತ್ತದೆ." },
  help: {
    title: "ಸಹಾಯ",
    sub: "ಸಹಾಯಕವನ್ನು ಹೇಗೆ ಬಳಸುವುದು, ಬ್ಯಾಂಕ್ ಪದಗಳ ಅರ್ಥ.",
    mic: { title: "ಸಹಾಯಕದ ಜೊತೆ ಮಾತು", steps: ["ದೊಡ್ಡ ಕಿತ್ತಳೆ ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.", "ಮಾತು ನಿಲ್ಲಿಸಿದಾಗ ಕೇಳುವುದು ನಿಲ್ಲುತ್ತದೆ. ಅಥವಾ ಮತ್ತೆ ಒತ್ತಿ.", "ಪ್ರಶ್ನೆ ಅರ್ಥವಾಗದಿದ್ದರೆ 'ಇದರ ಅರ್ಥ?' ಒತ್ತಿ.", "ಯಾವಾಗ ಬೇಕಾದರೂ 'ಸಿಬ್ಬಂದಿಯನ್ನು ಕರೆಯಿರಿ' ಒತ್ತಿ. ಯಾರಾದರೂ ಬರುತ್ತಾರೆ."] },
    person: { title: "ವ್ಯಕ್ತಿಯ ಜೊತೆ ಮಾತನಾಡಬೇಕೇ?", body: "ಪ್ರತಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ಸಿಬ್ಬಂದಿ ನೇರವಾಗಿ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ. ಸಹಾಯಕ ಫಾರ್ಮ್ ಅನ್ನು ವೇಗವಾಗಿ ತುಂಬುತ್ತದೆ ಅಷ್ಟೇ." },
  },
};

export const PORTAL: Record<Lang, PortalCopy> = { en, hi, kn };
export const LANG_COOKIE = "sahayak_lang";
