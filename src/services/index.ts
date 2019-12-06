import { AttributeMap } from "aws-sdk/clients/dynamodb";

import { MTGLMDynamoClient } from "mtglm-service-sdk/build/clients/dynamo";

import * as seasonMapper from "mtglm-service-sdk/build/mappers/season";

import { SuccessResponse, SeasonResponse } from "mtglm-service-sdk/build/models/Responses";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import { PROPERTIES_SEASON } from "mtglm-service-sdk/build/constants/mutable_properties";

const { SEASON_TABLE_NAME } = process.env;

const seasonClient = new MTGLMDynamoClient(SEASON_TABLE_NAME, PROPERTIES_SEASON);

const buildResponse = (season: AttributeMap): SeasonResponse => {
  const seasonNode = seasonMapper.toNode(season);

  return {
    ...seasonMapper.toView(seasonNode),
    matches: seasonNode.matchIds,
    players: seasonNode.playerIds
  };
};

export const create = async (data: SeasonCreateRequest): Promise<SeasonResponse> => {
  const seasonItem = seasonMapper.toCreateItem(data);

  const { seasonId, startDate } = seasonItem;

  const result = await seasonClient.create({ seasonId, startDate }, seasonItem);

  return buildResponse(result);
};

export const get = async (seasonId: string): Promise<SeasonResponse> => {
  const seasonResult = await seasonClient.fetchByKey({ seasonId });

  return buildResponse(seasonResult);
};

export const remove = async (seasonId: string): Promise<SuccessResponse> => {
  await seasonClient.remove({ seasonId });

  return { message: "Successfully deleted season." };
};

export const update = async (
  seasonId: string,
  data: SeasonUpdateRequest
): Promise<SeasonResponse> => {
  const seasonItem = seasonMapper.toUpdateItem(data);

  const result = await seasonClient.update({ seasonId }, seasonItem);

  return buildResponse(result);
};
