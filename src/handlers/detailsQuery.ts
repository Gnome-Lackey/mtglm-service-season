import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonPathParameters } from "mtglm-service-sdk/build/models/PathParameters";
import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";

import SeasonController from "../controllers/season";

const controller = new SeasonController();

module.exports.handler = requestMiddleware(
  async (
    path: SeasonPathParameters,
    data: object,
    query: SeasonQueryParams
  ): Promise<LambdaResponse> => {
    const response = await controller.query(query);

    return response;
  }
);
