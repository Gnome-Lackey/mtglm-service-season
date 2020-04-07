import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonPathParameters } from "mtglm-service-sdk/build/models/PathParameters";

import SeasonController from "../controllers/season";

const controller = new SeasonController();

module.exports.handler = requestMiddleware(
  async (path: SeasonPathParameters): Promise<LambdaResponse> => {
    const { seasonId } = path;

    const response = await controller.remove(seasonId);

    return response;
  }
);
