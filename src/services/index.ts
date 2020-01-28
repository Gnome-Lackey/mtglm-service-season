import { AttributeMap } from "aws-sdk/clients/dynamodb";

import { MTGLMDynamoClient } from "mtglm-service-sdk/build/clients/dynamo";
import * as requestClient from "mtglm-service-sdk/build/clients/request";

import * as seasonMapper from "mtglm-service-sdk/build/mappers/season";
import * as playerMapper from "mtglm-service-sdk/build/mappers/player";
import * as scryfallMapper from "mtglm-service-sdk/build/mappers/scryfall";
import * as queryMapper from "mtglm-service-sdk/build/mappers/query";

import { SuccessResponse, SeasonDetailsResponse } from "mtglm-service-sdk/build/models/Responses";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";
import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";

import {
  PROPERTIES_SEASON,
  PROPERTIES_PLAYER
} from "mtglm-service-sdk/build/constants/mutable_properties";

const { PLAYER_TABLE_NAME, SEASON_TABLE_NAME } = process.env;

const seasonClient = new MTGLMDynamoClient(SEASON_TABLE_NAME, PROPERTIES_SEASON);
const playerClient = new MTGLMDynamoClient(PLAYER_TABLE_NAME, PROPERTIES_PLAYER);

const buildDetailResponse = async (season: AttributeMap): Promise<SeasonDetailsResponse> => {
  const seasonNode = seasonMapper.toNode(season);

  const playerIds = seasonNode.playerIds || [];
  const playerPromises = playerIds.map((playerId) => playerClient.fetchByKey({ playerId }));
  const playerResults = await Promise.all(playerPromises);
  const playerNodes = playerResults.map(playerMapper.toNode);

  const setResult = await requestClient.get(`https://api.scryfall.com/sets/${seasonNode.setCode}`);

  return {
    ...seasonMapper.toView(seasonNode),
    players: playerNodes.map(playerMapper.toView),
    // TODO: Find out best way to remove any
    set: scryfallMapper.toSetView(setResult as any)
  };
};

export const create = async (data: SeasonCreateRequest): Promise<SeasonDetailsResponse> => {
  const seasonItem = seasonMapper.toCreateItem(data);

  const { seasonId, startDate } = seasonItem;

  const result = await seasonClient.create({ seasonId, startDate }, seasonItem);

  return buildDetailResponse(result);
};

export const get = async (seasonId: string): Promise<SeasonDetailsResponse> => {
  const seasonResult = await seasonClient.fetchByKey({ seasonId });

  return buildDetailResponse(seasonResult);
};

export const getRecent = async (): Promise<SeasonDetailsResponse> => {
  const seasonResults = await seasonClient.query({
    isActive: true
  });

  if (!seasonResults.length) {
    return null;
  }

  const seasonResult = seasonResults.reduce((currentSeason, nextSeason) => {
    const currentSeasonEpoch = new Date(currentSeason.startDate as string).getTime();
    const nextSeasonEpoch = new Date(nextSeason.startDate as string).getTime();

    return currentSeasonEpoch < nextSeasonEpoch ? nextSeason : currentSeason;
  }, seasonResults[0]);

  return buildDetailResponse(seasonResult);
};

export const query = async (queryParams: SeasonQueryParams): Promise<SeasonDetailsResponse[]> => {
  const filters = queryMapper.toSeasonFilters(queryParams);

  const seasonResults = await seasonClient.query(filters);

  if (!seasonResults.length) {
    return [];
  }

  const detailedResults = await Promise.all(seasonResults.map(buildDetailResponse));

  return detailedResults;
};

export const remove = async (seasonId: string): Promise<SuccessResponse> => {
  await seasonClient.remove({ seasonId });

  return { message: "Successfully deleted season." };
};

export const update = async (
  seasonId: string,
  data: SeasonUpdateRequest
): Promise<SeasonDetailsResponse> => {
  const key = { seasonId, startDate: data.startedOn };

  const seasonItem = seasonMapper.toUpdateItem(data);

  const result = await seasonClient.update(key, seasonItem);

  return buildDetailResponse(result);
};
