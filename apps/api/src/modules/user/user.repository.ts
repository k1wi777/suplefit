//Define la interfaz del repository (el contrato)
import type { User, UpdateUserData } from "./user.interfaces";

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  update(id: number, data: UpdateUserData): Promise<User | { error: string }>;
  delete(id: number): Promise<void>;
}
