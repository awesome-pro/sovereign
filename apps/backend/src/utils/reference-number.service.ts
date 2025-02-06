import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { nanoid } from 'nanoid';

export enum ReferencePrefix {
  DOCUMENT = 'DOC',
  PROPERTY = 'PROP',
  CLIENT = 'CLI',
  TRANSACTION = 'TRX',
  LISTING = 'LST',
  INQUIRY = 'INQ',
}

export enum MarketCode {
  DUBAI = 'DXB',
  SINGAPORE = 'SGP',
  SAUDI_ARABIA = 'SAU',
  ABU_DHABI = 'AUH',
  QATAR = 'QAT',
  INDIA = 'IND',
  USA = 'USA',
  SWITZERLAND = 'SUI',
}

interface ReferenceNumberOptions {
  prefix?: ReferencePrefix;
  market?: MarketCode;
  year?: number;
  includeTimestamp?: boolean;
  customSuffix?: string;
}

@Injectable()
export class ReferenceNumberService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a comprehensive and unique reference number
   * @param options Configuration options for reference number generation
   * @returns A unique, formatted reference number
   */
  async generateReferenceNumber(options: ReferenceNumberOptions = {}): Promise<string> {
    const {
      prefix = ReferencePrefix.DOCUMENT,
      market = MarketCode.DUBAI,
      year = new Date().getFullYear(),
      includeTimestamp = false,
      customSuffix,
    } = options;

    // Generate a unique, short ID to prevent collisions
    const uniqueId = nanoid(6).toUpperCase();

    // Optional timestamp component (milliseconds since start of year)
    const timestampComponent = includeTimestamp 
      ? this.getTimestampComponent() 
      : '';

    // Optional custom suffix
    const suffixComponent = customSuffix ? `-${customSuffix}` : '';

    // Construct the reference number
    const referenceNumber = [
      prefix,
      market,
      year.toString().slice(-2),
      timestampComponent,
      uniqueId,
      suffixComponent
    ].filter(Boolean).join('-');

    // Optional: Ensure uniqueness by checking database
    await this.ensureUniqueness(referenceNumber);

    return referenceNumber;
  }

  /**
   * Generate a timestamp component based on milliseconds since the start of the year
   * @returns A string representation of milliseconds
   */
  private getTimestampComponent(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const timestampMs = now.getTime() - startOfYear.getTime();
    return timestampMs.toString().slice(-6);
  }

  /**
   * Ensure the generated reference number is unique across the system
   * @param referenceNumber The generated reference number
   */
  private async ensureUniqueness(referenceNumber: string): Promise<void> {
    const existingDocument = await this.prisma.document.findUnique({
      where: { referenceNumber },
    });

    if (existingDocument) {
      // If a collision occurs, regenerate the reference number
      const newReferenceNumber = await this.generateReferenceNumber();
      return this.ensureUniqueness(newReferenceNumber);
    }
  }

  /**
   * Validate a reference number against predefined rules
   * @param referenceNumber The reference number to validate
   * @returns Boolean indicating if the reference number is valid
   */
  validateReferenceNumber(referenceNumber: string): boolean {
    const referenceRegex = /^(DOC|PROP|CLI|TRX|LST|INQ)-(DXB|SGP|SAU|AUH|QAT)-\d{2}(-\d{6})?-[A-Z0-9]{6}(-[A-Z0-9]+)?$/;
    return referenceRegex.test(referenceNumber);
  }

  /**
   * Parse a reference number into its components
   * @param referenceNumber The reference number to parse
   * @returns An object containing reference number components
   */
  parseReferenceNumber(referenceNumber: string): {
    prefix: ReferencePrefix;
    market: MarketCode;
    year: number;
    uniqueId: string;
    timestamp?: string;
    customSuffix?: string;
  } {
    if (!this.validateReferenceNumber(referenceNumber)) {
      throw new Error('Invalid reference number format');
    }

    const parts = referenceNumber.split('-');
    const prefix = parts[0] as ReferencePrefix;
    const market = parts[1] as MarketCode;
    const year = parseInt('20' + parts[2], 10);
    
    const result: any = { prefix, market, year };

    // Check for optional timestamp
    if (parts.length > 4 && /^\d{6}$/.test(parts[3])) {
      result.timestamp = parts[3];
    }

    // Last part is either unique ID or custom suffix
    const lastPart = parts[parts.length - 1];
    if (/^[A-Z0-9]{6}$/.test(lastPart)) {
      result.uniqueId = lastPart;
    } else {
      result.uniqueId = parts[parts.length - 2];
      result.customSuffix = lastPart;
    }

    return result;
  }
}
