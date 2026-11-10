# Sahayak — voice-first bank assistance and branch operations

Two clearly separate apps in one Next.js project:

- **Customer kiosk** (`/`): for people who find bank forms hard (elderly, low literacy, not comfortable in English). The customer says what they need in Kannada, Hindi or English (Hinglish works), answers one question at a time by voice or tap, hears everything read back, and leaves with a token and an acknowledgement.
- **Branch console** (`/console`, named staff sign-in): tellers and officers verify, complete, query or reject what customers submitted, with a full audit trail.

**Real:** correctly filled bank forms (pay-in slip, AOF + CKYC + DA-1, PMJJBY/PMSBY consent, APY registration, KYC update, service requisitions) that were read back and confirmed, plus the branch verification workflow.
**Simulated:** account records (5 fake customers), core-banking posting, and KYC itself (card photos only pre-fill; officers verify originals).

## Customer journey

| Page | Purpose |
|---|---|
| `/` | Trilingual welcome. Language = start button. Offers to **resume** an interrupted visit (2 h, this device). |
| `/session/[id]` | The guided conversation: one question, voice + tap, "What does this mean?", **Call a staff member** (creates a help request in the counter queue), document capture with read-back of what was extracted and what couldn't be read, final review, several jobs per visit. |
| `/slip/[id]` | Acknowledgement: reference number, token, **encrypted signed QR**, what to bring to the counter, what happens next, live status (e.g. "The bank needs something from you: bring PAN card"). |
| `/visit/[id]` | All tokens from this visit. |
| `/track` | Status by token, with no personal data shown. |

## How each service follows branch practice

- **Cash deposit:** account (passbook photo or voice) → holder name confirmed from the record → amount + words → note-by-note count that must match → PAN/Form 60 at the configured threshold (Rule 114B, ₹50,000 by default; for a third-party depositor it's *their* PAN) → depositor details if not the holder.
- **Account opening:** *existing customer?* If yes, the CIF is looked up and KYC is reused: name, DOB, address, father/spouse, mobile and PAN come from the record and are read back; only new facts are asked. If no: Aadhaar photo → extracted fields read back (unreadable ones asked by voice) → current address → father/spouse and mother's name → PAN or Form 60 → occupation, income, marital status → PEP/FATCA declaration → account type and facilities → nomination **offered**, with opt-out allowed (2025 rules: up to the configured number of nominees, % shares, guardian for a minor) → full read-back.
- **PMJJBY / PMSBY / APY:** age from the record; eligibility (18–50 / 18–70 / 18–40); one policy per person (asks about other banks); APY closed to income-tax payers; **pro-rata PMJJBY premium** (₹436 / 342 / 228 / 114 by enrolment month); APY contribution from the PFRDA chart; good-health declaration; nominee; spoken auto-debit consent.
- **Update details:** only what the customer wants to change, several at once. The current mobile is shown before asking for a new one (and "no change" is refused). Address via Aadhaar photo; nominee variation (DA-3); re-KYC with a self-declaration.
- **Card, cheque, complaint:** card block is urgent and asks about unauthorised debits (RBI zero-liability window); cheque book (configured sizes, branch or home); passbook; balance (shown on screen, never spoken); complaints with date and amount for failed ATM/UPI debits.

## Branch workflow (never "done" just because a QR exists)

`waiting → in review → (needs info ↔ in review) → verified → completed`, or `rejected`. Escalation is a separate flag.

- Each request carries a **verification checklist** generated from its bank form: flags (Form 60, PEP, fraud report), card-photo-vs-original match, every "collect at counter" item (signatures, photo, OTP, witness), and a final read-back check. Each item is ticked by a named officer, with the time.
- **Complete** is impossible until every item is verified. *Ask customer*, *Escalate* and *Reject* require a reason, which the customer sees on `/track` and on their slip.
- Every action is written to `request_events`, and shown as the request's history and on the Report page.

| Console page | Purpose |
|---|---|
| Counter | Live queue (urgent card blocks and help calls first), token / USB-scanner / camera QR lookup, and the request workbench: what they want, collected info with sources, checklist, actions, history. |
| Applications | Every request: open / needs info / escalated / completed / rejected, search, service filter, sort. Print view per request. |
| Customers | Directory and profile with KYC on record and past applications. |
| Report | Today / 7 / 30 days: volumes, median time to complete, needs-info, help calls, per service and language, recent staff activity, CSV export. |
| Settings | **Branch configuration** (PAN threshold, cash cap, cheque-book sizes, facilities, schemes, max nominees, kiosk languages) and the staff list. Manager only; zod-validated. |

## Run it

```bash
npm install
cp .env.example .env.local   # SLIP_SIGNING_SECRET, STAFF_PIN, optional SUPABASE_URL + SUPABASE_SECRET_KEY
npm run dev                  # kiosk: http://localhost:3000   console: /console (staff: asha, ravi, farida, meera)
npm test                     # 161 tests
```

- **Storage:** Supabase when configured (tables `accounts`, `sessions`, `requests`, `request_events`, `branch_config`, `turn_logs`; RLS on, no public access), otherwise JSON files in `./data`.
- **Voice:** practice mode by default (scripted answers, browser speech, **no API calls**). Live Gnani speech and Gemini understanding are opt-in (`MOCK_MODE=false` + keys + the "Live voice" switch in the kiosk footer). Rules always run first; if Gemini is unavailable the flow continues on rules.

## Security & privacy

- **QR:** the full form is deflated, **encrypted with AES-256-GCM** (key derived via HKDF from the server secret) and **HMAC-signed**. A phone scanning the slip sees ciphertext; the branch server decrypts and verifies it offline. Any change fails.
- Aadhaar only ever appears as its last 4 digits (Gemini is instructed to return only those). No audio is stored; transcripts are logged masked.
- Staff cookie: httpOnly, SameSite=strict, `staffId.HMAC(staffId, PIN)`. Sign-in attempts are rate-limited. Settings are manager-only.
- Every API input is validated with zod. `/track` reveals only service, stage and the officer's request; never names or numbers.

## Known limits

- Translations need a native-speaker review (`src/lib/i18n/`).
- One shared branch PIN with named staff (no per-person passwords or SSO).
- If Supabase is configured but unreachable, requests fail with a retry message (there is no automatic switch to local files).
- Gnani request/response shapes come from the brief. Run `npm run smoke` before going live.
