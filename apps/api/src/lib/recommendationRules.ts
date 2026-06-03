export type Objetivo =
  | "ganar_masa_muscular"
  | "perder_grasa"
  | "recomposicion_corporal"
  | "resistencia"
  | "definicion"
  | "rendimiento";

export const objetivoToCategorySlugs: Record<string, string[]> = {
  ganar_masa_muscular: ["creatina", "whey-protein", "mass-gainer"],
  perder_grasa: ["l-carnitina", "proteina-aislada", "electrolitos", "soporte-nutricional"],
  recomposicion_corporal: ["creatina", "whey-protein", "bcaa"],
  resistencia: ["electrolitos", "bcaa", "pre-entrenos"],
  definicion: ["l-carnitina", "proteina-aislada", "electrolitos"],
  rendimiento: ["electrolitos", "pre-entrenos", "bcaa"],
};

/** Categorías a depriorizar cuando el usuario es sedentario o poco activo */
export const highStimSlugs = ["pre-entrenos", "soporte-nutricional"];

export const objetivoLabels: Record<Objetivo, string> = {
  ganar_masa_muscular: "Ganar masa muscular",
  perder_grasa: "Bienestar y composición corporal",
  recomposicion_corporal: "Recomposición corporal",
  resistencia: "Resistencia",
  definicion: "Definición y tono",
  rendimiento: "Rendimiento deportivo",
};

