"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../contexts/ThemeContext";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after client-side mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder to avoid layout shift
    return <Button variant="outline" size="icon" disabled>...</Button>;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleDarkMode}>
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
