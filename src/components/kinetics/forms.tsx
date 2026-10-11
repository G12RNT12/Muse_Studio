import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { retrigger } from "./motion";

export type FloatingHandle = { shake: () => void };

export const FloatingInput = forwardRef<
  FloatingHandle,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined }
>(function FloatingInput({ label, error, id, className, ...props }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ shake: () => retrigger(wrap.current, "k-shake", 460) }));
  const inputId = id ?? props.name;
  return (
    <div className={className}>
      <div ref={wrap} className={cn("k-float", error && "err")}>
        <input id={inputId} placeholder=" " aria-invalid={!!error} {...props} />
        <label htmlFor={inputId}>{label}</label>
      </div>
      {error && <p className="mt-1 font-mono text-xs text-destructive">{error}</p>}
    </div>
  );
});

export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  const ratio = (current - 1) / (steps.length - 1);
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute left-4 right-4 top-4 h-px bg-border">
        <div className="k-steps-fill h-full w-full" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <ol className="relative flex justify-between">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2">
            <span
              className={cn(
                "k-step-node grid h-8 w-8 place-items-center rounded-full border border-foreground bg-background font-mono text-xs",
                i + 1 <= current && "on",
              )}
            >
              {i + 1}
            </span>
            <span className="font-mono text-[11px] uppercase">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export type SubmitState = "idle" | "loading" | "done";

export function SubmitButton({
  state,
  label,
  onClick,
  className,
  disabled = false,
}: {
  state: SubmitState;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || state !== "idle"}
      className={cn(
        "k-squish relative grid h-14 place-items-center overflow-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "k-submit-state col-start-1 row-start-1 font-display font-bold uppercase",
          state !== "idle" && "translate-y-2 opacity-0",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "k-submit-state col-start-1 row-start-1 flex gap-1.5",
          state !== "loading" && "opacity-0",
        )}
        aria-hidden
      >
        {[0, 0.12, 0.24].map((d) => (
          <span key={d} className="k-dot" style={{ animationDelay: `${d}s` }} />
        ))}
      </span>
      <span
        className={cn("k-submit-state col-start-1 row-start-1", state !== "done" && "opacity-0")}
        aria-hidden
      >
        {state === "done" && (
          <svg
            className="k-check h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        )}
      </span>
    </button>
  );
}

export function useTimedFlag(ms: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [on, ms]);
  return [on, setOn] as const;
}
