import Link from "next/link";

export default function TerminosPage() {
  return (
    <main className="flex-1 px-4 py-12 max-w-3xl mx-auto text-white/80">
      <h1 className="text-white font-black text-3xl mb-6">Términos de uso</h1>
      <p className="text-sm text-white/50 mb-8">Versión 1.0 · SupleFit</p>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          SupleFit es una plataforma de acompañamiento fitness que combina catálogo de suplementos,
          seguimiento de hábitos y recomendaciones orientativas. No constituye asesoramiento médico.
        </p>
        <p>
          Las sugerencias de productos se basan en reglas configuradas (objetivo, nivel de actividad,
          disponibilidad) y deben validarse con un profesional de la salud o del deporte cuando corresponda.
        </p>
        <p>
          Eres responsable de la veracidad de los datos que ingresas y del uso que haces de los productos
          adquiridos. Los pedidos quedan en estado pendiente hasta que se defina un proceso de pago y envío.
        </p>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/privacidad" className="text-[#baff2e] hover:underline">
          Política de privacidad
        </Link>
        <Link href="/" className="text-white/60 hover:text-white">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
