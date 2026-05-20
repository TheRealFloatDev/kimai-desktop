import { create } from "zustand";
import { persist } from "zustand/middleware";
import cs from "@/locales/cs.json";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import nl from "@/locales/nl.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import { kimaiApi } from "@/lib/api";

export const LOCALES = [
  "en",
  "de",
  "nl",
  "fr",
  "es",
  "it",
  "pl",
  "pt",
  "cs",
] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

type Messages = typeof en;

const messages: Record<Locale, Messages> = {
  en,
  de,
  nl,
  fr,
  es,
  it,
  pl,
  pt,
  cs,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const template =
    getNested(messages[locale] as Record<string, unknown>, key) ??
    getNested(messages.en as Record<string, unknown>, key) ??
    key;
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    String(params[name] ?? ""),
  );
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        set({ locale });
        void kimaiApi.setAppLocale(locale);
      },
    }),
    { name: "kimai-desktop-locale" },
  ),
);

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params);
  return { t, locale, setLocale };
}

export async function initLocale() {
  try {
    const prefs = await kimaiApi.getAppPreferences();
    const stored = useLocaleStore.getState().locale;
    const locale = (LOCALES.includes(prefs.locale as Locale)
      ? prefs.locale
      : stored) as Locale;
    useLocaleStore.setState({ locale });
    await kimaiApi.setAppLocale(locale);
  } catch {
    await kimaiApi.setAppLocale(useLocaleStore.getState().locale);
  }
}
