import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/i18n";
import { useCreateTag, useTags } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

function normalizeTagName(name: string): string {
  return name.trim().replace(/,/g, "");
}

function isValidNewTag(name: string): boolean {
  const n = normalizeTagName(name);
  return n.length >= 2 && n.length <= 100;
}

interface TagsComboboxProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagsCombobox({
  value,
  onChange,
  placeholder,
  className,
}: TagsComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data: suggestions = [], isLoading } = useTags(
    debouncedQuery,
    open,
  );
  const createTag = useCreateTag();

  const normalizedQuery = normalizeTagName(query);
  const canAddNew =
    isValidNewTag(query) &&
    !value.some((t) => t.toLowerCase() === normalizedQuery.toLowerCase()) &&
    !suggestions.some((t) => t.toLowerCase() === normalizedQuery.toLowerCase());

  const filteredSuggestions = useMemo(() => {
    const selected = new Set(value.map((t) => t.toLowerCase()));
    return suggestions.filter((t) => !selected.has(t.toLowerCase()));
  }, [suggestions, value]);

  const toggleTag = (tag: string) => {
    const key = tag.toLowerCase();
    if (value.some((t) => t.toLowerCase() === key)) {
      onChange(value.filter((t) => t.toLowerCase() !== key));
    } else {
      onChange([...value, tag]);
    }
    setQuery("");
  };

  const removeTag = (tag: string) => {
    const key = tag.toLowerCase();
    onChange(value.filter((t) => t.toLowerCase() !== key));
  };

  const handleAddNew = async () => {
    if (!canAddNew) return;
    const name = normalizedQuery;
    try {
      await createTag.mutateAsync(name);
      onChange([...value, name]);
      setQuery("");
    } catch {
      onChange([...value, name]);
      setQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-sm shadow-xs transition-colors hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            className,
          )}
        >
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-0.5 pr-1 font-normal"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              {tag}
              <X className="h-3 w-3 opacity-60" />
            </Badge>
          ))}
          <span className="text-muted-foreground">
            {value.length === 0
              ? (placeholder ?? t("timer.formTagsPlaceholder"))
              : ""}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("timer.formTagsSearch")}
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAddNew) {
                e.preventDefault();
                void handleAddNew();
              }
            }}
          />
        </div>
        <div className="max-h-48 overflow-y-auto p-1">
          {isLoading && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              {t("timer.formTagsLoading")}
            </p>
          )}
          {!isLoading && filteredSuggestions.length === 0 && !canAddNew && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              {t("timer.formTagsEmpty")}
            </p>
          )}
          {filteredSuggestions.map((tag) => {
            const selected = value.some(
              (t) => t.toLowerCase() === tag.toLowerCase(),
            );
            return (
              <button
                key={tag}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => toggleTag(tag)}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{tag}</span>
              </button>
            );
          })}
          {canAddNew && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-8 w-full justify-start"
              disabled={createTag.isPending}
              onClick={() => void handleAddNew()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("timer.formTagsAdd", { name: normalizedQuery })}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function tagsToKimaiString(tags: string[]): string | undefined {
  const cleaned = tags.map(normalizeTagName).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(",") : undefined;
}
