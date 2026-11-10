/**
 * All spoken and on-screen text, per language. Hindi in Devanagari and Kannada in
 * Kannada script so TTS pronounces them natively. Placeholders: {name}.
 * NOTE: have a native speaker review before a live demo.
 */
import type { Lang } from "../types";

export type Msg = Record<Lang, string>;

export const CORE = {
  // ── session start ──────────────────────────────────────────────
  greet: {
    hi: "नमस्ते! मैं बैंक के काम में आपकी मदद करूँगी। बताइए, आज क्या करना है? जैसे: पैसे जमा करना, बीमा, या ATM कार्ड बंद करना।",
    kn: "ನಮಸ್ಕಾರ! ಬ್ಯಾಂಕ್ ಕೆಲಸದಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಇಂದು ಏನು ಮಾಡಬೇಕು ಹೇಳಿ. ಉದಾ: ಹಣ ಜಮಾ, ವಿಮೆ, ಅಥವಾ ATM ಕಾರ್ಡ್ ಬ್ಲಾಕ್.",
    en: "Namaste! I'll help with your bank work. Tell me what you need today — for example: deposit cash, insurance, or block an ATM card.",
  },
  "task.deposit": { hi: "पैसे जमा करना", kn: "ಹಣ ಜಮಾ ಮಾಡುವುದು", en: "Deposit cash" },
  "task.account_open": { hi: "नया खाता खोलना", kn: "ಹೊಸ ಖಾತೆ ತೆರೆಯುವುದು", en: "Open a new account" },
  "task.start.deposit": {
    hi: "ठीक है, पैसे जमा करते हैं।",
    kn: "ಸರಿ, ಹಣ ಜಮಾ ಮಾಡೋಣ.",
    en: "Okay, let's deposit cash.",
  },
  "task.start.account_open": {
    hi: "ठीक है, नया खाता खोलते हैं। इसमें लगभग 3 मिनट लगेंगे।",
    kn: "ಸರಿ, ಹೊಸ ಖಾತೆ ತೆರೆಯೋಣ. ಸುಮಾರು 3 ನಿಮಿಷ ಆಗುತ್ತದೆ.",
    en: "Okay, let's open a new account. It takes about 3 minutes.",
  },

  // ── questions ──────────────────────────────────────────────────
  "q.accountNumber": {
    hi: "अपना खाता नंबर बोलिए। या पासबुक का फ़ोटो दिखाइए।",
    kn: "ನಿಮ್ಮ ಖಾತೆ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ. ಅಥವಾ ಪಾಸ್‌ಬುಕ್ ಫೋಟೋ ತೋರಿಸಿ.",
    en: "Please say your account number, or show your passbook to the camera.",
  },
  "q.amount": {
    hi: "कितने रुपये जमा करने हैं?",
    kn: "ಎಷ್ಟು ರೂಪಾಯಿ ಜಮಾ ಮಾಡಬೇಕು?",
    en: "How much money do you want to deposit?",
  },
  "q.notes": {
    hi: "कौन-कौन से नोट हैं? जैसे: 500 के 20 नोट। या नीचे गिनती भरिए।",
    kn: "ಯಾವ ನೋಟುಗಳು ಎಷ್ಟು? ಉದಾಹರಣೆಗೆ: 500 ರ 20 ನೋಟು. ಅಥವಾ ಕೆಳಗೆ ಎಣಿಕೆ ತುಂಬಿ.",
    en: "Which notes are you giving? For example: 20 notes of 500. Or tap the counts below.",
  },
  "q.pan.deposit": {
    hi: "50,000 रुपये या ज़्यादा जमा करने पर पैन ज़रूरी है। पैन नंबर बोलिए, कार्ड का फ़ोटो दिखाइए, या बोलिए 'पैन नहीं है'।",
    kn: "50,000 ರೂಪಾಯಿ ಅಥವಾ ಹೆಚ್ಚು ಜಮಾ ಮಾಡಲು ಪ್ಯಾನ್ ಬೇಕು. ಪ್ಯಾನ್ ಸಂಖ್ಯೆ ಹೇಳಿ, ಕಾರ್ಡ್ ಫೋಟೋ ತೋರಿಸಿ, ಅಥವಾ 'ಪ್ಯಾನ್ ಇಲ್ಲ' ಎನ್ನಿ.",
    en: "For deposits of 50,000 rupees or more, PAN is needed. Say your PAN, show the card, or say 'no PAN'.",
  },
  "q.pan.account_open": {
    hi: "पैन नंबर बोलिए, या बोलिए 'पैन नहीं है'।",
    kn: "ಪ್ಯಾನ್ ಸಂಖ್ಯೆ ಹೇಳಿ, ಅಥವಾ 'ಪ್ಯಾನ್ ಇಲ್ಲ' ಎನ್ನಿ.",
    en: "Please say your PAN number, or say 'no PAN'.",
  },
  "q.selfDeposit": {
    hi: "क्या आप खुद {holder} हैं?",
    kn: "ನೀವೇ {holder} ಅವರೇ?",
    en: "Are you {holder} yourself?",
  },
  "q.depositorName": { hi: "आपका नाम क्या है?", kn: "ನಿಮ್ಮ ಹೆಸರು ಏನು?", en: "What is your name?" },
  "q.depositorPhone": {
    hi: "आपका मोबाइल नंबर बोलिए।",
    kn: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೇಳಿ.",
    en: "Please say your mobile number.",
  },
  "q.aadhaarPhoto": {
    hi: "अपने आधार कार्ड का सामने वाला हिस्सा कैमरे के सामने रखिए, और 'फ़ोटो लें' दबाइए।",
    kn: "ನಿಮ್ಮ ಆಧಾರ್ ಕಾರ್ಡ್‌ನ ಮುಂಭಾಗವನ್ನು ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಹಿಡಿದು 'ಫೋಟೋ ತೆಗೆಯಿರಿ' ಒತ್ತಿ.",
    en: "Hold the front of your Aadhaar card to the camera and tap 'Take photo'.",
  },
  "q.name": { hi: "अपना पूरा नाम बोलिए।", kn: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಹೇಳಿ.", en: "Please say your full name." },
  "q.dob": {
    hi: "अपनी जन्म तिथि बोलिए, जैसे 15 अगस्त 1960।",
    kn: "ನಿಮ್ಮ ಹುಟ್ಟಿದ ದಿನಾಂಕ ಹೇಳಿ, ಉದಾಹರಣೆಗೆ 15 ಆಗಸ್ಟ್ 1960.",
    en: "Please say your date of birth, like 15 August 1960.",
  },
  "q.gender": {
    hi: "आपका लिंग: पुरुष, महिला, या अन्य?",
    kn: "ನಿಮ್ಮ ಲಿಂಗ: ಪುರುಷ, ಮಹಿಳೆ, ಅಥವಾ ಇತರೆ?",
    en: "Your gender: male, female, or other?",
  },
  "q.address": { hi: "अपना पूरा पता बोलिए, पिन कोड के साथ।", kn: "ಪಿನ್ ಕೋಡ್ ಸಹಿತ ನಿಮ್ಮ ಪೂರ್ಣ ವಿಳಾಸ ಹೇಳಿ.", en: "Please say your full address, with PIN code." },
  "q.panPhoto": {
    hi: "क्या आपके पास पैन कार्ड है? उसे कैमरे के सामने रखिए, या बोलिए 'पैन नहीं है'।",
    kn: "ನಿಮ್ಮ ಬಳಿ ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಇದೆಯೇ? ಅದನ್ನು ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಹಿಡಿಯಿರಿ, ಅಥವಾ 'ಪ್ಯಾನ್ ಇಲ್ಲ' ಎನ್ನಿ.",
    en: "Do you have a PAN card? Hold it to the camera, or say 'no PAN'.",
  },
  "q.mobile": { hi: "आपका मोबाइल नंबर बोलिए।", kn: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೇಳಿ.", en: "Please say your mobile number." },
  "q.occupation": { hi: "आप क्या काम करते हैं?", kn: "ನೀವು ಏನು ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?", en: "What work do you do?" },
  "q.income": {
    hi: "आपकी साल भर की कमाई लगभग कितनी है?",
    kn: "ನಿಮ್ಮ ವರ್ಷದ ಆದಾಯ ಸುಮಾರು ಎಷ್ಟು?",
    en: "Roughly how much do you earn in a year?",
  },
  "q.marital": { hi: "क्या आपकी शादी हुई है?", kn: "ನಿಮಗೆ ಮದುವೆ ಆಗಿದೆಯೇ?", en: "Are you married?" },
  "q.nomineeName": {
    hi: "आपके बाद यह पैसा किसे मिले? उनका नाम बोलिए। इन्हें नॉमिनी कहते हैं।",
    kn: "ನಿಮ್ಮ ನಂತರ ಈ ಹಣ ಯಾರಿಗೆ ಸಿಗಬೇಕು? ಅವರ ಹೆಸರು ಹೇಳಿ. ಇವರನ್ನು ನಾಮಿನಿ ಎನ್ನುತ್ತಾರೆ.",
    en: "Who should receive this money after you? Please say their name. This person is your nominee.",
  },
  "q.nomineeRelation": {
    hi: "{nominee} आपके क्या लगते हैं?",
    kn: "{nominee} ನಿಮಗೆ ಏನಾಗಬೇಕು?",
    en: "How is {nominee} related to you?",
  },
  "q.nomineeDob": {
    hi: "{nominee} की जन्म तिथि बोलिए। पता न हो तो 'छोड़ो' बोलिए।",
    kn: "{nominee} ಅವರ ಹುಟ್ಟಿದ ದಿನಾಂಕ ಹೇಳಿ. ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ 'ಬಿಡಿ' ಎನ್ನಿ.",
    en: "What is {nominee}'s date of birth? If you don't know, say 'skip'.",
  },
  "q.guardianName": {
    hi: "{nominee} नाबालिग हैं। उनके अभिभावक का नाम बोलिए।",
    kn: "{nominee} ಅಪ್ರಾಪ್ತರು. ಅವರ ಪೋಷಕರ ಹೆಸರು ಹೇಳಿ.",
    en: "{nominee} is a minor. Please say the name of their guardian.",
  },
  "q.accountType": {
    hi: "कौन सा खाता चाहिए: बचत खाता, या जन धन खाता?",
    kn: "ಯಾವ ಖಾತೆ ಬೇಕು: ಉಳಿತಾಯ ಖಾತೆ, ಅಥವಾ ಜನ್ ಧನ್ ಖಾತೆ?",
    en: "Which account do you want: a savings account, or a Jan Dhan account?",
  },

  // ── confirmations ──────────────────────────────────────────────
  "c.accountNumber": {
    hi: "खाता जिसके आखिरी अंक {last4} हैं, {holder} के नाम पर। क्या यह सही है?",
    kn: "ಕೊನೆಯ ಅಂಕಿಗಳು {last4} ಇರುವ ಖಾತೆ, {holder} ಅವರ ಹೆಸರಿನಲ್ಲಿ. ಇದು ಸರಿಯೇ?",
    en: "Account ending {last4}, in the name of {holder}. Is that right?",
  },
  "c.amount": {
    hi: "{amount} रुपये। क्या यह सही है?",
    kn: "{amount} ರೂಪಾಯಿ. ಇದು ಸರಿಯೇ?",
    en: "{amount} rupees — {words}. Is that right?",
  },
  "c.generic": { hi: "{value} — क्या यह सही है?", kn: "{value} — ಇದು ಸರಿಯೇ?", en: "{value} — is that right?" },
  "c.pan": {
    hi: "पैन {value}। क्या यह सही है?",
    kn: "ಪ್ಯಾನ್ {value}. ಇದು ಸರಿಯೇ?",
    en: "PAN {value}. Is that right?",
  },

  // ── feedback ───────────────────────────────────────────────────
  notHeard: {
    hi: "माफ़ कीजिए, मैं समझ नहीं पाई। कृपया फिर से बोलिए।",
    kn: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
    en: "Sorry, I didn't catch that. Please say it again.",
  },
  escape: {
    hi: "कोई बात नहीं। आप स्क्रीन पर बटन दबा सकते हैं, या स्टाफ़ की मदद ले सकते हैं।",
    kn: "ಪರವಾಗಿಲ್ಲ. ಪರದೆಯ ಮೇಲಿನ ಬಟನ್ ಒತ್ತಬಹುದು, ಅಥವಾ ಸಿಬ್ಬಂದಿಯ ಸಹಾಯ ಪಡೆಯಬಹುದು.",
    en: "No problem. You can tap the buttons on the screen, or ask a staff member for help.",
  },
  "e.accountLength": {
    hi: "खाता नंबर {n} अंकों का होता है। मैंने {got} अंक सुने। कृपया फिर से बोलिए।",
    kn: "ಖಾತೆ ಸಂಖ್ಯೆಯಲ್ಲಿ {n} ಅಂಕಿಗಳು ಇರುತ್ತವೆ. ನಾನು {got} ಅಂಕಿಗಳನ್ನು ಕೇಳಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
    en: "Account numbers have {n} digits. I heard {got}. Please say it again.",
  },
  "e.accountNotFound": {
    hi: "इस नंबर का कोई खाता नहीं मिला। कृपया नंबर फिर से बोलिए।",
    kn: "ಈ ಸಂಖ್ಯೆಯ ಖಾತೆ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
    en: "I couldn't find an account with that number. Please say it again.",
  },
  "e.amountInvalid": {
    hi: "रकम समझ नहीं आई। कितने रुपये, बोलिए।",
    kn: "ಮೊತ್ತ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಎಷ್ಟು ರೂಪಾಯಿ ಎಂದು ಹೇಳಿ.",
    en: "I didn't get the amount. How many rupees?",
  },
  "e.amountTooHigh": {
    hi: "इतनी बड़ी रकम के लिए कृपया स्टाफ़ से मिलिए।",
    kn: "ಇಷ್ಟು ದೊಡ್ಡ ಮೊತ್ತಕ್ಕೆ ದಯವಿಟ್ಟು ಸಿಬ್ಬಂದಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ.",
    en: "For an amount this large, please see a staff member.",
  },
  "e.notesMismatch": {
    hi: "नोट मिलाकर {total} रुपये होते हैं, पर रकम {amount} रुपये है। {diff} रुपये {dir}। कृपया नोट फिर से बताइए, या नीचे गिनती ठीक कीजिए।",
    kn: "ನೋಟುಗಳ ಒಟ್ಟು {total} ರೂಪಾಯಿ, ಆದರೆ ಮೊತ್ತ {amount} ರೂಪಾಯಿ. {diff} ರೂಪಾಯಿ {dir}. ದಯವಿಟ್ಟು ನೋಟುಗಳನ್ನು ಮತ್ತೆ ಹೇಳಿ, ಅಥವಾ ಕೆಳಗೆ ಎಣಿಕೆ ಸರಿಪಡಿಸಿ.",
    en: "The notes add up to {total} rupees, but the amount is {amount} rupees. That is {diff} rupees {dir}. Please tell me the notes again, or fix the counts below.",
  },
  "dir.short": { hi: "कम हैं", kn: "ಕಡಿಮೆ ಇದೆ", en: "short" },
  "dir.extra": { hi: "ज़्यादा हैं", kn: "ಹೆಚ್ಚು ಇದೆ", en: "extra" },
  notesOk: {
    hi: "नोट सही हैं, कुल {amount} रुपये।",
    kn: "ನೋಟುಗಳು ಸರಿ ಇವೆ, ಒಟ್ಟು {amount} ರೂಪಾಯಿ.",
    en: "The notes match: {amount} rupees.",
  },
  "e.notesUnclear": {
    hi: "नोट समझ नहीं आए। ऐसे बोलिए: 500 के 20 नोट। या नीचे गिनती भरिए।",
    kn: "ನೋಟುಗಳು ಅರ್ಥವಾಗಲಿಲ್ಲ. ಹೀಗೆ ಹೇಳಿ: 500 ರ 20 ನೋಟು. ಅಥವಾ ಕೆಳಗೆ ಎಣಿಕೆ ತುಂಬಿ.",
    en: "I didn't get the notes. Say it like: 20 notes of 500. Or tap the counts below.",
  },
  "e.panInvalid": {
    hi: "पैन में 10 अक्षर होते हैं, जैसे ABCDE1234F। कार्ड का फ़ोटो दिखाना आसान रहेगा।",
    kn: "ಪ್ಯಾನ್‌ನಲ್ಲಿ 10 ಅಕ್ಷರಗಳು ಇರುತ್ತವೆ, ಉದಾ: ABCDE1234F. ಕಾರ್ಡ್ ಫೋಟೋ ತೋರಿಸುವುದು ಸುಲಭ.",
    en: "A PAN has 10 characters, like ABCDE1234F. Showing the card to the camera is easier.",
  },
  "e.phoneInvalid": {
    hi: "मोबाइल नंबर 10 अंकों का होना चाहिए। कृपया फिर से बोलिए।",
    kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ 10 ಅಂಕಿಗಳದ್ದಾಗಿರಬೇಕು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
    en: "A mobile number has 10 digits. Please say it again.",
  },
  "e.dateInvalid": {
    hi: "तारीख समझ नहीं आई। ऐसे बोलिए: 15 अगस्त 1990।",
    kn: "ದಿನಾಂಕ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಹೀಗೆ ಹೇಳಿ: 15 ಆಗಸ್ಟ್ 1990.",
    en: "I didn't get the date. Say it like: 15 August 1990.",
  },
  "e.choiceUnclear": {
    hi: "कृपया इनमें से एक चुनिए: {options}।",
    kn: "ದಯವಿಟ್ಟು ಇವುಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ: {options}.",
    en: "Please choose one of: {options}.",
  },
  "e.nameInvalid": {
    hi: "नाम समझ नहीं आया। कृपया फिर से बोलिए।",
    kn: "ಹೆಸರು ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
    en: "I didn't get the name. Please say it again.",
  },
  "e.addressInvalid": {
    hi: "पूरा पता बोलिए: घर नंबर, गाँव या मोहल्ला, और पिन कोड।",
    kn: "ಪೂರ್ಣ ವಿಳಾಸ ಹೇಳಿ: ಮನೆ ಸಂಖ್ಯೆ, ಊರು, ಮತ್ತು ಪಿನ್ ಕೋಡ್.",
    en: "Please say the full address: house number, village or area, and PIN code.",
  },
  "e.photoFailed": {
    hi: "कार्ड साफ़ नहीं पढ़ पाई। रोशनी में फिर से फ़ोटो लीजिए, या 'बोलकर बताएँ' दबाइए।",
    kn: "ಕಾರ್ಡ್ ಸ್ಪಷ್ಟವಾಗಿ ಓದಲಾಗಲಿಲ್ಲ. ಬೆಳಕಿನಲ್ಲಿ ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ, ಅಥವಾ 'ಮಾತಿನಲ್ಲಿ ಹೇಳಿ' ಒತ್ತಿ.",
    en: "I couldn't read the card clearly. Try again in good light, or tap 'Tell by voice'.",
  },
  staffCalled: {
    hi: "मैंने स्टाफ़ को बुलाया है। वे यहाँ जवाब टाइप कर सकते हैं।",
    kn: "ನಾನು ಸಿಬ್ಬಂದಿಯನ್ನು ಕರೆದಿದ್ದೇನೆ. ಅವರು ಇಲ್ಲಿ ಉತ್ತರ ಟೈಪ್ ಮಾಡಬಹುದು.",
    en: "I've called a staff member. They can type the answer here.",
  },
  skipped: { hi: "ठीक है, इसे छोड़ते हैं।", kn: "ಸರಿ, ಇದನ್ನು ಬಿಡೋಣ.", en: "Okay, let's skip that." },
  cannotSkip: {
    hi: "यह ज़रूरी है, इसे छोड़ नहीं सकते। स्टाफ़ की मदद ले सकते हैं।",
    kn: "ಇದು ಅಗತ್ಯ, ಬಿಡಲು ಆಗುವುದಿಲ್ಲ. ಸಿಬ್ಬಂದಿಯ ಸಹಾಯ ಪಡೆಯಬಹುದು.",
    en: "This one is required, so it can't be skipped. A staff member can help.",
  },
  okAgain: { hi: "ठीक है, फिर से बताइए।", kn: "ಸರಿ, ಮತ್ತೆ ಹೇಳಿ.", en: "Okay, please tell me again." },
  form60: {
    hi: "ठीक है। पैन के बिना फ़ॉर्म 60 लगेगा, स्टाफ़ उसमें मदद करेगा।",
    kn: "ಸರಿ. ಪ್ಯಾನ್ ಇಲ್ಲದಿದ್ದರೆ ಫಾರ್ಮ್ 60 ಬೇಕು, ಸಿಬ್ಬಂದಿ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.",
    en: "Okay. Without PAN, Form 60 is needed — staff will help you with it.",
  },
  "review.intro.all": {
    hi: "अब मैं सब कुछ एक बार पढ़कर सुनाती हूँ।",
    kn: "ಈಗ ಎಲ್ಲವನ್ನೂ ಒಮ್ಮೆ ಓದಿ ಹೇಳುತ್ತೇನೆ.",
    en: "Let me read everything back to you.",
  },
  "review.intro.identity": {
    hi: "आपके कार्ड से मैंने यह पढ़ा:",
    kn: "ನಿಮ್ಮ ಕಾರ್ಡ್‌ನಿಂದ ನಾನು ಓದಿದ್ದು:",
    en: "From your card I read:",
  },
  "review.ask": {
    hi: "क्या सब सही है? 'हाँ' बोलिए, या बताइए क्या बदलना है।",
    kn: "ಎಲ್ಲವೂ ಸರಿಯೇ? 'ಹೌದು' ಎನ್ನಿ, ಅಥವಾ ಏನು ಬದಲಿಸಬೇಕು ಎಂದು ಹೇಳಿ.",
    en: "Is everything correct? Say 'yes', or tell me what to change.",
  },
  whatToChange: {
    hi: "क्या बदलना है? जैसे बोलिए: 'रकम गलत है, 12000'। या स्क्रीन पर उस लाइन को दबाइए।",
    kn: "ಏನು ಬದಲಿಸಬೇಕು? ಹೀಗೆ ಹೇಳಿ: 'ಮೊತ್ತ ತಪ್ಪು, 12000'. ಅಥವಾ ಪರದೆಯಲ್ಲಿ ಆ ಸಾಲನ್ನು ಒತ್ತಿ.",
    en: "What should I change? Say something like 'amount is wrong, 12000', or tap that line on the screen.",
  },
  updated: { hi: "बदल दिया।", kn: "ಬದಲಾಯಿಸಿದೆ.", en: "Updated." },
  "done.deposit": {
    hi: "आपकी जमा पर्ची तैयार है। इसे कैशियर को दिखाइए। आपका टोकन है {code}।",
    kn: "ನಿಮ್ಮ ಜಮಾ ಚೀಟಿ ಸಿದ್ಧವಾಗಿದೆ. ಇದನ್ನು ಕ್ಯಾಷಿಯರ್‌ಗೆ ತೋರಿಸಿ. ನಿಮ್ಮ ಟೋಕನ್ {code}.",
    en: "Your deposit slip is ready. Show it to the cashier. Your token is {code}.",
  },
  "done.account_open": {
    hi: "आपका खाता खोलने का फ़ॉर्म तैयार है। बैंक आपकी KYC जाँच करेगा। आपका टोकन है {code}।",
    kn: "ನಿಮ್ಮ ಖಾತೆ ತೆರೆಯುವ ಫಾರ್ಮ್ ಸಿದ್ಧವಾಗಿದೆ. ಬ್ಯಾಂಕ್ ನಿಮ್ಮ KYC ಪರಿಶೀಲಿಸುತ್ತದೆ. ನಿಮ್ಮ ಟೋಕನ್ {code}.",
    en: "Your account opening form is ready. The bank will do your KYC check. Your token is {code}.",
  },

  // ── help answers (for "why do you need this?") ─────────────────
  "help.accountNumber": {
    hi: "खाता नंबर से पैसा सही खाते में जाता है। यह पासबुक के पहले पन्ने पर लिखा होता है।",
    kn: "ಖಾತೆ ಸಂಖ್ಯೆಯಿಂದ ಹಣ ಸರಿಯಾದ ಖಾತೆಗೆ ಹೋಗುತ್ತದೆ. ಇದು ಪಾಸ್‌ಬುಕ್‌ನ ಮೊದಲ ಪುಟದಲ್ಲಿ ಇರುತ್ತದೆ.",
    en: "The account number makes sure the money goes to the right account. It's on the first page of your passbook.",
  },
  "help.notes": {
    hi: "कैशियर को नोट गिनने में आसानी हो, इसलिए हर नोट की गिनती चाहिए।",
    kn: "ಕ್ಯಾಷಿಯರ್ ಸುಲಭವಾಗಿ ಎಣಿಸಲು ಪ್ರತಿ ನೋಟಿನ ಎಣಿಕೆ ಬೇಕು.",
    en: "The cashier needs the count of each note to check the cash quickly.",
  },
  "help.pan": {
    hi: "सरकार के नियम से 50,000 रुपये या ज़्यादा नकद जमा पर पैन चाहिए।",
    kn: "ಸರ್ಕಾರದ ನಿಯಮದ ಪ್ರಕಾರ 50,000 ರೂಪಾಯಿ ಅಥವಾ ಹೆಚ್ಚಿನ ನಗದು ಜಮೆಗೆ ಪ್ಯಾನ್ ಬೇಕು.",
    en: "Government rules need a PAN for cash deposits of 50,000 rupees or more.",
  },
  "help.nomineeName": {
    hi: "नॉमिनी वह व्यक्ति है जिसे आपके बाद इस खाते का पैसा मिलेगा।",
    kn: "ನಿಮ್ಮ ನಂತರ ಈ ಖಾತೆಯ ಹಣ ಯಾರಿಗೆ ಸಿಗುತ್ತದೋ ಅವರೇ ನಾಮಿನಿ.",
    en: "The nominee is the person who receives the money in this account after you.",
  },
  "help.aadhaarPhoto": {
    hi: "कार्ड से नाम और पता अपने आप भर जाएगा। असली KYC जाँच बैंक करेगा।",
    kn: "ಕಾರ್ಡ್‌ನಿಂದ ಹೆಸರು ಮತ್ತು ವಿಳಾಸ ತಾನಾಗಿಯೇ ತುಂಬುತ್ತದೆ. ನಿಜವಾದ KYC ಪರಿಶೀಲನೆ ಬ್ಯಾಂಕ್ ಮಾಡುತ್ತದೆ.",
    en: "The card fills in your name and address automatically. The real KYC check is done by the bank.",
  },
  "help.default": {
    hi: "यह जानकारी बैंक फ़ॉर्म के लिए ज़रूरी है।",
    kn: "ಈ ಮಾಹಿತಿ ಬ್ಯಾಂಕ್ ಫಾರ್ಮ್‌ಗೆ ಅಗತ್ಯ.",
    en: "The bank form needs this information.",
  },

  // ── field labels ───────────────────────────────────────────────
  "l.accountNumber": { hi: "खाता नंबर", kn: "ಖಾತೆ ಸಂಖ್ಯೆ", en: "Account number" },
  "l.accountHolder": { hi: "खाताधारक", kn: "ಖಾತೆದಾರರು", en: "Account holder" },
  "l.amount": { hi: "रकम", kn: "ಮೊತ್ತ", en: "Amount" },
  "l.notes": { hi: "नोट", kn: "ನೋಟುಗಳು", en: "Notes" },
  "l.pan": { hi: "पैन", kn: "ಪ್ಯಾನ್", en: "PAN" },
  "l.selfDeposit": { hi: "जमाकर्ता", kn: "ಜಮಾ ಮಾಡುವವರು", en: "Depositor" },
  "l.depositorName": { hi: "जमाकर्ता का नाम", kn: "ಜಮಾ ಮಾಡುವವರ ಹೆಸರು", en: "Depositor name" },
  "l.depositorPhone": { hi: "मोबाइल", kn: "ಮೊಬೈಲ್", en: "Mobile" },
  "l.aadhaarPhoto": { hi: "आधार", kn: "ಆಧಾರ್", en: "Aadhaar" },
  "l.name": { hi: "नाम", kn: "ಹೆಸರು", en: "Name" },
  "l.dob": { hi: "जन्म तिथि", kn: "ಹುಟ್ಟಿದ ದಿನಾಂಕ", en: "Date of birth" },
  "l.gender": { hi: "लिंग", kn: "ಲಿಂಗ", en: "Gender" },
  "l.address": { hi: "पता", kn: "ವಿಳಾಸ", en: "Address" },
  "l.panPhoto": { hi: "पैन कार्ड", kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್", en: "PAN card" },
  "l.mobile": { hi: "मोबाइल", kn: "ಮೊಬೈಲ್", en: "Mobile" },
  "l.occupation": { hi: "काम", kn: "ಉದ್ಯೋಗ", en: "Occupation" },
  "l.income": { hi: "सालाना आय", kn: "ವಾರ್ಷಿಕ ಆದಾಯ", en: "Annual income" },
  "l.marital": { hi: "वैवाहिक स्थिति", kn: "ವೈವಾಹಿಕ ಸ್ಥಿತಿ", en: "Marital status" },
  "l.nomineeName": { hi: "नॉमिनी", kn: "ನಾಮಿನಿ", en: "Nominee" },
  "l.nomineeRelation": { hi: "नॉमिनी से रिश्ता", kn: "ನಾಮಿನಿ ಸಂಬಂಧ", en: "Nominee relation" },
  "l.nomineeDob": { hi: "नॉमिनी जन्म तिथि", kn: "ನಾಮಿನಿ ಹುಟ್ಟಿದ ದಿನಾಂಕ", en: "Nominee date of birth" },
  "l.guardianName": { hi: "अभिभावक", kn: "ಪೋಷಕರು", en: "Guardian" },
  "l.accountType": { hi: "खाते का प्रकार", kn: "ಖಾತೆ ಪ್ರಕಾರ", en: "Account type" },
  "say.note": { hi: "{d} के {c} नोट", kn: "{d} ರ {c} ನೋಟು", en: "{c} notes of {d}" },
  "say.coins": { hi: "{c} रुपये के सिक्के", kn: "{c} ರೂಪಾಯಿ ನಾಣ್ಯ", en: "{c} rupees in coins" },
  "say.rupees": { hi: "{n} रुपये", kn: "{n} ರೂಪಾಯಿ", en: "{n} rupees" },
  "v.form60": { hi: "पैन नहीं — फ़ॉर्म 60", kn: "ಪ್ಯಾನ್ ಇಲ್ಲ — ಫಾರ್ಮ್ 60", en: "No PAN — Form 60" },
  "v.self": { hi: "खुद खाताधारक", kn: "ಸ್ವತಃ ಖಾತೆದಾರರು", en: "Account holder (self)" },
  "v.other": { hi: "कोई और", kn: "ಬೇರೆಯವರು", en: "Someone else" },
  "v.skipped": { hi: "छोड़ा गया", kn: "ಬಿಡಲಾಗಿದೆ", en: "Skipped" },
  "sec.account": { hi: "खाता", kn: "ಖಾತೆ", en: "Account" },
  "sec.cash": { hi: "नकद", kn: "ನಗದು", en: "Cash" },
  "sec.depositor": { hi: "जमाकर्ता", kn: "ಜಮಾ ಮಾಡುವವರು", en: "Depositor" },
  "sec.identity": { hi: "पहचान", kn: "ಗುರುತು", en: "Identity" },
  "sec.contact": { hi: "संपर्क और काम", kn: "ಸಂಪರ್ಕ ಮತ್ತು ಕೆಲಸ", en: "Contact & work" },
  "sec.nominee": { hi: "नॉमिनी", kn: "ನಾಮಿನಿ", en: "Nominee" },

  // ── UI chrome ──────────────────────────────────────────────────
  "ui.yes": { hi: "हाँ, सही है", kn: "ಹೌದು, ಸರಿ", en: "Yes, correct" },
  "ui.no": { hi: "नहीं, बदलें", kn: "ಇಲ್ಲ, ಬದಲಿಸಿ", en: "No, change it" },
  "ui.tapToSpeak": { hi: "दबाकर बोलिए", kn: "ಒತ್ತಿ ಮಾತನಾಡಿ", en: "Tap and speak" },
  "ui.tapToStop": { hi: "बोलकर रुकें, या दबाएँ", kn: "ಮಾತು ಮುಗಿಸಿ, ಅಥವಾ ಒತ್ತಿ", en: "Stop talking, or tap" },
  "ui.listening": { hi: "सुन रही हूँ…", kn: "ಕೇಳುತ್ತಿದ್ದೇನೆ…", en: "Listening…" },
  "ui.thinking": { hi: "समझ रही हूँ…", kn: "ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ…", en: "Understanding…" },
  "ui.speaking": { hi: "बोल रही हूँ…", kn: "ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ…", en: "Speaking…" },
  "ui.repeat": { hi: "फिर से सुनें", kn: "ಮತ್ತೆ ಕೇಳಿ", en: "Hear again" },
  "ui.staff": { hi: "स्टाफ़ की मदद", kn: "ಸಿಬ್ಬಂದಿ ಸಹಾಯ", en: "Ask staff" },
  "ui.skip": { hi: "छोड़ें", kn: "ಬಿಡಿ", en: "Skip" },
  "ui.takePhoto": { hi: "फ़ोटो लें", kn: "ಫೋಟೋ ತೆಗೆಯಿರಿ", en: "Take photo" },
  "ui.passbook": { hi: "पासबुक से पढ़ें", kn: "ಪಾಸ್‌ಬುಕ್‌ನಿಂದ ಓದಿ", en: "Read from passbook" },
  "ui.panCard": { hi: "पैन कार्ड का फ़ोटो", kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಫೋಟೋ", en: "Photo of PAN card" },
  "ui.noPan": { hi: "पैन नहीं है", kn: "ಪ್ಯಾನ್ ಇಲ್ಲ", en: "No PAN" },
  "ui.byVoice": { hi: "बोलकर बताएँ", kn: "ಮಾತಿನಲ್ಲಿ ಹೇಳಿ", en: "Tell by voice" },
  "ui.filled": { hi: "भरी गई जानकारी", kn: "ತುಂಬಿದ ಮಾಹಿತಿ", en: "Filled so far" },
  "ui.youSaid": { hi: "आपने कहा", kn: "ನೀವು ಹೇಳಿದ್ದು", en: "You said" },
  "ui.total": { hi: "कुल", kn: "ಒಟ್ಟು", en: "Total" },
  "ui.target": { hi: "रकम", kn: "ಮೊತ್ತ", en: "Amount" },
  "ui.short": { hi: "{x} कम", kn: "{x} ಕಡಿಮೆ", en: "{x} short" },
  "ui.extra": { hi: "{x} ज़्यादा", kn: "{x} ಹೆಚ್ಚು", en: "{x} extra" },
  "ui.match": { hi: "रकम से मेल खाता है", kn: "ಮೊತ್ತಕ್ಕೆ ಸರಿಹೊಂದಿದೆ", en: "Matches the amount" },
  "ui.notesDone": { hi: "गिनती पूरी", kn: "ಎಣಿಕೆ ಮುಗಿಯಿತು", en: "Counts done" },
  "ui.coins": { hi: "सिक्के (₹)", kn: "ನಾಣ್ಯಗಳು (₹)", en: "Coins (₹)" },
  "ui.confirmAll": { hi: "हाँ, सब सही है", kn: "ಹೌದು, ಎಲ್ಲಾ ಸರಿ", en: "Yes, everything is correct" },
  "ui.reviewTitle": { hi: "एक बार जाँच लीजिए", kn: "ಒಮ್ಮೆ ಪರಿಶೀಲಿಸಿ", en: "Please check" },
  "ui.tapToFix": { hi: "बदलने के लिए दबाइए", kn: "ಬದಲಿಸಲು ಒತ್ತಿ", en: "Tap a line to change it" },
  "ui.step": { hi: "{a} / {b}", kn: "{a} / {b}", en: "{a} of {b}" },
  "ui.staffInput": { hi: "स्टाफ़: जवाब टाइप करें", kn: "ಸಿಬ್ಬಂದಿ: ಉತ್ತರ ಟೈಪ್ ಮಾಡಿ", en: "Staff: type the answer" },
  "ui.send": { hi: "भेजें", kn: "ಕಳುಹಿಸಿ", en: "Send" },
  "ui.micBlocked": {
    hi: "माइक नहीं मिला। बटन दबाकर जवाब दीजिए, या स्टाफ़ से टाइप करवाइए।",
    kn: "ಮೈಕ್ ಸಿಗಲಿಲ್ಲ. ಬಟನ್ ಒತ್ತಿ, ಅಥವಾ ಸಿಬ್ಬಂದಿಯಿಂದ ಟೈಪ್ ಮಾಡಿಸಿ.",
    en: "Microphone not available. Tap the buttons, or ask staff to type.",
  },
  "ui.kycNote": {
    hi: "कार्ड से सिर्फ़ फ़ॉर्म भरा जाता है। KYC जाँच बैंक करेगा।",
    kn: "ಕಾರ್ಡ್‌ನಿಂದ ಫಾರ್ಮ್ ಮಾತ್ರ ತುಂಬಲಾಗುತ್ತದೆ. KYC ಪರಿಶೀಲನೆ ಬ್ಯಾಂಕ್ ಮಾಡುತ್ತದೆ.",
    en: "The card only fills the form. KYC verification is done by the bank.",
  },
  "ui.frameHint": {
    hi: "कार्ड को फ़्रेम के अंदर रखें",
    kn: "ಕಾರ್ಡ್ ಅನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ಇಡಿ",
    en: "Fit the card inside the frame",
  },
  "ui.viewSlip": { hi: "पर्ची देखें", kn: "ಚೀಟಿ ನೋಡಿ", en: "View slip" },
  "ui.cancel": { hi: "रद्द करें", kn: "ರದ್ದುಮಾಡಿ", en: "Cancel" },
  "ui.reading": { hi: "कार्ड पढ़ रही हूँ…", kn: "ಕಾರ್ಡ್ ಓದುತ್ತಿದ್ದೇನೆ…", en: "Reading the card…" },
  "ui.privacy": {
    hi: "सबके सामने नंबर बोलना ठीक न लगे तो पासबुक दिखाइए।",
    kn: "ಎಲ್ಲರ ಮುಂದೆ ಸಂಖ್ಯೆ ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲದಿದ್ದರೆ ಪಾಸ್‌ಬುಕ್ ತೋರಿಸಿ.",
    en: "Prefer not to say the number aloud? Show your passbook instead.",
  },
} satisfies Record<string, Msg>;

export const LANG_LABELS: Record<Lang, { native: string; english: string; greeting: string }> = {
  hi: { native: "हिन्दी", english: "Hindi", greeting: "नमस्ते" },
  kn: { native: "ಕನ್ನಡ", english: "Kannada", greeting: "ನಮಸ್ಕಾರ" },
  en: { native: "English", english: "English", greeting: "Hello" },
};
