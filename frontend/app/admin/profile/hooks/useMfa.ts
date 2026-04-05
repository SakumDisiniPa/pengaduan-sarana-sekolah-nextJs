import { useState } from "react";
import {
  initiateMfaSetup,
  verifyMfaToken,
  enableMfa,
  disableMfaInDb,
  MfaSetupResult,
} from "../utils";

interface UseMfaResult {
  mfaEnabled: boolean;
  setupQr: string | null;
  setupSecret: string | null;
  mfaToken: string;
  loading: boolean;
  startSetup: (email: string) => Promise<void>;
  confirmSetup: (userId: string, token: string) => Promise<void>;
  disableMfa: (userId: string) => Promise<void>;
  setMfaToken: (token: string) => void;
  resetSetup: () => void;
  setMfaEnabled: (enabled: boolean) => void;
}

export const useMfa = (initialMfaEnabled: boolean): UseMfaResult => {
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [setupQr, setSetupQr] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const result: MfaSetupResult = await initiateMfaSetup(email);
      setSetupSecret(result.secret);
      setSetupQr(result.qrCodeUrl);
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (userId: string, token: string): Promise<void> => {
    if (!setupSecret) throw new Error("Setup secret not available");

    setLoading(true);
    try {
      const isValid = await verifyMfaToken(setupSecret, token);
      if (!isValid) {
        throw new Error("Kode MFA tidak valid");
      }

      await enableMfa(userId, setupSecret);
      setMfaEnabled(true);
      resetSetup();
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async (userId: string): Promise<void> => {
    setLoading(true);
    try {
      await disableMfaInDb(userId);
      setMfaEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const resetSetup = () => {
    setSetupQr(null);
    setSetupSecret(null);
    setMfaToken("");
  };

  return {
    mfaEnabled,
    setupQr,
    setupSecret,
    mfaToken,
    loading,
    startSetup,
    confirmSetup,
    disableMfa,
    setMfaToken,
    resetSetup,
    setMfaEnabled,
  };
};
