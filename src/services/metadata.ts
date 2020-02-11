import { AttributeMap } from "aws-sdk/clients/dynamodb";

import { MTGLMDynamoClient } from "mtglm-service-sdk/build/clients/dynamo";

import * as matchMapper from "mtglm-service-sdk/build/mappers/match";
import * as seasonMapper from "mtglm-service-sdk/build/mappers/season";

import { SeasonMetadataResponse, SuccessResponse } from "mtglm-service-sdk/build/models/Responses";

import {
  PROPERTIES_SEASON_METADATA,
  PROPERTIES_MATCH
} from "mtglm-service-sdk/build/constants/mutable_properties";

const { SEASON_METADATA_TABLE_NAME, MATCH_TABLE_NAME } = process.env;

const seasonMetadataClient = new MTGLMDynamoClient(
  SEASON_METADATA_TABLE_NAME,
  PROPERTIES_SEASON_METADATA
);

const matchClient = new MTGLMDynamoClient(MATCH_TABLE_NAME, PROPERTIES_MATCH);

const buildSeasonMetadataResponse = async (
  result: AttributeMap
): Promise<SeasonMetadataResponse> => {
  const node = seasonMapper.toMetadataNode(result);
  const view = seasonMapper.toMetadataView(node);

  const matchResults = await matchClient.fetchByKeys(node.matchIds.map((id) => ({ matchId: id })));
  const matchNodes = matchResults.map(matchMapper.toNode);
  const matchViews = matchNodes.map(matchMapper.toView);

  return {
    ...view,
    player: node.playerId,
    season: node.seasonId,
    matches: matchViews,
    playedOpponents: node.playedOpponentIds
  };
};

export const create = async (
  seasonId: string,
  playerId: string,
  players: string[]
): Promise<SeasonMetadataResponse> => {
  const seasonMetadataItem = seasonMapper.toMetadataCreateItem(seasonId, playerId, players);

  const result = await seasonMetadataClient.create({ seasonId, playerId }, seasonMetadataItem);

  return buildSeasonMetadataResponse(result);
};

export const remove = async (seasonId: string): Promise<SuccessResponse> => {
  const seasonMetadataResults = await seasonMetadataClient.query({ seasonId });

  if (!seasonMetadataResults.length) {
    throw new Error("Error deleting metadata. Invalid season id supplied.");
  }

  const seasonMetadataNodes = seasonMetadataResults.map(seasonMapper.toMetadataNode);

  await Promise.all(
    seasonMetadataNodes.map((node) =>
      seasonMetadataClient.remove({ seasonId, playerId: node.playerId })
    )
  );

  return { message: "Successfully deleted season metadata." };
};

export const getSeasonMetadata = async (seasonId: string): Promise<SeasonMetadataResponse[]> => {
  const seasonMetadataResults = await seasonMetadataClient.query({ seasonId });

  if (!seasonMetadataResults.length) {
    throw new Error("Error getting metadata. Invalid season id supplied.");
  }

  return await Promise.all(seasonMetadataResults.map(buildSeasonMetadataResponse));
};

export const getSeasonMetadataForPlayer = async (
  seasonId: string,
  playerId: string
): Promise<SeasonMetadataResponse> => {
  const seasonPlayerMetadataResults = await seasonMetadataClient.query({ seasonId, playerId });

  if (!seasonPlayerMetadataResults.length) {
    throw new Error("Error getting metadata. Invalid player or season id supplied.");
  }

  const seasonMetadata = seasonPlayerMetadataResults[0];

  return await buildSeasonMetadataResponse(seasonMetadata);
};
