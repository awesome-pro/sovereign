import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { SearchService } from './search.service.js';
import { RelatedUser } from '../auth/types/auth.types.js';
import { RelatedProperty } from '../properties/dto/properties.dto.js';
import { RelatedLead } from '../leads/dto/lead.dto.js';
import { RelatedDeal } from '../deals/dto/deal.dto.js';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => [RelatedUser])
  async searchUsers(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<RelatedUser[]> {
    return this.searchService.searchUsers(query, limit);
  }

  @Query(() => [RelatedProperty])
  async searchProperties(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<RelatedProperty[]> {
    return this.searchService.searchProperties(query, limit);
  }

  @Query(() => [RelatedLead])
  async searchLeads(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<RelatedLead[]> {
    return this.searchService.searchLeads(query, limit);
  }

  @Query(() => [RelatedDeal])
  async searchDeals(
    @Args('query') query: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number
  ): Promise<RelatedDeal[]> {
    return this.searchService.searchDeals(query, limit);
  }
}
