"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader as Loader2, ShieldCheck, CircleAlert as AlertCircle, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setEncryptionSalt, setPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          twoFactorRequired
            ? { email, password: passwordInput, token }
            : { email, password: passwordInput }
        ),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setError("Two-factor authentication is required. Please enter your TOTP code.");
          return;
        }

        try {
          setEncryptionSalt(data.encryptionSalt);
          await setPassword(passwordInput);
          router.push("/dashboard");
        } catch (e) {
          setError("Failed to set encryption key. Please retry login.");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (e) {
      setLoading(false);
      setError("Network error or server unavailable");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {twoFactorRequired ? "Two-Factor Authentication" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {twoFactorRequired
              ? "Enter your 6-digit authentication code"
              : "Sign in to access your password vault"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!twoFactorRequired ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="token" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Authentication Code
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the code from your authenticator app
                </p>
              </div>
            )}

            {error && (
              <Alert variant={twoFactorRequired ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {twoFactorRequired ? "Verifying..." : "Signing in..."}
                </>
              ) : (
                <>
                  {twoFactorRequired ? (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify Code
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-primary hover:underline font-medium"
            >
              Sign up here
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
