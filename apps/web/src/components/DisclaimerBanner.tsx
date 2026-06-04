type Props = {
  compact?: boolean;
};

export default function DisclaimerBanner({ compact }: Props) {
  return (
    <div
      className={`rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-100/90 ${
        compact ? "p-3 text-xs" : "p-4 text-sm"
      }`}
      role="note"
    >
      <strong className="text-amber-200">Aviso importante:</strong> Las recomendaciones y
      sugerencias de SupleFit son orientativas y no sustituyen la valoración de un nutricionista,
      médico o profesional del deporte. Consulta a un especialista si tienes condiciones de salud,
      tomas medicación o eres menor de edad.
    </div>
  );
}
