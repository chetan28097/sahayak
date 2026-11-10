/**
 * What the customer must bring to the counter and what happens next, per service and
 * per answer. Shown (in the customer's language) on the completed-application page.
 */
import { currentConfig } from "./config";
import { formatINR } from "./numbers";
import { schemeDebit } from "./schemes";
import { holderAge } from "./services/schemes";
import type { Lang, ServiceId, Values } from "./types";

type L = Record<Lang, string>;
const l = (en: string, hi: string, kn: string): L => ({ en, hi, kn });

export interface AfterSubmit {
  bring: L[];
  next: L[];
}

function deposit(v: Values): AfterSubmit {
  const amount = formatINR(v.amount ?? 0);
  const bring = [l(`The cash: ${amount}, in the notes you counted`, `नकद ${amount}, जो नोट आपने गिने`, `ನಗದು ${amount}, ನೀವು ಎಣಿಸಿದ ನೋಟುಗಳು`)];
  if ((v.amount ?? 0) >= currentConfig().panThreshold) {
    bring.push(
      v.form60
        ? l("You will sign Form 60 at the counter (no PAN)", "काउंटर पर फ़ॉर्म 60 पर हस्ताक्षर (पैन नहीं)", "ಕೌಂಟರ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ 60ಕ್ಕೆ ಸಹಿ (ಪ್ಯಾನ್ ಇಲ್ಲ)")
        : l("Your PAN card", "आपका पैन कार्ड", "ನಿಮ್ಮ ಪ್ಯಾನ್ ಕಾರ್ಡ್"),
    );
  }
  return {
    bring,
    next: [
      l("Give the cash and this slip to the cashier.", "नकद और यह पर्ची कैशियर को दीजिए।", "ನಗದು ಮತ್ತು ಈ ಚೀಟಿಯನ್ನು ಕ್ಯಾಷಿಯರ್‌ಗೆ ಕೊಡಿ."),
      l("The cashier counts it, signs, and gives you the stamped counterfoil.", "कैशियर गिनकर, हस्ताक्षर करके मुहर लगी रसीद देगा।", "ಕ್ಯಾಷಿಯರ್ ಎಣಿಸಿ, ಸಹಿ ಮಾಡಿ ಮುದ್ರೆಯ ರಸೀದಿ ಕೊಡುತ್ತಾರೆ."),
      l("The money reaches the account right away and you get an SMS.", "पैसा तुरंत खाते में आएगा और SMS मिलेगा।", "ಹಣ ತಕ್ಷಣ ಖಾತೆಗೆ ಬರುತ್ತದೆ, SMS ಬರುತ್ತದೆ."),
    ],
  };
}

