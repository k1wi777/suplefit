import Link from "next/link";

type Props = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  imagenUrl: string | null;
  categoriaLabel?: string;
};

export default function RecommendedProductCard({
  id,
  nombre,
  descripcion,
  precio,
  imagenUrl,
  categoriaLabel = "Recomendado",
}: Props) {
  return (
    <Link
      href={`/supplements/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:border-[#baff2e]/40 hover:shadow-[0_0_40px_rgba(186,255,46,0.12)] transition-all duration-500 hover:-translate-y-1"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#baff2e]/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative aspect-[4/3] overflow-hidden bg-black/60 border-b border-white/10">
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagenUrl}
            alt={nombre}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/25 text-[10px] font-black uppercase tracking-widest">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/70 text-[#baff2e] border border-[#baff2e]/30 backdrop-blur-md">
          {categoriaLabel}
        </span>
      </div>

      <div className="relative z-10 flex flex-col flex-1 p-5">
        <h3 className="text-white font-black text-lg leading-tight group-hover:text-[#baff2e] transition-colors line-clamp-2">
          {nombre}
        </h3>
        <p className="text-white/50 text-xs mt-2 line-clamp-2 leading-relaxed flex-1">{descripcion}</p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-[#baff2e] font-black text-xl tracking-tight">
            ${Number(precio).toFixed(2)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#baff2e] transition-colors">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  );
}
