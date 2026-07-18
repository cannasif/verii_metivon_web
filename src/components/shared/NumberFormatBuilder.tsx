import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GripVertical, Hash, Plus, Tag, Trash2, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type NumberFormatToken = "SERIES" | "BRANCH" | "TYPE" | "YYYY" | "YY" | "MM" | "DD" | "NUMBER";

type Segment = {
  id: string;
  kind: "token" | "literal";
  token?: NumberFormatToken;
  text?: string;
  digits?: number;
};

const TOKEN_PATTERN = /\{(SERIES|BRANCH|TYPE|YYYY|YY|MM|DD|NUMBER(?::(\d{1,2}))?)\}/gi;
const DEFAULT_TOKENS: NumberFormatToken[] = ["SERIES", "BRANCH", "YYYY", "YY", "MM", "DD", "NUMBER"];
let segmentSequence = 0;
const segmentId = (): string => `number-format-part-${++segmentSequence}`;

function parseFormat(value: string): Segment[] {
  const result: Segment[] = [];
  let lastIndex = 0;
  for (const match of value.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) result.push({ id: segmentId(), kind: "literal", text: value.slice(lastIndex, index) });
    const rawToken = match[1].toUpperCase();
    const token: NumberFormatToken = rawToken.startsWith("NUMBER") ? "NUMBER" : rawToken as NumberFormatToken;
    result.push({ id: segmentId(), kind: "token", token, digits: token === "NUMBER" ? Math.min(18, Math.max(1, Number(match[2] || 6))) : undefined });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < value.length) result.push({ id: segmentId(), kind: "literal", text: value.slice(lastIndex) });
  if (result.length === 0) result.push({ id: segmentId(), kind: "token", token: "NUMBER", digits: 6 });
  return result;
}

function serialize(segments: Segment[]): string {
  return segments.map((segment) => segment.kind === "literal"
    ? segment.text ?? ""
    : segment.token === "NUMBER"
      ? `{NUMBER:${Math.min(18, Math.max(1, segment.digits ?? 6))}}`
      : `{${segment.token}}`).join("");
}

function preview(segments: Segment[], number: number, seriesCode: string): string {
  const now = new Date();
  const samples: Record<Exclude<NumberFormatToken, "NUMBER">, string> = {
    SERIES: seriesCode || "ABC",
    BRANCH: "IST",
    TYPE: "STK",
    YYYY: String(now.getFullYear()),
    YY: String(now.getFullYear()).slice(-2),
    MM: String(now.getMonth() + 1).padStart(2, "0"),
    DD: String(now.getDate()).padStart(2, "0"),
  };
  return segments.map((segment) => segment.kind === "literal"
    ? segment.text ?? ""
    : segment.token === "NUMBER"
      ? String(number).padStart(segment.digits ?? 6, "0")
      : samples[segment.token!]).join("");
}

function tokenIcon(token: NumberFormatToken): ReactElement {
  if (token === "NUMBER") return <Hash className="h-4 w-4" />;
  if (["YYYY", "YY", "MM", "DD"].includes(token)) return <CalendarDays className="h-4 w-4" />;
  return <Tag className="h-4 w-4" />;
}

function SortableSegment({ segment, label, canRemove, disabled, onChange, onRemove }: {
  segment: Segment;
  label: string;
  canRemove: boolean;
  disabled: boolean;
  onChange: (patch: Partial<Segment>) => void;
  onRemove: () => void;
}): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: segment.id, disabled });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex min-h-11 items-center gap-2 rounded-xl border bg-background p-2 shadow-sm", isDragging && "z-20 opacity-70 shadow-xl")}>
    <button type="button" disabled={disabled} className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-40" aria-label={label} {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></button>
    {segment.kind === "literal" ? <>
      <Type className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input aria-label={label} disabled={disabled} value={segment.text ?? ""} maxLength={20} onChange={(event) => onChange({ text: event.target.value })} className="h-8 min-w-20 flex-1" />
    </> : <>
      <span className="text-primary">{tokenIcon(segment.token!)}</span>
      <span className="whitespace-nowrap text-sm font-medium">{label}</span>
      {segment.token === "NUMBER" ? <Input aria-label={label} disabled={disabled} type="number" min={1} max={18} value={segment.digits ?? 6} onChange={(event) => onChange({ digits: Math.min(18, Math.max(1, Number(event.target.value) || 1)) })} className="h-8 w-16" /> : null}
    </>}
    <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || !canRemove} onClick={onRemove} aria-label={label}><Trash2 className="h-3.5 w-3.5" /></Button>
  </div>;
}

