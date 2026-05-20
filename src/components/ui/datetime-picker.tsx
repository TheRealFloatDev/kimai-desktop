import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, mergeDateAndTime, splitDateTimeLocal } from "@/lib/utils";

interface DateTimePickerProps {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const { date, time } = splitDateTimeLocal(value ?? "");

  const handleDate = (d: Date | undefined) => {
    if (!d) {
      onChange(undefined);
      return;
    }
    onChange(mergeDateAndTime(d, time || "00:00"));
  };

  const handleTime = (t: string) => {
    if (!date) return;
    onChange(mergeDateAndTime(date, t));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date
                ? format(date, "dd.MM.yyyy", { locale: de })
                : "Datum wählen"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDate}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={time}
          onChange={(e) => handleTime(e.target.value)}
          className="w-28 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
          disabled={!date}
        />
      </div>
    </div>
  );
}
