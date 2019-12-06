import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonPathParameters } from "mtglm-service-sdk/build/models/PathParameters";

import * as controller from "../controllers";

module.exports.handler = requestMiddleware(
  async (path: SeasonPathParameters): Promise<LambdaResponse> => {
    const { seasonId } = path;

    const response = await controller.get(seasonId);

    return response;
  }
);
