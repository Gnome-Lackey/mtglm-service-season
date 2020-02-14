import { AttributeMap } from "aws-sdk/clients/dynamodb";

import { MTGLMDynamoClient } from "mtglm-service-sdk/build/clients/dynamo";
import * as requestClient from "mtglm-service-sdk/build/clients/request";

import * as metadataService from "./metadata";

import * as seasonMapper from "mtglm-service-sdk/build/mappers/season";
import * as playerMapper from "mtglm-service-sdk/build/mappers/player";
import * as scryfallMapper from "mtglm-service-sdk/build/mappers/scryfall";
import * as queryMapper from "mtglm-service-sdk/build/mappers/query";

import * as standingsUtil from "mtglm-service-sdk/build/utils/standings";

import { SuccessResponse, SeasonResponse } from "mtglm-service-sdk/build/models/Responses";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";
import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";

import {
  PROPERTIES_SEASON,
  PROPERTIES_PLAYER
} from "mtglm-service-sdk/build/constants/mutable_properties";

const { PLAYER_TABLE_NAME, SEASON_TABLE_NAME } = process.env;

const playerClient = new MTGLMDynamoClient(PLAYER_TABLE_NAME, PROPERTIES_PLAYER);
const seasonClient = new MTGLMDynamoClient(SEASON_TABLE_NAME, PROPERTIES_SEASON);

const buildDetailResponse = async (season: AttributeMap): Promise<SeasonResponse> => {
  const seasonNode = seasonMapper.toNode(season);

  const playerIds = seasonNode.playerIds || [];
  const playerPromises = playerIds.map((playerId) => playerClient.fetchByKey({ playerId }));
  const playerResults = await Promise.all(playerPromises);
  const playerNodes = playerResults.map(playerMapper.toNode);
  const sortedPlayerNodes = standingsUtil.sort(playerNodes);

  const setResult = await requestClient.get(`https://api.scryfall.com/sets/${seasonNode.setCode}`);

  return {
    ...seasonMapper.toView(seasonNode),
    players: sortedPlayerNodes.map(playerMapper.toView),
    // TODO: Find out best way to remove any
    set: scryfallMapper.toSetView(setResult as any)
  };
};

export const create = async (data: SeasonCreateRequest): Promise<SeasonResponse> => {
  const seasonItem = seasonMapper.toCreateItem(data);

  const { seasonId, playerIds } = seasonItem;

  await metadataService.createAll(seasonId, playerIds);

  const result = await seasonClient.create({ seasonId }, seasonItem);

  return buildDetailResponse(result);
};

export const get = async (seasonId: string): Promise<SeasonResponse> => {
  const seasonResults = await seasonClient.query({ seasonId });

  if (!seasonResults.length) {
    return null;
  }

  return buildDetailResponse(seasonResults[0]);
};

export const getRecent = async (): Promise<SeasonResponse> => {
  const seasonResults = await seasonClient.query({ isActive: true });

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

export const query = async (queryParams: SeasonQueryParams): Promise<SeasonResponse[]> => {
  const filters = queryMapper.toSeasonFilters(queryParams);

  const seasonResults = await seasonClient.query(filters);

  if (!seasonResults.length) {
    return [];
  }

  const detailedResults = await Promise.all(seasonResults.map(buildDetailResponse));

  return detailedResults;
};

export const remove = async (seasonId: string): Promise<SuccessResponse> => {
  await metadataService.remove(seasonId);

  await seasonClient.remove({ seasonId });

  return { message: "Successfully deleted season." };
};

export const update = async (
  seasonId: string,
  data: SeasonUpdateRequest
): Promise<SeasonResponse> => {
  const seasonItem = seasonMapper.toUpdateItem(data);

  await metadataService.createAll(seasonId, data.players);

  const result = await seasonClient.update({ seasonId }, seasonItem);

  return buildDetailResponse(result);
};
