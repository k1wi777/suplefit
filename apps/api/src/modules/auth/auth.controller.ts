import type { Request, Response } from "express";
import { PostgresAuthRepository } from "./postgres-auth.repository";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type { LoginDto, RegisterDto } from "./auth.dto";

const authService = new AuthService(new PostgresAuthRepository());

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<RegisterDto>(req, "body");
    const result = await authService.register(dto);
    return res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<LoginDto>(req, "body");
    const result = await authService.login(dto);
    return res.status(200).json(result);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.getCurrentUser(req.user!.userId);
    return res.json(result);
  });
}

export default new AuthController();
