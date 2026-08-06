export type WeightHistoryItem = {
  id: number;
  peso: number;
  registradoEn: string;
  createdAt: string;
};

export type HabitItem = {
  fecha: string;
  entrenamiento: boolean;
  descansoHoras: number | null;
  hidratacionLitros: number | null;
  notas: string | null;
};

export type TrackingSummary = {
  entrenosSemana: number;
  hidratacionPromedio: number | null;
  deltaPesoSemanal: number | null;
};

export type RegisterWeightInput = {
  peso: number;
  registradoEn: string;
};

export type SaveHabitInput = {
  fecha: string;
  entrenamiento?: boolean;
  descansoHoras?: number;
  hidratacionLitros?: number;
  notas?: string;
};
