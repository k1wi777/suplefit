import { CustomError } from "../../shared/errors/custom-error";

export type RecommendationErrorCode = "RECOMMENDATION_USER_NOT_FOUND";

export const RecommendationErrors = {
  userNotFound: () =>
    new CustomError<RecommendationErrorCode>({
      message: "Usuario no encontrado",
      statusCode: 404,
      code: "RECOMMENDATION_USER_NOT_FOUND",
    }),
};
