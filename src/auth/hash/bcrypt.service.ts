import { HashingServiceProtocol } from './hash.service';
import * as bcrypt from 'bcryptjs';

export class BcryptService extends HashingServiceProtocol {
  // Membuat hash dari password
  async hash(password: string): Promise<string> {
    const passwordHashed = await bcrypt.hash(password, 8); // 8 = salt rounds
    return passwordHashed;
  }

  // Membandingkan password plain dengan hash
  async compare(password: string, passwordHash: string): Promise<boolean> {
    const passwordCompared = await bcrypt.compare(password, passwordHash);
    return passwordCompared;
  }
}
