import { useTranslation } from "@/i18n";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";
import { KimaiColorDot } from "./ColorDot";

function LabelRow({
  label,
  name,
  colorEntity,
}: {
  label: string;
  name: string;
  colorEntity?: { color?: string; color_safe?: string } | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <KimaiColorDot entity={colorEntity} />
      <span className="truncate font-medium">{name}</span>
    </div>
  );
}

export function TimesheetEntryLabels({
  entry,
}: {
  entry: TimesheetCollectionExpanded;
}) {
  const { t } = useTranslation();
  const customer = entry.project.customer;

  return (
    <div className="min-w-0 space-y-1">
      {customer && (
        <LabelRow
          label={t("timer.customer")}
          name={customer.name}
          colorEntity={customer}
        />
      )}
      <LabelRow
        label={t("timer.project")}
        name={entry.project.name}
        colorEntity={entry.project}
      />
      <LabelRow
        label={t("timer.activity")}
        name={entry.activity.name}
        colorEntity={entry.activity}
      />
      {entry.description && (
        <p className="pt-1 pl-[4.5rem] text-sm text-muted-foreground">
          {entry.description}
        </p>
      )}
    </div>
  );
}
