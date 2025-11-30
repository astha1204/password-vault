// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("darkMode");
      if (saved) {
        const isDark = saved === "true";
        setDarkMode(isDark);
        updateBodyClass(isDark);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(prefersDark);
        updateBodyClass(prefersDark);
      }
    }
  }, []);

  function updateBodyClass(enabled: boolean) {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      updateBodyClass(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem("darkMode", next.toString());
      }
      return next;
    });
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}