function accountOpen(v: Values): AfterSubmit {
  const bring: L[] = [];
  if (v.existingCif) {
    bring.push(l("No identity documents: your KYC is already with the bank", "पहचान के कागज़ नहीं चाहिए: आपकी KYC बैंक में है", "ಗುರುತಿನ ದಾಖಲೆ ಬೇಡ: ನಿಮ್ಮ KYC ಬ್ಯಾಂಕಿನಲ್ಲಿದೆ"));
  } else {
    bring.push(l("Your original Aadhaar card", "आपका असली आधार कार्ड", "ನಿಮ್ಮ ಮೂಲ ಆಧಾರ್ ಕಾರ್ಡ್"));
    bring.push(l("One recent passport-size photo", "एक हाल की पासपोर्ट फ़ोटो", "ಒಂದು ಇತ್ತೀಚಿನ ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ"));
  }
  bring.push(
    v.form60
      ? l("You will sign Form 60 at the counter (no PAN)", "काउंटर पर फ़ॉर्म 60 पर हस्ताक्षर (पैन नहीं)", "ಕೌಂಟರ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ 60ಕ್ಕೆ ಸಹಿ (ಪ್ಯಾನ್ ಇಲ್ಲ)")
      : l("Your PAN card", "आपका पैन कार्ड", "ನಿಮ್ಮ ಪ್ಯಾನ್ ಕಾರ್ಡ್"),
  );
  bring.push(l("Your signature or thumb impression on the form", "फ़ॉर्म पर हस्ताक्षर या अँगूठा", "ಫಾರ್ಮ್ ಮೇಲೆ ಸಹಿ ಅಥವಾ ಹೆಬ್ಬೆರಳು"));
  return {
    bring,
    next: [
      l("An officer checks your documents and takes your signature.", "अधिकारी कागज़ जाँचकर हस्ताक्षर लेंगे।", "ಅಧಿಕಾರಿ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ ಸಹಿ ಪಡೆಯುತ್ತಾರೆ."),
      l("Your account number is given once the account is approved, usually the same day.", "खाता मंज़ूर होने पर खाता नंबर मिलेगा, अक्सर उसी दिन।", "ಖಾತೆ ಅನುಮೋದನೆಯಾದ ಮೇಲೆ ಖಾತೆ ಸಂಖ್ಯೆ ಸಿಗುತ್ತದೆ, ಸಾಮಾನ್ಯವಾಗಿ ಅದೇ ದಿನ."),
      l("Your ATM card and cheque book (if asked for) come by post or at the branch.", "ATM कार्ड और चेक बुक (अगर माँगी) डाक से या ब्रांच में मिलेगी।", "ATM ಕಾರ್ಡ್ ಮತ್ತು ಚೆಕ್ ಪುಸ್ತಕ (ಕೇಳಿದ್ದರೆ) ಅಂಚೆಯಲ್ಲಿ ಅಥವಾ ಶಾಖೆಯಲ್ಲಿ."),
    ],
  };
}

function scheme(v: Values): AfterSubmit {
  const debit = v.scheme ? schemeDebit(v.scheme, holderAge(v) ?? 0, v.pensionSlab) : null;
  const amount = debit ? formatINR(debit.amount) : "";
  return {
    bring: [
      l(`Enough balance for the first debit of ${amount}`, `पहली कटौती ${amount} के लिए खाते में पैसा`, `ಮೊದಲ ಕಡಿತ ${amount}ಕ್ಕೆ ಖಾತೆಯಲ್ಲಿ ಹಣ`),
      l("Your signature or thumb impression on the consent form", "सहमति फ़ॉर्म पर हस्ताक्षर या अँगूठा", "ಒಪ್ಪಿಗೆ ಫಾರ್ಮ್ ಮೇಲೆ ಸಹಿ ಅಥವಾ ಹೆಬ್ಬೆರಳು"),
    ],
    next: [
      l("After you sign, the amount is debited and your cover or pension account starts.", "हस्ताक्षर के बाद रकम कटेगी और योजना शुरू होगी।", "ಸಹಿ ಮಾಡಿದ ನಂತರ ಹಣ ಕಡಿತವಾಗಿ ಯೋಜನೆ ಆರಂಭವಾಗುತ್ತದೆ."),
      l("You will get an SMS and an acknowledgement slip.", "आपको SMS और पावती मिलेगी।", "ನಿಮಗೆ SMS ಮತ್ತು ಸ್ವೀಕೃತಿ ಸಿಗುತ್ತದೆ."),
    ],
  };
}

function update(v: Values): AfterSubmit {
  const what = v.updateWhat ?? [];
  const bring: L[] = [];
  if (what.includes("mobile")) bring.push(l("Your new phone, to receive an OTP", "नया फ़ोन, OTP के लिए", "ಹೊಸ ಫೋನ್, OTPಗಾಗಿ"));
  if (what.includes("address") || what.includes("rekyc")) bring.push(l("Your original Aadhaar card", "आपका असली आधार कार्ड", "ನಿಮ್ಮ ಮೂಲ ಆಧಾರ್ ಕಾರ್ಡ್"));
  bring.push(l("Your signature or thumb impression (a thumb impression needs a witness)", "हस्ताक्षर या अँगूठा (अँगूठे के लिए एक गवाह)", "ಸಹಿ ಅಥವಾ ಹೆಬ್ಬೆರಳು (ಹೆಬ್ಬೆರಳಿಗೆ ಒಬ್ಬ ಸಾಕ್ಷಿ)"));
  return {
    bring,
    next: [
      l("Staff check the documents and update your record.", "स्टाफ़ कागज़ जाँचकर रिकॉर्ड बदलेगा।", "ಸಿಬ್ಬಂದಿ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ ದಾಖಲೆ ನವೀಕರಿಸುತ್ತಾರೆ."),
      l("The change is usually live within 1–2 working days. You'll get an SMS.", "बदलाव आमतौर पर 1–2 कामकाजी दिनों में लागू होता है। SMS मिलेगा।", "ಬದಲಾವಣೆ ಸಾಮಾನ್ಯವಾಗಿ 1–2 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ. SMS ಬರುತ್ತದೆ."),
    ],
  };
}

