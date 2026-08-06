export type RegisterInput = {
  nombre: string;
  correo: string;
  password: string;
  edad: number;
  peso: number;
  altura: number;
  sexo: "M" | "F" | "Otro";
  nivelActividad: string;
  objetivo: string;
  politicaVersion?: string;
};

export type LoginInput = {
  correo: string;
  password: string;
};

export type AuthUserSummary = {
  id: number;
  nombre: string;
  correo: string;
  objetivo: string;
};

export type AuthUserRecord = {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  objetivo: string;
};

export type AuthProfile = {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
  peso: number;
  altura: number;
  sexo: string;
  nivel_actividad: string;
  objetivo: string;
  created_at: string;
};

export type AuthMeResult = {
  user: {
    id: number;
    nombre: string;
    correo: string;
    edad: number;
    peso: number;
    altura: number;
    sexo: string;
    nivel_actividad: string;
    objetivo: string;
    created_at: string;
    imc: number | null;
    clasificacionImc: string | null;
  };
  resumenPeso: unknown;
  isAdmin: boolean;
};
