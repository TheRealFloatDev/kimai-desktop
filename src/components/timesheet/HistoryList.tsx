import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TimesheetDurationPriceAside } from "@/components/timesheet/TimesheetMetaAside";
import { TimesheetEntryLabels } from "@/components/timesheet/TimesheetEntryLabels";
import { useTranslation } from "@/i18n";
import { formatDateTime } from "@/lib/utils";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";

interface HistoryListProps {
  timesheets: TimesheetCollectionExpanded[];
  onEdit: (timesheet: TimesheetCollectionExpanded) => void;
  onDelete: (id: number) => void;
}

export function HistoryList({
  timesheets,
  onEdit,
  onDelete,
}: HistoryListProps) {
  const { t } = useTranslation();

  if (timesheets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("history.empty")}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {timesheets.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start gap-5 rounded-lg py-2"
        >
          <TimesheetDurationPriceAside entry={entry} />
          <div className="min-w-0 flex-1 space-y-1">
            <TimesheetEntryLabels entry={entry} />
            <p className="pl-[4.5rem] text-xs text-muted-foreground">
              {formatDateTime(entry.begin)}
              {entry.end ? ` → ${formatDateTime(entry.end)}` : ""}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t("history.colActions")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("history.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("history.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
  );
}
