import CZ from "country-flag-icons/react/3x2/CZ";
import DE from "country-flag-icons/react/3x2/DE";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import IT from "country-flag-icons/react/3x2/IT";
import NL from "country-flag-icons/react/3x2/NL";
import PL from "country-flag-icons/react/3x2/PL";
import PT from "country-flag-icons/react/3x2/PT";
import type { Locale } from "@/i18n";
import { cn } from "@/lib/utils";

const FLAG_BY_LOCALE = {
  en: GB,
  de: DE,
  nl: NL,
  fr: FR,
  es: ES,
  it: IT,
  pl: PL,
  pt: PT,
  cs: CZ,
} as const;

export function LocaleFlag({
  locale,
  className,
  title,
}: {
  locale: Locale;
  className?: string;
  title?: string;
}) {
  const Flag = FLAG_BY_LOCALE[locale];
  return (
    <Flag
      title={title}
      className={cn("h-3.5 w-5 shrink-0 rounded-[2px]", className)}
    />
  );
}
