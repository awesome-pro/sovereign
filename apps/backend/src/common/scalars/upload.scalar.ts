import { Scalar } from '@nestjs/graphql';
import { GraphQLScalarType, GraphQLError } from 'graphql';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';

@Scalar('Upload')
export class UploadScalar {
  description = 'File upload scalar type';

  parseValue(value: unknown): Promise<FileUpload> {
    if (value instanceof Promise) {
      return value as Promise<FileUpload>;
    }
    throw new GraphQLError('Upload value must be a Promise<FileUpload>');
  }

  serialize(): never {
    throw new GraphQLError('Upload scalar cannot be serialized');
  }

  parseLiteral(): never {
    throw new GraphQLError('Upload scalar does not support literal parsing');
  }
}
