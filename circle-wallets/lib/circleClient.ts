import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

let circleClient: ReturnType<
  typeof initiateUserControlledWalletsClient
> | null = null;

export function getCircleClient() {
  if (!process.env.CIRCLE_API_KEY) {
    throw new Error("Missing CIRCLE_API_KEY");
  }

  if (!circleClient) {
    circleClient = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
    });
  }

  return circleClient;
}
