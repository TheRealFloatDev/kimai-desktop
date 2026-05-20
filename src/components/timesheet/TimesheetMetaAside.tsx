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
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 text-center">
      <Clock className="h-5 w-5 text-muted-foreground/70" strokeWidth={1.5} />
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
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
      <div className="flex w-14 flex-col items-center gap-1 text-center">
        <Euro className="h-5 w-5 text-muted-foreground/70" strokeWidth={1.5} />
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {cost != null ? formatCurrency(cost) : "–"}
        </span>
      </div>
    </div>
  );
}
