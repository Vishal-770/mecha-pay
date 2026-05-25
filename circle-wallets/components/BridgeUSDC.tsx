"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
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
  type Log,
} from "viem";
import {
  baseSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  unichainSepolia,
} from "viem/chains";
import { arcTestnet, customSepolia, monadTestnet } from "@/lib/privy_config";
import { useQuery } from "@tanstack/react-query";
import { cn, formatBalance } from "@/lib/utils";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { ARC_BLOCKCHAIN } from "@/lib/subscription";

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

interface CircleWalletSummary {
  id: string;
  address: string;
  blockchain: string;
}

interface WalletRequestProvider {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
}

const GAS_CAPS_BY_SELECTOR: Record<string, bigint> = {
  // approve(address,uint256)
  "0x095ea7b3": 120000n,
  // depositForBurn(uint256,uint32,bytes32,address)
  "0x5fe11e4a": 500000n,
  // receiveMessage(bytes,bytes)
  "0x57ecfd28": 900000n,
};

const CONSERVATIVE_GAS_CAPS_BY_SELECTOR: Record<string, bigint> = {
  "0x095ea7b3": 100000n,
  "0x5fe11e4a": 300000n,
  "0x57ecfd28": 700000n,
};

const DEFAULT_TX_GAS_CAP = 900000n;
const CCTP_USE_FAST_TRANSFER = true;
const CCTP_MIN_FINALITY_THRESHOLD = CCTP_USE_FAST_TRANSFER ? 1000 : 2000;
const CCTP_STANDARD_FEE_BUFFER_BPS = 5000n; // +50%
const CCTP_STANDARD_FEE_MIN_BUFFER = 50000n; // 0.05 USDC (6 decimals)
const CCTP_INSUFFICIENT_FEE_MAX_POLLS = 24; // ~2 minutes at 5s interval
const CCTP_MIN_FEE_QUOTE_RETRIES = 3;
const CCTP_FALLBACK_MAX_FEE_BPS = 2000n; // 20% of transfer amount when quote read fails
const CCTP_FALLBACK_MAX_FEE_MIN = 100000n; // 0.10 USDC
const ATTESTATION_POLL_INTERVAL_MS = 5000;
const ATTESTATION_MAX_POLLS = 360;

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
  | "Monad_Testnet";

const SUPPORTED_CHAINS = [
  {
    name: "Arc Testnet",
    identifier: "Arc_Testnet" as BridgeChain,
    viemChain: arcTestnet,
    // Arc uses USDC as native gas (18 decimals), while ERC-20 USDC token operations are 6 decimals.
    usdcAddress: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    symbol: "Arc",
    icon: "/arc-logo.png",
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
    viemChain: arbitrumSepolia,
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    decimals: 6,
    symbol: "Arb",
    icon: "https://ethglobal.storage/static/faucet/arbitrum-sepolia.png",
  },
  {
    name: "Avalanche Fuji",
    identifier: "Avalanche_Fuji" as BridgeChain,
    viemChain: avalancheFuji,
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    decimals: 6,
    symbol: "Avax",
    icon: "/avalanche-logo.png",
  },
  {
    name: "Ethereum Sepolia",
    identifier: "Ethereum_Sepolia" as BridgeChain,
    viemChain: customSepolia,
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    symbol: "Eth",
    icon: "/seoplia-logo.png",
  },
  {
    name: "OP Sepolia",
    identifier: "Optimism_Sepolia" as BridgeChain,
    viemChain: optimismSepolia,
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    decimals: 6,
    symbol: "OP",
    icon: "/op-logo.png",
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
    icon: "/polygon-logo.png",
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
    name: "Monad Testnet",
    identifier: "Monad_Testnet" as BridgeChain,
    viemChain: monadTestnet,
    usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    decimals: 6,
    symbol: "MON",
    icon: "https://ethglobal.storage/static/faucet/monad-testnet.png",
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
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
    ],
    outputs: [{ name: "nonce", type: "uint64" }],
  },
  {
    name: "getMinFeeAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "minFee", type: "uint256" }],
  },
] as const;

// CCTP V2 Testnet — same MessageTransmitter on every testnet chain (Circle docs)
const MESSAGE_TRANSMITTER_ADDRESS =
  "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";
