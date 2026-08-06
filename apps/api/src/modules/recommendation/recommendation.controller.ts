import type { Request, Response } from "express";
import { RecommendationService } from "./recommendation.service";
import { MySqlRecommendationRepository } from "./mysql-recommendation.repository";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type { GetHistoryQueryDto } from "./recommendation.dto";

const recommendationService = new RecommendationService(
  new MySqlRecommendationRepository(),
);

class RecommendationController {
  getCurrent = asyncHandler(async (req: Request, res: Response) => {
    const result = await recommendationService.getCurrentForUser(
      req.user!.userId,
    );
    return res.json(result);
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const query = getValidated<GetHistoryQueryDto>(req, "query");
    const history = await recommendationService.getHistoryForUser(
      req.user!.userId,
      query.limit,
    );
    return res.json({ history });
  });
}

export default new RecommendationController();
