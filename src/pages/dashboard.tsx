"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import VaultList from "../components/VaultList";
import VaultEditor from "../components/VaultEditor";
import { decryptToJSON, encryptJSON } from "../utils/crypto";
import TOTPSetup from "../components/TOTPSetup";
import DarkModeToggle from "../components/DarkModeToggle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  LogOut,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Loader as Loader2,
  CircleAlert as AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { cryptoKey, encryptionSalt, setPassword, clearKey } = useAuth();

  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);

  // Unlock vault prompt visibility
  useEffect(() => {
    if (!cryptoKey && encryptionSalt) setShowPrompt(true);
    else setShowPrompt(false);
  }, [cryptoKey, encryptionSalt]);

  // Fetch vault items
  useEffect(() => {
    if (!cryptoKey) {
      setVaultItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/vault")
      .then((r) => r.json())
      .then(async (items) => {
        const decrypted = await Promise.all(
          items.map(async (item: any) => {
            try {
              const decryptedObj = await decryptToJSON(item.ciphertext, item.iv, cryptoKey);
              return { ...item, decrypted: decryptedObj };
            } catch {
              return null;
            }
          })
        );
        setVaultItems(decrypted.filter(Boolean));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [cryptoKey]);

  // Filtered items
  const filteredItems = vaultItems.filter((item) => {
    const text = (item.decrypted.title + item.decrypted.username + item.decrypted.url).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  // Vault operations
  async function saveVaultItem(item: any) {
    if (!cryptoKey) return toast.error("Encryption key not available");

    const { ciphertext, iv } = await encryptJSON(item, cryptoKey);

    if (item._id) {
      await fetch(`/api/vault/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciphertext, iv }),
      });
      setVaultItems((prev) =>
        prev.map((v) => (v._id === item._id ? { ...v, decrypted: item, ciphertext, iv } : v))
      );
      toast.success("Item updated successfully");
    } else {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciphertext, iv }),
      });
      const data = await res.json();
      setVaultItems((prev) => [...prev, { _id: data.id, ciphertext, iv, decrypted: item }]);
      toast.success("Item added successfully");
    }
    setSelectedItem(null);
  }

  async function deleteVaultItem(id: string) {
    await fetch(`/api/vault/${id}`, { method: "DELETE" });
    setVaultItems((prev) => prev.filter((item) => item._id !== id));
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    try {
      await setPassword(passwordInput);
      setPasswordInput("");
      setShowPrompt(false);
      toast.success("Vault unlocked!");
    } catch {
      setPasswordError("Wrong password or failed to derive key.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearKey();
    window.location.href = "/login";
  }

  // Fetch 2FA status
  useEffect(() => {
    async function fetchTwoFactorStatus() {
      setLoading2FA(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setTwoFactorEnabled(!!data.totpSecret);
        } else {
          setTwoFactorEnabled(false);
        }
      } catch {
        setTwoFactorEnabled(false);
      } finally {
        setLoading2FA(false);
      }
    }
    fetchTwoFactorStatus();
  }, []);

  // Disable 2FA
  async function handleDisable2FA() {
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication?")) return;

    try {
      const res = await fetch("/api/auth/disable-2fa", { method: "POST" });
      if (res.ok) {
        setTwoFactorEnabled(false);
        toast.success("2FA disabled successfully");
      } else toast.error("Failed to disable 2FA");
    } catch {
      toast.error("Error disabling 2FA");
    }
  }

  // Unlock prompt
  if (showPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Unlock Vault</CardTitle>
            <CardDescription className="text-center">
              Enter your master password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Master Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
            </form>
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleLogout} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Password Vault
            </h1>
            <p className="text-muted-foreground mt-1">Securely store and manage your passwords</p>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vault search/add */}
          <Card>
            <CardContent className="pt-6 flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
                <Input
                  placeholder="Search your vault..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setSelectedItem({})}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your vault...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <VaultList items={filteredItems} onEdit={setSelectedItem} onDelete={deleteVaultItem} setItems={setVaultItems} />

              {/* 2FA card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading2FA ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : twoFactorEnabled ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Enabled
                        </Badge>
                        <span className="text-sm">2FA is active</span>
                      </div>
                      <Button onClick={handleDisable2FA} variant="destructive" size="sm">Disable 2FA</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Disabled</Badge>
                        <span className="text-sm text-muted-foreground">Enhance your account security</span>
                      </div>
                      <Button onClick={() => setShow2FAModal(true)} size="sm">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Enable 2FA
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Vault editor */}
      {selectedItem && <VaultEditor item={selectedItem} onSave={saveVaultItem} onClose={() => setSelectedItem(null)} />}

      {/* 2FA modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <TOTPSetup />
        </DialogContent>
      </Dialog>
    </div>
  );
}
