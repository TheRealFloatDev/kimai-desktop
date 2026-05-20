import DE from "country-flag-icons/react/3x2/DE";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import NL from "country-flag-icons/react/3x2/NL";
import type { Locale } from "@/i18n";
import { cn } from "@/lib/utils";

const FLAG_BY_LOCALE = {
  en: GB,
  de: DE,
  nl: NL,
  fr: FR,
  es: ES,
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
