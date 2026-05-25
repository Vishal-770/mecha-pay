type CircleChallenge = {
  status?: string;
  errorMessage?: string;
  correlationIds?: string[];
};

type CircleTransaction = {
  txHash?: string;
};

type CircleResponse<T> = {
  data?: T;
};

type CreateChallengeResponse = CircleResponse<{ challengeId?: string }>;
type GetChallengeResponse = CircleResponse<{ challenge?: CircleChallenge }>;
type GetTransactionResponse = CircleResponse<{ transaction?: CircleTransaction }>;

type CreateChallengeParams = {
  userToken: string;
  walletId: string;
  contractAddress: string;
  abiFunctionSignature: string;
  abiParameters: string[];
  fee?: unknown;
};

type GetUserChallengeParams = {
  userToken: string;
  challengeId: string;
};

type GetTransactionParams = {
  userToken: string;
  id: string;
};

export interface CircleClient {
  createUserTransactionContractExecutionChallenge(
    params: CreateChallengeParams
  ): Promise<CreateChallengeResponse>;
  getUserChallenge(params: GetUserChallengeParams): Promise<GetChallengeResponse>;
  getTransaction(params: GetTransactionParams): Promise<GetTransactionResponse>;
}

export function getCircleClient(): CircleClient {
  return {
    async createUserTransactionContractExecutionChallenge() {
      throw new Error("Circle client is not configured");
    },
    async getUserChallenge() {
      throw new Error("Circle client is not configured");
    },
    async getTransaction() {
      throw new Error("Circle client is not configured");
    },
  };
}
