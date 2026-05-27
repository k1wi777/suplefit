export type Objetivo =
  | "ganar_masa_muscular"
  | "perder_grasa"
  | "recomposicion_corporal"
  | "resistencia"
  | "definicion"
  | "rendimiento";

export const objetivoToCategorySlugs: Record<string, string[]> = {
  ganar_masa_muscular: ["creatina", "whey-protein", "mass-gainer"],
  perder_grasa: ["l-carnitina", "quemadores", "proteina-aislada"],
  recomposicion_corporal: ["creatina", "whey-protein", "bcaa"],
  resistencia: ["electrolitos", "bcaa", "pre-entrenos"],
  definicion: ["l-carnitina", "proteina-aislada", "quemadores"],
  rendimiento: ["electrolitos", "pre-entrenos", "bcaa"],
};

