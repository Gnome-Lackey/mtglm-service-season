import { AttributeMap } from "aws-sdk/clients/dynamodb";

import MTGLMDynamoClient from "mtglm-service-sdk/build/clients/dynamo";
import MTGLMRequestClient from "mtglm-service-sdk/build/clients/request";

import SeasonMapper from "mtglm-service-sdk/build/mappers/season";
import PlayerMapper from "mtglm-service-sdk/build/mappers/player";
import ScryfallMapper from "mtglm-service-sdk/build/mappers/scryfall";

import { SuccessResponse, SeasonResponse } from "mtglm-service-sdk/build/models/Responses";
import { SeasonCreateRequest, SeasonUpdateRequest } from "mtglm-service-sdk/build/models/Requests";
import { SeasonQueryParams } from "mtglm-service-sdk/build/models/QueryParameters";

import {
  PROPERTIES_SEASON,
  PROPERTIES_PLAYER
} from "mtglm-service-sdk/build/constants/mutable_properties";

export default class SeasonService {
  private playerTableName = process.env.PLAYER_TABLE_NAME;
  private seasonTableName = process.env.SEASON_TABLE_NAME;

  private seasonMapper = new SeasonMapper();
  private playerMapper = new PlayerMapper();
  private scryfallMapper = new ScryfallMapper();

  private playerClient = new MTGLMDynamoClient(this.playerTableName, PROPERTIES_PLAYER);
  private seasonClient = new MTGLMDynamoClient(this.seasonTableName, PROPERTIES_SEASON);
  private requestClient = new MTGLMRequestClient();

  private async buildDetailResponse(season: AttributeMap): Promise<SeasonResponse> {
    const seasonNode = this.seasonMapper.toNode(season);

    const playerIds = seasonNode.playerIds || [];
    const playerPromises = playerIds.map((playerId) => this.playerClient.fetchByKey({ playerId }));
    const playerResults = await Promise.all(playerPromises);
    const playerNodes = playerResults.map(this.playerMapper.toNode);

    const setUrl = `https://api.scryfall.com/sets/${seasonNode.setCode}`;
    const setResult = await this.requestClient.get(setUrl);

    return {
      ...this.seasonMapper.toView(seasonNode),
      players: playerNodes.map(this.playerMapper.toView),
      set: this.scryfallMapper.toSetView(setResult as any)
    };
  }

  async create(data: SeasonCreateRequest): Promise<SeasonResponse> {
    const seasonItem = this.seasonMapper.toCreateItem(data);

    const { seasonId } = seasonItem;

    const result = await this.seasonClient.create({ seasonId }, seasonItem);

    return this.buildDetailResponse(result);
  }

  async get(seasonId: string): Promise<SeasonResponse> {
    const seasonResults = await this.seasonClient.query({ seasonId });

    if (!seasonResults.length) {
      return null;
    }

    return this.buildDetailResponse(seasonResults[0]);
  }

  async getRecent(): Promise<SeasonResponse> {
    const filters = this.seasonMapper.toFilters({ active: "true" });

    const seasonResults = await this.seasonClient.query(filters);

    if (!seasonResults.length) {
      return null;
    }

    const seasonResult = seasonResults.reduce((currentSeason, nextSeason) => {
      const currentSeasonEpoch = new Date(currentSeason.startDate as string).getTime();
      const nextSeasonEpoch = new Date(nextSeason.startDate as string).getTime();

      return currentSeasonEpoch < nextSeasonEpoch ? nextSeason : currentSeason;
    }, seasonResults[0]);

    return this.buildDetailResponse(seasonResult);
  }

  async query(queryParams: SeasonQueryParams): Promise<SeasonResponse[]> {
    const filters = this.seasonMapper.toFilters(queryParams);

    const seasonResults = await this.seasonClient.query(filters);

    if (!seasonResults.length) {
      return [];
    }

    const detailedResults = await Promise.all(seasonResults.map(this.buildDetailResponse));

    return detailedResults;
  }

  async remove(seasonId: string): Promise<SuccessResponse> {
    await this.seasonClient.remove({ seasonId });

    return { message: "Successfully deleted season." };
  }

  async update(seasonId: string, data: SeasonUpdateRequest): Promise<SeasonResponse> {
    const seasonItem = this.seasonMapper.toUpdateItem(data);

    const result = await this.seasonClient.update({ seasonId }, seasonItem);

    return this.buildDetailResponse(result);
  }
}
