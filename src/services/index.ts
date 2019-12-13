import { AttributeMap } from "aws-sdk/clients/dynamodb";

import { MTGLMDynamoClient } from "mtglm-service-sdk/build/clients/dynamo";
import * as requestClient from "mtglm-service-sdk/build/clients/request";

import * as seasonMapper from "mtglm-service-sdk/build/mappers/season";
import * as playerMapper from "mtglm-service-sdk/build/mappers/player";
import * as scryfallMapper from "mtglm-service-sdk/build/mappers/scryfall";

import {
  SuccessResponse,
  SeasonResponse,
  SeasonDetailsResponse
} from "mtglm-service-sdk/build/models/Responses";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";

import {
  PROPERTIES_SEASON,
  PROPERTIES_PLAYER
} from "mtglm-service-sdk/build/constants/mutable_properties";

const { PLAYER_TABLE_NAME, SEASON_TABLE_NAME } = process.env;

const seasonClient = new MTGLMDynamoClient(SEASON_TABLE_NAME, PROPERTIES_SEASON);
const playerClient = new MTGLMDynamoClient(PLAYER_TABLE_NAME, PROPERTIES_PLAYER);

const buildResponse = (season: AttributeMap): SeasonResponse => {
  const seasonNode = seasonMapper.toNode(season);

  return {
    ...seasonMapper.toView(seasonNode),
    set: seasonNode.setCode,
    players: seasonNode.playerIds
  };
};

const buildDetailResponse = async (season: AttributeMap): Promise<SeasonDetailsResponse> => {
  const seasonNode = seasonMapper.toNode(season);

  const players = (await Promise.all(
    seasonNode.playerIds.map((id) => playerClient.fetchByKey({ playerId: id }))
  )) as AttributeMap[];

  const playerNodes = players.map(playerMapper.toNode);

  const set = await requestClient.get(`https://api.scryfall.com/sets/${seasonNode.setCode}`);

  return {
    ...seasonMapper.toView(seasonNode),
    players: playerNodes.map(playerMapper.toView),
    // TODO: Find out best way to remove any
    set: scryfallMapper.toSetView(set as any)
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

export const fetchDetails = async (): Promise<SeasonDetailsResponse[]> => {
  const seasonResults = await seasonClient.query();

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
): Promise<SeasonResponse> => {
  const seasonItem = seasonMapper.toUpdateItem(data);

  const result = await seasonClient.update({ seasonId }, seasonItem);

  return buildResponse(result);
};
