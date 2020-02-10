import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonPathParameters } from "mtglm-service-sdk/build/models/PathParameters";
import { SeasonCreateRequest } from "mtglm-service-sdk/build/models/Requests";

import * as controller from "../controllers/season";

module.exports.handler = requestMiddleware(
  async (path: SeasonPathParameters, data: SeasonCreateRequest): Promise<LambdaResponse> => {
    const response = await controller.create(data);

    return response;
  },
  true
);
