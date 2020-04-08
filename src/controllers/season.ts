import MTGLMLogger from "mtglm-service-sdk/build/utils/logger";
import ResponseHandler from "mtglm-service-sdk/build/utils/response";

import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";
import { LambdaResponse } from "mtglm-service-sdk/build/models/Lambda";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import SeasonService from "../services/season";

export default class SeasonController {
  private service = new SeasonService();

  private logger = new MTGLMLogger();
  private responseHandler = new ResponseHandler();

  create = async (data: SeasonCreateRequest): Promise<LambdaResponse> => {
    try {
      const result = await this.service.create(data);

      this.logger.success("DYNAMO", "POST season", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "POST season", error);

      return this.responseHandler.error(error);
    }
  };

  current = async (): Promise<LambdaResponse> => {
    try {
      const result = await this.service.getRecent();

      this.logger.success("DYNAMO", "GET season", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "GET season", error);

      return this.responseHandler.error(error);
    }
  };

  get = async (seasonId: string): Promise<LambdaResponse> => {
    try {
      const result = await this.service.get(seasonId);

      this.logger.success("DYNAMO", "GET season", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "GET season", error);

      return this.responseHandler.error(error);
    }
  };

  query = async (queryParams: SeasonQueryParams): Promise<LambdaResponse> => {
    try {
      const result = await this.service.query(queryParams);

      this.logger.success("DYNAMO", "GET all seasons", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "GET all seasons", error);

      return this.responseHandler.error(error);
    }
  };

  remove = async (seasonId: string): Promise<LambdaResponse> => {
    try {
      const result = await this.service.remove(seasonId);

      this.logger.success("DYNAMO", "DELETE season", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "DELETE season", error);

      return this.responseHandler.error(error);
    }
  };

  update = async (seasonId: string, data: SeasonUpdateRequest): Promise<LambdaResponse> => {
    try {
      const result = await this.service.update(seasonId, data);

      this.logger.success("DYNAMO", "UPDATE season", result);

      return this.responseHandler.success(result);
    } catch (error) {
      this.logger.failure("DYNAMO", "UPDATE season", error);

      return this.responseHandler.error(error);
    }
  };
}
