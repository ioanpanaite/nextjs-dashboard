import { DB_NAME } from "@/constants/database";
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

export default async function connectToDatabase() {
  const uri = process.env.MONGODB_URI ?? "";
  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  };

  const client = new MongoClient(uri, options);
  client.connect();
  const db = client.db(DB_NAME);
  return { client, db };
}