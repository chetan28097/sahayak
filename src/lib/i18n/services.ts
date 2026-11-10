/** Messages for the multi-service flows (nominees, CKYC, schemes, updates, requests, visit). */
import type { Msg } from "./core";

export const SERVICES_MSGS = {
  // ── tasks & visit ──────────────────────────────────────────────
  "task.scheme_enroll": { hi: "बीमा और पेंशन", kn: "ವಿಮೆ ಮತ್ತು ಪಿಂಚಣಿ", en: "Insurance & pension" },
  "task.update_details": { hi: "जानकारी बदलें", kn: "ವಿವರ ಬದಲಿಸಿ", en: "Update my details" },
  "task.service_request": { hi: "कार्ड, चेक, शिकायत", kn: "ಕಾರ್ಡ್, ಚೆಕ್, ದೂರು", en: "Card, cheque, complaint" },
  "task.start.scheme_enroll": {
    hi: "ठीक है, सरकारी बीमा या पेंशन योजना में नाम लिखते हैं।",
    kn: "ಸರಿ, ಸರ್ಕಾರಿ ವಿಮೆ ಅಥವಾ ಪಿಂಚಣಿ ಯೋಜನೆಗೆ ಸೇರೋಣ.",
    en: "Okay, let's enrol you in a government insurance or pension scheme.",
  },
  "task.start.update_details": {
    hi: "ठीक है, आपकी जानकारी बदलते हैं।",
    kn: "ಸರಿ, ನಿಮ್ಮ ವಿವರ ಬದಲಿಸೋಣ.",
    en: "Okay, let's update your details.",
  },
  "task.start.service_request": { hi: "ठीक है।", kn: "ಸರಿ.", en: "Okay." },
  anythingElse: {
    hi: "क्या कोई और काम है?",
    kn: "ಬೇರೆ ಏನಾದರೂ ಕೆಲಸ ಇದೆಯೇ?",
    en: "Is there anything else I can help with?",
  },
  whatElse: { hi: "ज़रूर। और क्या करना है?", kn: "ಖಂಡಿತ. ಇನ್ನೇನು ಮಾಡಬೇಕು?", en: "Sure. What else do you need?" },
  visitEnd: {
    hi: "धन्यवाद! अपनी पर्ची लेकर काउंटर पर जाइए।",
    kn: "ಧನ್ಯವಾದ! ನಿಮ್ಮ ಚೀಟಿಯೊಂದಿಗೆ ಕೌಂಟರ್‌ಗೆ ಹೋಗಿ.",
    en: "Thank you! Please take your slip to the counter.",
  },
  "done.scheme_enroll": {
    hi: "आपका योजना फ़ॉर्म तैयार है। टोकन है {code}।",
    kn: "ನಿಮ್ಮ ಯೋಜನೆ ಫಾರ್ಮ್ ಸಿದ್ಧವಾಗಿದೆ. ಟೋಕನ್ {code}.",
    en: "Your scheme form is ready. Your token is {code}.",
  },
  "done.update_details": {
    hi: "आपका बदलाव का फ़ॉर्म तैयार है। टोकन है {code}।",
    kn: "ನಿಮ್ಮ ಬದಲಾವಣೆ ಫಾರ್ಮ್ ಸಿದ್ಧವಾಗಿದೆ. ಟೋಕನ್ {code}.",
    en: "Your change request is ready. Your token is {code}.",
  },
  "done.service_request": {
    hi: "आपका अनुरोध काउंटर पर भेज दिया है। टोकन है {code}।",
    kn: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕೌಂಟರ್‌ಗೆ ಕಳುಹಿಸಿದೆ. ಟೋಕನ್ {code}.",
    en: "Your request has been sent to the counter. Your token is {code}.",
  },
  "done.block_card": {
    hi: "आपका कार्ड बंद करने का अनुरोध ज़रूरी के रूप में काउंटर पर पहुँच गया है। टोकन है {code}।",
    kn: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಬ್ಲಾಕ್ ವಿನಂತಿ ತುರ್ತು ಎಂದು ಕೌಂಟರ್‌ಗೆ ತಲುಪಿದೆ. ಟೋಕನ್ {code}.",
    en: "Your card block request has reached the counter as URGENT. Your token is {code}.",
  },
  "done.balance": { hi: "ठीक है।", kn: "ಸರಿ.", en: "Done." },

  // ── nominees (DA-1, up to 4) ───────────────────────────────────
  "q.nomineeNameNext": {
    hi: "नॉमिनी नंबर {n} का नाम बोलिए।",
    kn: "ನಾಮಿನಿ ಸಂಖ್ಯೆ {n} ಅವರ ಹೆಸರು ಹೇಳಿ.",
    en: "Please say the name of nominee number {n}.",
  },
  "q.nomineeMore": {
    hi: "क्या एक और नॉमिनी जोड़ना है? ज़्यादा से ज़्यादा 4 हो सकते हैं।",
    kn: "ಇನ್ನೊಬ್ಬ ನಾಮಿನಿ ಸೇರಿಸಬೇಕೇ? ಗರಿಷ್ಠ 4 ಜನ.",
    en: "Do you want to add another nominee? You can have up to 4.",
  },
  "q.nomineeShares": {
    hi: "{names} में पैसा कैसे बँटे? 'बराबर' बोलिए, या हर एक का हिस्सा, जैसे 60 और 40।",
    kn: "{names} ಅವರಲ್ಲಿ ಹಣ ಹೇಗೆ ಹಂಚಬೇಕು? 'ಸಮಾನವಾಗಿ' ಎನ್ನಿ, ಅಥವಾ ಪ್ರತಿಯೊಬ್ಬರ ಪಾಲು, ಉದಾ 60 ಮತ್ತು 40.",
    en: "How should the money be divided between {names}? Say 'equally', or each person's share, like 60 and 40.",
  },
  "e.sharesInvalid": {
    hi: "हिस्से जोड़कर 100 होने चाहिए। 'बराबर' बोलिए, या जैसे 60 और 40।",
    kn: "ಪಾಲುಗಳ ಒಟ್ಟು 100 ಆಗಬೇಕು. 'ಸಮಾನವಾಗಿ' ಎನ್ನಿ, ಅಥವಾ ಉದಾ 60 ಮತ್ತು 40.",
    en: "The shares must add up to 100. Say 'equally', or for example 60 and 40.",
  },
  "l.nominee": { hi: "नॉमिनी {n}", kn: "ನಾಮಿನಿ {n}", en: "Nominee {n}" },
  "l.guardian": { hi: "अभिभावक", kn: "ಪೋಷಕರು", en: "guardian" },

  // ── CKYC extras ────────────────────────────────────────────────
  "q.livesAtAadhaarAddress": {
    hi: "क्या आप अभी इसी पते पर रहते हैं?",
    kn: "ನೀವು ಈಗ ಇದೇ ವಿಳಾಸದಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಾ?",
    en: "Do you live at this address now?",
  },
  "q.currentAddress": {
    hi: "अभी आप जहाँ रहते हैं, वह पता पिन कोड के साथ बोलिए।",
    kn: "ನೀವು ಈಗ ವಾಸಿಸುವ ವಿಳಾಸವನ್ನು ಪಿನ್ ಕೋಡ್ ಸಹಿತ ಹೇಳಿ.",
    en: "Please say the address where you live now, with PIN code.",
  },
  "q.fatherOrSpouse": {
    hi: "आपके पिता या पति/पत्नी का नाम बोलिए।",
    kn: "ನಿಮ್ಮ ತಂದೆ ಅಥವಾ ಗಂಡ/ಹೆಂಡತಿಯ ಹೆಸರು ಹೇಳಿ.",
    en: "Please say your father's or spouse's name.",
  },
  "q.motherName": { hi: "आपकी माँ का नाम बोलिए।", kn: "ನಿಮ್ಮ ತಾಯಿಯ ಹೆಸರು ಹೇಳಿ.", en: "Please say your mother's name." },
  "q.declaration": {
    hi: "आखिरी सवाल: आप भारत में रहते हैं, टैक्स सिर्फ़ भारत में भरते हैं, और आप या आपके करीबी रिश्तेदार नेता या बड़े सरकारी अधिकारी नहीं हैं। क्या यह सही है?",
    kn: "ಕೊನೆಯ ಪ್ರಶ್ನೆ: ನೀವು ಭಾರತದಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ, ತೆರಿಗೆ ಭಾರತದಲ್ಲಿ ಮಾತ್ರ ಕಟ್ಟುತ್ತೀರಿ, ಮತ್ತು ನೀವು ಅಥವಾ ನಿಮ್ಮ ಹತ್ತಿರದ ಸಂಬಂಧಿಕರು ರಾಜಕಾರಣಿ ಅಥವಾ ಹಿರಿಯ ಸರ್ಕಾರಿ ಅಧಿಕಾರಿ ಅಲ್ಲ. ಇದು ಸರಿಯೇ?",
    en: "Last question: you live in India, pay tax only in India, and neither you nor a close relative is a politician or senior government official. Is that correct?",
  },
  staffWillCheck: {
    hi: "ठीक है, स्टाफ़ इसे आपके साथ जाँच लेगा।",
    kn: "ಸರಿ, ಸಿಬ್ಬಂದಿ ಇದನ್ನು ನಿಮ್ಮೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.",
    en: "Okay, a staff member will check this with you.",
  },
  "l.livesAtAadhaarAddress": { hi: "मौजूदा पता", kn: "ಪ್ರಸ್ತುತ ವಿಳಾಸ", en: "Current address" },
  "l.currentAddress": { hi: "मौजूदा पता", kn: "ಪ್ರಸ್ತುತ ವಿಳಾಸ", en: "Current address" },
  "l.fatherOrSpouse": { hi: "पिता / पति-पत्नी", kn: "ತಂದೆ / ಸಂಗಾತಿ", en: "Father / spouse" },
  "l.motherName": { hi: "माँ का नाम", kn: "ತಾಯಿಯ ಹೆಸರು", en: "Mother's name" },
  "l.declaration": { hi: "घोषणा", kn: "ಘೋಷಣೆ", en: "Declaration" },
  "v.sameAsAadhaar": { hi: "आधार वाला पता", kn: "ಆಧಾರ್ ವಿಳಾಸವೇ", en: "Same as Aadhaar" },
  "v.declOk": {
    hi: "भारतीय निवासी, टैक्स सिर्फ़ भारत में, PEP नहीं",
    kn: "ಭಾರತೀಯ ನಿವಾಸಿ, ತೆರಿಗೆ ಭಾರತದಲ್ಲಿ ಮಾತ್ರ, PEP ಅಲ್ಲ",
    en: "Resident Indian, tax resident of India only, not a PEP",
  },
  "v.staffCheck": { hi: "स्टाफ़ जाँच करेगा", kn: "ಸಿಬ್ಬಂದಿ ಪರಿಶೀಲಿಸುತ್ತಾರೆ", en: "Staff to verify" },
  "v.yes": { hi: "हाँ", kn: "ಹೌದು", en: "Yes" },
  "v.no": { hi: "नहीं", kn: "ಇಲ್ಲ", en: "No" },

  // ── schemes ────────────────────────────────────────────────────
  "q.scheme": {
    hi: "कौन सी योजना चाहिए? जीवन बीमा PMJJBY ₹436 साल का, दुर्घटना बीमा PMSBY ₹20 साल का, या अटल पेंशन योजना।",
    kn: "ಯಾವ ಯೋಜನೆ ಬೇಕು? ಜೀವ ವಿಮೆ PMJJBY ವರ್ಷಕ್ಕೆ ₹436, ಅಪಘಾತ ವಿಮೆ PMSBY ವರ್ಷಕ್ಕೆ ₹20, ಅಥವಾ ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ.",
    en: "Which scheme? Life insurance PMJJBY for ₹436 a year, accident insurance PMSBY for ₹20 a year, or Atal Pension Yojana.",
  },
  "e.schemeAge": {
    hi: "यह योजना {min} से {max} साल की उम्र के लिए है। आपकी उम्र {age} है। {others}",
    kn: "ಈ ಯೋಜನೆ {min} ರಿಂದ {max} ವರ್ಷ ವಯಸ್ಸಿನವರಿಗೆ. ನಿಮ್ಮ ವಯಸ್ಸು {age}. {others}",
    en: "This scheme is for ages {min} to {max}. You are {age}. {others}",
  },
  "e.schemeOthers": { hi: "आप इसमें जुड़ सकते हैं: {list}।", kn: "ನೀವು ಇದಕ್ಕೆ ಸೇರಬಹುದು: {list}.", en: "You can join: {list}." },
  "e.schemeNone": {
    hi: "माफ़ कीजिए, आपकी उम्र में कोई योजना नहीं है।",
    kn: "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಯಸ್ಸಿಗೆ ಯಾವ ಯೋಜನೆಯೂ ಇಲ್ಲ.",
    en: "Sorry, none of these schemes is open at your age.",
  },
  "e.alreadyEnrolled": {
    hi: "आप पहले से इस योजना में हैं। कोई दूसरी चुनिए।",
    kn: "ನೀವು ಈಗಾಗಲೇ ಈ ಯೋಜನೆಯಲ್ಲಿ ಇದ್ದೀರಿ. ಬೇರೆ ಆರಿಸಿ.",
    en: "You are already enrolled in this scheme. Please choose another.",
  },
  "q.pensionSlab": {
    hi: "60 साल के बाद हर महीने कितनी पेंशन चाहिए? 1000 से 5000 रुपये।",
    kn: "60 ವರ್ಷದ ನಂತರ ತಿಂಗಳಿಗೆ ಎಷ್ಟು ಪಿಂಚಣಿ ಬೇಕು? 1000 ರಿಂದ 5000 ರೂಪಾಯಿ.",
    en: "How much pension do you want every month after age 60? 1000 to 5000 rupees.",
  },
  "c.pensionSlab": {
    hi: "{slab} रुपये पेंशन के लिए आपको 60 साल की उम्र तक हर महीने {c} रुपये देने होंगे। ठीक है?",
    kn: "{slab} ರೂಪಾಯಿ ಪಿಂಚಣಿಗೆ ನೀವು 60 ವರ್ಷದವರೆಗೆ ತಿಂಗಳಿಗೆ {c} ರೂಪಾಯಿ ಕಟ್ಟಬೇಕು. ಸರಿಯೇ?",
    en: "For a {slab} rupee pension, you pay {c} rupees every month until age 60. Is that okay?",
  },
  "q.healthOk": {
    hi: "क्या आपकी सेहत अभी ठीक है, कोई गंभीर बीमारी नहीं है?",
    kn: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಈಗ ಚೆನ್ನಾಗಿದೆಯೇ, ಯಾವುದೇ ಗಂಭೀರ ಕಾಯಿಲೆ ಇಲ್ಲವೇ?",
    en: "Are you in good health right now, with no serious illness?",
  },
  "q.consent": {
    hi: "{premium} रुपये {freq} आपके खाते से अपने आप कटेंगे। क्या आप सहमत हैं?",
    kn: "{premium} ರೂಪಾಯಿ {freq} ನಿಮ್ಮ ಖಾತೆಯಿಂದ ತಾನಾಗಿಯೇ ಕಡಿತವಾಗುತ್ತದೆ. ನೀವು ಒಪ್ಪುತ್ತೀರಾ?",
    en: "{premium} rupees will be debited automatically {freq} from your account. Do you agree?",
  },
  "freq.year": { hi: "हर साल", kn: "ಪ್ರತಿ ವರ್ಷ", en: "every year" },
  "freq.month": { hi: "हर महीने", kn: "ಪ್ರತಿ ತಿಂಗಳು", en: "every month" },
  "e.needConsent": {
    hi: "आपकी अनुमति के बिना योजना शुरू नहीं हो सकती। सहमत हों तो 'हाँ' बोलिए, या स्टाफ़ से पूछिए।",
    kn: "ನಿಮ್ಮ ಅನುಮತಿ ಇಲ್ಲದೆ ಯೋಜನೆ ಆರಂಭವಾಗುವುದಿಲ್ಲ. ಒಪ್ಪಿದರೆ 'ಹೌದು' ಎನ್ನಿ, ಅಥವಾ ಸಿಬ್ಬಂದಿಯನ್ನು ಕೇಳಿ.",
    en: "The scheme can't start without your permission. Say yes to agree, or ask a staff member.",
  },
  "l.scheme": { hi: "योजना", kn: "ಯೋಜನೆ", en: "Scheme" },
  "l.pensionSlab": { hi: "मासिक पेंशन", kn: "ಮಾಸಿಕ ಪಿಂಚಣಿ", en: "Monthly pension" },
  "l.healthOk": { hi: "सेहत की घोषणा", kn: "ಆರೋಗ್ಯ ಘೋಷಣೆ", en: "Good-health declaration" },
  "l.autoDebitConsent": { hi: "ऑटो-डेबिट अनुमति", kn: "ಆಟೋ-ಡೆಬಿಟ್ ಅನುಮತಿ", en: "Auto-debit consent" },

  // ── update details ─────────────────────────────────────────────
  "q.updateWhat": {
    hi: "क्या बदलना है: मोबाइल नंबर, पता, नॉमिनी, या री-KYC? एक से ज़्यादा भी चुन सकते हैं।",
    kn: "ಏನು ಬದಲಿಸಬೇಕು: ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ವಿಳಾಸ, ನಾಮಿನಿ, ಅಥವಾ ಮರು-KYC? ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಆರಿಸಬಹುದು.",
    en: "What do you want to change: mobile number, address, nominee, or re-KYC? You can choose more than one.",
  },
  "q.newMobile": { hi: "नया मोबाइल नंबर बोलिए।", kn: "ಹೊಸ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೇಳಿ.", en: "Please say your new mobile number." },
  "q.addressPhoto": {
    hi: "नए पते वाला आधार कार्ड कैमरे के सामने रखिए, या 'बोलकर बताएँ' दबाइए।",
    kn: "ಹೊಸ ವಿಳಾಸವಿರುವ ಆಧಾರ್ ಕಾರ್ಡ್ ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಹಿಡಿಯಿರಿ, ಅಥವಾ 'ಮಾತಿನಲ್ಲಿ ಹೇಳಿ' ಒತ್ತಿ.",
    en: "Show your Aadhaar with the new address to the camera, or tap 'Tell by voice'.",
  },
  "q.newAddress": {
    hi: "नया पता पिन कोड के साथ बोलिए।",
    kn: "ಹೊಸ ವಿಳಾಸವನ್ನು ಪಿನ್ ಕೋಡ್ ಸಹಿತ ಹೇಳಿ.",
    en: "Please say your new address with PIN code.",
  },
  "q.rekycPhoto": {
    hi: "री-KYC के लिए अपना आधार कार्ड कैमरे के सामने रखिए।",
    kn: "ಮರು-KYCಗೆ ನಿಮ್ಮ ಆಧಾರ್ ಕಾರ್ಡ್ ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಹಿಡಿಯಿರಿ.",
    en: "For re-KYC, hold your Aadhaar card to the camera.",
  },
  "q.kycChanged": {
    hi: "पिछली बार से आपका नाम, पता या मोबाइल बदला है?",
    kn: "ಕಳೆದ ಬಾರಿಯಿಂದ ನಿಮ್ಮ ಹೆಸರು, ವಿಳಾಸ ಅಥವಾ ಮೊಬೈಲ್ ಬದಲಾಗಿದೆಯೇ?",
    en: "Has your name, address or mobile changed since last time?",
  },
  "l.updateWhat": { hi: "बदलाव", kn: "ಬದಲಾವಣೆ", en: "Changes" },
  "l.newMobile": { hi: "नया मोबाइल", kn: "ಹೊಸ ಮೊಬೈಲ್", en: "New mobile" },
  "l.addressPhoto": { hi: "नया पता", kn: "ಹೊಸ ವಿಳಾಸ", en: "New address" },
  "l.newAddress": { hi: "नया पता", kn: "ಹೊಸ ವಿಳಾಸ", en: "New address" },
  "l.rekycPhoto": { hi: "री-KYC आधार", kn: "ಮರು-KYC ಆಧಾರ್", en: "Re-KYC Aadhaar" },
  "l.kycChanged": { hi: "KYC में बदलाव", kn: "KYC ಬದಲಾವಣೆ", en: "KYC changed" },

  // ── service requests ───────────────────────────────────────────
  "q.requestType": {
    hi: "क्या चाहिए: चेक बुक, ATM कार्ड बंद करना, पासबुक अपडेट, बैलेंस, या शिकायत?",
    kn: "ಏನು ಬೇಕು: ಚೆಕ್ ಪುಸ್ತಕ, ATM ಕಾರ್ಡ್ ಬ್ಲಾಕ್, ಪಾಸ್‌ಬುಕ್ ಅಪ್‌ಡೇಟ್, ಬ್ಯಾಲೆನ್ಸ್, ಅಥವಾ ದೂರು?",
    en: "What do you need: a cheque book, block an ATM card, passbook update, balance, or a complaint?",
  },
  "q.chequeLeaves": { hi: "कितने पन्नों की चेक बुक: 10 या 25?", kn: "ಎಷ್ಟು ಹಾಳೆಯ ಚೆಕ್ ಪುಸ್ತಕ: 10 ಅಥವಾ 25?", en: "How many leaves: 10 or 25?" },
  "q.chequeDelivery": {
    hi: "चेक बुक ब्रांच से लेंगे, या घर के पते पर भेजें?",
    kn: "ಚೆಕ್ ಪುಸ್ತಕ ಶಾಖೆಯಲ್ಲಿ ಪಡೆಯುತ್ತೀರಾ, ಅಥವಾ ಮನೆ ವಿಳಾಸಕ್ಕೆ ಕಳುಹಿಸಬೇಕೇ?",
    en: "Will you collect it at the branch, or should we send it to your home address?",
  },
  "q.cardReason": {
    hi: "आपका कार्ड जिसके आखिरी अंक {last4} हैं। क्या हुआ: खो गया, चोरी हुआ, या खराब हो गया?",
    kn: "ಕೊನೆಯ ಅಂಕಿಗಳು {last4} ಇರುವ ನಿಮ್ಮ ಕಾರ್ಡ್. ಏನಾಯಿತು: ಕಳೆದುಹೋಯಿತು, ಕಳ್ಳತನ, ಅಥವಾ ಹಾಳಾಗಿದೆ?",
    en: "Your card ending {last4}. What happened: lost, stolen, or damaged?",
  },
  "q.cardReissue": { hi: "क्या नया कार्ड चाहिए?", kn: "ಹೊಸ ಕಾರ್ಡ್ ಬೇಕೇ?", en: "Do you want a new card?" },
  "q.balanceInfo": {
    hi: "आपका बैलेंस और पिछले लेन-देन स्क्रीन पर हैं। सुरक्षा के लिए मैं इसे ज़ोर से नहीं पढ़ूँगी। देख लें तो 'ठीक है' बोलिए।",
    kn: "ನಿಮ್ಮ ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಹಿಂದಿನ ವ್ಯವಹಾರಗಳು ಪರದೆಯ ಮೇಲಿವೆ. ಸುರಕ್ಷತೆಗಾಗಿ ನಾನು ಜೋರಾಗಿ ಓದುವುದಿಲ್ಲ. ನೋಡಿದ ಮೇಲೆ 'ಸರಿ' ಎನ್ನಿ.",
    en: "Your balance and last transactions are on the screen. For privacy I won't read them aloud. Say 'okay' when you're done.",
  },
  "q.complaintCategory": { hi: "शिकायत किस बारे में है?", kn: "ದೂರು ಯಾವುದರ ಬಗ್ಗೆ?", en: "What is the complaint about?" },
  "q.complaintText": {
    hi: "अपनी शिकायत अपने शब्दों में बताइए।",
    kn: "ನಿಮ್ಮ ದೂರನ್ನು ನಿಮ್ಮ ಮಾತಿನಲ್ಲಿ ಹೇಳಿ.",
    en: "Please tell me your complaint in your own words.",
  },
  "c.complaint": {
    hi: "मैंने लिखा: “{text}”। भेज दूँ?",
    kn: "ನಾನು ಬರೆದಿದ್ದು: “{text}”. ಕಳುಹಿಸಲೇ?",
    en: "I noted: “{text}”. Shall I send it?",
  },
  "e.complaintShort": {
    hi: "थोड़ा और बताइए, क्या हुआ?",
    kn: "ಸ್ವಲ್ಪ ಹೆಚ್ಚು ಹೇಳಿ, ಏನಾಯಿತು?",
    en: "Please tell me a little more, what happened?",
  },
  "e.noCard": {
    hi: "इस खाते पर कोई कार्ड नहीं मिला। स्टाफ़ मदद करेगा।",
    kn: "ಈ ಖಾತೆಗೆ ಯಾವುದೇ ಕಾರ್ಡ್ ಸಿಗಲಿಲ್ಲ. ಸಿಬ್ಬಂದಿ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.",
    en: "No card was found on this account. A staff member will help.",
  },
  "l.requestType": { hi: "अनुरोध", kn: "ವಿನಂತಿ", en: "Request" },
  "l.chequeLeaves": { hi: "चेक पन्ने", kn: "ಚೆಕ್ ಹಾಳೆಗಳು", en: "Cheque leaves" },
  "l.chequeDelivery": { hi: "डिलीवरी", kn: "ವಿತರಣೆ", en: "Delivery" },
  "l.cardReason": { hi: "कारण", kn: "ಕಾರಣ", en: "Reason" },
  "l.cardReissue": { hi: "नया कार्ड", kn: "ಹೊಸ ಕಾರ್ಡ್", en: "New card" },
  "l.complaintCategory": { hi: "शिकायत का विषय", kn: "ದೂರಿನ ವಿಷಯ", en: "Complaint about" },
  "l.complaintText": { hi: "शिकायत", kn: "ದೂರು", en: "Complaint" },

  // ── existing customers, help, assistance ───────────────────────
  "q.existingCustomer": {
    hi: "क्या आपका इस बैंक में पहले से कोई खाता है?",
    kn: "ಈ ಬ್ಯಾಂಕಿನಲ್ಲಿ ನಿಮಗೆ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    en: "Do you already have an account with this bank?",
  },
  "q.existingAccount": {
    hi: "अपना मौजूदा खाता नंबर बोलिए, या पासबुक दिखाइए। तब हमें आपकी जानकारी दोबारा नहीं पूछनी पड़ेगी।",
    kn: "ನಿಮ್ಮ ಈಗಿನ ಖಾತೆ ಸಂಖ್ಯೆ ಹೇಳಿ, ಅಥವಾ ಪಾಸ್‌ಬುಕ್ ತೋರಿಸಿ. ಆಗ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಮತ್ತೆ ಕೇಳಬೇಕಿಲ್ಲ.",
    en: "Please say your existing account number, or show your passbook. Then we won't need to ask your details again.",
  },
  "review.intro.record": {
    hi: "हमारे रिकॉर्ड में आपकी यह जानकारी है:",
    kn: "ನಮ್ಮ ದಾಖಲೆಯಲ್ಲಿ ನಿಮ್ಮ ಈ ವಿವರಗಳಿವೆ:",
    en: "Our records have these details for you:",
  },
  "q.newMobileWithOld": {
    hi: "अभी आपका मोबाइल नंबर {last4} पर खत्म होता है। नया मोबाइल नंबर बोलिए।",
    kn: "ಈಗ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ {last4} ರಲ್ಲಿ ಕೊನೆಯಾಗುತ್ತದೆ. ಹೊಸ ಸಂಖ್ಯೆ ಹೇಳಿ.",
    en: "Your registered mobile ends in {last4}. Please say the new number.",
  },
  "e.sameMobile": {
    hi: "यह वही नंबर है जो पहले से दर्ज है। नया नंबर बोलिए।",
    kn: "ಇದು ಈಗಾಗಲೇ ದಾಖಲಾಗಿರುವ ಅದೇ ಸಂಖ್ಯೆ. ಹೊಸ ಸಂಖ್ಯೆ ಹೇಳಿ.",
    en: "That is the number already registered. Please say the new number.",
  },
  "l.existingAccount": { hi: "मौजूदा ग्राहक", kn: "ಈಗಿನ ಗ್ರಾಹಕರು", en: "Existing customer" },
  "v.existingCif": { hi: "हाँ, खाता {last4} से जुड़ा", kn: "ಹೌದು, ಖಾತೆ {last4} ಜೊತೆ", en: "Yes, linked to account ending {last4}" },
  "ui.whatMeans": { hi: "इसका मतलब?", kn: "ಇದರ ಅರ್ಥ?", en: "What does this mean?" },
  "ui.callStaff": { hi: "स्टाफ़ को बुलाएँ", kn: "ಸಿಬ್ಬಂದಿಯನ್ನು ಕರೆಯಿರಿ", en: "Call a staff member" },
  staffComing: {
    hi: "स्टाफ़ को सूचना भेज दी है, वे आ रहे हैं। तब तक आप जारी रख सकते हैं।",
    kn: "ಸಿಬ್ಬಂದಿಗೆ ಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ, ಅವರು ಬರುತ್ತಿದ್ದಾರೆ. ಅಲ್ಲಿಯವರೆಗೆ ಮುಂದುವರಿಸಬಹುದು.",
    en: "A staff member has been told and is on the way. You can carry on meanwhile.",
  },
  "ui.cantRead": {
    hi: "कार्ड से नहीं पढ़ पाए: {list}। यह हम आपसे अलग से पूछेंगे।",
    kn: "ಕಾರ್ಡ್‌ನಿಂದ ಓದಲಾಗಲಿಲ್ಲ: {list}. ಇದನ್ನು ನಿಮ್ಮಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ಕೇಳುತ್ತೇವೆ.",
    en: "Could not read from the card: {list}. We will ask you for these separately.",
  },
  "ui.cardOnly": {
    hi: "यह सिर्फ़ फ़ॉर्म भरने के लिए है। असली जाँच काउंटर पर होगी।",
    kn: "ಇದು ಫಾರ್ಮ್ ತುಂಬಲು ಮಾತ್ರ. ನಿಜವಾದ ಪರಿಶೀಲನೆ ಕೌಂಟರ್‌ನಲ್ಲಿ.",
    en: "This only fills the form. The real check happens at the counter.",
  },
  "ui.resume": { hi: "जहाँ छोड़ा था वहीं से जारी रखें", kn: "ನಿಲ್ಲಿಸಿದಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ", en: "Continue where you left off" },
  "ui.track": { hi: "अपना आवेदन देखें", kn: "ನಿಮ್ಮ ಅರ್ಜಿ ನೋಡಿ", en: "Check your application" },
  "ui.nextSteps": { hi: "आगे क्या होगा", kn: "ಮುಂದೆ ಏನಾಗುತ್ತದೆ", en: "What happens next" },
  "ui.bring": { hi: "काउंटर पर साथ लाएँ", kn: "ಕೌಂಟರ್‌ಗೆ ತನ್ನಿ", en: "Bring to the counter" },
  "ui.reference": { hi: "आवेदन संख्या", kn: "ಅರ್ಜಿ ಸಂಖ್ಯೆ", en: "Application reference" },

  // ── plain-language explanations (asked via "What does this mean?") ──
  "help.existingCustomer": {
    hi: "अगर आपका यहाँ पहले से खाता है, तो आपकी पहचान बैंक के पास दर्ज है। तब आधार दोबारा नहीं दिखाना पड़ेगा।",
    kn: "ನಿಮಗೆ ಇಲ್ಲಿ ಈಗಾಗಲೇ ಖಾತೆ ಇದ್ದರೆ, ನಿಮ್ಮ ಗುರುತು ಬ್ಯಾಂಕಿನಲ್ಲಿ ದಾಖಲಾಗಿದೆ. ಆಗ ಆಧಾರ್ ಮತ್ತೆ ತೋರಿಸಬೇಕಿಲ್ಲ.",
    en: "If you already bank here, the bank has your identity on file, so you won't need to show your Aadhaar again.",
  },
  "help.facilities": {
    hi: "ATM कार्ड से मशीन से पैसे निकालते हैं। चेक बुक से किसी को भुगतान करते हैं। SMS अलर्ट हर लेन-देन पर मैसेज भेजता है।",
    kn: "ATM ಕಾರ್ಡ್‌ನಿಂದ ಯಂತ್ರದಲ್ಲಿ ಹಣ ತೆಗೆಯಬಹುದು. ಚೆಕ್ ಪುಸ್ತಕದಿಂದ ಪಾವತಿ ಮಾಡಬಹುದು. SMS ಪ್ರತಿ ವ್ಯವಹಾರಕ್ಕೆ ಸಂದೇಶ ಕಳುಹಿಸುತ್ತದೆ.",
    en: "An ATM card lets you take cash from a machine. A cheque book lets you pay someone. SMS alerts send a message for every transaction.",
  },
  "help.declarationOk": {
    hi: "सरकार के नियम से बैंक को यह पूछना होता है। ज़्यादातर लोगों के लिए जवाब 'हाँ' होता है।",
    kn: "ಸರ್ಕಾರದ ನಿಯಮದಂತೆ ಬ್ಯಾಂಕ್ ಇದನ್ನು ಕೇಳಬೇಕು. ಹೆಚ್ಚಿನವರಿಗೆ ಉತ್ತರ 'ಹೌದು'.",
    en: "Government rules require the bank to ask this. For most people the answer is yes.",
  },
  "help.autoDebitConsent": {
    hi: "ऑटो-डेबिट का मतलब है कि बैंक हर बार अपने आप आपके खाते से यह रकम काट लेगा। आपको हर साल आना नहीं पड़ेगा।",
    kn: "ಆಟೋ-ಡೆಬಿಟ್ ಅಂದರೆ ಬ್ಯಾಂಕ್ ತಾನಾಗಿಯೇ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಈ ಹಣ ಕಡಿತ ಮಾಡುತ್ತದೆ. ನೀವು ಪ್ರತಿ ವರ್ಷ ಬರಬೇಕಿಲ್ಲ.",
    en: "Auto-debit means the bank takes this amount from your account automatically, so you don't have to come in each time.",
  },
  "help.scheme": {
    hi: "PMJJBY: मृत्यु पर परिवार को 2 लाख। PMSBY: दुर्घटना में मृत्यु या विकलांगता पर 2 लाख तक। अटल पेंशन: 60 साल के बाद हर महीने पेंशन।",
    kn: "PMJJBY: ಮರಣವಾದರೆ ಕುಟುಂಬಕ್ಕೆ 2 ಲಕ್ಷ. PMSBY: ಅಪಘಾತದಲ್ಲಿ ಮರಣ ಅಥವಾ ಅಂಗವೈಕಲ್ಯಕ್ಕೆ 2 ಲಕ್ಷದವರೆಗೆ. ಅಟಲ್ ಪಿಂಚಣಿ: 60 ವರ್ಷದ ನಂತರ ತಿಂಗಳ ಪಿಂಚಣಿ.",
    en: "PMJJBY pays your family ₹2 lakh if you die. PMSBY pays up to ₹2 lakh for accidental death or disability. Atal Pension pays you a monthly pension after 60.",
  },
  "help.pensionSlab": {
    hi: "जितनी ज़्यादा पेंशन चुनेंगे, उतना ज़्यादा हर महीने जमा करना होगा।",
    kn: "ಹೆಚ್ಚು ಪಿಂಚಣಿ ಆರಿಸಿದರೆ, ತಿಂಗಳಿಗೆ ಹೆಚ್ಚು ಕಟ್ಟಬೇಕು.",
    en: "The higher the pension you choose, the more you pay each month.",
  },
  "help.taxPayer": {
    hi: "अगर आप हर साल इनकम टैक्स रिटर्न भरते हैं, तो 'हाँ' बोलिए। ज़्यादातर किसान और मज़दूर टैक्स नहीं भरते।",
    kn: "ನೀವು ಪ್ರತಿ ವರ್ಷ ಆದಾಯ ತೆರಿಗೆ ರಿಟರ್ನ್ ಸಲ್ಲಿಸಿದರೆ 'ಹೌದು' ಎನ್ನಿ. ಹೆಚ್ಚಿನ ರೈತರು ಮತ್ತು ಕೂಲಿಕಾರರು ತೆರಿಗೆ ಕಟ್ಟುವುದಿಲ್ಲ.",
    en: "Say yes if you file an income-tax return every year. Most farmers and daily-wage workers don't.",
  },
  "help.schemeElsewhere": {
    hi: "एक व्यक्ति यह योजना सिर्फ़ एक बार ले सकता है, चाहे बैंक कोई भी हो।",
    kn: "ಒಬ್ಬ ವ್ಯಕ್ತಿ ಈ ಯೋಜನೆಯನ್ನು ಒಂದೇ ಬಾರಿ ಪಡೆಯಬಹುದು, ಯಾವುದೇ ಬ್ಯಾಂಕ್ ಆಗಿರಲಿ.",
    en: "A person can have this scheme only once, whichever bank it's through.",
  },
  "help.fatherOrSpouse": {
    hi: "KYC फ़ॉर्म में पिता या पति/पत्नी का नाम ज़रूरी है।",
    kn: "KYC ಫಾರ್ಮ್‌ನಲ್ಲಿ ತಂದೆ ಅಥವಾ ಸಂಗಾತಿಯ ಹೆಸರು ಕಡ್ಡಾಯ.",
    en: "The KYC form requires your father's or spouse's name.",
  },
  "help.updateWhat": {
    hi: "री-KYC का मतलब है बैंक में अपनी पहचान की जानकारी फिर से ताज़ा करना। बैंक कुछ सालों में इसे माँगता है।",
    kn: "ಮರು-KYC ಅಂದರೆ ಬ್ಯಾಂಕಿನಲ್ಲಿ ನಿಮ್ಮ ಗುರುತಿನ ವಿವರಗಳನ್ನು ಮತ್ತೆ ನವೀಕರಿಸುವುದು. ಕೆಲವು ವರ್ಷಗಳಿಗೊಮ್ಮೆ ಬ್ಯಾಂಕ್ ಕೇಳುತ್ತದೆ.",
    en: "Re-KYC means refreshing your identity details with the bank. Banks ask for it every few years.",
  },
  "help.unauthorisedTxn": {
    hi: "अगर कार्ड खोने के बाद किसी ने पैसे निकाले हैं, तो जल्दी बताने पर बैंक नुकसान की भरपाई कर सकता है।",
    kn: "ಕಾರ್ಡ್ ಕಳೆದ ನಂತರ ಯಾರಾದರೂ ಹಣ ತೆಗೆದಿದ್ದರೆ, ಬೇಗ ತಿಳಿಸಿದರೆ ಬ್ಯಾಂಕ್ ನಷ್ಟ ತುಂಬಬಹುದು.",
    en: "If someone took money after the card was lost, reporting it quickly means the bank can refund you.",
  },
  "help.selfDeposit": {
    hi: "अगर आप किसी और के खाते में पैसे डाल रहे हैं, तो 'नहीं' बोलिए। तब हम आपका नाम पूछेंगे।",
    kn: "ಬೇರೆಯವರ ಖಾತೆಗೆ ಹಣ ಹಾಕುತ್ತಿದ್ದರೆ 'ಇಲ್ಲ' ಎನ್ನಿ. ಆಗ ನಿಮ್ಮ ಹೆಸರು ಕೇಳುತ್ತೇವೆ.",
    en: "If you are putting money into someone else's account, say no and we'll take your name.",
  },
  "help.income": {
    hi: "बैंक को मोटा-मोटा अंदाज़ा चाहिए। आप महीने की कमाई भी बता सकते हैं, जैसे 'महीने का 10 हज़ार'।",
    kn: "ಬ್ಯಾಂಕಿಗೆ ಸುಮಾರು ಅಂದಾಜು ಸಾಕು. ತಿಂಗಳ ಆದಾಯವನ್ನೂ ಹೇಳಬಹುದು, ಉದಾ 'ತಿಂಗಳಿಗೆ 10 ಸಾವಿರ'.",
    en: "A rough figure is fine. You can also say what you earn in a month, like '10 thousand a month'.",
  },
  "help.accountType": {
    hi: "जन धन खाते में न्यूनतम बैलेंस नहीं रखना पड़ता। बचत खाते में ज़्यादा सुविधाएँ होती हैं।",
    kn: "ಜನ್ ಧನ್ ಖಾತೆಯಲ್ಲಿ ಕನಿಷ್ಠ ಬ್ಯಾಲೆನ್ಸ್ ಬೇಕಿಲ್ಲ. ಉಳಿತಾಯ ಖಾತೆಯಲ್ಲಿ ಹೆಚ್ಚು ಸೌಲಭ್ಯಗಳಿವೆ.",
    en: "A Jan Dhan account needs no minimum balance. A savings account has more facilities.",
  },

  // ── field-audit additions ──────────────────────────────────────
  "q.wantsNominee": {
    hi: "क्या आप नॉमिनी जोड़ना चाहते हैं? यानी आपके बाद पैसा किसे मिले। यह ज़रूरी नहीं, पर सलाह दी जाती है।",
    kn: "ನೀವು ನಾಮಿನಿ ಸೇರಿಸಲು ಬಯಸುತ್ತೀರಾ? ಅಂದರೆ ನಿಮ್ಮ ನಂತರ ಹಣ ಯಾರಿಗೆ. ಕಡ್ಡಾಯವಲ್ಲ, ಆದರೆ ಸಲಹೆ ನೀಡಲಾಗುತ್ತದೆ.",
    en: "Would you like to name a nominee, the person who gets this money after you? It's optional but recommended.",
  },
  "q.facilities": {
    hi: "आपको क्या-क्या चाहिए: ATM कार्ड, चेक बुक, SMS अलर्ट, मोबाइल बैंकिंग? जो चाहिए वो सब बोलिए।",
    kn: "ನಿಮಗೆ ಏನೇನು ಬೇಕು: ATM ಕಾರ್ಡ್, ಚೆಕ್ ಪುಸ್ತಕ, SMS ಸಂದೇಶ, ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್? ಬೇಕಾದವನ್ನೆಲ್ಲ ಹೇಳಿ.",
    en: "Which of these do you want: ATM card, cheque book, SMS alerts, mobile banking? Say all you want.",
  },
  "q.schemeElsewhere": {
    hi: "क्या आप यह योजना पहले से किसी और बैंक या डाकघर में ले चुके हैं?",
    kn: "ನೀವು ಈ ಯೋಜನೆಯನ್ನು ಈಗಾಗಲೇ ಬೇರೆ ಬ್ಯಾಂಕ್ ಅಥವಾ ಅಂಚೆ ಕಚೇರಿಯಲ್ಲಿ ಪಡೆದಿದ್ದೀರಾ?",
    en: "Do you already have this scheme through another bank or post office?",
  },
  "q.taxPayer": {
    hi: "क्या आप इनकम टैक्स भरते हैं?",
    kn: "ನೀವು ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟುತ್ತೀರಾ?",
    en: "Do you pay income tax?",
  },
  apyTaxPayer: {
    hi: "अटल पेंशन योजना इनकम टैक्स भरने वालों के लिए नहीं है। आप कोई दूसरी योजना चुन सकते हैं।",
    kn: "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟುವವರಿಗೆ ಇಲ್ಲ. ನೀವು ಬೇರೆ ಯೋಜನೆ ಆರಿಸಬಹುದು.",
    en: "Atal Pension Yojana is not open to income-tax payers. You can choose another scheme.",
  },
  "q.unauthorisedTxn": {
    hi: "क्या आपके खाते से ऐसा कोई पैसा निकला है जो आपने नहीं निकाला?",
    kn: "ನೀವು ತೆಗೆಯದ ಹಣ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹೋಗಿದೆಯೇ?",
    en: "Has any money left your account that you did not take out yourself?",
  },
  "q.complaintDate": {
    hi: "यह कब हुआ? तारीख बोलिए, जैसे 5 नवंबर 2026।",
    kn: "ಇದು ಯಾವಾಗ ಆಯಿತು? ದಿನಾಂಕ ಹೇಳಿ, ಉದಾ 5 ನವೆಂಬರ್ 2026.",
    en: "When did this happen? Say the date, like 5 November 2026.",
  },
  "q.complaintAmount": {
    hi: "कितने रुपये कटे?",
    kn: "ಎಷ್ಟು ರೂಪಾಯಿ ಕಡಿತವಾಯಿತು?",
    en: "How much money was debited?",
  },
  "l.wantsNominee": { hi: "नॉमिनेशन", kn: "ನಾಮನಿರ್ದೇಶನ", en: "Nomination" },
  "l.facilities": { hi: "सुविधाएँ", kn: "ಸೌಲಭ್ಯಗಳು", en: "Facilities" },
  "l.schemeElsewhere": { hi: "दूसरे बैंक में योजना", kn: "ಬೇರೆ ಬ್ಯಾಂಕಿನಲ್ಲಿ ಯೋಜನೆ", en: "Enrolled elsewhere" },
  "l.taxPayer": { hi: "इनकम टैक्स", kn: "ಆದಾಯ ತೆರಿಗೆ", en: "Income-tax payer" },
  "l.unauthorisedTxn": { hi: "अनधिकृत लेन-देन", kn: "ಅನಧಿಕೃತ ವ್ಯವಹಾರ", en: "Unauthorised transaction" },
  "l.complaintDate": { hi: "तारीख", kn: "ದಿನಾಂಕ", en: "Date of transaction" },
  "l.complaintAmount": { hi: "रकम", kn: "ಮೊತ್ತ", en: "Amount debited" },
  "v.noNominee": { hi: "नॉमिनी नहीं (हस्ताक्षर काउंटर पर)", kn: "ನಾಮಿನಿ ಇಲ್ಲ (ಸಹಿ ಕೌಂಟರ್‌ನಲ್ಲಿ)", en: "Declined (sign opt-out at counter)" },

  // ── UI ─────────────────────────────────────────────────────────
  "ui.chooseMany": { hi: "जो-जो चाहिए वो सब दबाइए, फिर 'आगे'", kn: "ಬೇಕಾದವನ್ನೆಲ್ಲ ಒತ್ತಿ, ನಂತರ 'ಮುಂದೆ'", en: "Tap all that apply, then 'Next'" },
  "ui.next": { hi: "आगे", kn: "ಮುಂದೆ", en: "Next" },
  "ui.ok": { hi: "ठीक है", kn: "ಸರಿ", en: "Okay" },
  "ui.balance": { hi: "बैलेंस", kn: "ಬ್ಯಾಲೆನ್ಸ್", en: "Balance" },
  "ui.lastTxns": { hi: "पिछले लेन-देन", kn: "ಹಿಂದಿನ ವ್ಯವಹಾರಗಳು", en: "Last transactions" },
  "ui.demoData": { hi: "डेमो डेटा", kn: "ಡೆಮೊ ಡೇಟಾ", en: "Demo data" },
  "ui.somethingElse": { hi: "हाँ, और काम है", kn: "ಹೌದು, ಇನ್ನೊಂದು ಕೆಲಸ", en: "Yes, something else" },
  "ui.allDone": { hi: "नहीं, बस इतना ही", kn: "ಇಲ್ಲ, ಇಷ್ಟೇ", en: "No, that's all" },
  "ui.visitTitle": { hi: "आपके टोकन", kn: "ನಿಮ್ಮ ಟೋಕನ್‌ಗಳು", en: "Your tokens" },
  "ui.urgent": { hi: "ज़रूरी", kn: "ತುರ್ತು", en: "Urgent" },
  "ui.status.waiting": { hi: "जमा हुआ, काउंटर पर इंतज़ार", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ, ಕೌಂಟರ್‌ನಲ್ಲಿ ಕಾಯುತ್ತಿದೆ", en: "Submitted, waiting at the counter" },
  "ui.status.in_review": { hi: "स्टाफ़ जाँच रहा है", kn: "ಸಿಬ್ಬಂದಿ ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ", en: "A staff member is checking it" },
  "ui.status.needs_info": { hi: "बैंक को आपसे कुछ चाहिए", kn: "ಬ್ಯಾಂಕಿಗೆ ನಿಮ್ಮಿಂದ ಏನೋ ಬೇಕು", en: "The bank needs something from you" },
  "ui.status.verified": { hi: "जाँच पूरी, काम हो रहा है", kn: "ಪರಿಶೀಲನೆ ಮುಗಿದಿದೆ, ಕೆಲಸ ನಡೆಯುತ್ತಿದೆ", en: "Checked, being processed" },
  "ui.status.completed": { hi: "पूरा हुआ", kn: "ಮುಗಿದಿದೆ", en: "Completed" },
  "ui.status.rejected": { hi: "स्वीकार नहीं, स्टाफ़ से मिलें", kn: "ಸ್ವೀಕರಿಸಿಲ್ಲ, ಸಿಬ್ಬಂದಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ", en: "Not accepted, please see staff" },
  "ui.addressCard": { hi: "आधार से नया पता", kn: "ಆಧಾರ್‌ನಿಂದ ಹೊಸ ವಿಳಾಸ", en: "New address from Aadhaar" },
} satisfies Record<string, Msg>;
