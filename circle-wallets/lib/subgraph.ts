import { SUBGRAPH_URL } from "@/lib/subscription";

type GraphQlError = {
  message: string;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: GraphQlError[];
};

export async function querySubgraph<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Subgraph query failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((entry) => entry.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("Subgraph response did not include data");
  }

  return payload.data;
}

export function toSecondsNow() {
  return Math.floor(Date.now() / 1000);
}

export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function maskAddress(address: string) {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toLowerHex(value: string) {
  return value.toLowerCase();
}
