import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";

import SeasonController from "../controllers/season";

const controller = new SeasonController();

module.exports.handler = requestMiddleware(
  async (): Promise<LambdaResponse> => {
    const response = await controller.current();

    return response;
  }
);
