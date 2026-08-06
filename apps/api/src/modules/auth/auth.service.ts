import bcrypt from "bcryptjs";
import { signAccessToken } from "../../lib/jwt";
import type { AuthMeResult } from "./auth.interfaces";
import type { AuthRepository } from "./auth.repository";
import type { LoginDto, RegisterDto } from "./auth.dto";
import { AuthErrors } from "./auth.errors";

export class AuthService {
  constructor(private authRepo: AuthRepository) {}

  async register(input: RegisterDto) {
    const existing = await this.authRepo.findByEmail(input.correo);
    if (existing) {
      throw AuthErrors.emailAlreadyRegistered();
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userId = await this.authRepo.createUser({
      nombre: input.nombre,
      correo: input.correo,
      password: input.password,
      edad: input.edad,
      peso: input.peso,
      altura: input.altura,
      sexo: input.sexo,
      nivelActividad: input.nivelActividad,
      objetivo: input.objetivo,
      politicaVersion: input.politicaVersion,
      passwordHash,
      version: input.politicaVersion ?? "1.0",
    });

    if (userId == null) {
      throw AuthErrors.creationFailed();
    }

    const user = await this.authRepo.findByIdSummary(userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    return { user };
  }

  async login(input: LoginDto) {
    const user = await this.authRepo.findByEmail(input.correo);
    if (!user) {
      throw AuthErrors.invalidCredentials();
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) {
      throw AuthErrors.invalidCredentials();
    }

    const isAdmin = await this.authRepo.isAdmin(user.id);
    const token = signAccessToken({ userId: user.id, isAdmin });

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        objetivo: user.objetivo,
        isAdmin,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<AuthMeResult> {
    const profile = await this.authRepo.findProfile(userId);
    if (!profile) {
      throw AuthErrors.userNotFound();
    }

    const [{ imc, clasificacionImc }, resumenPeso, isAdmin] = await Promise.all([
      this.authRepo.getImcData(userId),
      this.authRepo.getWeightSummary(userId),
      this.authRepo.isAdmin(userId),
    ]);

    return {
      user: {
        ...profile,
        imc,
        clasificacionImc,
      },
      resumenPeso,
      isAdmin,
    };
  }
}
