import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES, useTranslation, type Locale } from "@/i18n";
import { LocaleFlag } from "@/lib/locale-flags";

export function LanguageSelector() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t("language.label")}</Label>
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue>
            <span className="flex items-center gap-2">
              <LocaleFlag locale={locale} />
              {t(`language.${locale}`)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((code) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <LocaleFlag locale={code} />
                {t(`language.${code}`)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
