// Configure mongodb database name
export const DB_NAME = "forfiles";

// Define collections
export enum Collections {
  User = "User",
  Account = "Account",
  Session = "Session",
  VerificationToken = "VerificationToken",
  Subscription = "Subscription",
  TwoFactor = "TwoFactor",
  Advertisement = "Advertisement",
  SiteSettings = "SiteSettings",
  Events = "Events",
  PromoCode = "PromoCode"
}

export enum Status {
  UPGRADE = "upgraded",
  DELETE = "deleted",
  ACTIVE = "active",
  APPROVED = "approved",
  VERIFIED = "verified",
  PENDING = "pending",
  NEW = "new",
  DISABLED = "disabled",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum LoginType {
  CREDENTIAL = "credential",
  GOOGLE = "google",
}

export interface IUser extends Document {
  id?: string;
  fullname: string;
  username: string;
  email: string;
  password: string;
  passwordVerify: boolean;
  passwordNew: string;
  emailVerified: boolean;
  emailSid: string;
  image?: string;
  status: string;
  country: string;
  crypto: string;
  telegram: string;
  promoCode: string;
  lookupKey: string;
  loginType: string;
  twofactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAccount {
  id?: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  expires_at: number;
  token_type: string;
  refresh_token?: string;
  access_token: string;
  scope: string;
  id_token: string;
  session_state?: string;
}

export interface ISession {
  id?: string;
  expires: number;
  sessionToken: string;
  userId: string;
}

export interface IVerificationToken {
  id?: string;
  identifier: string;
  token: string;
  expires: number;
}

export interface ISubscription {
  email: string;
  checkoutId?: string;
  userId: string;
  stripePriceId: string;
  stripeCustomerId: string; 
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITwoFactor {
  userId: string;  
  twofactorSid: string;
  twofactorChallengeSid?: string;
  entityIdentity: string;
  twofactorStatus: string;
  twofactorQrcode: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdvertisement {
  image: string;
  title: string;
  link: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISiteSettings {
  site_title: string;
  reset_pass: string;
  verify_pass: string;
  change_pass: string;
  twofactor_enable: string;
  twofactor_disable: string;
  code_expired: string;
  credential_warning: string;
  createdAt: string;
  updatedAt: string;
}