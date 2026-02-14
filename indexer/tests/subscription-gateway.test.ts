import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  handleFeeUpdated,
  handleFeesWithdrawn,
  handleOwnerUpdated,
  handlePlanCreated,
  handlePlanStatusUpdated,
  handleSubscribed,
} from "../src/subscription-gateway";
import {
  createFeeUpdatedEvent,
  createFeesWithdrawnEvent,
  createOwnerUpdatedEvent,
  createPlanCreatedEvent,
  createPlanStatusUpdatedEvent,
  createSubscribedEvent,
} from "./subscription-gateway-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("SubscriptionGateway dual-write mappings", () => {
  beforeAll(() => {
    let seller = Address.fromString(
      "0x00000000000000000000000000000000000000aa",
    );
    let subscriber = Address.fromString(
      "0x00000000000000000000000000000000000000bb",
    );
    let owner = Address.fromString(
      "0x00000000000000000000000000000000000000cc",
    );
    let planId = Bytes.fromHexString(
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );

    handleFeeUpdated(createFeeUpdatedEvent(BigInt.fromI32(300)));
    handleOwnerUpdated(createOwnerUpdatedEvent(owner));
    handlePlanCreated(
      createPlanCreatedEvent(
        planId,
        seller,
        BigInt.fromI32(1000),
        BigInt.fromI32(30),
        "ipfs://plan-meta",
      ),
    );
    handlePlanStatusUpdated(createPlanStatusUpdatedEvent(planId, false));
    handleSubscribed(
      createSubscribedEvent(
        subscriber,
        seller,
        planId,
        BigInt.fromI32(1000),
        BigInt.fromI32(25),
        "buyer-1",
        BigInt.fromI32(100),
        BigInt.fromI32(130),
      ),
    );
    handleFeesWithdrawn(createFeesWithdrawnEvent(seller, BigInt.fromI32(25)));
  });

  afterAll(() => {
    clearStore();
  });

  test("preserves legacy immutable entities", () => {
    assert.entityCount("FeeUpdated", 1);
    assert.entityCount("FeesWithdrawn", 1);
    assert.entityCount("OwnerUpdated", 1);
    assert.entityCount("PlanCreated", 1);
    assert.entityCount("PlanStatusUpdated", 1);
    assert.entityCount("Subscribed", 1);

    assert.fieldEquals(
      "FeeUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newFeeBps",
      "300",
    );
    assert.fieldEquals(
      "PlanCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "1000",
    );
  });

  test("writes and updates production state entities", () => {
    assert.entityCount("GlobalConfig", 1);
    assert.entityCount("Seller", 1);
    assert.entityCount("Subscriber", 1);
    assert.entityCount("Plan", 1);
    assert.entityCount("SubscriptionState", 1);
    assert.entityCount("DailyStats", 1);

    assert.fieldEquals("GlobalConfig", "global", "feeBps", "300");
    assert.fieldEquals(
      "GlobalConfig",
      "global",
      "owner",
      "0x00000000000000000000000000000000000000cc",
    );

    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "planCount",
      "1",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "activePlanCount",
      "0",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "subscriptionCount",
      "1",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "totalGrossRevenue",
      "1000",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "totalNetRevenue",
      "975",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "totalFeeContributed",
      "25",
    );
    assert.fieldEquals(
      "Seller",
      "0x00000000000000000000000000000000000000aa",
      "totalFeeWithdrawn",
      "25",
    );

    assert.fieldEquals(
      "Plan",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
      "active",
      "false",
    );
    assert.fieldEquals(
      "Plan",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
      "subscriptionCount",
      "1",
    );
    assert.fieldEquals(
      "Plan",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
      "totalGrossVolume",
      "1000",
    );
    assert.fieldEquals(
      "Plan",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
      "totalFeesCollected",
      "25",
    );

    assert.fieldEquals(
      "Subscriber",
      "0x00000000000000000000000000000000000000bb",
      "subscriptionCount",
      "1",
    );
    assert.fieldEquals(
      "Subscriber",
      "0x00000000000000000000000000000000000000bb",
      "activeSubscriptionCount",
      "1",
    );
    assert.fieldEquals(
      "Subscriber",
      "0x00000000000000000000000000000000000000bb",
      "totalSpent",
      "1000",
    );
    assert.fieldEquals(
      "Subscriber",
      "0x00000000000000000000000000000000000000bb",
      "totalFeesPaid",
      "25",
    );

    assert.fieldEquals(
      "SubscriptionState",
      "0x00000000000000000000000000000000000000bb-0x1111111111111111111111111111111111111111111111111111111111111111",
      "status",
      "ACTIVE",
    );
    assert.fieldEquals(
      "SubscriptionState",
      "0x00000000000000000000000000000000000000bb-0x1111111111111111111111111111111111111111111111111111111111111111",
      "subscriptionCount",
      "1",
    );
    assert.fieldEquals("DailyStats", "0", "plansCreated", "1");
    assert.fieldEquals("DailyStats", "0", "subscriptionsCreated", "1");
    assert.fieldEquals("DailyStats", "0", "totalGrossVolume", "1000");
    assert.fieldEquals("DailyStats", "0", "totalFeesCollected", "25");
    assert.fieldEquals("DailyStats", "0", "totalFeeWithdrawals", "25");
  });
});
