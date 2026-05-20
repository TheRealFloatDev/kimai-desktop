import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
} from "@/lib/utils";

interface TimesheetDataTableProps {
  timesheets: TimesheetCollectionExpanded[];
  onEdit: (timesheet: TimesheetCollectionExpanded) => void;
  onDelete: (id: number) => void;
}

export function TimesheetDataTable({
  timesheets,
  onEdit,
  onDelete,
}: TimesheetDataTableProps) {
  const columns: ColumnDef<TimesheetCollectionExpanded>[] = [
    {
      accessorKey: "begin",
      header: "Beginn",
      cell: ({ row }) => formatDateTime(row.original.begin),
    },
    {
      accessorKey: "end",
      header: "Ende",
      cell: ({ row }) =>
        row.original.end ? formatDateTime(row.original.end) : "–",
    },
    {
      accessorKey: "duration",
      header: "Dauer",
      cell: ({ row }) =>
        row.original.duration != null
          ? formatDuration(row.original.duration)
          : "–",
    },
    {
      id: "customer",
      header: "Kunde",
      cell: ({ row }) => row.original.project.customer?.name ?? "–",
    },
    {
      id: "project",
      header: "Projekt",
      cell: ({ row }) => row.original.project.name,
    },
    {
      id: "activity",
      header: "Aktivität",
      cell: ({ row }) => row.original.activity.name,
    },
    {
      accessorKey: "description",
      header: "Beschreibung",
      cell: ({ row }) => (
        <span className="block max-w-[200px] truncate">
          {row.original.description ?? "–"}
        </span>
      ),
    },
    {
      accessorKey: "rate",
      header: "Preis/Kosten",
      cell: ({ row }) =>
        row.original.rate != null && row.original.rate > 0
          ? formatCurrency(row.original.rate)
          : "–",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Aktionen</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: timesheets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Keine Einträge
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
