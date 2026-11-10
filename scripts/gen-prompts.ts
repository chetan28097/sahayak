/**
 * Pre-generates audio for every fixed prompt (no placeholders) in all 3 languages
 * into the shared TTS disk cache, so live sessions only spend credits on dynamic
 * read-backs. Already-cached prompts are skipped (re-running is free).
 *   MOCK_MODE=false npm run prompts
 */
process.loadEnvFile(".env.local");

async function main() {
  const { t } = await import("../src/lib/i18n");
  const { cachedSpeech, synthesize } = await import("../src/server/voice");
  const { liveVoiceAvailable } = await import("../src/server/config");
  if (!liveVoiceAvailable()) throw new Error("Set MOCK_MODE=false and GNANI_API_KEY in .env.local first.");

  const keys = [
    "greet", "task.start.deposit", "task.start.account_open", "q.accountNumber", "q.amount", "q.notes",
    "q.pan.deposit", "q.pan.account_open", "q.depositorName", "q.depositorPhone", "q.aadhaarPhoto", "q.name",
    "q.dob", "q.gender", "q.address", "q.panPhoto", "q.mobile", "q.occupation", "q.income", "q.marital",
    "q.nomineeName", "q.accountType", "notHeard", "escape", "okAgain", "whatToChange", "staffCalled",
  ] as const;
  const langs = ["hi", "kn", "en"] as const;

  let made = 0;
  let skipped = 0;
  for (const lang of langs) {
    for (const key of keys) {
      const text = t(lang, key);
      if (await cachedSpeech(text, lang)) {
        skipped++;
        continue;
      }
      await synthesize(text, lang, true);
      made++;
      process.stdout.write(`✓ ${lang} ${key}\n`);
    }
  }
  process.stdout.write(`\nGenerated ${made}, already cached ${skipped}.\n`);
}

main().catch((e) => {
  process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
