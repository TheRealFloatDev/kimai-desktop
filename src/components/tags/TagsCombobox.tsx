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
import { KimaiColorDot } from "@/components/timesheet/ColorDot";
import { useTranslation } from "@/i18n";
import { useCreateTag, useTags } from "@/hooks/useApi";
import type { TagEntity } from "@/lib/api";
import { cn } from "@/lib/utils";

function normalizeTagName(name: string): string {
  return name.trim().replace(/,/g, "");
}

function isValidNewTag(name: string): boolean {
  const n = normalizeTagName(name);
  return n.length >= 2 && n.length <= 100;
}

function tagKey(name: string): string {
  return name.toLowerCase();
}

type TagColorMeta = Pick<TagEntity, "color" | "color_safe">;

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
  const [createError, setCreateError] = useState<string | null>(null);
  const [colorByName, setColorByName] = useState<Record<string, TagColorMeta>>(
    {},
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data: suggestions = [], isLoading } = useTags(
    debouncedQuery,
    open,
  );
  const createTag = useCreateTag();

  useEffect(() => {
    if (!suggestions.length) return;
    setColorByName((prev) => {
      const next = { ...prev };
      for (const tag of suggestions) {
        next[tagKey(tag.name)] = {
          color: tag.color,
          color_safe: tag.color_safe,
        };
      }
      return next;
    });
  }, [suggestions]);

  const normalizedQuery = normalizeTagName(query);
  const canAddNew =
    isValidNewTag(query) &&
    !value.some((t) => tagKey(t) === tagKey(normalizedQuery)) &&
    !suggestions.some((t) => tagKey(t.name) === tagKey(normalizedQuery));

  const filteredSuggestions = useMemo(() => {
    const selected = new Set(value.map(tagKey));
    return suggestions.filter((t) => !selected.has(tagKey(t.name)));
  }, [suggestions, value]);

  const addTag = (name: string, meta?: TagColorMeta) => {
    const key = tagKey(name);
    if (value.some((t) => tagKey(t) === key)) return;
    onChange([...value, name]);
    if (meta) {
      setColorByName((prev) => ({ ...prev, [key]: meta }));
    }
    setQuery("");
    setCreateError(null);
  };

  const toggleTag = (tag: TagEntity) => {
    const key = tagKey(tag.name);
    if (value.some((t) => tagKey(t) === key)) {
      onChange(value.filter((t) => tagKey(t) !== key));
    } else {
      addTag(tag.name, { color: tag.color, color_safe: tag.color_safe });
    }
  };

  const removeTag = (name: string) => {
    const key = tagKey(name);
    onChange(value.filter((t) => tagKey(t) !== key));
  };

  const handleAddNew = async () => {
    if (!canAddNew || createTag.isPending) return;
    const name = normalizedQuery;
    setCreateError(null);
    try {
      const created = await createTag.mutateAsync(name);
      addTag(created.name, {
        color: created.color,
        color_safe: created.color_safe,
      });
    } catch (e) {
      setCreateError(String(e));
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
              className="gap-1 pr-1 font-normal"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <KimaiColorDot entity={colorByName[tagKey(tag)]} />
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
            onChange={(e) => {
              setQuery(e.target.value);
              setCreateError(null);
            }}
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
          {createError && (
            <p className="px-2 py-1.5 text-xs text-destructive">{createError}</p>
          )}
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
              (t) => tagKey(t) === tagKey(tag.name),
            );
            return (
              <button
                key={tag.id}
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
                <KimaiColorDot entity={tag} />
                <span className="truncate">{tag.name}</span>
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
