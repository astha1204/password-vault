import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { deriveKeyFromPassword } from "../utils/crypto";

interface AuthContextType {
  cryptoKey: CryptoKey | null;
  setPassword: (password: string) => Promise<void>;
  clearKey: () => void;
  encryptionSalt: string;
  setEncryptionSalt: (salt: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [encryptionSalt, setEncryptionSaltState] = useState("");

  function setEncryptionSalt(salt: string) {
    setEncryptionSaltState(salt);
    sessionStorage.setItem("encryptionSalt", salt);
  }

  async function setPassword(password: string) {
    const salt = encryptionSalt || sessionStorage.getItem("encryptionSalt") || "";
    if (!salt) throw new Error("Encryption salt not set");
    const key = await deriveKeyFromPassword(password, salt);
    setCryptoKey(key);
  }

  function clearKey() {
    setCryptoKey(null);
    setEncryptionSaltState("");
    sessionStorage.removeItem("encryptionSalt");
  }

  // Restore salt on mount
  useEffect(() => {
    if (!encryptionSalt) {
      const savedSalt = sessionStorage.getItem("encryptionSalt");
      if (savedSalt) setEncryptionSaltState(savedSalt);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ cryptoKey, setPassword, clearKey, encryptionSalt, setEncryptionSalt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
