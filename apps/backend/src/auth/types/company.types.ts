import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()   
export class Company {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  status!: string;
}
