import { CustomError } from "../../shared/errors/custom-error";

export type TrackingErrorCode = "TRACKING_WEIGHT_REGISTER_FAILED";

export const TrackingErrors = {
  weightRegisterFailed: () =>
    new CustomError<TrackingErrorCode>({
      message: "No se pudo registrar el peso",
      statusCode: 500,
      code: "TRACKING_WEIGHT_REGISTER_FAILED",
    }),
};
