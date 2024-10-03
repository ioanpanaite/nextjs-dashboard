import { createClient } from 'contentful';

export const confClient = createClient({
  space: process.env.CF_SPACE_ID ?? "",
  accessToken: process.env.CF_DELIVERY_ACCESS_TOKEN ?? "",
});
