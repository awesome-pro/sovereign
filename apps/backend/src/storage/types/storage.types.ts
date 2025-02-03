import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class FileInfo {
  @Field()
  key!: string;

  @Field(() => Int)
  size!: number;

  @Field()
  lastModified!: Date;

  @Field()
  etag!: string;

  @Field({ nullable: true })
  contentType?: string;

  @Field(() => Object, { nullable: true })
  metadata?: Record<string, string>;

  @Field(() => Object, { nullable: true })
  tags?: Record<string, string>;
}

@ObjectType()
export class FileUploadResult {
  @Field()
  key!: string;

  @Field()
  location!: string;

  @Field()
  etag!: string;

  @Field({ nullable: true })
  versionId?: string;
}

@ObjectType()
export class FileOperationResult {
  @Field()
  success!: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Object, { nullable: true })
  error?: any;
}

@ObjectType()
export class FileListResponse {
  @Field(() => [FileInfo])
  files!: FileInfo[];

  @Field({ nullable: true })
  nextContinuationToken?: string;

  @Field()
  isTruncated!: boolean;
}
