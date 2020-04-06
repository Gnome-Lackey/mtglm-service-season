import { logFailure, logSuccess } from "mtglm-service-sdk/build/utils/logger";
import { handleError, handleSuccess } from "mtglm-service-sdk/build/utils/response";

import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";
import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import SeasonService from "../services/season";

export default class SeasonController {
  private service = new SeasonService();

  async create(data: SeasonCreateRequest): Promise<LambdaResponse> {
    try {
      const result = await this.service.create(data);

      logSuccess("DYNAMO", "POST season", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "POST season", error);

      return handleError(error);
    }
  }

  async current(): Promise<LambdaResponse> {
    try {
      const result = await this.service.getRecent();

      logSuccess("DYNAMO", "GET season", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "GET season", error);

      return handleError(error);
    }
  }

  async get(seasonId: string): Promise<LambdaResponse> {
    try {
      const result = await this.service.get(seasonId);

      logSuccess("DYNAMO", "GET season", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "GET season", error);

      return handleError(error);
    }
  }

  async query(queryParams: SeasonQueryParams): Promise<LambdaResponse> {
    try {
      const result = await this.service.query(queryParams);

      logSuccess("DYNAMO", "GET all seasons", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "GET all seasons", error);

      return handleError(error);
    }
  }

  async remove(seasonId: string): Promise<LambdaResponse> {
    try {
      const result = await this.service.remove(seasonId);

      logSuccess("DYNAMO", "DELETE season", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "DELETE season", error);

      return handleError(error);
    }
  }

  async update(seasonId: string, data: SeasonUpdateRequest): Promise<LambdaResponse> {
    try {
      const result = await this.service.update(seasonId, data);

      logSuccess("DYNAMO", "UPDATE season", result);

      return handleSuccess(result);
    } catch (error) {
      logFailure("DYNAMO", "UPDATE season", error);

      return handleError(error);
    }
  }
}
