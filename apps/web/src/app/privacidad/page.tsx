import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="flex-1 px-4 py-12 max-w-3xl mx-auto text-white/80">
      <h1 className="text-white font-black text-3xl mb-6">Política de privacidad</h1>
      <p className="text-sm text-white/50 mb-8">Versión 1.0 · SupleFit</p>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-white font-bold text-lg">Qué datos recopilamos</h2>
        <p>
          Al registrarte podemos solicitar nombre, correo, edad, peso, altura, sexo, nivel de actividad y
          objetivo físico. También registramos pedidos confirmados y, si lo indicas, hábitos de entrenamiento
          e historial de peso.
        </p>

        <h2 className="text-white font-bold text-lg">Para qué los usamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Calcular indicadores como el IMC en tu dashboard.</li>
          <li>Generar sugerencias orientativas de suplementos según tu perfil.</li>
          <li>Gestionar pedidos en estado pendiente.</li>
          <li>Mejorar tu experiencia dentro de la plataforma.</li>
        </ul>
        <p>No vendemos tus datos personales a terceros.</p>

        <h2 className="text-white font-bold text-lg">Tus derechos</h2>
        <p>
          Puedes editar tu información en Perfil o solicitar la eliminación de tu cuenta, lo que borrará
          recomendaciones, seguimiento y pedidos asociados.
        </p>

        <h2 className="text-white font-bold text-lg">Conservación</h2>
        <p>
          Conservamos los datos mientras mantengas tu cuenta activa. Tras eliminarla, los datos vinculados
          se eliminan de nuestra base de datos.
        </p>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/terminos" className="text-[#baff2e] hover:underline">
          Términos de uso
        </Link>
        <Link href="/" className="text-white/60 hover:text-white">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
