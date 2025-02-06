// import { Field, ID, ObjectType } from '@nestjs/graphql';
// import { Document } from './document.model.js';
// import { User } from '../../auth/types/auth.types.js';

// @ObjectType()
// export class DocumentView {
//   @Field(() => ID)
//   id: string;

//   @Field(() => Document)
//   document: Document;

//   @Field()
//   documentId: string;

//   @Field(() => User, { nullable: true })
//   user?: User;

//   @Field({ nullable: true })
//   userId?: string;

//   @Field({ nullable: true })
//   viewDuration?: number;

//   @Field()
//   completed: boolean;

//   @Field({ nullable: true })
//   ipAddress?: string;

//   @Field({ nullable: true })
//   userAgent?: string;

//   @Field({ nullable: true })
//   deviceType?: string;

//   @Field()
//   createdAt: Date;
// }
