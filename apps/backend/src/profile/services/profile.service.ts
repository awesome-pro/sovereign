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
      // Sanitize social links to remove empty strings
      const sanitizedSocialLinks = input.socialLinks 
        ? Object.fromEntries(
            Object.entries(input.socialLinks)
              .filter(([_, value]) => value !== '' && value !== null)
          )
        : undefined;

      const profile = await this.prisma.userProfile.update({
        where: { userId },
        data: {
          ...input,
          socialLinks: sanitizedSocialLinks
            ? sanitizedSocialLinks
            : {},
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
      // Validate input
      if (!userId) throw new BadRequestException('User ID is required');
      if (!file) throw new BadRequestException('File is required');

      const { createReadStream, filename, mimetype } = file;
      if (!createReadStream || !filename) {
        throw new BadRequestException('Invalid file upload');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      // Read the file stream
      const stream = createReadStream();
      const chunks: Buffer[] = [];

      try {
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
      } catch (streamError) {
        this.logger.error('Failed to read file stream', { error: streamError, userId });
        throw new BadRequestException('Failed to process file upload');
      }

      // Validate file size (5MB limit)
      const buffer = Buffer.concat(chunks);
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new BadRequestException('File size must be less than 5MB');
      }

      // Upload to S3
      const result = await this.storageService.uploadFile(buffer, filename, {
        contentType: mimetype,
        metadata: {
          prefix: 'avatars',
          userId,
          uploadType: 'avatar',
        },
        tags: {
          uploadType: 'avatar',
          userId,
        },
      });

      // Update user's avatar URL in database
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { avatar: result.location },
        });
      } catch (dbError) {
        // If database update fails, try to delete the uploaded file
        this.logger.error('Failed to update user avatar in database', { error: dbError, userId });
        try {
          await this.storageService.deleteFile(result.key);
        } catch (deleteError) {
          this.logger.error('Failed to delete uploaded file after database error', { error: deleteError, key: result.key });
        }
        throw new BadRequestException('Failed to update avatar');
      }

      return result.location;
    } catch (error) {
      this.logger.error('Failed to upload avatar', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
        userId,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to upload avatar'
      );
    }
  }

  async uploadCoverImage(userId: string, file: FileUpload) {
    try {
      // Validate input
      if (!userId) throw new BadRequestException('User ID is required');
      if (!file) throw new BadRequestException('File is required');

      const { createReadStream, filename, mimetype } = file;
      if (!createReadStream || !filename) {
        throw new BadRequestException('Invalid file upload');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      // Read the file stream
      const stream = createReadStream();
      const chunks: Buffer[] = [];

      try {
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
      } catch (streamError) {
        this.logger.error('Failed to read file stream', { error: streamError, userId });
        throw new BadRequestException('Failed to process file upload');
      }

      // Validate file size (5MB limit)
      const buffer = Buffer.concat(chunks);
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new BadRequestException('File size must be less than 5MB');
      }

      // Upload to S3
      const result = await this.storageService.uploadFile(buffer, filename, {
        contentType: mimetype,
        metadata: {
          prefix: 'cover-images',
          userId,
          uploadType: 'cover-image',
        },
        tags: {
          uploadType: 'cover-image',
          userId,
        },
      });

      // Update user's cover image URL in database
      try {
        await this.prisma.userProfile.update({
          where: { userId },
          data: { coverImage: result.location },
        });
      } catch (dbError) {
        // If database update fails, try to delete the uploaded file
        this.logger.error('Failed to update user cover image in database', { error: dbError, userId });
        try {
          await this.storageService.deleteFile(result.key);
        } catch (deleteError) {
          this.logger.error('Failed to delete uploaded file after database error', { error: deleteError, key: result.key });
        }
        throw new BadRequestException('Failed to update cover image');
      }

      return result.location;
    } catch (error) {
      this.logger.error('Failed to upload cover image', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
        userId,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to upload cover image'
      );
    }
  }

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
}
