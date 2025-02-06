// import { Field, ID, ObjectType } from '@nestjs/graphql';
// import { Document } from './document.model.js';

// @ObjectType()
// export class DocumentWorkflow {
//   @Field(() => ID)
//   id: string;

//   @Field(() => Document)
//   document: Document;

//   @Field()
//   documentId: string;

//   @Field()
//   status: string;

//   @Field()
//   currentStep: number;

//   @Field()
//   totalSteps: number;

//   @Field(() => JSON)
//   steps: any;

//   @Field()
//   requiredApprovers: number;

//   @Field()
//   currentApprovers: number;

//   @Field({ nullable: true })
//   deadline?: Date;

//   @Field()
//   reminderSent: boolean;

//   @Field({ nullable: true })
//   completedAt?: Date;

//   @Field({ nullable: true })
//   completedBy?: string;
// }
