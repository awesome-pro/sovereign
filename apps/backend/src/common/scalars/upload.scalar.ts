import { Scalar } from '@nestjs/graphql';
import { GraphQLScalarType, GraphQLError } from 'graphql';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';

@Scalar('Upload')
export class UploadScalar {
  description = 'File upload scalar type';

  parseValue(value: any): Promise<FileUpload> {
    if (!value) {
      throw new GraphQLError('Upload value is required');
    }

    // Handle the Upload object from graphql-upload
    if (value?.promise instanceof Promise) {
      return value.promise;
    }

    // If it's already a Promise<FileUpload>, return it
    if (value instanceof Promise) {
      return value;
    }

    // If it's a FileUpload object, wrap it in a Promise
    if (value.createReadStream && value.filename && value.mimetype) {
      return Promise.resolve(value);
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