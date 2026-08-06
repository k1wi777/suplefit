//Define el modelo/entidad (agnóstico de DB)
export interface User {
  id: number;
  nombre: string;
  correo: string;
  edad: number | null;
  peso: number | null;
  altura: number | null;
  sexo: "M" | "F" | "Otro" | null;
  nivelActividad: string | null;
  objetivo: string | null;
  createdAt: Date;
}

export interface UpdateUserData {
  nombre?: string;
  edad?: number;
  peso?: number;
  altura?: number;
  sexo?: "M" | "F" | "Otro";
  nivelActividad?: string;
  objetivo?: string;
  passwordHash?: string;
}