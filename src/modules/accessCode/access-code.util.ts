import { randomInt } from 'node:crypto';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

function pickRandomChars(pool: string, count: number): string {
  return Array.from({ length: count }, () =>
    pool[randomInt(0, pool.length)],
  ).join('');
}

export function generateCompanyAccessCode(): string {
  const lettersPart = pickRandomChars(LETTERS, 4);
  const digitsPart = pickRandomChars(DIGITS, 4);

  return `${lettersPart}-${digitsPart}`;
}