// keccak256("MessageSent(bytes)") — topic emitted by TokenMessenger on burn
const MESSAGE_SENT_TOPIC =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";
const CCTP_MESSAGES_API_BASE =
  "https://iris-api-sandbox.circle.com/v2/messages";

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
    Arc_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 26,
    },
    Monad_Testnet: {
      messenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
      domain: 15,
    },
  };

export default function BridgeUSDC({ 
  isCompact = false, 
  defaultDestChain = "Arc_Testnet" 
}: { 
  isCompact?: boolean; 
  defaultDestChain?: BridgeChain;
}) {
  const { user, authenticated, login, logout } = usePrivy();
  const { session, executeTransaction } = useCircleSDK();
  const { wallets } = useWallets();
  const [amount, setAmount] = useState("1.00");
  const [status, setStatus] = useState<
    "idle" | "bridging" | "success" | "error"
  >("idle");
  const [steps, setSteps] = useState<UIStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const arcCircleWallet = useMemo(() => {
    if (!session?.walletAddress) return null;
    return {
      id: "Arc_Testnet",
      address: session.walletAddress,
      blockchain: ARC_BLOCKCHAIN,
    };
  }, [session?.walletAddress]);
  const isLoadingCircleWallet = false;
  
  // Synchronous guard — prevents double-burn on fast double-clicks
  const isBridging = useRef(false);

  // Chain state
  const [sourceKey, setSourceKey] = useState<BridgeChain>("Ethereum_Sepolia");
  const [destKey, setDestKey] = useState<BridgeChain>(defaultDestChain);

  const sourceChain = useMemo(
    () => SUPPORTED_CHAINS.find((c) => c.identifier === sourceKey)!,
    [sourceKey],
  );
  const destChain = useMemo(
    () => SUPPORTED_CHAINS.find((c) => c.identifier === destKey)!,
    [destKey],
  );

  const bridgeDirectionLabel =
    sourceKey === "Arc_Testnet"
      ? "Circle Wallet (Arc) -> EOA"
      : "EOA -> Circle Wallet (Arc Testnet)";

  const handleSourceChange = (newSource: BridgeChain) => {
    setSourceKey(newSource);
    if (newSource === "Arc_Testnet") {
      if (destKey === "Arc_Testnet") {
        setDestKey("Ethereum_Sepolia");
      }
      return;
    }
    setDestKey("Arc_Testnet");
  };

  const handleDestChange = (newDest?: BridgeChain) => {
    if (!newDest) {
      return;
    }

    if (sourceKey !== "Arc_Testnet") {
      setDestKey("Arc_Testnet");
      return;
    }

    if (newDest === "Arc_Testnet") {
      setDestKey("Ethereum_Sepolia");
      return;
    }

    setDestKey(newDest);
  };

  const switchChains = () => {
    if (sourceKey === "Arc_Testnet" && destKey !== "Arc_Testnet") {
      setSourceKey(destKey);
      setDestKey("Arc_Testnet");
    } else if (sourceKey !== "Arc_Testnet" && destKey === "Arc_Testnet") {
      setSourceKey("Arc_Testnet");
      setDestKey(sourceKey);
    }
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
      const provider = (await wallet.getEthereumProvider()) as unknown as WalletRequestProvider;
      await provider.request({
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

  const address = user?.wallet?.address;
  const sourceAddress =
    sourceKey === "Arc_Testnet" ? arcCircleWallet?.address : address;
  const destinationAddress =
    destKey === "Arc_Testnet" ? arcCircleWallet?.address : address;



  useEffect(() => {
    if (sourceKey === destKey) {
      if (sourceKey === "Arc_Testnet") {
        setDestKey("Ethereum_Sepolia");
      } else {
        setDestKey("Arc_Testnet");
      }
      return;
    }

    if (sourceKey !== "Arc_Testnet" && destKey !== "Arc_Testnet") {
      setDestKey("Arc_Testnet");
    }
  }, [sourceKey, destKey]);

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
    async (
      chainKey: BridgeChain,
      isNative: boolean = false,
      targetAddress?: string,
    ) => {
      if (!targetAddress) return "0.00";
      const chain = SUPPORTED_CHAINS.find((c) => c.identifier === chainKey)!;

      try {
        const publicClient = clients[chainKey];
        let balance: bigint;
        if (isNative || !chain.usdcAddress) {
          balance = await publicClient.getBalance({
            address: targetAddress as `0x${string}`,
          });
          const decimals = chain.viemChain.nativeCurrency.decimals;
          return formatUnits(balance, decimals);
        } else {
          balance = await publicClient.readContract({
            address: chain.usdcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [targetAddress as `0x${string}`],
          });
          return formatUnits(balance, chain.decimals);
        }
      } catch (e) {
        console.error(`Error fetching balance for ${chain.name}:`, e);
        return "0.00";
      }
    },
    [clients],
  );

  const {
    data: sourceBalance = "0.00",
    isLoading: isLoadingSource,
    refetch: refetchSource,
  } = useQuery({
    queryKey: ["balance", sourceKey, sourceAddress, "usdc"],
    queryFn: () => getBalance(sourceKey, false, sourceAddress),
    enabled: !!sourceAddress && status !== "bridging",
  });

  const { data: nativeSourceBalance = "0.00", refetch: refetchNativeSource } =
    useQuery({
      queryKey: ["balance", sourceKey, sourceAddress, "native"],
      queryFn: () => getBalance(sourceKey, true, sourceAddress),
      enabled: !!sourceAddress && status !== "bridging",
    });

  const {
    data: destBalance = "0.00",
    isLoading: isLoadingDest,
    refetch: refetchDest,
  } = useQuery({
    queryKey: ["balance", destKey, destinationAddress, "usdc"],
    queryFn: () => getBalance(destKey, false, destinationAddress),
    enabled: !!destinationAddress && status !== "bridging",
  });

  const { data: nativeDestBalance = "0.00", refetch: refetchNativeDest } =
    useQuery({
      queryKey: ["balance", destKey, destinationAddress, "native"],
      queryFn: () => getBalance(destKey, true, destinationAddress),
      enabled: !!destinationAddress && status !== "bridging",
    });

  const isLoadingBalances = isLoadingSource || isLoadingDest;

  const toRecipientBytes32 = (recipient: string) =>
    (`0x000000000000000000000000${recipient.slice(2).toLowerCase()}` as `0x${string}`);

  const extractTxHash = (input: unknown): `0x${string}` | null => {
    const seen = new Set<unknown>();
    const queue: unknown[] = [input];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || seen.has(current)) continue;
      seen.add(current);

      if (typeof current === "string" && /^0x[a-fA-F0-9]{64}$/.test(current)) {
        return current as `0x${string}`;
      }

      if (Array.isArray(current)) {
        queue.push(...current);
      } else if (typeof current === "object") {
        queue.push(...Object.values(current as Record<string, unknown>));
      }
    }

    return null;
  };

  const requestCircleChallenge = async (
    endpoint: string,
    payload: Record<string, unknown>,
  ): Promise<string> => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Failed to create Circle challenge");
    }
    if (!data.challengeId) {
      throw new Error("Circle did not return a challengeId");
    }

    return data.challengeId;
  };

  const resolveChallengeTxHash = async (
    challengeId: string,
    userToken: string,
  ): Promise<`0x${string}`> => {
    const maxAttempts = 8;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await fetch("/api/bridge/resolve-challenge-tx-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, userToken }),
      });

      const data = await response.json();

      if (response.ok) {
        const txHash = data?.txHash;
        if (txHash && /^0x[a-fA-F0-9]{64}$/.test(txHash)) {
          return txHash as `0x${string}`;
        }
      }

      // 404 is expected while Circle indexes correlation and tx hash.
      if (response.status !== 404 || attempt === maxAttempts) {
        throw new Error(
          data?.error || "Failed to resolve Circle challenge tx hash",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }

    throw new Error("Failed to resolve Circle challenge tx hash");
  };

  const sendEoaTransaction = async ({
    chainKey,
    provider,
    from,
    to,
    data,
  }: {
    chainKey: BridgeChain;
    provider: WalletRequestProvider;
    from: string;
    to: string;
    data: `0x${string}`;
  }): Promise<`0x${string}`> => {
    const selector = data.slice(0, 10).toLowerCase();
    const conservativeCap =
      CONSERVATIVE_GAS_CAPS_BY_SELECTOR[selector] ?? DEFAULT_TX_GAS_CAP;

    const getErrorText = (err: unknown): string => {
      if (typeof err === "string") return err;
      if (err instanceof Error) return err.message;
      if (!err || typeof err !== "object") return "";

      const rec = err as Record<string, unknown>;
      const direct = rec.message;
      if (typeof direct === "string") return direct;

      const nestedError = rec.error as Record<string, unknown> | undefined;
      if (nestedError && typeof nestedError.message === "string") {
        return nestedError.message;
      }

      const nestedData = rec.data as Record<string, unknown> | undefined;
      if (nestedData && typeof nestedData.message === "string") {
        return nestedData.message;
      }

      try {
        return JSON.stringify(err);
      } catch {
        return "";
      }
    };

    const isGasLimitTooHighError = (err: unknown) => {
      const message = getErrorText(err);
      return /gas limit too high|exceeds block gas limit|intrinsic gas too high/i.test(
        message,
      );
    };

    let gasHex: `0x${string}` | undefined;

    try {
      const publicClient = clients[chainKey];
      const selectorCap = GAS_CAPS_BY_SELECTOR[selector] ?? DEFAULT_TX_GAS_CAP;
      const estimated = await publicClient.estimateGas({
        account: from as `0x${string}`,
        to: to as `0x${string}`,
        data,
      });

      // Add a small safety buffer but cap against block gas limit to avoid wallet rejections.
      let gasLimit = (estimated * 120n) / 100n;
      if (gasLimit > selectorCap) {
        gasLimit = selectorCap;
      }

      const latestBlock = await publicClient.getBlock({ blockTag: "latest" });
      if (latestBlock.gasLimit > 0n) {
        const maxAllowed = (latestBlock.gasLimit * 90n) / 100n;
        if (gasLimit > maxAllowed) gasLimit = maxAllowed;
      }

      gasHex = `0x${gasLimit.toString(16)}` as `0x${string}`;
    } catch {
      // If estimation fails, still send with a conservative cap instead of letting wallet guess an oversized limit.
      gasHex = `0x${conservativeCap.toString(16)}` as `0x${string}`;
    }

    const txParams: {
      from: string;
      to: string;
      data: `0x${string}`;
      gas?: `0x${string}`;
    } = {
      from,
      to,
      data,
    };

    if (gasHex) {
      txParams.gas = gasHex;
    }

    const sendWithParams = async (params: { from: string; to: string; data: `0x${string}`; gas?: `0x${string}` }) => {
      return (await provider.request({
        method: "eth_sendTransaction",
        params: [params] as unknown[],
      })) as `0x${string}`;
    };

    try {
      return await sendWithParams(txParams);
    } catch (err) {
      if (isGasLimitTooHighError(err)) {

        try {
          const conservativeParams = {
            from,
            to,
            data,
            gas: `0x${conservativeCap.toString(16)}` as `0x${string}`,
          };
          return await sendWithParams(conservativeParams);
        } catch (err2) {
          if (!isGasLimitTooHighError(err2)) {
            throw err2;
          }
        }

        const retryParams = {
          from,
          to,
          data,
        };
        return await sendWithParams(retryParams);
      }
      throw err;
    }
  };

  const getReadableError = (err: unknown): string => {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "string") return err;
    if (!err || typeof err !== "object") return "Unknown error";

    const rec = err as Record<string, unknown>;
    const candidates = [
      rec.shortMessage,
      rec.message,
      (rec.details as Record<string, unknown> | undefined)?.message,
      (rec.cause as Record<string, unknown> | undefined)?.message,
    ];

    for (const c of candidates) {
      if (typeof c === "string" && c.trim().length > 0) return c;
    }

    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  };

  const handleBridge = async () => {
    if (isBridging.current) return;
    isBridging.current = true;

    if (!wallet) {
      setError("Please connect your EOA wallet first.");
      isBridging.current = false;
      return;
    }

    if (!sourceAddress || !destinationAddress) {
      setError("Missing source or destination wallet address.");
      isBridging.current = false;
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(destinationAddress)) {
      setError("Destination address is invalid.");
      isBridging.current = false;
      return;
    }

    if (!arcCircleWallet && (sourceKey === "Arc_Testnet" || destKey === "Arc_Testnet")) {
      setError("Arc Circle wallet not found. Please register or login first.");
      isBridging.current = false;
      return;
    }

    if (!session && (sourceKey === "Arc_Testnet" || destKey === "Arc_Testnet")) {
      setError("Circle session is required for Arc wallet signing.");
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

    setStatus("bridging");
    setError(null);
    setSteps([]);

    try {
      const amountInUsdc = parseUnits(amount, 6);
      const destinationDomain = CCTP_CONFIG[destKey].domain;
      const messenger = CCTP_CONFIG[sourceKey].messenger;
      const recipientBytes32 = toRecipientBytes32(destinationAddress);

      let burnTxHash: `0x${string}`;
      let burnDataV2: `0x${string}` | null = null;
      let burnMaxFeeHuman = "n/a";
      let feeQuoteSourceLabel = "n/a";

      if (sourceKey === "Arc_Testnet") {
        if (!session) {
          throw new Error("Arc smart account session is required for Arc source bridge.");
        }

        setSteps([{ name: "Approve & Burn", state: "bridging" }]);

        const approveCall = {
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
            args: [messenger as `0x${string}`, amountInUsdc],
          }),
        };

        const burnCall = {
          to: messenger as `0x${string}`,
          data: encodeFunctionData({
            abi: TOKEN_MESSENGER_ABI,
            functionName: "depositForBurn",
            args: [
              amountInUsdc,
              destinationDomain,
              recipientBytes32,
              sourceChain.usdcAddress as `0x${string}`,
              "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
              0n, // maxFee
              1000, // minFinalityThreshold
            ],
          }),
        };

        // Submit the batched call directly on Arc_Testnet
        const result = await executeTransaction([approveCall, burnCall], false, "Arc_Testnet");
        
        burnTxHash = result.txHash;
        burnMaxFeeHuman = "0";
        feeQuoteSourceLabel = "sponsored";
        burnDataV2 = burnCall.data;
      } else {
        const provider = (await wallet.getEthereumProvider()) as unknown as WalletRequestProvider;

        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${sourceChain.viemChain.id.toString(16)}` }],
          });
        } catch {
          await addChainToWallet(sourceKey);
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${sourceChain.viemChain.id.toString(16)}` }],
          });
        }

        const activeChainHex = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const activeChainId = Number.parseInt(activeChainHex, 16);
        if (activeChainId !== sourceChain.viemChain.id) {
          throw new Error(
            `Wallet is on chain ${activeChainId}, expected ${sourceChain.viemChain.id} (${sourceChain.name}). Please switch network and retry.`,
          );
        }

        setSteps([{ name: "Approve", state: "bridging" }]);

        const approveData = encodeFunctionData({
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
          args: [messenger as `0x${string}`, amountInUsdc],
        });

        const approveTxHash = await sendEoaTransaction({
          chainKey: sourceKey,
          provider,
          from: sourceAddress,
          to: sourceChain.usdcAddress as `0x${string}`,
          data: approveData,
        });

        await clients[sourceKey].waitForTransactionReceipt({ hash: approveTxHash });
        setSteps([
          {
            name: "Approve",
            state: "success",
            data: {
              explorerUrl: `${sourceChain.viemChain.blockExplorers?.default.url}/tx/${approveTxHash}`,
            },
          },
          { name: "Burn", state: "bridging" },
        ]);

        let minFee = 0n;
        let feeQuoteReadFailed = false;
        const shouldQuoteMinFee = CCTP_MIN_FINALITY_THRESHOLD >= 2000;

        if (shouldQuoteMinFee) {
          for (let attempt = 1; attempt <= CCTP_MIN_FEE_QUOTE_RETRIES; attempt++) {
            try {
              minFee = await clients[sourceKey].readContract({
                address: messenger as `0x${string}`,
                abi: TOKEN_MESSENGER_ABI,
                functionName: "getMinFeeAmount",
                args: [amountInUsdc],
              });
              feeQuoteReadFailed = false;
              break;
            } catch {
              feeQuoteReadFailed = true;
              if (attempt < CCTP_MIN_FEE_QUOTE_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 750));
              }
            }
          }
        }

        const burnMaxFee = (() => {
          if (!shouldQuoteMinFee || feeQuoteReadFailed) {
            const pctFallback = (amountInUsdc * CCTP_FALLBACK_MAX_FEE_BPS) / 10000n;
            return pctFallback > CCTP_FALLBACK_MAX_FEE_MIN
              ? pctFallback
              : CCTP_FALLBACK_MAX_FEE_MIN;
          }

          if (minFee <= 0n) return 0n;
          const pctBuffer = (minFee * CCTP_STANDARD_FEE_BUFFER_BPS) / 10000n;
          const extra =
            pctBuffer > CCTP_STANDARD_FEE_MIN_BUFFER
              ? pctBuffer
              : CCTP_STANDARD_FEE_MIN_BUFFER;
          return minFee + extra;
        })();

        if (burnMaxFee >= amountInUsdc) {
          throw new Error(
            `Bridge amount too small for current fee quote. Required maxFee ${formatUnits(burnMaxFee, 6)} USDC for transfer amount ${amount} USDC. Increase amount or retry later.`,
          );
        }

        burnMaxFeeHuman = formatUnits(burnMaxFee, 6);
        feeQuoteSourceLabel = !shouldQuoteMinFee
          ? "fast-policy"
          : feeQuoteReadFailed
            ? "fallback"
            : "quoted";
        burnDataV2 = encodeFunctionData({
          abi: TOKEN_MESSENGER_ABI,
          functionName: "depositForBurn",
          args: [
            amountInUsdc,
            destinationDomain,
            recipientBytes32,
            sourceChain.usdcAddress as `0x${string}`,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            burnMaxFee,
            CCTP_MIN_FINALITY_THRESHOLD,
          ],
        });

        burnTxHash = await sendEoaTransaction({
          chainKey: sourceKey,
          provider,
          from: sourceAddress,
          to: messenger,
          data: burnDataV2,
        });
      }

      setSteps((prev) => [
        ...prev.slice(0, -1),
        {
          name: "Burn Submitted",
          state: "pending",
          data: {
            explorerUrl: `${sourceChain.viemChain.blockExplorers?.default.url}/tx/${burnTxHash}`,
          },
        },
        { name: "Confirming Burn", state: "bridging" },
      ]);

      const receipt = await clients[sourceKey].waitForTransactionReceipt({ hash: burnTxHash });

      if (receipt.status !== "success") {
        let revertHint = "";
        try {
          if (burnDataV2) {
            await clients[sourceKey].call({
              account: sourceAddress as `0x${string}`,
              to: messenger as `0x${string}`,
              data: burnDataV2,
            });
          }
        } catch (callErr) {
          const reason = getReadableError(callErr);
          if (reason) {
            revertHint = ` Revert reason: ${reason}`;
          }
        }

        setSteps((prev) =>
          prev.map((step) => {
            if (step.name === "Burn Submitted") {
              return { ...step, state: "error", errorMessage: "Transaction reverted" };
            }
            if (step.name === "Confirming Burn") {
              return { ...step, state: "error" };
            }
            return step;
          }),
        );

        throw new Error(
          `Burn transaction reverted on ${sourceChain.name}. Tx: ${burnTxHash}.${revertHint}`,
        );
      }

      setSteps((prev) =>
        prev.map((step) => {
          if (step.name === "Burn Submitted") {
            return { ...step, name: "Burn", state: "success" };
          }
          if (step.name === "Confirming Burn") {
            return { ...step, state: "success" };
          }
          return step;
        }),
      );

      const msgLog = receipt.logs.find(
        (log: Log) => log.topics[0]?.toLowerCase() === MESSAGE_SENT_TOPIC,
      );
      if (!msgLog) {
        throw new Error(
          `Burn confirmed but MessageSent event not found in receipt. Tx: ${burnTxHash}.`,
        );
      }

      setSteps((prev) => [...prev, { name: "Waiting for Attestation", state: "bridging" }]);
      let attestation = "";
      let attestedMessageBytes: `0x${string}` | null = null;
      const sourceDomain = CCTP_CONFIG[sourceKey].domain;
      let insufficientFeePolls = 0;

      for (let i = 0; i < ATTESTATION_MAX_POLLS; i++) {
        await new Promise((resolve) => setTimeout(resolve, ATTESTATION_POLL_INTERVAL_MS));
        try {
          const qs = new URLSearchParams({
            transactionHash: burnTxHash,
          });
          const response = await fetch(
            `${CCTP_MESSAGES_API_BASE}/${sourceDomain}?${qs.toString()}`,
          );
          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          const messages = Array.isArray(data?.messages)
            ? data.messages
            : [];

          const pendingMessage = messages.find((m: unknown) => {
            const row = m as Record<string, unknown>;
            return row?.status === "pending_confirmations";
          }) as Record<string, unknown> | undefined;

          const delayReason =
            pendingMessage && typeof pendingMessage.delayReason === "string"
              ? pendingMessage.delayReason
              : null;

          if (delayReason === "insufficient_fee") {
            insufficientFeePolls += 1;
            if (insufficientFeePolls >= CCTP_INSUFFICIENT_FEE_MAX_POLLS) {
              throw new Error(
                `Iris reports insufficient_fee for this burn after ${CCTP_INSUFFICIENT_FEE_MAX_POLLS} polls. This transfer is unlikely to complete with current ${feeQuoteSourceLabel} maxFee (${burnMaxFeeHuman} USDC). Submit a new bridge transaction. Burn tx: ${burnTxHash}`,
              );
            }
          }

          if (pendingMessage && i % 12 === 0) {
            const waitingMsg =
              delayReason === "insufficient_fee"
                ? `Attestation delayed: ${feeQuoteSourceLabel} maxFee ${burnMaxFeeHuman} USDC is currently insufficient. Retry with a higher amount so maxFee can cover the current fee quote.`
                : "Iris is waiting for source-chain confirmations...";

            setSteps((prev) =>
              prev.map((step) =>
                step.name === "Waiting for Attestation"
                  ? {
                      ...step,
                      errorMessage: waitingMsg,
                    }
                  : step,
              ),
            );
          }

          const completed = messages.find(
            (m: unknown) => {
              const row = m as Record<string, unknown>;
              return (
                typeof row?.attestation === "string" &&
                row.attestation !== "PENDING" &&
                typeof row?.message === "string" &&
                row.message.startsWith("0x")
              );
            },
          ) as Record<string, unknown> | undefined;

          if (completed) {
            attestation = completed.attestation as string;
            attestedMessageBytes = completed.message as `0x${string}`;
            break;
          }
        } catch (pollErr) {
          if (
            pollErr instanceof Error &&
            pollErr.message.startsWith("Iris reports insufficient_fee")
          ) {
            throw pollErr;
          }
          // retry transient poll errors
        }
      }

      if (!attestation || !attestedMessageBytes) {
        throw new Error("Attestation timed out while waiting for confirmations.");
      }

      setSteps((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], state: "success" },
      ]);

      setSteps((prev) => [...prev, { name: "Minting on Destination", state: "bridging" }]);
      if (destKey === "Arc_Testnet") {
        if (!session) {
          throw new Error("Arc smart account session is required for destination mint.");
        }

        const receiveData = encodeFunctionData({
          abi: RECEIVE_MESSAGE_ABI,
          functionName: "receiveMessage",
          args: [attestedMessageBytes, attestation as `0x${string}`],
        });

        const mintCall = {
          to: MESSAGE_TRANSMITTER_ADDRESS as `0x${string}`,
          data: receiveData,
        };

        const result = await executeTransaction([mintCall], false, "Arc_Testnet");
        const mintTxHash = result.txHash;

        setSteps((prev) => [
          ...prev.slice(0, -1),
          {
            name: "Minting on Destination",
            state: "success",
            data: {
              explorerUrl: `${destChain.viemChain.blockExplorers?.default.url}/tx/${mintTxHash}`,
            },
          },
        ]);
      } else {
        if (!wallet || !address) {
          throw new Error("EOA wallet is required to mint on destination chain.");
        }

        const provider = (await wallet.getEthereumProvider()) as unknown as WalletRequestProvider;
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${destChain.viemChain.id.toString(16)}` }],
          });
        } catch {
          await addChainToWallet(destKey);
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${destChain.viemChain.id.toString(16)}` }],
          });
        }

        const receiveData = encodeFunctionData({
          abi: RECEIVE_MESSAGE_ABI,
          functionName: "receiveMessage",
          args: [attestedMessageBytes, attestation as `0x${string}`],
        });

        const mintTxHash = await sendEoaTransaction({
          chainKey: destKey,
          provider,
          from: address,
          to: MESSAGE_TRANSMITTER_ADDRESS,
          data: receiveData,
        });

        setSteps((prev) => [
          ...prev.slice(0, -1),
          {
            name: "Minting on Destination",
            state: "success",
            data: {
              explorerUrl: `${destChain.viemChain.blockExplorers?.default.url}/tx/${mintTxHash}`,
            },
          },
        ]);
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
    <div className={cn(
      "relative w-full",
      !isCompact && "px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    )}>
      <div
        className={cn(
          "flex flex-col gap-8 transition-all duration-500",
          !isCompact && "lg:flex-row lg:gap-12 items-start justify-center",
          !authenticated && "opacity-80 blur-[0.5px]",
        )}
      >
        {/* Left Side: Setup & Warning (Hidden in Compact mode) */}
        {!isCompact && (
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
        )}

        {/* Right Side: Bridge Card */}
        <div className={cn(
          "w-full order-1 lg:order-2",
          !isCompact && "max-w-md"
        )}>
          <Card className={cn(
            "border-border bg-background",
            isCompact && "border-none shadow-none"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Swap
                </CardTitle>
                <CardDescription>{bridgeDirectionLabel}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {authenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    className="h-8 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => login()}
                    className="h-8 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Connect
                  </Button>
                )}
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
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Source Chain */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                  <span>
                    {sourceKey === "Arc_Testnet"
                      ? "From (Circle Wallet on Arc Testnet)"
                      : "From (EOA)"}
                  </span>
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
                      disabled={status === "bridging" || sourceKey === "Arc_Testnet"}
                    >
                      <SelectTrigger className="w-[180px] border-none shadow-none bg-transparent hover:bg-accent font-bold text-lg h-auto py-1 px-2 text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.filter((c) =>
                          sourceKey === "Arc_Testnet"
                            ? c.identifier === "Arc_Testnet"
                            : c.identifier !== "Arc_Testnet"
                        ).map((c) => (
                          <SelectItem key={c.identifier} value={c.identifier}>
                            <div className="flex items-center gap-2">
                              {c.icon && (
                                <img 
                                  src={c.icon} 
                                  alt="" 
                                  className="h-4 w-4 rounded-full object-contain" 
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
                        setAmount(formatBalance(sourceBalance, 6));
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
                  <span>
                    {destKey === "Arc_Testnet"
                      ? "To (Circle Wallet on Arc Testnet)"
                      : "To (EOA)"}
                  </span>
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
                      onValueChange={(val) => handleDestChange(val as BridgeChain)}
                      disabled={status === "bridging" || sourceKey !== "Arc_Testnet"}
                    >
                      <SelectTrigger className="w-[180px] border-none shadow-none bg-transparent hover:bg-accent font-bold text-lg h-auto py-1 px-2 text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.filter((c) =>
                          sourceKey === "Arc_Testnet"
                            ? c.identifier !== "Arc_Testnet"
                            : c.identifier === "Arc_Testnet",
                        ).map((c) => (
                          <SelectItem key={c.identifier} value={c.identifier}>
                            <div className="flex items-center gap-2">
                              {c.icon && (
                                <img 
                                  src={c.icon} 
                                  alt="" 
                                  className="h-4 w-4 rounded-full object-contain" 
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

              {(isLoadingCircleWallet || arcCircleWallet) && (
                <Alert className="border-border">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Arc Circle Wallet</AlertTitle>
                  <AlertDescription className="text-xs break-all">
                    {isLoadingCircleWallet
                      ? "Loading Arc wallet..."
                      : arcCircleWallet?.address}
                  </AlertDescription>
                </Alert>
              )}

              {!isLoadingCircleWallet && !arcCircleWallet && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Arc Circle Wallet Required</AlertTitle>
                  <AlertDescription className="text-xs">
                    Create/login your Circle wallet on Arc testnet to receive bridged USDC.
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
                          parseFloat(nativeSourceBalance) < 0.001 ||
                          !arcCircleWallet ||
                          isLoadingCircleWallet
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
