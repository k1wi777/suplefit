import Link from "next/link";

type Props = {
  className?: string;
};

function LightningIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="32"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M13 2L4 15h7l-1 11 9-14h-7l1-10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLogo({ className = "" }: Props) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 shrink-0 ${className}`}
      aria-label="SupleFit — Inicio"
    >
      <span className="relative flex items-center justify-center text-[#baff2e] shrink-0 transition-transform duration-300 group-hover:scale-105">
        <span
          className="absolute inset-0 blur-md bg-[#baff2e]/25 rounded-full scale-75"
          aria-hidden
        />
        <LightningIcon className="relative drop-shadow-[0_0_10px_rgba(186,255,46,0.45)]" />
      </span>

      {/* Móvil: nombre sin tagline */}
      <div className="flex flex-col sm:hidden leading-none">
        <span className="text-base font-black tracking-tight">
          <span className="text-white">Suple</span>
          <span className="text-[#baff2e]">Fit</span>
        </span>
      </div>

      {/* Tablet+ : nombre + tagline como referencia */}
      <div className="hidden sm:flex flex-col justify-center min-w-0">
        <span className="text-lg md:text-xl font-black tracking-tight leading-none">
          <span className="text-white">Suple</span>
          <span className="text-[#baff2e] group-hover:text-[#d4ff63] transition-colors">Fit</span>
        </span>
        <span className="text-white/50 text-[10px] md:text-[11px] font-normal mt-1 tracking-wide">
          Fitness y nutrición
        </span>
      </div>
    </Link>
  );
}
