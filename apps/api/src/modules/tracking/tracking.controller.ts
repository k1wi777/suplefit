import type { Request, Response } from "express";
import { MySqlTrackingRepository } from "./mysql-tracking.repository";
import { TrackingService } from "./tracking.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type { RegisterWeightDto, SaveHabitDto } from "./tracking.dto";

const trackingService = new TrackingService(new MySqlTrackingRepository());

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

class TrackingController {
  getWeightHistory = asyncHandler(async (req: Request, res: Response) => {
    const historial = await trackingService.listWeightHistory(req.user!.userId);
    return res.json({ historial });
  });

  registerWeight = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<RegisterWeightDto>(req, "body");
    const result = await trackingService.registerWeight(req.user!.userId, {
      peso: dto.peso,
      registradoEn: dto.registradoEn ?? todayIsoDate(),
    });
    return res.status(201).json(result);
  });

  getHabits = asyncHandler(async (req: Request, res: Response) => {
    const habitos = await trackingService.listHabits(req.user!.userId);
    return res.json({ habitos });
  });

  saveHabit = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<SaveHabitDto>(req, "body");
    const result = await trackingService.saveHabit(req.user!.userId, {
      fecha: dto.fecha ?? todayIsoDate(),
      entrenamiento: dto.entrenamiento,
      descansoHoras: dto.descansoHoras,
      hidratacionLitros: dto.hidratacionLitros,
      notas: dto.notas,
    });
    return res.json(result);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const resumen = await trackingService.getSummary(req.user!.userId);
    return res.json(resumen);
  });
}

export default new TrackingController();