function request(v: Values): AfterSubmit {
  switch (v.requestType) {
    case "block_card":
      return {
        bring: [l("Nothing else — just this token", "और कुछ नहीं — बस यह टोकन", "ಬೇರೇನೂ ಬೇಡ — ಈ ಟೋಕನ್ ಸಾಕು")],
        next: [
          l("The counter blocks your card first, before other customers.", "काउंटर सबसे पहले आपका कार्ड बंद करेगा।", "ಕೌಂಟರ್ ಮೊದಲು ನಿಮ್ಮ ಕಾರ್ಡ್ ಬ್ಲಾಕ್ ಮಾಡುತ್ತದೆ."),
          l("A new card (if asked for) arrives in about 7–10 days.", "नया कार्ड (अगर माँगा) लगभग 7–10 दिन में आएगा।", "ಹೊಸ ಕಾರ್ಡ್ (ಕೇಳಿದ್ದರೆ) ಸುಮಾರು 7–10 ದಿನಗಳಲ್ಲಿ."),
        ],
      };
    case "cheque_book":
      return {
        bring: [l("Your signature on the request", "अनुरोध पर हस्ताक्षर", "ವಿನಂತಿಗೆ ಸಹಿ")],
        next: [l("The cheque book is ready in about 7 working days.", "चेक बुक लगभग 7 कामकाजी दिनों में तैयार होगी।", "ಚೆಕ್ ಪುಸ್ತಕ ಸುಮಾರು 7 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಸಿದ್ಧ.")],
      };
    case "passbook":
      return {
        bring: [l("Your passbook", "आपकी पासबुक", "ನಿಮ್ಮ ಪಾಸ್‌ಬುಕ್")],
        next: [l("The counter prints your entries now.", "काउंटर अभी आपकी एंट्री छाप देगा।", "ಕೌಂಟರ್ ಈಗಲೇ ನಮೂದುಗಳನ್ನು ಮುದ್ರಿಸುತ್ತದೆ.")],
      };
    case "complaint":
      return {
        bring: [l("Any ATM slip or SMS about the problem, if you have one", "समस्या से जुड़ी ATM पर्ची या SMS, अगर हो", "ಸಮಸ್ಯೆಯ ATM ಚೀಟಿ ಅಥವಾ SMS, ಇದ್ದರೆ")],
        next: [
          l("Keep this reference number. The bank must reply within 30 days.", "यह संख्या संभालकर रखें। बैंक को 30 दिन में जवाब देना होता है।", "ಈ ಸಂಖ್ಯೆಯನ್ನು ಇಟ್ಟುಕೊಳ್ಳಿ. ಬ್ಯಾಂಕ್ 30 ದಿನಗಳಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು."),
          ...(v.complaintCategory === "atm_debit"
            ? [l("A failed ATM withdrawal is normally reversed within 5 working days.", "ATM से न निकला पैसा आमतौर पर 5 कामकाजी दिनों में वापस आता है।", "ATMನಲ್ಲಿ ಬಾರದ ಹಣ ಸಾಮಾನ್ಯವಾಗಿ 5 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ವಾಪಸ್.")]
            : []),
        ],
      };
    default:
      return { bring: [], next: [] };
  }
}

const BUILDERS: Record<ServiceId, (v: Values) => AfterSubmit> = {
  deposit,
  account_open: accountOpen,
  scheme_enroll: scheme,
  update_details: update,
  service_request: request,
};

export function afterSubmit(service: ServiceId, v: Values): AfterSubmit {
  return BUILDERS[service](v);
}
