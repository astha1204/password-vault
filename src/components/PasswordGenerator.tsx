"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const LOOKALIKES = ["l", "I", "1", "O", "0", "o"];
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/`~";

function secureRandomInt(max: number) {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
}

export default function PasswordGenerator({
  onGenerated,
}: {
  onGenerated?: (pwd: string) => void;
}) {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNums, setUseNums] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeLookalikes, setExcludeLookalikes] = useState(true);
  const [result, setResult] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  function buildPool() {
    let pool = "";
    if (useLower) pool += LOWER;
    if (useUpper) pool += UPPER;
    if (useNums) pool += NUMS;
    if (useSymbols) pool += SYMBOLS;
    if (excludeLookalikes) {
      for (const c of LOOKALIKES) pool = pool.replace(new RegExp(c, "g"), "");
    }
    return pool;
  }

  function generate() {
    const pool = buildPool();
    if (!pool.length) return;
    let out = "";
    for (let i = 0; i < length; i++) {
      const idx = secureRandomInt(pool.length);
      out += pool[idx];
    }
    setResult(out);
    setCopyStatus("");
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    if (onGenerated) onGenerated(out);
  }

  async function copyAndAutoClear() {
    if (!result) return;
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    try {
      await navigator.clipboard.writeText(result);
      setCopyStatus("Copied! Will auto-clear in 15s");
      
      const newTimeoutId = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
          setCopyStatus("Clipboard cleared");
          setTimeout(() => setCopyStatus(""), 3000);
        } catch (err) {
          console.error("Failed to clear clipboard", err);
          setCopyStatus("Failed to clear clipboard");
        }
      }, 15000);
      
      setTimeoutId(newTimeoutId);
    } catch (e) {
      console.error("Clipboard write failed", e);
      setCopyStatus("Copy failed - check permissions");
    }
  }

  return (
    <div className="p-6 border rounded-lg max-w-md space-y-4 bg-card text-card-foreground">
      {/* Length slider */}
      <div>
        <Label htmlFor="length">Length: {length}</Label>
        <Slider
          id="length"
          value={[length]}
          onValueChange={(val) => setLength(val[0])}
          min={8}
          max={64}
        />
      </div>

      {/* Options checkboxes */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useLower}
            onChange={() => setUseLower(!useLower)}
          />
          <span>Lowercase</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useUpper}
            onChange={() => setUseUpper(!useUpper)}
          />
          <span>Uppercase</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useNums}
            onChange={() => setUseNums(!useNums)}
          />
          <span>Numbers</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useSymbols}
            onChange={() => setUseSymbols(!useSymbols)}
          />
          <span>Symbols</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={excludeLookalikes}
            onChange={() => setExcludeLookalikes(!excludeLookalikes)}
          />
          <span>Exclude Lookalikes</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button type="button" onClick={generate}>
          Generate
        </Button>
        <Button type="button" onClick={copyAndAutoClear} disabled={!result} variant="outline">
          Copy (auto-clear)
        </Button>
      </div>

      {/* Result */}
      {result && <Input value={result} readOnly />}
      
      {/* Copy status */}
      {copyStatus && (
        <p className="text-sm text-muted-foreground">{copyStatus}</p>
      )}
    </div>
  );
}