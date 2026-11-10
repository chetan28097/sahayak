/**
 * MOCK_MODE: canned transcripts per step per language, so every screen can be
 * built and rehearsed without spending credits. The deposit script follows the
 * demo: the first note breakdown is ₹500 short, the second answer fixes it.
 */
import { currentStep, type SessionState } from "@/lib/machine";
import type { CardData, CardKind, Lang } from "@/lib/types";

type Script = Record<string, string | string[]>;

const SCRIPTS: Record<Lang, Script> = {
  kn: {
    task: "ನಾನು ಹಣ ಜಮಾ ಮಾಡಬೇಕು", yes: "ಹೌದು", no: "ಇಲ್ಲ", next: "ಇಲ್ಲ, ಇಷ್ಟೇ",
    accountNumber: "3021 4567 891", amount: "ಹನ್ನೆರಡು ಸಾವಿರದ ಐನೂರು",
    notes: ["500 ರ 20 ನೋಟು, 100 ರ 20 ನೋಟು", "100 ರ 25 ನೋಟು"],
    pan: "ಪ್ಯಾನ್ ಇಲ್ಲ", panPhoto: "ಪ್ಯಾನ್ ಇಲ್ಲ", depositorName: "ರವಿ ಕುಮಾರ್", depositorPhone: "98450 12345",
    name: "ಲಕ್ಷ್ಮಿ ನಾರಾಯಣ್", dob: "14 ಮಾರ್ಚ್ 1962", gender: "ಮಹಿಳೆ", address: "12, ದೇವಸ್ಥಾನ ರಸ್ತೆ, ಹೊಸಕೋಟೆ 562114",
    fatherOrSpouse: "ನಾರಾಯಣಪ್ಪ", motherName: "ಗೌರಮ್ಮ", currentAddress: "4ನೇ ಕ್ರಾಸ್, ಗಾಂಧಿ ನಗರ, ಹೊಸಕೋಟೆ 562114",
    mobile: "98450 12345", occupation: "ನಾನು ರೈತ", income: "ತಿಂಗಳಿಗೆ 10 ಸಾವಿರ",
    nominee1Name: "ಸುರೇಶ್", nominee1Relation: "ಮಗ", nominee1Dob: "15 ಆಗಸ್ಟ್ 1990", nominee1Guardian: "ರಮೇಶ್",
    accountType: "ಉಳಿತಾಯ ಖಾತೆ", scheme: "ಅಪಘಾತ ವಿಮೆ", pensionSlab: "2000", updateWhat: "ಮೊಬೈಲ್ ಮತ್ತು ವಿಳಾಸ",
    newMobile: "91234 56789", newAddress: "22, ಎಂಜಿ ರಸ್ತೆ, ಹೊಸಕೋಟೆ 562114", requestType: "ಚೆಕ್ ಪುಸ್ತಕ",
    chequeLeaves: "25", chequeDelivery: "ಶಾಖೆಯಲ್ಲಿ", cardReason: "ಕಳೆದುಹೋಗಿದೆ", balanceInfo: "ಸರಿ",
    complaintCategory: "ATM", complaintText: "ATM ನಲ್ಲಿ 2000 ರೂಪಾಯಿ ಕಡಿತವಾಯಿತು ಆದರೆ ಹಣ ಬರಲಿಲ್ಲ",
    kycChanged: "ಇಲ್ಲ", nominee1More: "ಇಲ್ಲ", nomineeShares: "ಸಮಾನವಾಗಿ",
    existingCustomer: "ಇಲ್ಲ", wantsNominee: "ಹೌದು", facilities: "ATM ಕಾರ್ಡ್ ಮತ್ತು SMS", schemeElsewhere: "ಇಲ್ಲ", taxPayer: "ಇಲ್ಲ", unauthorisedTxn: "ಇಲ್ಲ", complaintDate: "5 ನವೆಂಬರ್ 2026", complaintAmount: "2000",
  },
  hi: {
    task: "मुझे पैसे जमा करने हैं", yes: "हाँ जी", no: "नहीं", next: "नहीं, बस इतना ही",
    accountNumber: "5012 3456 789", amount: "बारह हज़ार पाँच सौ",
    notes: ["500 के 20 नोट और 100 के 20 नोट", "100 के 25 नोट"],
    pan: "पैन नहीं है", panPhoto: "पैन नहीं है", depositorName: "रवि कुमार", depositorPhone: "98450 12345",
    name: "लक्ष्मी नारायण", dob: "14 मार्च 1962", gender: "महिला", address: "12, मंदिर रोड, होसकोटे 562114",
    fatherOrSpouse: "नारायणप्पा", motherName: "गौरम्मा", currentAddress: "चौथा क्रॉस, गांधी नगर, होसकोटे 562114",
    mobile: "98450 12345", occupation: "मैं किसान हूँ", income: "महीने का 10 हज़ार",
    nominee1Name: "सुरेश", nominee1Relation: "बेटा", nominee1Dob: "15 अगस्त 1990", nominee1Guardian: "रमेश",
    accountType: "बचत खाता", scheme: "दुर्घटना बीमा", pensionSlab: "2000", updateWhat: "मोबाइल और पता",
    newMobile: "91234 56789", newAddress: "22, एमजी रोड, होसकोटे 562114", requestType: "चेक बुक",
    chequeLeaves: "25", chequeDelivery: "ब्रांच से", cardReason: "खो गया", balanceInfo: "ठीक है",
    complaintCategory: "ATM", complaintText: "ATM से 2000 रुपये कट गए पर पैसे नहीं निकले",
    kycChanged: "नहीं", nominee1More: "नहीं", nomineeShares: "बराबर",
    existingCustomer: "नहीं", wantsNominee: "हाँ", facilities: "ATM कार्ड और SMS", schemeElsewhere: "नहीं", taxPayer: "नहीं", unauthorisedTxn: "नहीं", complaintDate: "5 नवंबर 2026", complaintAmount: "2000",
  },
  en: {
    task: "I want to deposit cash", yes: "yes", no: "no", next: "no, that's all",
    accountNumber: "4098 7654 321", amount: "twelve thousand five hundred",
    notes: ["20 notes of 500 and 20 notes of 100", "25 notes of 100"],
    pan: "I don't have PAN", panPhoto: "no PAN", depositorName: "Ravi Kumar", depositorPhone: "98450 12345",
    name: "Lakshmi Narayan", dob: "14 March 1962", gender: "female", address: "12 Temple Road, Hosakote 562114",
    fatherOrSpouse: "Narayanappa", motherName: "Gowramma", currentAddress: "4th Cross, Gandhi Nagar, Hosakote 562114",
    mobile: "98450 12345", occupation: "I am a farmer", income: "10 thousand a month",
    nominee1Name: "Suresh", nominee1Relation: "my son", nominee1Dob: "15 August 1990", nominee1Guardian: "Ramesh",
    accountType: "savings account", scheme: "accident insurance", pensionSlab: "2000", updateWhat: "mobile and address",
    newMobile: "91234 56789", newAddress: "22 MG Road, Hosakote 562114", requestType: "cheque book",
    chequeLeaves: "25", chequeDelivery: "collect at branch", cardReason: "lost", balanceInfo: "okay",
    complaintCategory: "ATM", complaintText: "ATM debited 2000 rupees but no cash came out",
    kycChanged: "no", nominee1More: "no", nomineeShares: "equally",
    existingCustomer: "no", wantsNominee: "yes", facilities: "ATM card and SMS alerts", schemeElsewhere: "no", taxPayer: "no", unauthorisedTxn: "no", complaintDate: "5 November 2026", complaintAmount: "2000",
  },
};

export function mockTranscript(state: SessionState): string {
  const script = SCRIPTS[state.lang];
  if (state.afterSlip) return script.next as string;
  if (!state.form) return script.task as string;
  if (state.pending) return script.yes as string;
  const step = currentStep(state);
  if (!step || step.input === "review") return script.yes as string;
  const line = script[step.id] ?? script.yes;
  if (Array.isArray(line)) {
    // Notes: first answer is short by ₹500; once counts exist, give the fix.
    const attempt = step.id === "notes" && state.values.notes ? 1 : 0;
    return line[Math.min(attempt, line.length - 1)];
  }
  return line;
}

const MOCK_CARDS: Record<CardKind, CardData> = {
  aadhaar: {
    name: "Lakshmi Narayan",
    dob: "1962-03-14",
    gender: "female",
    address: "12, Temple Road, Hosakote, Bengaluru Rural, Karnataka 562114",
    aadhaarLast4: "4821",
  },
  pan: { pan: "ABCPL1234K", name: "Lakshmi Narayan" },
  passbook: { accountNumber: "30214567891", name: "Lakshmamma" },
};

export function mockCard(kind: CardKind): CardData {
  return { ...MOCK_CARDS[kind] };
}
