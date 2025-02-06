// import { Field, InputType } from '@nestjs/graphql';
// import { IsInt, IsOptional, IsString } from 'class-validator';

// @InputType()
// export class CreateDocumentWorkflowInput {
//   @Field()
//   documentId: string;

//   @Field()
//   @IsString()
//   status: string;

//   @Field()
//   @IsInt()
//   currentStep: number;

//   @Field()
//   @IsInt()
//   totalSteps: number;

//   @Field(() => JSON)
//   steps: any;

//   @Field()
//   @IsInt()
//   requiredApprovers: number;

//   @Field({ nullable: true })
//   @IsOptional()
//   @IsInt()
//   currentApprovers?: number;

//   @Field({ nullable: true })
//   @IsOptional()
//   deadline?: Date;

//   @Field({ nullable: true })
//   @IsOptional()
//   @IsString()
//   completedBy?: string;
// }
