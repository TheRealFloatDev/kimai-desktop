import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { TimesheetCollection } from "@/lib/types.generated";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface TimesheetRowProps {
  timesheet: TimesheetCollection;
  customerName?: string;
  projectName?: string;
  activityName?: string;
  onEdit: (timesheet: TimesheetCollection) => void;
  onDelete: (id: number) => void;
}

export function TimesheetRow({
  timesheet,
  customerName,
  projectName,
  activityName,
  onEdit,
  onDelete,
}: TimesheetRowProps) {
  return (
    <TableRow>
      <TableCell>{formatDateTime(timesheet.begin)}</TableCell>
      <TableCell>
        {timesheet.end ? formatDateTime(timesheet.end) : "–"}
      </TableCell>
      <TableCell>
        {timesheet.duration != null
          ? formatDuration(timesheet.duration)
          : "–"}
      </TableCell>
      <TableCell>{customerName ?? "–"}</TableCell>
      <TableCell>{projectName ?? `#${timesheet.project}`}</TableCell>
      <TableCell>{activityName ?? `#${timesheet.activity}`}</TableCell>
      <TableCell className="max-w-[200px] truncate">
        {timesheet.description ?? "–"}
      </TableCell>
      <TableCell>{timesheet.rate?.toFixed(2) ?? "–"}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(timesheet)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(timesheet.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
