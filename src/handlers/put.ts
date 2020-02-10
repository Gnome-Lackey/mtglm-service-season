import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonPathParameters } from "mtglm-service-sdk/build/models/PathParameters";
import { SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import * as controller from "../controllers/season";

module.exports.handler = requestMiddleware(
  async (path: SeasonPathParameters, data: SeasonUpdateRequest): Promise<LambdaResponse> => {
    const { seasonId } = path;

    const response = await controller.update(seasonId, data);

    return response;
  },
  true
);
