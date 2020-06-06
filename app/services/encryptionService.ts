import CryptoJS from 'crypto-js';

export class EncryptionService {
  encrypt = (args) => {
    if (args === undefined || args === null) return args;
    if (!process.env.RESPONSE_ENCRYPTION_SECRET) {
      throw new Error("Encryption secret not found");
    }
    const secret: string = process.env.RESPONSE_ENCRYPTION_SECRET;

    for (let i = 0; i < args.length; i++) {
      let encrypted = CryptoJS.RC4.encrypt(args[i].toString(), secret);
      args[i] = JSON.stringify(encrypted);
    }

    return args;
  }
}