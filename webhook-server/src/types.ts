import { ObjectId } from "mongodb";

export interface WebhookEndpoint {
  _id?: ObjectId;
  userId: string;
  planId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
