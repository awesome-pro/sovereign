import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
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
  async getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Query(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['VIEW', 'MANAGE'] }])
  async getUserProfile(@Args('userId', { type: () => ID }) userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.profileService.updateProfile(userId, input);
  }

  @Mutation(() => String)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @Args({ name: 'file', type: () => UploadScalar })
    fileUpload: Promise<FileUpload>,
  ) {
    const file = await fileUpload;
    return this.profileService.uploadAvatar(userId, file);
  }

  @Mutation(() => String)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async uploadCoverImage(
    @CurrentUser('id') userId: string,
    @Args({ name: 'file', type: () => UploadScalar })
    fileUpload: Promise<FileUpload>,
  ) {
    const file = await fileUpload;
    return this.profileService.uploadCoverImage(userId, file);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }))
  // async updateAddress(
  //   @CurrentUser('id') userId: string,
  //   @Args('input') input: AddressInput,
  // ) {
  //   return this.profileService.updateAddress(userId, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async addLicense(
    @CurrentUser('id') userId: string,
    @Args('input') input: LicenseInput,
  ) {
    return this.profileService.addLicense(userId, input);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateLicense(
  //   @CurrentUser('id') userId: string,
  //   @Args('licenseId', { type: () => ID }) licenseId: string,
  //   @Args('input') input: LicenseInput,
  // ) {
  //   return this.profileService.updateLicense(userId, licenseId, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async deleteLicense(
    @CurrentUser('id') userId: string,
    @Args('licenseId', { type: () => ID }) licenseId: string,
  ) {
    return this.profileService.deleteLicense(userId, licenseId);
  }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async addCertification(
    @CurrentUser('id') userId: string,
    @Args('input') input: CertificationInput,
  ) {
    return this.profileService.addCertification(userId, input);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateCertification(
  //   @CurrentUser('id') userId: string,
  //   @Args('certId', { type: () => ID }) certId: string,
  //   @Args('input') input: CertificationInput,
  // ) {
  //   return this.profileService.updateCertification(userId, certId, input);
  // }

  @Mutation(() => CompleteUserProfile)
  // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  async deleteCertification(
    @CurrentUser('id') userId: string,
    @Args('certId', { type: () => ID }) certId: string,
  ) {
    return this.profileService.deleteCertification(userId, certId);
  }

  // @Mutation(() => CompleteUserProfile)
  // // @Permissions([{ resourceCode: '0u', actions: ['EDIT'] }])
  // async updateLanguages(
  //   @CurrentUser('id') userId: string,
  //   @Args('languages', { type: () => [LanguageInput] }) languages: LanguageInput[],
  // ) {
  //   return this.profileService.updateLanguages(userId, languages);
  // }
}
