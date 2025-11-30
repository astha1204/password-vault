"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TOTPSetupProps {
  onSetupComplete?: () => void; // callback to notify parent
  onClose?: () => void; // close the modal
}

export default function TOTPSetup({ onSetupComplete, onClose }: TOTPSetupProps) {
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/totp-secret")
      .then((res) => res.json())
      .then((data) => {
        setOtpauthUrl(data.otpauth_url);
        setManualCode(data.base32);
      })
      .catch(() => setMessage("Failed to load QR code"));
  }, []);

  const handleVerify = async () => {
    if (!verificationCode) return setMessage("Enter the 6-digit code");

    try {
      const res = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("✅ 2FA setup successful!");
        if (onSetupComplete) onSetupComplete(); // notify parent to update state
        if (onClose) onClose(); // close modal immediately
      } else {
        setMessage("❌ Invalid code, try again");
      }
    } catch {
      setMessage("❌ Verification failed, try again");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 p-6 space-y-4 bg-white dark:bg-[#0a0a0a] shadow-md rounded-lg border">
      <CardHeader>
        <CardTitle>Set up Two-Factor Authentication</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4 w-full">
        {otpauthUrl ? (
          <>
            <p className="text-center">Scan the QR code with your authenticator app:</p>
            <QRCodeSVG
              value={otpauthUrl}
              size={200}
              className="border p-2 rounded-md bg-white dark:bg-[#222]"
            />
            <div className="w-full flex flex-col items-center mt-2">
              <p className="text-center text-sm mb-1">Or enter this code manually:</p>
              <span
                className="font-mono px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-base text-center break-all select-all"
                style={{ wordBreak: "break-all", display: "inline-block", maxWidth: "100%" }}
              >
                {manualCode}
              </span>
            </div>
          </>
        ) : (
          <p>Loading QR code...</p>
        )}

        <div className="w-full space-y-2">
          <Label htmlFor="verification">Enter 6-digit code</Label>
          <Input
            id="verification"
            value={verificationCode}
            maxLength={6}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="123456"
          />
        </div>

        <Button onClick={handleVerify} className="w-full">
          Verify
        </Button>

        {message && <p className="text-center text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}
