export const FRIEND_NAME = "Forflies Verification Service	";
export const serviceId = process.env.TWILIO_SERVICE_ID;
export const accountSid = process.env.TWILIO_ACCOUNT_SID;
export const authToken = process.env.TWILIO_AUTH_TOKEN;
export const entitieId = 'ff483d1ff591898a9942916050d2ca3f';

export interface NewFactor {
  sid: string;
  account_sid: string;
  service_sid: string;
  entity_sid: string;
  identity: string;
  binding: {
    secret: string;
    uri: string;
  },
  date_created: string;
  date_updated: string;
  friendly_name: string;
  status: string;
  factor_type: string;
  config: {
    alg: string;
    skew: number;
    code_length: number;
    time_step: number;
  },
  metadata: any;
  url: string;
}

export interface VerifyFactor {
  sid: string;
  account_sid: string;
  service_sid: string;
  entity_sid: string;
  identity: string;
  date_created: string;
  date_updated: string;
  friendly_name: string;
  status: string;
  factor_type: string;
  config: {
    alg: string;
    skew: number;
    code_length: number;
    time_step: number;
  },
  metadata: any;
  url: string;
}