
eg code 

```"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { BridgeKit, type BridgeResult } from "@circle-fin/bridge-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import {
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowDownUp,
  ShieldAlert,
  PlusCircle,
  Droplets,
} from "lucide-react";
import {
  createPublicClient,
  http,
  formatUnits,
  parseUnits,
  encodeFunctionData,
  keccak256,
  type Log,
  type EIP1193Provider,
} from "viem";
import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
  lineaSepolia,
} from "viem/chains";
import { arcTestnet, customSepolia, seiTestnet, worldChainSepolia, inkTestnet, xdcApothem, monadTestnet, codexTestnet } from "@/lib/privy_config";
import { useQuery } from "@tanstack/react-query";
import { cn, formatBalance } from "@/lib/utils";

// shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StepState = "bridging" | "pending" | "success" | "error" | "noop";

interface UIStep {
  name: string;
  state: StepState;
  data?: { explorerUrl?: string };
  errorMessage?: string;
}

// BridgeStep is not publicly exported from bridge-kit, so we mirror its shape
interface BridgeKitStep {
  name: string;
  state: "pending" | "success" | "error" | "noop";
  explorerUrl?: string;
  data?: unknown;
  errorMessage?: string;
  error?: unknown;
}

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

type BridgeChain =
  | "Arc_Testnet"
  | "Base_Sepolia"
  | "Arbitrum_Sepolia"
  | "Avalanche_Fuji"
  | "Ethereum_Sepolia"
  | "Optimism_Sepolia"
  | "Polygon_Amoy_Testnet"
  | "Unichain_Sepolia"
  | "Linea_Sepolia"
  | "Sei_Testnet"
  | "World_Chain_Sepolia"
  | "Ink_Testnet"
  | "XDC_Apothem"
  | "Monad_Testnet"
  | "Codex_Testnet";

const SUPPORTED_CHAINS = [
  {
    name: "Arc Testnet",
    identifier: "Arc_Testnet" as BridgeChain,
    viemChain: arcTestnet,
    usdcAddress: null,
    decimals: 18,
    symbol: "Arc",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    name: "Base Sepolia",
    identifier: "Base_Sepolia" as BridgeChain,
    viemChain: baseSepolia,
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6,
    symbol: "Base",
    icon: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4", // Base Logo
  },
  {
    name: "Arbitrum Sepolia",
    identifier: "Arbitrum_Sepolia" as BridgeChain,
    viemChain: {
      ...arbitrumSepolia,
      fees: {
        ...arbitrumSepolia.fees,
        /**
         * Arbitrum Sepolia requires a minimum priority fee of 25 Gwei.
         * We override the estimation to ensure transactions are accepted by the network.
         */
        async estimateFeesPerGas() {
          return {
            maxPriorityFeePerGas: parseUnits("30", 9), // 30 Gwei for buffer
            maxFeePerGas: parseUnits("50", 9), // 50 Gwei for buffer
          };
        },
      },
    },
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    decimals: 6,
    symbol: "Arb",
    icon: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
  {
    name: "Avalanche Fuji",
    identifier: "Avalanche_Fuji" as BridgeChain,
    viemChain: avalancheFuji,
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    decimals: 6,
    symbol: "Avax",
    icon: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
  {
    name: "Ethereum Sepolia",
    identifier: "Ethereum_Sepolia" as BridgeChain,
    viemChain: customSepolia,
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    symbol: "Eth",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    name: "OP Sepolia",
    identifier: "Optimism_Sepolia" as BridgeChain,
    viemChain: optimismSepolia,
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    decimals: 6,
    symbol: "OP",
    icon: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
  },
  {
    name: "Polygon Amoy",
    identifier: "Polygon_Amoy_Testnet" as BridgeChain,
    viemChain: {
      ...polygonAmoy,
      fees: {
        ...polygonAmoy.fees,
        /**
         * Polygon Amoy requires a minimum priority fee of 25 Gwei.
         * We override the estimation to ensure transactions are accepted by the network.
         */
        async estimateFeesPerGas() {
          return {
            maxPriorityFeePerGas: parseUnits("30", 9), // 30 Gwei for buffer
            maxFeePerGas: parseUnits("50", 9), // 50 Gwei for buffer
          };
        },
      },
    },
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    decimals: 6,
    symbol: "Matic",
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    name: "Unichain Sepolia",
    identifier: "Unichain_Sepolia" as BridgeChain,
    viemChain: unichainSepolia,
    usdcAddress: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    decimals: 6,
    symbol: "Uni",
    icon: "https://ethglobal.storage/static/faucet/unichain.png",
  },
  {
    name: "Linea Sepolia",
    identifier: "Linea_Sepolia" as BridgeChain,
    viemChain: lineaSepolia,
    usdcAddress: "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7",
    decimals: 6,
    symbol: "Linea",
    icon: "https://ethglobal.storage/static/faucet/linea-sepolia.png",
  },
  {
    name: "Sei Testnet",
    identifier: "Sei_Testnet" as BridgeChain,
    viemChain: seiTestnet,
    usdcAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    decimals: 6,
    symbol: "Sei",
    icon: "https://cryptologos.cc/logos/sei-sei-logo.png",
  },
  {
    name: "World Chain Sepolia",
    identifier: "World_Chain_Sepolia" as BridgeChain,
    viemChain: worldChainSepolia,
    usdcAddress: "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88",
    decimals: 6,
    symbol: "WLD",
    icon: "https://ethglobal.storage/static/faucet/world-chain-sepolia.png",
  },
  {
    name: "Ink Testnet",
    identifier: "Ink_Testnet" as BridgeChain,
    viemChain: inkTestnet,
    usdcAddress: "0xFabab97dCE620294D2B0b0e46C68964e326300Ac",
    decimals: 6,
    symbol: "Ink",
    icon: "https://inkonchain.com/logo/ink-mark-light.webp",
  },
  {
    name: "XDC Apothem",
    identifier: "XDC_Apothem" as BridgeChain,
    viemChain: xdcApothem,
    usdcAddress: "0xb5AB69F7bBada22B28e79C8FFAECe55eF1c771D4",
    decimals: 6,
    symbol: "XDC",
    icon: "/xdc-faucet-logo.png",
  },
  {
    name: "Monad Testnet",
    identifier: "Monad_Testnet" as BridgeChain,
    viemChain: monadTestnet,
    usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    decimals: 6,
    symbol: "MON",
    icon: "https://ethglobal.storage/static/faucet/monad-testnet.png",
  },
  {
    name: "Codex Testnet",
    identifier: "Codex_Testnet" as BridgeChain,
    viemChain: codexTestnet,
    usdcAddress: "0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f",
    decimals: 6,
    symbol: "ETH",
    icon: "https://codex.xyz/logo.svg",
  },
];

const TOKEN_MESSENGER_ABI = [
  {
    name: "depositForBurn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
    ],
    outputs: [{ name: "nonce", type: "uint64" }],
  },
] as const;

// CCTP V2 Testnet — same MessageTransmitter on every testnet chain (Circle docs)
const MESSAGE_TRANSMITTER_ADDRESS =
  "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";
// keccak256("MessageSent(bytes)") — topic emitted by TokenMessenger on burn
const MESSAGE_SENT_TOPIC =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";
const CCTP_ATTESTATION_API =
  "https://iris-api-sandbox.circle.com/v1/attestations/";

const RECEIVE_MESSAGE_ABI = [
  {
    name: "receiveMessage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

const CCTP_CONFIG: Record<BridgeChain, { messenger: string; domain: number }> =
  {
    Ethereum_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 0,
    },
    Avalanche_Fuji: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 1,
    },
    Optimism_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 2,
    },
    Arbitrum_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 3,
    },
    Base_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 6,
    },
    Polygon_Amoy_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 7,
    },
    Unichain_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 10,
    },
    Linea_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 11,
    },
    Arc_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 26,
    },
    Sei_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 16,
    },
    World_Chain_Sepolia: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 14,
    },
    Ink_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 21,
    },
    XDC_Apothem: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 18,
    },
    Monad_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 15,
    },
    Codex_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 12,
    },
  };

export default function BridgeUSDC() {
  const { user, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [amount, setAmount] = useState("1.00");
  const [status, setStatus] = useState<
    "idle" | "bridging" | "success" | "error"
  >("idle");
  const [steps, setSteps] = useState<UIStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { client } = useSmartWallets();
  const smartAccount = client?.account; // Access account directly from the smart wallet client

  // Synchronous guard — prevents double-burn on fast double-clicks
  const isBridging = useRef(false);

  // Chain state
  const [sourceKey, setSourceKey] = useState<BridgeChain>("Arc_Testnet");
  const [destKey, setDestKey] = useState<BridgeChain>("Base_Sepolia");

  const sourceChain = useMemo(
    () => SUPPORTED_CHAINS.find((c) => c.identifier === sourceKey)!,
    [sourceKey],
  );
  const destChain = useMemo(
    () => SUPPORTED_CHAINS.find((c) => c.identifier === destKey)!,
    [destKey],
  );

  const handleSourceChange = (newSource: BridgeChain) => {
    if (newSource === destKey) {
      // Swap them
      setDestKey(sourceKey);
    }
    setSourceKey(newSource);
  };

  const handleDestChange = (newDest: BridgeChain) => {
    if (newDest === sourceKey) {
      // Swap them
      setSourceKey(destKey);
    }
    setDestKey(newDest);
  };

  const switchChains = () => {
    const temp = sourceKey;
    setSourceKey(destKey);
    setDestKey(temp);
    setAmount("1.00");
    setStatus("idle");
    setSteps([]);
  };

  // Add a chain to MetaMask via wallet_addEthereumChain
  const addChainToWallet = async (chainKey: BridgeChain) => {
    if (!wallet) return;
    const chain = SUPPORTED_CHAINS.find((c) => c.identifier === chainKey)!;
    const v = chain.viemChain;
    try {
      const provider = await wallet.getEthereumProvider();
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${v.id.toString(16)}`,
            chainName: v.name,
            nativeCurrency: v.nativeCurrency,
            rpcUrls: v.rpcUrls.default.http,
            blockExplorerUrls: v.blockExplorers
              ? [v.blockExplorers.default.url]
              : undefined,
          },
        ],
      });
    } catch (e: unknown) {
      console.error("Failed to add chain:", e);
    }
  };

  // Add USDC token to MetaMask via wallet_watchAsset
  const addTokenToWallet = async (chainKey: BridgeChain) => {
    if (!wallet) return;
    const chain = SUPPORTED_CHAINS.find((c) => c.identifier === chainKey)!;
    if (!chain.usdcAddress) return;
    try {
      await addChainToWallet(chainKey);
      const provider = await wallet.getEthereumProvider();
      await (provider as EIP1193Provider).request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: chain.usdcAddress as `0x${string}`,
            symbol: "USDC",
            decimals: chain.decimals,
            image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
          },
        },
      });
    } catch (e: unknown) {
      console.error("Failed to add token:", e);
    }
  };

  const address = smartAccount?.address || user?.wallet?.address;
  const wallet = useMemo(() => {
    return wallets.find(
      (w) => w.address.toLowerCase() === user?.wallet?.address?.toLowerCase(),
    );
  }, [wallets, user?.wallet?.address]);

  const clients = useMemo(() => {
    const cache = {} as Record<BridgeChain, unknown>;
    SUPPORTED_CHAINS.forEach((chain) => {
      cache[chain.identifier] = createPublicClient({
        chain: chain.viemChain,
        transport: http(undefined, {
          batch: true,
          retryCount: 2,
          retryDelay: 1000,
        }),
        batch: { multicall: true },
      });
    });
    return cache as Record<BridgeChain, ReturnType<typeof createPublicClient>>;
  }, []);

  const getBalance = useCallback(
    async (chainKey: BridgeChain, isNative: boolean = false) => {
      if (!address) return "0.00";
      const chain = SUPPORTED_CHAINS.find((c) => c.identifier === chainKey)!;

      try {
        const publicClient = clients[chainKey];
        let balance: bigint;
        if (isNative || !chain.usdcAddress) {
          balance = await publicClient.getBalance({
            address: address as `0x${string}`,
          });
          const decimals = chain.viemChain.nativeCurrency.decimals;
          return formatUnits(balance, decimals);
        } else {
          balance = await publicClient.readContract({
            address: chain.usdcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          });
          return formatUnits(balance, chain.decimals);
        }
      } catch (e) {
        console.error(`Error fetching balance for ${chain.name}:`, e);
        return "0.00";
      }
    },
    [address, clients],
  );

  const {
    data: sourceBalance = "0.00",
    isLoading: isLoadingSource,
    refetch: refetchSource,
  } = useQuery({
    queryKey: ["balance", sourceKey, address, "usdc"],
    queryFn: () => getBalance(sourceKey, false),
    enabled: !!address && status !== "bridging",
  });

  const { data: nativeSourceBalance = "0.00", refetch: refetchNativeSource } =
    useQuery({
      queryKey: ["balance", sourceKey, address, "native"],
      queryFn: () => getBalance(sourceKey, true),
      enabled: !!address && status !== "bridging",
    });

  const {
    data: destBalance = "0.00",
    isLoading: isLoadingDest,
    refetch: refetchDest,
  } = useQuery({
    queryKey: ["balance", destKey, address, "usdc"],
    queryFn: () => getBalance(destKey, false),
    enabled: !!address && status !== "bridging",
  });

  const { data: nativeDestBalance = "0.00", refetch: refetchNativeDest } =
    useQuery({
      queryKey: ["balance", destKey, address, "native"],
      queryFn: () => getBalance(destKey, true),
      enabled: !!address && status !== "bridging",
    });

  const isLoadingBalances = isLoadingSource || isLoadingDest;

  const handleBridge = async () => {
    if (isBridging.current) return;
    isBridging.current = true;

    if (!wallet) {
      setError("Please connect your wallet first.");
      isBridging.current = false;
      return;
    }

    if (parseFloat(nativeSourceBalance) < 0.001) {
      setError(
        `Insufficient ${sourceChain.viemChain.nativeCurrency.symbol} for gas.`,
      );
      isBridging.current = false;
      return;
    }

    if (parseFloat(amount) > parseFloat(sourceBalance)) {
      setError("Amount exceeds available balance.");
      isBridging.current = false;
      return;
    }

    // Batch approve+burn into a single ERC-4337 UserOperation (1 signature)
    // Works for any CCTP-supported chain when a smart account is available
    const canBatch = !!smartAccount;

    setStatus("bridging");
    setError(null);
    setSteps([]);

    try {
      const provider = await wallet.getEthereumProvider();

      if (canBatch && smartAccount) {
        // ── Step 1: Approve + DepositForBurn batched into a single UserOp ──────────
        setSteps([{ name: "Approve & Burn (Batched)", state: "bridging" }]);

        const amountWei = parseUnits(amount, sourceChain.decimals);
        const destinationDomain = CCTP_CONFIG[destKey].domain;
        const messenger = CCTP_CONFIG[sourceKey].messenger;
        const recipientBytes32 = ("0x000000000000000000000000" +
          address!.substring(2)) as `0x${string}`;

        const calls = [
          {
            to: sourceChain.usdcAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: [
                {
                  name: "approve",
                  type: "function",
                  inputs: [
                    { name: "spender", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                },
              ],
              functionName: "approve",
              args: [messenger as `0x${string}`, amountWei],
            }),
          },
          {
            to: messenger as `0x${string}`,
            data: encodeFunctionData({
              abi: TOKEN_MESSENGER_ABI,
              functionName: "depositForBurn",
              args: [
                amountWei,
                destinationDomain,
                recipientBytes32,
                sourceChain.usdcAddress as `0x${string}`,
              ],
            }),
          },
        ];

        const txHash = await client.sendTransaction({ calls });
        setSteps([
          {
            name: "Approve & Burn (Batched)",
            state: "success",
            data: {
              explorerUrl: `${sourceChain.viemChain.blockExplorers?.default.url}/tx/${txHash}`,
            },
          },
        ]);

        // ── Step 2: Wait for receipt & parse MessageSent log ─────────────────────
        setSteps((prev) => [
          ...prev,
          { name: "Confirming Burn", state: "bridging" },
        ]);
        const srcPublicClient = clients[sourceKey];
        const receipt = await srcPublicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        const msgLog = receipt.logs.find(
          (l: Log) => l.topics[0]?.toLowerCase() === MESSAGE_SENT_TOPIC,
        );
        if (!msgLog)
          throw new Error(
            "MessageSent event not found in receipt — check that the source chain TokenMessenger is correct.",
          );

        const messageBytes = msgLog.data as `0x${string}`;
        const messageHash = keccak256(messageBytes);
        setSteps((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], state: "success" },
        ]);

        // ── Step 3: Poll Circle attestation API ──────────────────────────────────
        setSteps((prev) => [
          ...prev,
          { name: "Waiting for Attestation", state: "bridging" },
        ]);
        let attestation = "";
        for (let i = 0; i < 90; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const res = await fetch(`${CCTP_ATTESTATION_API}${messageHash}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === "complete" && data.attestation) {
                attestation = data.attestation;
                break;
              }
            }
          } catch {
            /* retry */
          }
        }
        if (!attestation)
          throw new Error("Attestation timed out after 7.5 minutes.");
        setSteps((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], state: "success" },
        ]);

        // ── Step 4: Switch to destination chain & call receiveMessage ─────────────
        setSteps((prev) => [
          ...prev,
          { name: "Minting on Destination", state: "bridging" },
        ]);
        const provider = await wallet.getEthereumProvider();
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${destChain.viemChain.id.toString(16)}` }],
          });
        } catch {
          // Chain may already be added; try adding it first
          await addChainToWallet(destKey);
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${destChain.viemChain.id.toString(16)}` }],
          });
        }

        const receiveData = encodeFunctionData({
          abi: RECEIVE_MESSAGE_ABI,
          functionName: "receiveMessage",
          args: [messageBytes, attestation as `0x${string}`],
        });

        const mintTxHash = (await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: MESSAGE_TRANSMITTER_ADDRESS,
              data: receiveData,
            },
          ],
        })) as `0x${string}`;

        setSteps((prev) => [
          ...prev.slice(0, -1),
          {
            ...prev[prev.length - 1],
            state: "success",
            data: {
              explorerUrl: `${destChain.viemChain.blockExplorers?.default.url}/tx/${mintTxHash}`,
            },
          },
        ]);
      } else {
        // Robust Gas Fee Fix: Intercept the provider's request method
        // This ensures that even if the SDK hardcodes low fees, we force the correct values
        // right before they reach MetaMask.
        const interceptedProvider: EIP1193Provider = {
          ...provider,
          request: async (args: any) => {
            if (
              args.method === "eth_sendTransaction" &&
              args.params?.[0] &&
              (sourceKey === "Arbitrum_Sepolia" ||
                sourceKey === "Polygon_Amoy_Testnet")
            ) {
              const tx = args.params[0];
              console.log("Intercepted Bridge Transaction:", tx);

              // Force the gas values to meet network minimums
              // maxPriorityFeePerGas: 30 Gwei, maxFeePerGas: 60 Gwei (to be safe above base fee)
              tx.maxPriorityFeePerGas = `0x${parseUnits("30", 9).toString(16)}`;
              tx.maxFeePerGas = `0x${parseUnits("60", 9).toString(16)}`;

              console.log("Forced Gas Overrides Applied:", {
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                maxFeePerGas: tx.maxFeePerGas,
              });
            }
            return (provider as any).request(args);
          },
        } as any;

        const kit = new BridgeKit();
        const adapter = await createViemAdapterFromProvider({
          provider: interceptedProvider,
        } as any);

        // Still pass gas values to kit.bridge if supported (as a fallback)
        const gasOverrides =
          sourceKey === "Arbitrum_Sepolia" ||
          sourceKey === "Polygon_Amoy_Testnet"
            ? {
                maxPriorityFeePerGas: parseUnits("30", 9),
                maxFeePerGas: parseUnits("60", 9),
              }
            : {};

        const result = await kit.bridge({
          from: { adapter, chain: sourceKey },
          to: { adapter, chain: destKey },
          amount: formatBalance(amount, 6),
          ...gasOverrides,
        });

        setSteps(
          (result as BridgeResult).steps?.map((s: BridgeKitStep) => ({
            name: s.name,
            state: s.state as StepState,
            data: s.explorerUrl ? { explorerUrl: s.explorerUrl } : undefined,
            errorMessage: s.errorMessage,
          })) ?? [],
        );

        if (result.state === "error") {
          const failedStep = result.steps?.find(
            (s: BridgeKitStep) => s.state === "error",
          );
          setError(
            failedStep
              ? `Failed at step: ${failedStep.name}`
              : "Bridging failed.",
          );
          setStatus("error");
          return;
        }
      }

      setStatus("success");
      refetchSource();
      refetchDest();
      refetchNativeSource();
      refetchNativeDest();
    } catch (err: unknown) {
      console.error("Bridge Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during bridging.",
      );
      setStatus("error");
    } finally {
      isBridging.current = false;
    }
  };

  const isValidAmount = useMemo(() => {
    const val = parseFloat(amount);
    return !isNaN(val) && val > 0 && val <= parseFloat(sourceBalance);
  }, [amount, sourceBalance]);

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div
        className={cn(
          "flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center transition-all duration-500",
          !authenticated && "opacity-50 blur-[1px] pointer-events-none",
        )}
      >
        {/* Left Side: Setup & Warning */}
        <div className="w-full lg:max-w-sm space-y-6 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md  flex items-center justify-center text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Wallet Setup
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addChainToWallet(sourceKey)}
                className="bg-background cursor-pointer h-auto py-3 px-4 flex flex-col gap-1 items-start text-left hover:bg-accent"
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground/60">
                  Add Chain
                </span>
                <span className="text-xs font-semibold truncate w-full">
                  {sourceChain.name}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addTokenToWallet(sourceKey)}
                className="bg-background cursor-pointer h-auto py-3 px-4 flex flex-col gap-1 items-start text-left hover:bg-accent"
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground/60">
                  Import USDC
                </span>
                <span className="text-xs font-semibold truncate w-full">
                  on {sourceChain.name}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addChainToWallet(destKey)}
                className="bg-background cursor-pointer h-auto py-3 px-4 flex flex-col gap-1 items-start text-left hover:bg-accent"
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground/60">
                  Add Chain
                </span>
                <span className="text-xs font-semibold truncate w-full">
                  {destChain.name}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addTokenToWallet(destKey)}
                className="bg-background cursor-pointer h-auto py-3 px-4 flex flex-col gap-1 items-start text-left hover:bg-accent"
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground/60">
                  Import USDC
                </span>
                <span className="text-xs font-semibold truncate w-full">
                  on {destChain.name}
                </span>
              </Button>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Risk Warning Section */}
          <div className="space-y-4">
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-destructive"
            >
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-bold">
                Important Wallet Setup
              </AlertTitle>
              <AlertDescription className="text-xs font-medium">
                Please ensure you have added the required chains and tokens to
                your wallet before bridging to avoid losing funds. If already
                imported, you may proceed safely.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="bg-background cursor-pointer h-10 text-xs font-bold gap-2 hover:bg-accent border-border/50"
                onClick={() => addChainToWallet(sourceKey)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add {sourceChain.name}
              </Button>
              <Button
                variant="secondary"
                className="bg-background cursor-pointer h-10 text-xs font-bold gap-2 hover:bg-accent border-border/50"
                onClick={() => addTokenToWallet(sourceKey)}
              >
                <Droplets className="h-3.5 w-3.5" />
                Import USDC
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Bridge Card */}
        <div className="w-full max-w-md order-1 lg:order-2">
          <Card className="border-border bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Swap
                </CardTitle>
                <CardDescription>Bridge USDC across testnets</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  refetchSource();
                  refetchDest();
                }}
                disabled={status === "bridging" || isLoadingBalances}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoadingBalances && "animate-spin")}
                />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Source Chain */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                  <span>From</span>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      {isLoadingSource ? (
                        <Skeleton className="h-3 w-12" />
                      ) : (
                        <span>{formatBalance(sourceBalance)} USDC</span>
                      )}
                    </div>
                    {!isLoadingSource && (
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatBalance(nativeSourceBalance)}{" "}
                        {sourceChain.viemChain.nativeCurrency.symbol}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl  border border-border space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Select
                      value={sourceKey}
                      onValueChange={(val) =>
                        handleSourceChange(val as BridgeChain)
                      }
                      disabled={status === "bridging"}
                    >
                      <SelectTrigger className="w-[180px] border-none shadow-none bg-transparent hover:bg-accent font-bold text-lg h-auto py-1 px-2 text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.map((c) => (
                          <SelectItem key={c.identifier} value={c.identifier}>
                            <div className="flex items-center gap-2">
                              {c.icon && (
                                <img 
                                  src={c.icon} 
                                  alt="" 
                                  className={cn(
                                    "h-4 w-4 rounded-full object-contain",
                                    (c.identifier === "Sei_Testnet" || 
                                     c.identifier === "World_Chain_Sepolia" || 
                                     c.identifier === "Linea_Sepolia") && "dark:invert",
                                    (c.identifier === "XDC_Apothem" || 
                                     c.identifier === "Codex_Testnet") && "invert dark:invert-0"
                                  )} 
                                />
                              )}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-right">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={status === "bridging"}
                        placeholder="0.00"
                        className="bg-transparent text-right text-2xl font-bold outline-none w-full max-w-[150px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-none"
                      >
                        {sourceChain.symbol}
                      </Badge>
                      {!isLoadingSource &&
                        parseFloat(nativeSourceBalance) < 0.01 && (
                          <Badge
                            variant="outline"
                            className="text-warning-foreground border-warning bg-warning"
                          >
                            Low Gas
                          </Badge>
                        )}
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-primary font-bold"
                      onClick={() => {
                        if (sourceKey === "Arc_Testnet") {
                          const bal = parseFloat(sourceBalance);
                          // Truncate to 6 decimals for bridge compatibility
                          const buffered = Math.max(0, bal - 1).toString();
                          setAmount(formatBalance(buffered, 6));
                        } else {
                          // Ensure even non-Arc balances are capped at 6 decimals for UI/Bridge consistency
                          setAmount(formatBalance(sourceBalance, 6));
                        }
                      }}
                      disabled={status === "bridging"}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="relative flex items-center justify-center  z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-md bg-background border-border h-10 w-10 hover:bg-accent"
                  onClick={switchChains}
                  disabled={status === "bridging"}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>

              {/* Destination Chain */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                  <span>To</span>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      {isLoadingDest ? (
                        <Skeleton className="h-3 w-12" />
                      ) : (
                        <span>{formatBalance(destBalance)} USDC</span>
                      )}
                    </div>
                    {!isLoadingDest && (
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatBalance(nativeDestBalance)}{" "}
                        {destChain.viemChain.nativeCurrency.symbol}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Select
                      value={destKey}
                      onValueChange={(val) =>
                        handleDestChange(val as BridgeChain)
                      }
                      disabled={status === "bridging"}
                    >
                      <SelectTrigger className="w-[180px] border-none shadow-none bg-transparent hover:bg-accent font-bold text-lg h-auto py-1 px-2 text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.map((c) => (
                          <SelectItem key={c.identifier} value={c.identifier}>
                            <div className="flex items-center gap-2">
                              {c.icon && (
                                <img 
                                  src={c.icon} 
                                  alt="" 
                                  className={cn(
                                    "h-4 w-4 rounded-full object-contain",
                                    (c.identifier === "Sei_Testnet" || 
                                     c.identifier === "World_Chain_Sepolia" || 
                                     c.identifier === "Linea_Sepolia") && "dark:invert",
                                    (c.identifier === "XDC_Apothem" || 
                                     c.identifier === "Codex_Testnet") && "invert dark:invert-0"
                                  )} 
                                />
                              )}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-right py-1">
                      <span className="text-2xl font-bold text-muted-foreground/50">
                        {amount ? formatBalance(amount) : "0.00"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground border-none"
                    >
                      {destChain.symbol}
                    </Badge>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {status === "success" && (
                <Alert className="border-border">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription className="text-xs">
                    Transaction completed successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Steps Progress */}
              {steps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Progress
                    </p>
                    <div className="space-y-2">
                      {steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                step.state === "success"
                                  ? "bg-primary"
                                  : step.state === "error"
                                    ? "bg-destructive"
                                    : "bg-primary/50 animate-pulse",
                              )}
                            />
                            <span className="font-semibold capitalize">
                              {step.name.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span
                              className={cn(
                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                                step.state === "success"
                                  ? "text-primary border-primary/20"
                                  : step.state === "error"
                                    ? "text-destructive border-destructive/20"
                                    : "text-primary/70 border-primary/10",
                              )}
                            >
                              {step.state}
                            </span>
                            {step.data?.explorerUrl && (
                              <a
                                href={step.data.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <Separator className="opacity-50" />
            
          
            <CardFooter className="pt-2">
              {!isValidAmount &&
              parseFloat(amount) > parseFloat(sourceBalance) ? (
                <Button
                  className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                  disabled
                >
                  Insufficient Balance
                </Button>
              ) : status === "bridging" ? (
                <Button
                  disabled
                  className="w-full bg-primary text-primary-foreground flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bridging in progress...
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={handleBridge}
                        disabled={
                          !isValidAmount ||
                          parseFloat(nativeSourceBalance) < 0.001
                        }
                        className="w-full h-11 font-bold"
                      >
                        Bridge USDC
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isValidAmount && parseFloat(amount) <= 0 && (
                    <TooltipContent>Enter a valid amount</TooltipContent>
                  )}
                  {parseFloat(nativeSourceBalance) < 0.001 && (
                    <TooltipContent>
                      Insufficient native gas tokens
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {!authenticated && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-50">
          <div className="rounded-md bg-background p-8 border border-border max-w-sm w-full">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-[240px] mx-auto">
              Please connect your wallet to view your balances and start
              bridging USDC.
            </p>
            <Button onClick={login} className="w-full font-bold h-12 text-base">
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

