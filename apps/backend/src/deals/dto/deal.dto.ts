import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RelatedDeal {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  referenceNumber!: string;
}