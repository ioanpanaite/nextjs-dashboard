import { IUser } from "@/constants/database";
import * as crypto from 'crypto';

export const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours
export function isObjectNotArray(val: unknown) {
  return typeof val === "object" && !Array.isArray(val) && val !== null;
}

export function getCurrentMonth() {
  const date = new Date();
  return date.getMonth() + 1;
}

export function getDateAWeekAgo(dateString?: string) {
  const date = dateString ? new Date(dateString) : new Date();
  date.setDate(date.getDate() - 7);
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return formattedDate;
}

export function getDatePeriodAgo(dateString?: string, period?: number) {
  const date = dateString ? new Date(dateString) : new Date();
  const periodTime = period ? period : 0;
  date.setDate(date.getDate() - periodTime);
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return formattedDate;
}

export function getTodayDate() {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return formattedDate;
}

export function dateStringToTimestamp(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.getTime();
}

export function getPriceFractionDigits(price: number) {
  const priceAbs = Math.abs(price);
  return priceAbs < 0.0001 ? 8 : priceAbs < 1 ? 4 : 2;
}

export function formatCurrency(value: number, fractionDigits = 2, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: fractionDigits ?? 2,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(value);
}

export function getTokenExpireDate() {
  const date = new Date();
  // Set the expire date after 12 hours
  const expireTime = date.getTime() + EXPIRE_TIME;
  return expireTime;
}

export function generateResetToken(user: IUser | null) {
  const now = new Date();
  const timeBase64 = Buffer.from(now.getTime().toString()).toString('base64');
  const userIdBase64 = Buffer.from(user?.id as string).toString('base64');

  const userInfo = `${user?.id}-${user?.email}-${user?.password}-${user?.updatedAt}`;
  const userInfoHash = crypto.createHash('md5').update(userInfo).digest('hex');

  const tokenize = `${userIdBase64}-${userInfoHash}-${timeBase64}`;
  return encryptToken(tokenize);
}

export function encryptToken(toEncrypt: string) {
  const key = crypto.createHash('sha256').update('forfiles').digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = cipher.update(toEncrypt);

  const cipherEncrypt = Buffer.concat([encrypted, cipher.final()]);
  const result = Buffer.from(`${iv.toString('hex')}@${cipherEncrypt.toString('hex')}`).toString('base64');
  return result;
}

export function decryptToken(encryptToken: string) {
  try {
    // Decrypt token from encrypted token
    const decryptToken = Buffer.from(encryptToken, 'base64').toString('ascii');

    const key = crypto.createHash('sha256').update('forfiles').digest();
    const splitToken = decryptToken.split('@');
    const iv = Buffer.from(splitToken.shift() as string, 'hex');
    const encrypted = Buffer.from(splitToken.join('@'), 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = decipher.update(encrypted);

    const result = Buffer.concat([decrypted, decipher.final()]);
    return result.toString();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function getResetTokenInfo(token: string) {
  const decToken = decryptToken(token);
  const info = decToken?.split('-') as string[];
  const userIdBase64 = info[0];
  const userInfoHash = info[1];
  const timeBase64 = info[2];

  const timestamp = Buffer.from(timeBase64, 'base64').toString('ascii');
  const userId = Buffer.from(userIdBase64, 'base64').toString('ascii');

  return { timestamp, userId, userInfoHash }
}

export function validationToken(token: string, user: IUser | null) {
  const { timestamp, userInfoHash } = getResetTokenInfo(token);
  const now = new Date();
  console.log(now.getTime().toString(), timestamp)
  const diffHour = (now.getTime() - parseInt(timestamp)) / EXPIRE_TIME;

  // Validation failed if it's expired 12 hours
  if (diffHour > 12) return false;

  const validUser = `${user?.id}-${user?.email}-${user?.password}-${user?.updatedAt}`;
  const validUserHash = crypto.createHash('md5').update(validUser).digest('hex');

  return userInfoHash === validUserHash
}

export function validatePassword(password: string) {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (regex.test(password)) return true;
  return false;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Get identifie code
export function getIdentifieCode() {
  const code = shuffleArray('abcdefghijklmnopqrstuvwxyz0123456789'.split(''))
    .join('')
    .substring(0, 32)
  return code
}