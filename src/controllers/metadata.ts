import { logFailure, logSuccess } from "mtglm-service-sdk/build/utils/logger";
import { handleError, handleSuccess } from "mtglm-service-sdk/build/utils/response";

import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";

import * as service from "../services/metadata";

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

export const getSeasonMetadataForPlayer = async (
  seasonId: string,
  playerId: string
): Promise<LambdaResponse> => {
  try {
    const result = await service.getSeasonMetadataForPlayer(seasonId, playerId);

    logSuccess("DYNAMO", "GET player season metadata", result);

    return handleSuccess(result);
  } catch (error) {
    logFailure("DYNAMO", "GET player season metadata", error);

    return handleError(error);
  }
};
