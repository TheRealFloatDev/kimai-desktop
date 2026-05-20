import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TimesheetCollection } from "@/lib/types.generated";
import { TimesheetRow } from "./TimesheetRow";

interface TimesheetListProps {
  timesheets: TimesheetCollection[];
  onEdit: (timesheet: TimesheetCollection) => void;
  onDelete: (id: number) => void;
  showActions?: boolean;
}

export function TimesheetList({
  timesheets,
  onEdit,
  onDelete,
  showActions = true,
}: TimesheetListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beginn</TableHead>
          <TableHead>Ende</TableHead>
          <TableHead>Dauer</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead>Projekt</TableHead>
          <TableHead>Aktivität</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead>Rate</TableHead>
          {showActions && <TableHead>Aktionen</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {timesheets.map((ts) => (
          <TimesheetRow
            key={ts.id}
            timesheet={ts}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
