export function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-hidden="true">
      <span className="grid h-10 w-11 place-items-center bg-foreground font-display text-xl font-black leading-none tracking-[-0.12em] text-background">
        MS
      </span>
      <span className="flex flex-col font-display text-[10px] font-black uppercase leading-[1.05] tracking-[0.16em]">
        <span>Muse</span>
        <span>Studio</span>
      </span>
    </span>
  );
}
