import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
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
  formatTimesheetCost,
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
  const { t } = useTranslation();
  const dash = t("history.dash");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "begin", desc: true },
  ]);

  const columns: ColumnDef<TimesheetCollectionExpanded>[] = useMemo(() => [
    {
      accessorKey: "begin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colBegin")} />
      ),
      cell: ({ row }) => formatDateTime(row.original.begin),
      sortingFn: (a, b) =>
        new Date(a.original.begin).getTime() -
        new Date(b.original.begin).getTime(),
    },
    {
      accessorKey: "end",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colEnd")} />
      ),
      cell: ({ row }) =>
        row.original.end ? formatDateTime(row.original.end) : dash,
      sortingFn: (a, b) => {
        const ae = a.original.end ? new Date(a.original.end).getTime() : 0;
        const be = b.original.end ? new Date(b.original.end).getTime() : 0;
        return ae - be;
      },
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colDuration")} />
      ),
      cell: ({ row }) =>
        row.original.duration != null
          ? formatDuration(row.original.duration)
          : dash,
    },
    {
      id: "customer",
      accessorFn: (row) => row.project.customer?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colCustomer")} />
      ),
      cell: ({ row }) => row.original.project.customer?.name ?? dash,
    },
    {
      id: "project",
      accessorFn: (row) => row.project.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colProject")} />
      ),
      cell: ({ row }) => row.original.project.name,
    },
    {
      id: "activity",
      accessorFn: (row) => row.activity.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colActivity")} />
      ),
      cell: ({ row }) => row.original.activity.name,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colDescription")} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-[200px] truncate text-muted-foreground">
          {row.original.description ?? dash}
        </span>
      ),
    },
    {
      id: "cost",
      accessorFn: (row) => formatTimesheetCost(row) ?? -1,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("history.colCost")} />
      ),
      cell: ({ row }) => {
        const cost = formatTimesheetCost(row.original);
        return cost != null ? (
          <span className="tabular-nums">{formatCurrency(cost)}</span>
        ) : (
          dash
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t("history.colActions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("history.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("history.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [t, dash, onEdit, onDelete]);

  const table = useReactTable({
    data: timesheets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="h-10">
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
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("history.empty")}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
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
