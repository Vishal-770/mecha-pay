"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

// SocialLoginProvider enum value (the type is not re-exported by the package).
const GOOGLE_PROVIDER = "Google" as const;

// Minimal type aliases so we don't import unexported internal types.
type W3SConfigs = ConstructorParameters<typeof W3SSdk>[0];
type W3SLoginCallback = ConstructorParameters<typeof W3SSdk>[1];
type W3SSocialLoginResult = {
  userToken: string;
  encryptionKey: string;
  refreshToken: string;
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SdkSession {
  userToken: string;
  encryptionKey: string;
  refreshToken?: string;
}

interface CircleSDKContextValue {
  sdk: W3SSdk | null;
  isReady: boolean;
  session: SdkSession | null;
  setSession: (session: SdkSession) => void;
  clearSession: () => void;
  setLoginTokens: (deviceToken: string, deviceEncryptionKey: string) => void;
  getDeviceId: () => Promise<string>;
  performLogin: () => void;
  executeChallenge: (challengeId: string) => Promise<void>;
  loginError: string | null;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

const SESSION_KEY = "circle_session";
const PENDING_KEY = "circle_pending_login";

function readSession(): SdkSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SdkSession) : null;
  } catch {
    return null;
  }
}

// ─── SDK factory ─────────────────────────────────────────────────────────────

function buildConfigs(
  deviceToken?: string,
  deviceEncryptionKey?: string,
  session?: SdkSession | null,
): W3SConfigs {
  const base: W3SConfigs = {
    appSettings: {
      appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID!,
    },
  };

  if (session) {
    base.authentication = {
      userToken: session.userToken,
      encryptionKey: session.encryptionKey,
    };
  }

  if (deviceToken && deviceEncryptionKey) {
    base.loginConfigs = {
      deviceToken,
      deviceEncryptionKey,
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID!,
        redirectUri: `${typeof window !== "undefined" ? window.location.origin : ""}/api/oauth`,
        selectAccountPrompt: true,
      },
    };
  }

  return base;
}

// ─── SDK state reducer ───────────────────────────────────────────────────────

interface SdkReducerState {
  sdk: W3SSdk | null;
  isReady: boolean;
}

type SdkReducerAction = { type: "init"; sdk: W3SSdk } | { type: "reset" };

function sdkReducer(
  _state: SdkReducerState,
  action: SdkReducerAction,
): SdkReducerState {
  switch (action.type) {
    case "init":
      return { sdk: action.sdk, isReady: true };
    case "reset":
      return { sdk: null, isReady: false };
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CircleSDKContext = createContext<CircleSDKContextValue | null>(null);

export function CircleSDKProvider({ children }: { children: ReactNode }) {
  const sdkRef = useRef<W3SSdk | null>(null);
  const [{ sdk: sdkSnapshot, isReady }, dispatchSdk] = useReducer(sdkReducer, {
    sdk: null,
    isReady: false,
  });
  const [session, setSessionState] = useState<SdkSession | null>(
    () => readSession(),
  );
  const [loginError, setLoginError] = useState<string | null>(null);

  const onLoginComplete = useCallback<NonNullable<W3SLoginCallback>>(
    (
      err: { message: string } | undefined,
      result: W3SSocialLoginResult | undefined,
    ) => {
      if (err) {
        console.error("[Circle SDK] onLoginComplete error:", err);
        setLoginError(err.message);
        return;
      }
      const r = result as W3SSocialLoginResult | undefined;
      if (r?.userToken && r?.encryptionKey) {
        const newSession: SdkSession = {
          userToken: r.userToken,
          encryptionKey: r.encryptionKey,
          refreshToken: r.refreshToken,
        };
        setSessionState(newSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        sessionStorage.removeItem(PENDING_KEY);

        // Update the SDK with the new authentication tokens so that
        // executeChallenge() can show the PIN / security-question UI.
        if (sdkRef.current) {
          const configs = buildConfigs(undefined, undefined, newSession);
          sdkRef.current.updateConfigs(configs, undefined);
          console.log("[Circle SDK] SDK authentication updated with new session.");
        }

        console.log("[Circle SDK] Login complete – session stored.");
      }
    },
    [],
  );

  const initSdk = useCallback(
    (
      currentSession: SdkSession | null,
      deviceToken?: string,
      deviceEncryptionKey?: string,
    ) => {
      const configs = buildConfigs(deviceToken, deviceEncryptionKey, currentSession);
      let instance: W3SSdk;
      if (sdkRef.current) {
        sdkRef.current.updateConfigs(configs, onLoginComplete as W3SLoginCallback);
        instance = sdkRef.current;
      } else {
        instance = new W3SSdk(configs, onLoginComplete as W3SLoginCallback);
        sdkRef.current = instance;
      }
      dispatchSdk({ type: "init", sdk: instance });
    },
    [onLoginComplete],
  );

  useEffect(() => {
    const stored = readSession();
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (raw) {
        const { deviceToken, deviceEncryptionKey } = JSON.parse(raw) as {
          deviceToken: string;
          deviceEncryptionKey: string;
        };
        initSdk(stored, deviceToken, deviceEncryptionKey);
        return;
      }
    } catch {
      /* ignore */
    }
    initSdk(stored);
  }, [initSdk]);

  const setSession = useCallback(
    (newSession: SdkSession) => {
      setSessionState(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      initSdk(newSession);
    },
    [initSdk],
  );

  const clearSession = useCallback(() => {
    setSessionState(null);
    localStorage.removeItem(SESSION_KEY);
    initSdk(null);
  }, [initSdk]);

  const setLoginTokens = useCallback(
    (deviceToken: string, deviceEncryptionKey: string) => {
      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ deviceToken, deviceEncryptionKey }),
      );
      initSdk(session, deviceToken, deviceEncryptionKey);
    },
    [initSdk, session],
  );

  const getDeviceId = useCallback(async (): Promise<string> => {
    if (!sdkRef.current) throw new Error("SDK not ready");
    return sdkRef.current.getDeviceId();
  }, []);

  const performLogin = useCallback(() => {
    if (!sdkRef.current) {
      console.error("[Circle SDK] SDK not initialised.");
      return;
    }
    setLoginError(null);
    void (sdkRef.current.performLogin as (p: string) => Promise<void>)(
      GOOGLE_PROVIDER,
    );
  }, []);

  const executeChallenge = useCallback(
    (challengeId: string): Promise<void> => {
      if (!sdkRef.current) return Promise.reject(new Error("SDK not ready"));
      return new Promise<void>((resolve, reject) => {
        sdkRef.current!.execute(challengeId, (error, result) => {
          if (error) {
            reject(new Error(error.message ?? "Challenge execution failed"));
          } else {
            console.log("[Circle SDK] Challenge complete:", result);
            resolve();
          }
        });
      });
    },
    [],
  );

  return (
    <CircleSDKContext.Provider
      value={{
        sdk: sdkSnapshot,
        isReady,
        session,
        setSession,
        clearSession,
        setLoginTokens,
        getDeviceId,
        performLogin,
        executeChallenge,
        loginError,
      }}
    >
      {children}
    </CircleSDKContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCircleSDK(): CircleSDKContextValue {
  const ctx = useContext(CircleSDKContext);
  if (!ctx)
    throw new Error("useCircleSDK must be used inside <CircleSDKProvider>");
  return ctx;
}
