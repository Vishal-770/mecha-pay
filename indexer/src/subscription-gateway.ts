// @ts-nocheck
import {
  FeeUpdated as FeeUpdatedEvent,
  FeesWithdrawn as FeesWithdrawnEvent,
  OwnerUpdated as OwnerUpdatedEvent,
  PlanCreated as PlanCreatedEvent,
  PlanStatusUpdated as PlanStatusUpdatedEvent,
  PlanUpdated as PlanUpdatedEvent,
  Subscribed as SubscribedEvent,
  TierAdded as TierAddedEvent,
} from "../generated/SubscriptionGateway/SubscriptionGateway";
import {
  FeeUpdated,
  FeesWithdrawn,
  OwnerUpdated,
  PlanCreated,
  TierAdded,
  PlanStatusUpdated,
  PlanUpdated,
  Subscribed,
  Tier,
  DailyStats,
  GlobalConfig,
  Plan,
  Seller,
  Subscriber,
  SubscriptionState,
  MonthlyStats,
  Transaction,
  PlanUpdate,
} from "../generated/schema";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

let SECONDS_PER_DAY = BigInt.fromI32(86400);
let SECONDS_PER_MONTH = BigInt.fromI32(2592000); // 30 days approximation


function getLegacyEventId(txHash: Bytes, logIndex: BigInt): Bytes {
  return txHash.concatI32(logIndex.toI32());
}

function getOrCreateGlobalConfig(
  blockTimestamp: BigInt,
  blockNumber: BigInt,
): GlobalConfig {
  let entity = GlobalConfig.load("global");
  if (entity == null) {
    entity = new GlobalConfig("global");
    entity.feeBps = BigInt.fromI32(250);
    entity.updatedAt = blockTimestamp;
    entity.updatedBlock = blockNumber;
    entity.save();
  }
  return entity;
}

function getOrCreateSeller(id: Bytes, blockTimestamp: BigInt): Seller {
  let entity = Seller.load(id);
  if (entity == null) {
    entity = new Seller(id);
    entity.planCount = 0;
    entity.activePlanCount = 0;
    entity.subscriptionCount = 0;
    entity.totalGrossRevenue = BigInt.zero();
    entity.totalNetRevenue = BigInt.zero();
    entity.totalFeeContributed = BigInt.zero();
    entity.totalFeeWithdrawn = BigInt.zero();
    entity.createdAt = blockTimestamp;
    entity.updatedAt = blockTimestamp;
    entity.save();
  }
  return entity;
}

function getOrCreateSubscriber(id: Bytes, blockTimestamp: BigInt): Subscriber {
  let entity = Subscriber.load(id);
  if (entity == null) {
    entity = new Subscriber(id);
    entity.subscriptionCount = 0;
    entity.activeSubscriptionCount = 0;
    entity.totalSpent = BigInt.zero();
    entity.totalFeesPaid = BigInt.zero();
    entity.firstSeenAt = blockTimestamp;
    entity.updatedAt = blockTimestamp;
    entity.save();
  }
  return entity;
}

function getOrCreateDailyStats(blockTimestamp: BigInt): DailyStats {
  let dayBucket = blockTimestamp.div(SECONDS_PER_DAY);
  let id = dayBucket.toString();
  let entity = DailyStats.load(id);
  if (entity == null) {
    entity = new DailyStats(id);
    entity.dayStartTimestamp = dayBucket.times(SECONDS_PER_DAY);
    entity.plansCreated = 0;
    entity.subscriptionsCreated = 0;
    entity.totalGrossVolume = BigInt.zero();
    entity.totalFeesCollected = BigInt.zero();
    entity.totalFeeWithdrawals = BigInt.zero();
    entity.updatedAt = blockTimestamp;
    entity.save();
  }
  return entity;
}

function getOrCreateMonthlyStats(blockTimestamp: BigInt): MonthlyStats {
  let monthBucket = blockTimestamp.div(SECONDS_PER_MONTH);
  let id = monthBucket.toString();
  let entity = MonthlyStats.load(id);
  if (entity == null) {
    entity = new MonthlyStats(id);
    entity.monthStartTimestamp = monthBucket.times(SECONDS_PER_MONTH);
    entity.plansCreated = 0;
    entity.subscriptionsCreated = 0;
    entity.totalGrossVolume = BigInt.zero();
    entity.totalFeesCollected = BigInt.zero();
    entity.totalFeeWithdrawals = BigInt.zero();
    entity.updatedAt = blockTimestamp;
    entity.save();
  }
  return entity;
}


