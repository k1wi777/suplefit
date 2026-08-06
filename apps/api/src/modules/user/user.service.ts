// Capa de servicio (lógica de negocio, sin HTTP ni SQL)
import bcrypt from "bcryptjs";
import type { UserRepository } from "./user.repository";
import type { UpdateUserData } from "./user.interfaces";
import type { UpdateUserDto } from "./user.dto";
import { calcularImc, clasificarImc } from "../../shared/domain/imc";
import { UserErrors } from "./user.errors";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getProfileWithImc(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw UserErrors.notFound();
    }

    const imc =
      user.peso != null && user.altura != null
        ? calcularImc(Number(user.peso), Number(user.altura))
        : null;
    const clasificacionImc = clasificarImc(imc);

    return { ...user, imc, clasificacionImc };
  }

  async updateProfile(userId: number, input: UpdateUserDto) {
    const data: UpdateUserData = {
      nombre: input.nombre,
      edad: input.edad,
      peso: input.peso,
      altura: input.altura,
      sexo: input.sexo,
      nivelActividad: input.nivelActividad,
      objetivo: input.objetivo,
    };

    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }

    const result = await this.userRepo.update(userId, data);
    if ("error" in result) {
      throw UserErrors.updateFailed(result.error);
    }
    return result;
  }

  async deleteAccount(userId: number) {
    return this.userRepo.delete(userId);
  }
}
