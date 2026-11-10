import { cookies } from "next/headers";
import type { Lang } from "../types";
import { LANG_COOKIE, PORTAL, type PortalCopy } from "./content";

/** Portal language from the cookie set by the header switcher (English by default). */
export async function portalLang(): Promise<{ lang: Lang; copy: PortalCopy }> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  const lang: Lang = value === "kn" || value === "hi" ? value : "en";
  return { lang, copy: PORTAL[lang] };
}