function ensurePlan(
  planId: Bytes,
  sellerAddress: Address,
  blockTimestamp: BigInt,
): Plan {
  let entity = Plan.load(planId);
  if (entity == null) {
    let seller = getOrCreateSeller(sellerAddress, blockTimestamp);
    seller.updatedAt = blockTimestamp;
    seller.save();

    entity = new Plan(planId);
    entity.seller = seller.id;
    entity.duration = BigInt.zero();
    entity.ipfsHash = "";
    entity.active = true;
    entity.createdAt = blockTimestamp;
    entity.updatedAt = blockTimestamp;
    entity.subscriptionCount = 0;
    entity.totalGrossVolume = BigInt.zero();
    entity.totalFeesCollected = BigInt.zero();
    entity.save();
  }
  return entity;
}

function tierId(planId: Bytes, tierId: BigInt): string {
  return planId.toHexString() + "-" + tierId.toString();
}

function getOrCreateTier(
  planId: Bytes,
  id: BigInt,
  blockTimestamp: BigInt,
): Tier {
  let tid = tierId(planId, id);
  let entity = Tier.load(tid);
  if (entity == null) {
    entity = new Tier(tid);
    entity.plan = planId;
    entity.tierId = id;
    entity.price = BigInt.zero();
    entity.label = "";
    entity.active = true;
    entity.createdAt = blockTimestamp;
    entity.updatedAt = blockTimestamp;
    entity.save();
  }
  return entity;
}

function subscriptionStateId(subscriber: Address, planId: Bytes): string {
  return subscriber.toHexString() + "-" + planId.toHexString();
}

