import type { AuthMeResult, AuthProfile, AuthUserRecord, AuthUserSummary, RegisterInput } from "./auth.interfaces";

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findByIdSummary(userId: number): Promise<AuthUserSummary | null>;
  createUser(input: RegisterInput & { passwordHash: string; version: string }): Promise<number | null>;
  findProfile(userId: number): Promise<AuthProfile | null>;
  getImcData(userId: number): Promise<{ imc: number | null; clasificacionImc: string | null }>;
  getWeightSummary(userId: number): Promise<unknown>;
  isAdmin(userId: number): Promise<boolean>;
}
