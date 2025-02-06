import { ObjectType } from "@nestjs/graphql";
import { Field, ID } from "@nestjs/graphql";


@ObjectType()
export class RelatedTransaction {
    @Field(() => ID)
    id!: string

    @Field(() => String)
    referenceNumber!: string
}