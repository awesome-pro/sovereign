import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// password.service.ts
@Injectable()
export class PasswordService {
  private readonly BCRYPT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.BCRYPT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  async validate(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  async isCompromised(password: string): Promise<boolean> {
    const hash = crypto.createHash('sha1').update(password).digest('hex');
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0,5)}`);
    const responseText = await response.text();
    return responseText.includes(hash.slice(5).toUpperCase());
  }
}