import { logFailure, logSuccess } from "mtglm-service-sdk/build/utils/logger";
import { handleError, handleSuccess } from "mtglm-service-sdk/build/utils/response";

import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";
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

export const current = async (): Promise<LambdaResponse> => {
  try {
    const result = await service.getRecent();

    logSuccess("DYNAMO", "GET season", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET season", error);

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

export const getSeasonMetadata = async (seasonId: string): Promise<LambdaResponse> => {
  try {
    const result = await service.getSeasonMetadata(seasonId);

    logSuccess("DYNAMO", "GET season metadata", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET season metadata", error);

    return handleError(error);
  }
};

export const getSeasonMetadataForPlayer = async (seasonId: string, playerId: string): Promise<LambdaResponse> => {
  try {
    const result = await service.getSeasonMetadataForPlayer(seasonId, playerId);

    logSuccess("DYNAMO", "GET player season metadata", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET player season metadata", error);

    return handleError(error);
  }
};

export const query = async (queryParams: SeasonQueryParams): Promise<LambdaResponse> => {
  try {
    const result = await service.query(queryParams);

    logSuccess("DYNAMO", "GET all seasons", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET all seasons", error);

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
