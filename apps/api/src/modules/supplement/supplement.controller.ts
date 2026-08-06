import type { Request, Response } from "express";
import { SupplementService } from "./supplement.service";
import { PostgresSupplementRepository } from "./postgres-supplement.repository";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type {
  GetSupplementParamsDto,
  ListSupplementsQueryDto,
} from "./supplement.dto";

const supplementService = new SupplementService(
  new PostgresSupplementRepository(),
);

class SupplementController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = getValidated<ListSupplementsQueryDto>(req, "query");
    const result = await supplementService.listSupplements({
      categorySlug: query.categorySlug,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });
    return res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const params = getValidated<GetSupplementParamsDto>(req, "params");
    const result = await supplementService.getSupplementById(params.id);
    return res.json(result);
  });
}

export default new SupplementController();
