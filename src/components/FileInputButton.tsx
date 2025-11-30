"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileInputButtonProps {
  onFileSelected: (file: File) => void;
  label?: string;
}

export default function FileInputButton({
  onFileSelected,
  label = "Import Vault JSON",
}: FileInputButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = ""; // reset input
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <Button variant="outline" onClick={handleClick}>
        {label}
      </Button>
    </>
  );
}
