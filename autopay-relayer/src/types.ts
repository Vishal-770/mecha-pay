import { ObjectId } from "mongodb";

export interface AutoPaySetting {
  _id: ObjectId;
  subscriberAddress: string;
  planId: string;
  enabled: boolean;
  tierId: string | number;
  buyerData?: string;
  signature: string;
  nonce: number;
  deadline: number;
  currentExpiresAt: number;
  sessionPublicKey: string;
  sessionPrivateKey: string;
  maxCycles: number;
  executedCycles: number;
}
