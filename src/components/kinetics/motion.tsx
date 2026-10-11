import {
  Children,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Re-trigger a CSS animation class by forcing a reflow. */
export function retrigger(el: HTMLElement | null, cls: string, ms?: number) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  if (ms) setTimeout(() => el.classList.remove(cls), ms);
}

export function SquishButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cn("k-squish", className)} />;
}

export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const zone = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={zone}
      className={cn("inline-block p-6 -m-6", className)}
      onMouseMove={(e) => {
        const r = inner.current!.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        inner.current!.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        inner.current!.style.transform = "translate(0,0)";
      }}
    >
      <div ref={inner} className="k-magnetic">
        {children}
      </div>
    </div>
  );
}

export function SplitText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={cn("k-split", className)} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden style={{ animationDelay: `${delay + i * 40}ms` }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 px-4">
          <span>{t}</span>
          <span aria-hidden className="text-accent">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("k-marquee", className)}>
      <div className="k-marquee-track">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const items = Array.from(ref.current?.children ?? []) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement;
            el.style.transitionDelay = `${Number(el.dataset["i"]) * 90}ms`;
            el.classList.add("is-in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1 },
    );
    items.forEach((el, i) => {
      el.dataset["i"] = String(i % 8);
      el.classList.add("k-stagger");
      el.classList.remove("is-in");
      io.observe(el);
    });
    return () => io.disconnect();
  });
  return (
    <div ref={ref} className={className}>
      {Children.toArray(children)}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("k-shimmer", className)} />;
}

export function NumberCounter({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) retrigger(ref.current, "bump", 420);
    prev.current = value;
  }, [value]);
  return (
    <span ref={ref} className="k-num">
      {format(value)}
    </span>
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
