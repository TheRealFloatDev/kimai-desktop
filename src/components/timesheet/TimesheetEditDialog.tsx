import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { TimesheetCollection } from "@/lib/types.generated";

interface TimesheetEditDialogProps {
  timesheet: TimesheetCollection | null;
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
  const [begin, setBegin] = useState("");
  const [end, setEnd] = useState("");
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
    setProjectId(String(timesheet.project));
    setActivityId(String(timesheet.activity));
    setBegin(timesheet.begin.slice(0, 16));
    setEnd(timesheet.end?.slice(0, 16) ?? "");
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
          begin: begin ? `${begin}:00` : undefined,
          end: end ? `${end}:00` : undefined,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Beginn</Label>
              <Input
                type="datetime-local"
                value={begin}
                onChange={(e) => setBegin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ende</Label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
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
