// Manejo HTTP (request/response); el body validado llega como DTO tipado
import type { Request, Response } from "express";
import { UserService } from "./user.service";
import { PostgresUserRepository } from "./postgres-user.repository";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type { UpdateUserDto } from "./user.dto";

const userService = new UserService(new PostgresUserRepository());

class UserController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await userService.getProfileWithImc(req.user!.userId);
    return res.json({ user: profile, isAdmin: req.user!.isAdmin });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<UpdateUserDto>(req, "body");
    const user = await userService.updateProfile(req.user!.userId, dto);
    return res.json({ user });
  });

  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteAccount(req.user!.userId);
    return res.json({ ok: true });
  });
}

export default new UserController();
