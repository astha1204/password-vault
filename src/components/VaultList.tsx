"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Eye, EyeOff, Copy, ExternalLink, CreditCard as Edit } from "lucide-react";
import { toast } from "sonner";

interface VaultItem {
  _id: string;
  decrypted: { title: string; username?: string; url?: string; password?: string; [key: string]: any };
}

interface VaultListProps {
  items: VaultItem[];
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
  setItems: React.Dispatch<React.SetStateAction<VaultItem[]>>;
}

export default function VaultList({ items, onEdit, onDelete, setItems }: VaultListProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      onDelete(id);
      toast.success("Item deleted");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vault exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedItems = JSON.parse(event.target?.result as string);
        if (!Array.isArray(importedItems)) throw new Error("Invalid format");
        const normalized = importedItems.map((item: any) => ({
          _id: item._id || crypto.randomUUID(),
          decrypted: item.decrypted || item,
        }));
        setItems((prev) => [...prev, ...normalized]);
        toast.success("Vault imported successfully");
      } catch {
        toast.error("Failed to import vault");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  if (!items.length) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">No saved items found. Add your first password!</p>
        <div className="mt-4 flex gap-2 justify-center">
          {/* <Button onClick={handleExport}>Export Vault</Button>
          <input type="file" accept=".json" onChange={handleImport} className="hidden" id="importVault" />
          <label htmlFor="importVault">
            <Button variant="outline">Import Vault</Button>
          </label> */}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 justify-end">
        <Button onClick={handleExport}>Export Vault</Button>
        <input type="file" accept=".json" onChange={handleImport} className="hidden" id="importVault" />
        <label htmlFor="importVault">
          <Button variant="outline">Import Vault</Button>
        </label>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ _id, decrypted }) => (
              <TableRow key={_id} className="hover:bg-muted/30 transition-colors">
                <TableCell>{decrypted.title}</TableCell>
                <TableCell>
                  {decrypted.username ? (
                    <div className="flex items-center gap-2">
                      {decrypted.username}
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(decrypted.username!, "Username")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {decrypted.password ? (
                    <div className="flex items-center gap-2">
                      <code>{visiblePasswords.has(_id) ? decrypted.password : "••••••••"}</code>
                      <Button size="icon" variant="ghost" onClick={() => togglePasswordVisibility(_id)}>
                        {visiblePasswords.has(_id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(decrypted.password!, "Password")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : ("—")}
                </TableCell>
                <TableCell>
                  {decrypted.url ? (
                    <a href={decrypted.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] flex items-center gap-1">
                      {decrypted.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : ("—")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => onEdit({ _id, decrypted })}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(_id, decrypted.title)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
