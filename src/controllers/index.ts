import { logFailure, logSuccess } from "mtglm-service-sdk/build/utils/logger";
import { handleError, handleSuccess } from "mtglm-service-sdk/build/utils/response";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import * as service from "../services";

export const create = async (data: SeasonCreateRequest): Promise<LambdaResponse> => {
  try {
    const result = await service.create(data);

    logSuccess("DYNAMO", "POST season", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "POST season", error);

    return handleError(error);
  }
};

export const get = async (seasonId: string): Promise<LambdaResponse> => {
  try {
    const result = await service.get(seasonId);

    logSuccess("DYNAMO", "GET season", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET season", error);

    return handleError(error);
  }
};

export const remove = async (seasonId: string): Promise<LambdaResponse> => {
  try {
    const result = await service.remove(seasonId);

    logSuccess("DYNAMO", "DELETE season", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "DELETE season", error);

    return handleError(error);
  }
};

export const update = async (
  seasonId: string,
  data: SeasonUpdateRequest
): Promise<LambdaResponse> => {
  try {
    const result = await service.update(seasonId, data);

    logSuccess("DYNAMO", "UPDATE season", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "UPDATE season", error);

    return handleError(error);
  }
};