import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RelatedDocument {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  referenceNumber!: string;
}

@ObjectType()
export class RelatedFile {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  fileName!: string;

  @Field(() => String)
  url!: string;

  @Field(() => Number)
  fileSize!: number;

  @Field(() => String)
  fileType!: string;
}


export class RelatedDocumentComment {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  content!: string;

  @Field(() => ID)
  userId!: string;
}