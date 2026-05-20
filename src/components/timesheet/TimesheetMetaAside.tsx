import { Clock, Euro } from "lucide-react";
import {
  formatCurrency,
  formatTimesheetCost,
  formatWorkingHours,
} from "@/lib/utils";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";

export function TimesheetDurationAside({
  duration,
}: {
  duration?: number | null;
}) {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-0.5 text-center">
      <Clock className="h-4 w-4 text-muted-foreground/70" strokeWidth={1.5} />
      <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
        {duration != null ? formatWorkingHours(duration) : "–"}
      </span>
    </div>
  );
}

export function TimesheetDurationPriceAside({
  entry,
}: {
  entry: TimesheetCollectionExpanded;
}) {
  const cost = formatTimesheetCost(entry);

  return (
    <div className="flex shrink-0 gap-3">
      <TimesheetDurationAside duration={entry.duration} />
      <div className="flex w-12 flex-col items-center gap-0.5 text-center">
        <Euro className="h-4 w-4 text-muted-foreground/70" strokeWidth={1.5} />
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {cost != null ? formatCurrency(cost) : "–"}
        </span>
      </div>
    </div>
  );
}
