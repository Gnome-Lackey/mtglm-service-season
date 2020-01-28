import requestMiddleware from "mtglm-service-sdk/build/middleware/requestResource";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";

import * as controller from "../controllers";

module.exports.handler = requestMiddleware(async (): Promise<LambdaResponse> => {
  const response = await controller.current();

  return response;
}, true);
