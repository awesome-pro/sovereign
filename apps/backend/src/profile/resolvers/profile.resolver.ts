import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from '../services/profile.service.js';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Permissions } from '../../auth/decorators/rbac.decorator.js';
import {
  CompleteUserProfile,
  UpdateProfileInput,
  AddressInput,
  LicenseInput,
  CertificationInput,
  LanguageInput,
} from '../types/profile.types.js';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { UploadScalar } from '../../common/scalars/upload.scalar.js';

@Resolver(() => CompleteUserProfile)
@UseGuards(GqlAuthGuard)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['VIEW'] }])
  async getProfile(@Context() { req, res }: { req: any; res: any },) {
    return this.profileService.getProfile(req.user.sb);
  }

  @Query(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['VIEW', 'MANAGE'] }])
  async getUserProfile(@Args('userId', { type: () => ID }) userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async updateProfile(
    @Context() {req, res}: {req: any; res: any},
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.profileService.updateProfile(req.user.sb, input);
  }

  @Mutation(() => String)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async uploadAvatar(
    @Context() {req, res}: {req: any; res: any},
    @Args({ name: 'file', type: () => UploadScalar })
    fileUpload: Promise<FileUpload>,
  ) {
    const file = await fileUpload;
    return this.profileService.uploadAvatar(req.user.sb, file);
  }

  @Mutation(() => String)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async uploadCoverImage(
    @Context() {req, res}: {req: any; res: any},
    @Args({ name: 'file', type: () => UploadScalar })
    fileUpload: Promise<FileUpload>,
  ) {
    const file = await fileUpload;
    return this.profileService.uploadCoverImage(req.user.sb, file);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }))
  // async updateAddress(
  //   @Context() {req, res}: {req: any; res: any},
  //   @Args('input') input: AddressInput,
  // ) {
  //   return this.profileService.updateAddress(req.user.sb, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async addLicense(
    @Context() {req, res}: {req: any; res: any},
    @Args('input') input: LicenseInput,
  ) {
    return this.profileService.addLicense(req.user.sb, input);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateLicense(
  //   @Context() {req, res}: {req: any; res: any},
  //   @Args('licenseId', { type: () => ID }) licenseId: string,
  //   @Args('input') input: LicenseInput,
  // ) {
  //   return this.profileService.updateLicense(req.user.sb, licenseId, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async deleteLicense(
    @Context() {req, res}: {req: any; res: any},
    @Args('licenseId', { type: () => ID }) licenseId: string,
  ) {
    return this.profileService.deleteLicense(req.user.sb, licenseId);
  }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async addCertification(
    @Context() {req, res}: {req: any; res: any},
    @Args('input') input: CertificationInput,
  ) {
    return this.profileService.addCertification(req.user.sb, input);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateCertification(
  //   @Context() {req, res}: {req: any; res: any},
  //   @Args('certId', { type: () => ID }) certId: string,
  //   @Args('input') input: CertificationInput,
  // ) {
  //   return this.profileService.updateCertification(req.user.sb, certId, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async deleteCertification(
    @Context() {req, res}: {req: any; res: any},
    @Args('certId', { type: () => ID }) certId: string,
  ) {
    return this.profileService.deleteCertification(req.user.sb, certId);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateLanguages(
  //   @Context() {req, res}: {req: any; res: any},
  //   @Args('languages', { type: () => [LanguageInput] }) languages: LanguageInput[],
  // ) {
  //   return this.profileService.updateLanguages(req.user.sb, languages);
  // }
}
