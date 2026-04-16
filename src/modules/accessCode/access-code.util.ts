import { randomBytes } from 'node:crypto';

export function generateCompanyAccessCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}