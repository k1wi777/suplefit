type Variant = "prev" | "start" | "total";

type Props = {
  delta: number | null;
  label?: string;
  size?: "sm" | "md";
  variant?: Variant;
};

function variantStyles(variant: Variant, gained: boolean, neutral: boolean) {
  if (neutral) {
    if (variant === "prev") {
      return { color: "text-sky-200/70", bg: "bg-sky-500/10 border-sky-400/20" };
    }
    if (variant === "start") {
      return { color: "text-amber-200/70", bg: "bg-amber-500/10 border-amber-400/20" };
    }
    return { color: "text-white/50", bg: "bg-white/10 border-white/15" };
  }
  if (variant === "prev") {
    return gained
      ? { color: "text-sky-300", bg: "bg-sky-500/20 border-sky-400/40" }
      : { color: "text-cyan-300", bg: "bg-cyan-500/20 border-cyan-400/40" };
  }
  if (variant === "start") {
    return gained
      ? { color: "text-amber-300", bg: "bg-amber-500/20 border-amber-400/40" }
      : { color: "text-violet-300", bg: "bg-violet-500/20 border-violet-400/40" };
  }
  return gained
    ? { color: "text-sky-400", bg: "bg-sky-400/15 border-sky-400/30" }
    : { color: "text-[#baff2e]", bg: "bg-[#baff2e]/20 border-[#baff2e]/40" };
}

export default function WeightDeltaBadge({
  delta,
  label,
  size = "sm",
  variant = "total",
}: Props) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 text-white/40 text-xs font-semibold">
        <span className="opacity-60">—</span>
        {label ? <span>{label}</span> : null}
      </span>
    );
  }

  const neutral = Math.abs(delta) < 0.05;
  const gained = delta > 0;
  const { color, bg } = variantStyles(variant, gained, neutral);
  const iconSize = size === "md" ? 14 : 12;

  if (neutral) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wide ${color} ${bg}`}
      >
        <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
          =
        </span>
        Sin cambio
        {label ? <span className="font-normal normal-case opacity-80 ml-0.5">{label}</span> : null}
      </span>
    );
  }

  const text = `${gained ? "+" : ""}${delta.toFixed(1)} kg`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wide ${color} ${bg}`}
    >
      {gained ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      )}
      {text}
      {label ? <span className="font-normal normal-case opacity-75 ml-0.5">{label}</span> : null}
    </span>
  );
}
