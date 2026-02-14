import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatBalance(balance: string, decimals: number = 2): string {
  if (!balance || balance === "0" || balance === "0.00") return "0.00";
  const parts = balance.split(".");
  if (parts.length === 1) return parts[0] + "." + "0".repeat(decimals);
  const fraction = parts[1].substring(0, decimals);
  return `${parts[0]}.${fraction.padEnd(decimals, "0")}`;
}
