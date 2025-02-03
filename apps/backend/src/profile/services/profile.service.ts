import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../../storage/storage.service.js';
import { LoggerService } from '../../logging/logging.service.js';
import {
  UpdateProfileInput,
  AddressInput,
  LicenseInput,
  CertificationInput,
} from '../types/profile.types.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

@Injectable()
export class ProfileService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        address: true,
        licenses: true,
        certifications: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    try {
      const profile = await this.prisma.userProfile.update({
        where: { userId },
        data: {
          ...input,
          socialLinks: input.socialLinks ? JSON.stringify(input.socialLinks) : undefined,
        },
        include: {
          address: true,
          licenses: true,
          certifications: true,
        },
      });

      return profile;
    } catch (error) {
      this.logger.error('Failed to update profile', { error, userId, input });
      throw new BadRequestException('Failed to update profile');
    }
  }

  async uploadAvatar(userId: string, file: FileUpload) {
    try {
      const { createReadStream, filename } = file;
      const stream = createReadStream();
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const result = await this.storageService.uploadFile(buffer, filename, {
        contentType: file.mimetype,
        metadata: { prefix: 'avatars', userId },
        acl: 'public-read',
      });

      // Update user's avatar URL
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: result.location },
      });

      return result.location;
    } catch (error) {
      this.logger.error('Failed to upload avatar', { error, userId });
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  async uploadCoverImage(userId: string, file: FileUpload) {
    try {
      const { createReadStream, filename } = file;
      const stream = createReadStream();
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const result = await this.storageService.uploadFile(buffer, filename, {
        contentType: file.mimetype,
        metadata: { prefix: 'covers', userId },
        acl: 'public-read',
      });

      // Update profile's cover image URL
      await this.prisma.userProfile.update({
        where: { userId },
        data: { coverImage: result.location },
      });

      return result.location;
    } catch (error) {
      this.logger.error('Failed to upload cover image', { error, userId });
      throw new BadRequestException('Failed to upload cover image');
    }
  }

  // async updateAddress(userId: string, input: AddressInput) {
  //   try {
  //     const profile = await this.prisma.userProfile.findUnique({
  //       where: { userId },
  //       include: { address: true },
  //     });

  //     if (!profile) {
  //       throw new NotFoundException('Profile not found');
  //     }

  //     if (profile.address) {
  //       await this.prisma.userAddress.update({
  //         where: { id: profile.address.id },
  //         data: input,
  //       });
  //     } else {
  //       await this.prisma.userAddress.create({
  //         data: {
  //           ...input,
  //           profile: { connect: { userId } },
  //         },
  //       });
  //     }

  //     return this.getProfile(userId);
  //   } catch (error) {
  //     this.logger.error('Failed to update address', { error, userId, input });
  //     throw new BadRequestException('Failed to update address');
  //   }
  // }

  async addLicense(userId: string, input: LicenseInput) {
    try {
      // await this.prisma.userLicense.create({
      //   data: {
      //     ...input,
      //     profileId: userId,
      //   },
      // });

      return this.getProfile(userId);
    } catch (error) {
      this.logger.error('Failed to add license', { error, userId, input });
      throw new BadRequestException('Failed to add license');
    }
  }

  // async updateLicense(userId: string, licenseId: string, input: LicenseInput) {
  //   try {
  //     const license = await this.prisma.userLicense.findFirst({
  //       where: { id: licenseId, profile: { userId } },
  //     });

  //     if (!license) {
  //       throw new NotFoundException('License not found');
  //     }

  //     await this.prisma.userLicense.update({
  //       where: { id: licenseId },
  //       data: input,
  //     });

  //     return this.getProfile(userId);
  //   } catch (error) {
  //     this.logger.error('Failed to update license', { error, userId, licenseId, input });
  //     throw new BadRequestException('Failed to update license');
  //   }
  // }

  async deleteLicense(userId: string, licenseId: string) {
    try {
      const license = await this.prisma.userLicense.findFirst({
        where: { id: licenseId, profileId: userId },
      });

      if (!license) {
        throw new NotFoundException('License not found');
      }

      await this.prisma.userLicense.delete({
        where: { id: licenseId },
      });

      return this.getProfile(userId);
    } catch (error) {
      this.logger.error('Failed to delete license', { error, userId, licenseId });
      throw new BadRequestException('Failed to delete license');
    }
  }

  async addCertification(userId: string, input: CertificationInput) {
    try {
      // await this.prisma.userCertification.create({
      //   data: {
      //     ...input,
      //     profileId: userId,
      //   },
      // });

      return this.getProfile(userId);
    } catch (error) {
      this.logger.error('Failed to add certification', { error, userId, input });
      throw new BadRequestException('Failed to add certification');
    }
  }

  // async updateCertification(userId: string, certId: string, input: CertificationInput) {
  //   try {
  //     const cert = await this.prisma.userCertification.findFirst({
  //       where: { id: certId, profile: { userId } },
  //     });

  //     if (!cert) {
  //       throw new NotFoundException('Certification not found');
  //     }

  //     await this.prisma.userCertification.update({
  //       where: { id: certId },
  //       data: input,
  //     });

  //     return this.getProfile(userId);
  //   } catch (error) {
  //     this.logger.error('Failed to update certification', { error, userId, certId, input });
  //     throw new BadRequestException('Failed to update certification');
  //   }
  // }

  async deleteCertification(userId: string, certId: string) {
    try {
      const cert = await this.prisma.userCertification.findFirst({
        where: { id: certId, profileId: userId },
      });

      if (!cert) {
        throw new NotFoundException('Certification not found');
      }

      await this.prisma.userCertification.delete({
        where: { id: certId },
      });

      return this.getProfile(userId);
    } catch (error) {
      this.logger.error('Failed to delete certification', { error, userId, certId });
      throw new BadRequestException('Failed to delete certification');
    }
  }

  // async updateLanguages(userId: string, languages: LanguageInput[]) {
  //   try {
  //     // Delete existing languages
  //     await this.prisma.language.deleteMany({
  //       where: { profileId: userId },
  //     });

  //     // Add new languages
  //     await this.prisma.language.createMany({
  //       data: languages.map(lang => ({
  //         ...lang,
  //         profileId: userId,
  //       })),
  //     });

  //     return this.getProfile(userId);
  //   } catch (error) {
  //     this.logger.error('Failed to update languages', { error, userId, languages });
  //     throw new BadRequestException('Failed to update languages');
  //   }
  // }
}
