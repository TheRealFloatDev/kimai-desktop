import { cn, kimaiEntityColor } from "@/lib/utils";

export function ColorDot({
  color,
  className,
}: {
  color?: string | null;
  className?: string;
}) {
  const resolved = color ?? undefined;
  if (!resolved) return null;
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-border/60",
        className,
      )}
      style={{ backgroundColor: resolved }}
      aria-hidden
    />
  );
}

export function KimaiColorDot({
  entity,
  className,
}: {
  entity?: { color?: string; color_safe?: string } | null;
  className?: string;
}) {
  return <ColorDot color={kimaiEntityColor(entity)} className={className} />;
}
