export function calcularImc(peso: number, altura: number): number | null {
  if (altura <= 0 || peso <= 0) return null;
  return Math.round((peso / (altura * altura)) * 10) / 10;
}

export function clasificarImc(imc: number | null): string | null {
  if (imc == null) return null;
  if (imc < 18.5) return "bajo_peso";
  if (imc < 25) return "normal";
  if (imc < 30) return "sobrepeso";
  return "obesidad";
}