export function handleFeeUpdated(event: FeeUpdatedEvent): void {
  let entity = new FeeUpdated(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.newFeeBps = event.params.newFeeBps;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let config = getOrCreateGlobalConfig(
    event.block.timestamp,
    event.block.number,
  );
  config.feeBps = event.params.newFeeBps;
  config.updatedAt = event.block.timestamp;
  config.updatedBlock = event.block.number;
  config.save();

  let tx = new Transaction(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  tx.type = "SET_FEE";
  tx.from = event.transaction.from;
  tx.amount = event.params.newFeeBps;
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}


export function handleFeesWithdrawn(event: FeesWithdrawnEvent): void {
  let entity = new FeesWithdrawn(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.to = event.params.to;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let seller = getOrCreateSeller(event.params.to, event.block.timestamp);
  seller.totalFeeWithdrawn = seller.totalFeeWithdrawn.plus(event.params.amount);
  seller.updatedAt = event.block.timestamp;
  seller.save();

  let daily = getOrCreateDailyStats(event.block.timestamp);
  daily.totalFeeWithdrawals = daily.totalFeeWithdrawals.plus(
    event.params.amount,
  );
  daily.updatedAt = event.block.timestamp;
  daily.save();

  let monthly = getOrCreateMonthlyStats(event.block.timestamp);
  monthly.totalFeeWithdrawals = monthly.totalFeeWithdrawals.plus(
    event.params.amount,
  );
  monthly.updatedAt = event.block.timestamp;
  monthly.save();

  let tx = new Transaction(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  tx.type = "WITHDRAW";
  tx.from = event.transaction.from;
  tx.to = event.params.to;
  tx.amount = event.params.amount;
  tx.seller = seller.id;
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}


export function handleOwnerUpdated(event: OwnerUpdatedEvent): void {
  let entity = new OwnerUpdated(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let config = getOrCreateGlobalConfig(
    event.block.timestamp,
    event.block.number,
  );
  config.owner = event.params.newOwner;
  config.updatedAt = event.block.timestamp;
  config.updatedBlock = event.block.number;
  config.save();
}

export function handlePlanCreated(event: PlanCreatedEvent): void {
  let entity = new PlanCreated(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.planId = event.params.planId;
  entity.seller = event.params.seller;
  entity.duration = event.params.duration;
  entity.ipfsHash = event.params.ipfsHash;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let seller = getOrCreateSeller(event.params.seller, event.block.timestamp);
  seller.planCount = seller.planCount + 1;
  seller.activePlanCount = seller.activePlanCount + 1;
  seller.updatedAt = event.block.timestamp;
  seller.save();

  let plan = ensurePlan(
    event.params.planId,
    event.params.seller,
    event.block.timestamp,
  );
  plan.seller = seller.id;
  plan.duration = event.params.duration;
  plan.ipfsHash = event.params.ipfsHash;
  plan.active = true;
  plan.updatedAt = event.block.timestamp;
  plan.save();

  let daily = getOrCreateDailyStats(event.block.timestamp);
  daily.plansCreated = daily.plansCreated + 1;
  daily.updatedAt = event.block.timestamp;
  daily.save();

  let monthly = getOrCreateMonthlyStats(event.block.timestamp);
  monthly.plansCreated = monthly.plansCreated + 1;
  monthly.updatedAt = event.block.timestamp;
  monthly.save();

  let tx = new Transaction(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  tx.type = "CREATE_PLAN";
  tx.from = event.transaction.from;
  tx.plan = plan.id;
  tx.seller = seller.id;
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}

export function handleTierAdded(event: TierAddedEvent): void {
  let entity = new TierAdded(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.planId = event.params.planId;
  entity.tierId = event.params.tierId;
  entity.price = event.params.price;
  entity.label = event.params.label;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let tier = getOrCreateTier(
    event.params.planId,
    event.params.tierId,
    event.block.timestamp,
  );
  tier.price = event.params.price;
  tier.label = event.params.label;
  tier.updatedAt = event.block.timestamp;
  tier.save();
}


export function handlePlanStatusUpdated(event: PlanStatusUpdatedEvent): void {
  let entity = new PlanStatusUpdated(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.planId = event.params.planId;
  entity.active = event.params.active;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let plan = Plan.load(event.params.planId);
  if (plan == null) {
    return;
  }

  let wasActive = plan.active;
  plan.active = event.params.active;
  plan.updatedAt = event.block.timestamp;
  plan.save();

  if (wasActive != event.params.active) {
    let seller = Seller.load(plan.seller);
    if (seller != null) {
      if (event.params.active) {
        seller.activePlanCount = seller.activePlanCount + 1;
      } else {
        seller.activePlanCount =
          seller.activePlanCount > 0 ? seller.activePlanCount - 1 : 0;
      }
      seller.updatedAt = event.block.timestamp;
      seller.save();
    }
  }
}

export function handlePlanUpdated(event: PlanUpdatedEvent): void {
  let entity = new PlanUpdated(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.planId = event.params.planId;
  entity.duration = event.params.duration;
  entity.ipfsHash = event.params.ipfsHash;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let plan = Plan.load(event.params.planId);
  if (plan != null) {
    let oldDuration = plan.duration;
    let oldIpfsHash = plan.ipfsHash;

    plan.duration = event.params.duration;
    plan.ipfsHash = event.params.ipfsHash;
    plan.updatedAt = event.block.timestamp;
    plan.save();

    let update = new PlanUpdate(
      getLegacyEventId(event.transaction.hash, event.logIndex),
    );
    update.plan = plan.id;
    update.oldDuration = oldDuration;
    update.newDuration = event.params.duration;
    update.oldIpfsHash = oldIpfsHash;
    update.newIpfsHash = event.params.ipfsHash;
    update.blockNumber = event.block.number;
    update.blockTimestamp = event.block.timestamp;
    update.transactionHash = event.transaction.hash;
    update.save();

    let tx = new Transaction(
      getLegacyEventId(event.transaction.hash, event.logIndex),
    );
    tx.type = "UPDATE_PLAN";
    tx.from = event.transaction.from;
    tx.plan = plan.id;
    tx.seller = plan.seller;
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.save();
  }
}

export function handleSubscribed(event: SubscribedEvent): void {
  let entity = new Subscribed(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  entity.subscriber = event.params.subscriber;
  entity.seller = event.params.seller;
  entity.planId = event.params.planId;
  entity.plan = event.params.planId;
  entity.tierId = event.params.tierId;
  entity.totalAmount = event.params.totalAmount;
  entity.feeAmount = event.params.feeAmount;
  entity.buyerData = event.params.buyerData;
  entity.startTime = event.params.startTime;
  entity.endTime = event.params.endTime;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let tid = tierId(event.params.planId, event.params.tierId);
  entity.tier = tid;

  entity.save();

  let seller = getOrCreateSeller(event.params.seller, event.block.timestamp);
  seller.subscriptionCount = seller.subscriptionCount + 1;
  seller.totalGrossRevenue = seller.totalGrossRevenue.plus(
    event.params.totalAmount,
  );
  seller.totalNetRevenue = seller.totalNetRevenue.plus(
    event.params.totalAmount.minus(event.params.feeAmount),
  );
  seller.totalFeeContributed = seller.totalFeeContributed.plus(
    event.params.feeAmount,
  );
  seller.updatedAt = event.block.timestamp;
  seller.save();

  let subscriber = getOrCreateSubscriber(
    event.params.subscriber,
    event.block.timestamp,
  );
  subscriber.subscriptionCount = subscriber.subscriptionCount + 1;
  subscriber.totalSpent = subscriber.totalSpent.plus(event.params.totalAmount);
  subscriber.totalFeesPaid = subscriber.totalFeesPaid.plus(
    event.params.feeAmount,
  );
  subscriber.updatedAt = event.block.timestamp;

  let plan = ensurePlan(
    event.params.planId,
    event.params.seller,
    event.block.timestamp,
  );
  plan.subscriptionCount = plan.subscriptionCount + 1;
  plan.totalGrossVolume = plan.totalGrossVolume.plus(event.params.totalAmount);
  plan.totalFeesCollected = plan.totalFeesCollected.plus(
    event.params.feeAmount,
  );
  plan.lastSubscriptionAt = event.block.timestamp;
  plan.updatedAt = event.block.timestamp;
  plan.save();

  let stateKey = subscriptionStateId(
    event.params.subscriber,
    event.params.planId,
  );
  let state = SubscriptionState.load(stateKey);
  let previousStatus = "";
  if (state != null) {
    previousStatus = state.status;
  }

  if (state == null) {
    state = new SubscriptionState(stateKey);
    state.subscriber = subscriber.id;
    state.seller = seller.id;
    state.plan = plan.id;
    state.status = "EXPIRED";
    state.subscriptionCount = 0;
    state.totalSpent = BigInt.zero();
    state.totalFeesPaid = BigInt.zero();
    state.firstStartTime = event.params.startTime;
    state.lastStartTime = event.params.startTime;
    state.lastEndTime = event.params.endTime;
    state.lastBuyerData = event.params.buyerData;
    state.lastTierId = event.params.tierId;
    state.firstSeenAt = event.block.timestamp;
    state.updatedAt = event.block.timestamp;
    state.lastTxHash = event.transaction.hash;
  }

  state.status =
    event.params.endTime >= event.block.timestamp ? "ACTIVE" : "EXPIRED";

  if (previousStatus == "") {
    if (state.status == "ACTIVE") {
      subscriber.activeSubscriptionCount =
        subscriber.activeSubscriptionCount + 1;
    }
  } else if (previousStatus != state.status) {
    if (state.status == "ACTIVE") {
      subscriber.activeSubscriptionCount =
        subscriber.activeSubscriptionCount + 1;
    } else if (subscriber.activeSubscriptionCount > 0) {
      subscriber.activeSubscriptionCount =
        subscriber.activeSubscriptionCount - 1;
    }
  }

  subscriber.save();

  state.subscriptionCount = state.subscriptionCount + 1;
  state.totalSpent = state.totalSpent.plus(event.params.totalAmount);
  state.totalFeesPaid = state.totalFeesPaid.plus(event.params.feeAmount);
  state.lastStartTime = event.params.startTime;
  state.lastEndTime = event.params.endTime;
  state.lastBuyerData = event.params.buyerData;
  state.lastTierId = event.params.tierId;
  state.updatedAt = event.block.timestamp;
  state.lastTxHash = event.transaction.hash;
  state.save();

  let daily = getOrCreateDailyStats(event.block.timestamp);
  daily.subscriptionsCreated = daily.subscriptionsCreated + 1;
  daily.totalGrossVolume = daily.totalGrossVolume.plus(
    event.params.totalAmount,
  );
  daily.totalFeesCollected = daily.totalFeesCollected.plus(
    event.params.feeAmount,
  );
  daily.updatedAt = event.block.timestamp;
  daily.save();

  let monthly = getOrCreateMonthlyStats(event.block.timestamp);
  monthly.subscriptionsCreated = monthly.subscriptionsCreated + 1;
  monthly.totalGrossVolume = monthly.totalGrossVolume.plus(
    event.params.totalAmount,
  );
  monthly.totalFeesCollected = monthly.totalFeesCollected.plus(
    event.params.feeAmount,
  );
  monthly.updatedAt = event.block.timestamp;
  monthly.save();

  let tx = new Transaction(
    getLegacyEventId(event.transaction.hash, event.logIndex),
  );
  tx.type = "SUBSCRIBE";
  tx.from = event.transaction.from;
  tx.to = event.params.seller;
  tx.amount = event.params.totalAmount;
  tx.fee = event.params.feeAmount;
  tx.plan = plan.id;
  tx.seller = seller.id;
  tx.subscriber = subscriber.id;
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}
