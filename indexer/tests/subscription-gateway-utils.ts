import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  FeeUpdated,
  FeesWithdrawn,
  OwnerUpdated,
  PlanCreated,
  PlanStatusUpdated,
  Subscribed
} from "../generated/SubscriptionGateway/SubscriptionGateway"

export function createFeeUpdatedEvent(newFeeBps: BigInt): FeeUpdated {
  let feeUpdatedEvent = changetype<FeeUpdated>(newMockEvent())

  feeUpdatedEvent.parameters = new Array()

  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newFeeBps",
      ethereum.Value.fromUnsignedBigInt(newFeeBps)
    )
  )

  return feeUpdatedEvent
}

export function createFeesWithdrawnEvent(
  to: Address,
  amount: BigInt
): FeesWithdrawn {
  let feesWithdrawnEvent = changetype<FeesWithdrawn>(newMockEvent())

  feesWithdrawnEvent.parameters = new Array()

  feesWithdrawnEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  feesWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return feesWithdrawnEvent
}

export function createOwnerUpdatedEvent(newOwner: Address): OwnerUpdated {
  let ownerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent())

  ownerUpdatedEvent.parameters = new Array()

  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerUpdatedEvent
}

export function createPlanCreatedEvent(
  planId: Bytes,
  seller: Address,
  price: BigInt,
  duration: BigInt,
  ipfsHash: string
): PlanCreated {
  let planCreatedEvent = changetype<PlanCreated>(newMockEvent())

  planCreatedEvent.parameters = new Array()

  planCreatedEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromFixedBytes(planId))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam("ipfsHash", ethereum.Value.fromString(ipfsHash))
  )

  return planCreatedEvent
}

export function createPlanStatusUpdatedEvent(
  planId: Bytes,
  active: boolean
): PlanStatusUpdated {
  let planStatusUpdatedEvent = changetype<PlanStatusUpdated>(newMockEvent())

  planStatusUpdatedEvent.parameters = new Array()

  planStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromFixedBytes(planId))
  )
  planStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("active", ethereum.Value.fromBoolean(active))
  )

  return planStatusUpdatedEvent
}

export function createSubscribedEvent(
  subscriber: Address,
  seller: Address,
  planId: Bytes,
  totalAmount: BigInt,
  feeAmount: BigInt,
  buyerData: string,
  startTime: BigInt,
  endTime: BigInt
): Subscribed {
  let subscribedEvent = changetype<Subscribed>(newMockEvent())

  subscribedEvent.parameters = new Array()

  subscribedEvent.parameters.push(
    new ethereum.EventParam(
      "subscriber",
      ethereum.Value.fromAddress(subscriber)
    )
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromFixedBytes(planId))
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam(
      "feeAmount",
      ethereum.Value.fromUnsignedBigInt(feeAmount)
    )
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam("buyerData", ethereum.Value.fromString(buyerData))
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  subscribedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return subscribedEvent
}
