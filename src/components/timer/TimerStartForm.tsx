import { useState } from "react";
import { Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useTranslation } from "@/i18n";
import {
  useActivities,
  useCustomers,
  useProjects,
  useStartTimer,
} from "@/hooks/useApi";

interface TimerStartFormProps {
  onSuccess?: () => void;
}

export function TimerStartForm({ onSuccess }: TimerStartFormProps) {
  const { t } = useTranslation();
  const [customerId, setCustomerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [billable, setBillable] = useState(true);

  const { data: customers = [] } = useCustomers();
  const { data: projects = [] } = useProjects(
    customerId ? Number(customerId) : undefined,
  );
  const { data: activities = [] } = useActivities(
    projectId ? Number(projectId) : undefined,
  );
  const startTimer = useStartTimer();

  const handleStart = () => {
    if (!projectId || !activityId) return;
    startTimer.mutate(
      {
        projectId: Number(projectId),
        activityId: Number(activityId),
        description: description || undefined,
        tags: tags || undefined,
        billable,
      },
      { onSuccess },
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>{t("timer.formCustomer")}</Label>
          <Select
            value={customerId}
            onValueChange={(v) => {
              setCustomerId(v);
              setProjectId("");
              setActivityId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("timer.formCustomerPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("timer.formProject")}</Label>
          <Select
            value={projectId}
            onValueChange={(v) => {
              setProjectId(v);
              setActivityId("");
            }}
            disabled={!customerId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("timer.formProjectPlaceholder")} />
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
          <Label>{t("timer.formActivity")}</Label>
          <Select
            value={activityId}
            onValueChange={setActivityId}
            disabled={!projectId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("timer.formActivityPlaceholder")} />
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
      </div>

      <div className="space-y-2">
        <Label>{t("timer.formDescription")}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("timer.formDescriptionPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("timer.formTags")}</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t("timer.formTagsPlaceholder")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="billable"
          checked={billable}
          onCheckedChange={(v) => setBillable(v === true)}
        />
        <Label htmlFor="billable">{t("timer.formBillable")}</Label>
      </div>

      {startTimer.isError && (
        <Alert variant="destructive">
          <AlertDescription>{String(startTimer.error)}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleStart}
        disabled={!projectId || !activityId || startTimer.isPending}
      >
        <Play className="mr-2 h-4 w-4" />
        {t("timer.formStart")}
      </Button>
    </div>
  );
}
