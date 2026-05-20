import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useActivities,
  useProjects,
  useUpdateTimesheet,
} from "@/hooks/useApi";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";

interface TimesheetEditDialogProps {
  timesheet: TimesheetCollectionExpanded | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimesheetEditDialog({
  timesheet,
  open,
  onOpenChange,
}: TimesheetEditDialogProps) {
  const [projectId, setProjectId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [begin, setBegin] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [billable, setBillable] = useState(true);

  const { data: projects = [] } = useProjects(undefined, true);
  const { data: activities = [] } = useActivities(
    projectId ? Number(projectId) : undefined,
  );
  const updateTimesheet = useUpdateTimesheet();

  useEffect(() => {
    if (!timesheet) return;
    setProjectId(String(timesheet.project.id));
    setActivityId(String(timesheet.activity.id));
    setBegin(timesheet.begin);
    setEnd(timesheet.end);
    setDescription(timesheet.description ?? "");
    setTags(timesheet.tags?.join(", ") ?? "");
    setBillable(timesheet.billable ?? true);
  }, [timesheet]);

  const handleSave = () => {
    if (!timesheet || !projectId || !activityId) return;
    updateTimesheet.mutate(
      {
        id: timesheet.id,
        form: {
          project: Number(projectId),
          activity: Number(activityId),
          begin,
          end,
          description: description || undefined,
          tags: tags || undefined,
          billable,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Timesheet bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <DateTimePicker label="Beginn" value={begin} onChange={setBegin} />
          <DateTimePicker label="Ende" value={end} onChange={setEnd} />
          <div className="space-y-2">
            <Label>Projekt</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Aktivität</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={billable}
              onCheckedChange={(v) => setBillable(v === true)}
            />
            <Label>Abrechenbar</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={updateTimesheet.isPending}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