export function NumberFormatBuilder({ value, onChange, allowedTokens = DEFAULT_TOKENS, nextNumber = 1, seriesCode = "ABC", required = true, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  allowedTokens?: NumberFormatToken[];
  nextNumber?: number;
  seriesCode?: string;
  required?: boolean;
  disabled?: boolean;
}): ReactElement {
  const { t } = useTranslation("number-format-builder");
  const [segments, setSegments] = useState<Segment[]>(() => parseFormat(value));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const currentFormat = useMemo(() => serialize(segments), [segments]);

  useEffect(() => {
    const next = parseFormat(value);
    setSegments((current) => serialize(current) === serialize(next) ? current : next);
  }, [value]);

  const update = (next: Segment[]): void => {
    setSegments(next);
    onChange(serialize(next));
  };
  const addToken = (token: NumberFormatToken): void => update([...segments, { id: segmentId(), kind: "token", token, digits: token === "NUMBER" ? 6 : undefined }]);
  const addLiteral = (text = "-"): void => update([...segments, { id: segmentId(), kind: "literal", text }]);
  const dragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) return;
    const from = segments.findIndex((segment) => segment.id === active.id);
    const to = segments.findIndex((segment) => segment.id === over.id);
    if (from >= 0 && to >= 0) update(arrayMove(segments, from, to));
  };
  const usedTokens = new Set(segments.filter((segment) => segment.kind === "token").map((segment) => segment.token));
  const numberCount = segments.filter((segment) => segment.token === "NUMBER").length;

  return <div className="space-y-3 rounded-2xl border bg-muted/15 p-4">
    <div>
      <Label className="text-sm font-semibold">{t("parts")}{required ? <span className="ms-1 text-destructive">*</span> : null}</Label>
      <p className="mt-1 text-xs text-muted-foreground">{t("help")}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {allowedTokens.map((token) => <Button key={token} type="button" size="sm" variant="outline" disabled={disabled || usedTokens.has(token)} onClick={() => addToken(token)}>{tokenIcon(token)}{t(`tokens.${token}`)}</Button>)}
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => addLiteral()}><Plus /><Type />{t("fixedText")}</Button>
    </div>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
      <SortableContext items={segments.map((segment) => segment.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex min-h-16 flex-wrap gap-2 rounded-xl border border-dashed bg-background/70 p-3">
          {segments.map((segment, index) => <SortableSegment key={segment.id} segment={segment} label={segment.kind === "literal" ? t("fixedText") : t(`tokens.${segment.token}`)} canRemove={segment.token !== "NUMBER" || numberCount > 1} disabled={disabled} onChange={(patch) => update(segments.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))} onRemove={() => update(segments.filter((_, itemIndex) => itemIndex !== index))} />)}
        </div>
      </SortableContext>
    </DndContext>
    <div className="metivon-brand-soft rounded-xl border p-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("preview")}</span>
      <div className="mt-1 break-all font-mono text-lg font-bold">{preview(segments, nextNumber, seriesCode)}</div>
    </div>
    <details className="text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none">{t("technicalFormat")}</summary>
      <code className="mt-2 block break-all rounded-lg bg-muted p-2">{currentFormat}</code>
    </details>
  </div>;
}
