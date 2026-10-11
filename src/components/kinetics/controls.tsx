import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { retrigger } from "./motion";

export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={(e) => {
            onChange(o);
            retrigger(e.currentTarget, "pop", 460);
          }}
          className={cn(
            "k-chip rounded-full px-4 py-1.5 font-mono text-xs uppercase",
            value === o && "on",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function TabPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 3, width: 0 });
  useLayoutEffect(() => {
    const el = wrap.current?.querySelector<HTMLElement>(`[data-v="${value}"]`);
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);
  return (
    <div ref={wrap} className="k-tabs" role="tablist">
      <span className="k-tabs-pill" style={{ left: pill.left, width: pill.width }} />
      {options.map((o) => (
        <button
          key={o.value}
          data-v={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "k-tab rounded-full px-4 py-1.5 font-mono text-xs uppercase",
            value === o.value && "active",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TogglePills({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o} className="k-pill relative cursor-pointer font-mono text-sm">
          <input
            type="radio"
            name={name}
            value={o}
            checked={value === o}
            onChange={() => onChange(o)}
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

export function SwatchPicker({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { name: string; hex: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-4 p-1">
      {options.map((o) => (
        <label key={o.name} className="k-swatch relative cursor-pointer" title={o.name}>
          <input
            type="radio"
            name={name}
            checked={value === o.name}
            onChange={() => onChange(o.name)}
            aria-label={o.name}
          />
          <span style={{ ["--sw" as string]: o.hex }} />
        </label>
      ))}
    </div>
  );
}

export function QuantityStepper({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  const val = useRef<HTMLSpanElement>(null);
  const set = (v: number) => {
    const n = Math.max(1, v);
    if (n !== value) {
      onChange(n);
      retrigger(val.current, "pop", 460);
    }
  };
  const h = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="inline-flex items-center border border-foreground">
      <button
        aria-label="Disminuir"
        className={cn("k-step-btn grid place-items-center", h)}
        onClick={() => set(value - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span ref={val} className="k-step-val w-8 text-center font-mono text-sm">
        {value}
      </span>
      <button
        aria-label="Aumentar"
        className={cn("k-step-btn grid place-items-center", h)}
        onClick={() => set(value + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LikeButton({
  liked,
  onToggle,
  label = "Favorito",
  className,
}: {
  liked: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}) {
  const [burst, setBurst] = useState(0);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      aria-pressed={liked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!liked) setBurst(Date.now());
        retrigger(ref.current, "pop", 520);
        onToggle();
      }}
      className={cn("k-like inline-flex items-center justify-center", className)}
    >
      <Heart className={cn("h-5 w-5", liked ? "fill-accent text-accent" : "text-foreground")} />
      {burst > 0 && (
        <span key={burst} aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="k-like-p"
              style={{ ["--a" as string]: `${i * 45}deg`, left: "10px" }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

export function confettiBurst(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const colors = ["var(--color-accent)", "var(--color-denim)", "var(--color-foreground)"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const d = 60 + Math.random() * 80;
    const p = document.createElement("span");
    p.className = "k-confetti";
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.background = colors[i % 3]!;
    p.style.setProperty("--x", `${Math.cos(a) * d}px`);
    p.style.setProperty("--y", `${Math.sin(a) * d}px`);
    p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

export function Accordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const body = useRef<HTMLDivElement>(null);
  return (
    <div className={cn("k-acc border-b border-border", open && "open")}>
      <button
        className="flex w-full items-center justify-between py-4 text-left font-display text-sm font-bold uppercase tracking-tight"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown className="k-acc-chev h-4 w-4" />
      </button>
      <div
        ref={body}
        className="k-acc-body"
        style={{ maxHeight: open ? (body.current?.scrollHeight ?? 500) : 0 }}
      >
        <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
