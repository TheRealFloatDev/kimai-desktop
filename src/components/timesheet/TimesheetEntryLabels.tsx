import {
  Building2,
  Folder,
  ListTodo,
  TextAlignStart,
  type LucideIcon,
} from "lucide-react";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";
import { KimaiColorDot } from "./ColorDot";

function EntryChip({
  icon: Icon,
  name,
  colorEntity,
}: {
  icon: LucideIcon;
  name: string;
  colorEntity?: { color?: string; color_safe?: string } | null;
}) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      <KimaiColorDot entity={colorEntity} />
      <span className="truncate text-sm font-medium">{name}</span>
    </span>
  );
}

export function TimesheetEntryLabels({
  entry,
}: {
  entry: TimesheetCollectionExpanded;
}) {
  const customer = entry.project.customer;

  return (
    <div className="min-w-0 space-y-0.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        {customer && (
          <EntryChip
            icon={Building2}
            name={customer.name}
            colorEntity={customer}
          />
        )}
        <EntryChip
          icon={Folder}
          name={entry.project.name}
          colorEntity={entry.project}
        />
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        <EntryChip
          icon={ListTodo}
          name={entry.activity.name}
          colorEntity={entry.activity}
        />
        {entry.description && (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-muted-foreground">
            <TextAlignStart
              className="h-3.5 w-3.5 shrink-0 opacity-70"
              strokeWidth={1.75}
            />
            <span className="truncate text-sm">{entry.description}</span>
          </span>
        )}
      </div>
    </div>
  );
}
