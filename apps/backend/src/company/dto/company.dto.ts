import { ObjectType } from "@nestjs/graphql";
import { Field, ID } from "@nestjs/graphql";

@ObjectType()
export class RelatedCompany {
    @Field(() => ID)
    id!: string;

    @Field(() => String)
    name!: string;
}