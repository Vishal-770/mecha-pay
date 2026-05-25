import { MongoClient, Db } from "mongodb";
import { MONGODB_URI, MONGODB_DB } from "./config.js";

let mongoClient: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!mongoClient) {
    mongoClient = await MongoClient.connect(MONGODB_URI as string);
  }
  return mongoClient!.db(MONGODB_DB);
}
