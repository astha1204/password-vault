"use client";

import React, { useState, useEffect } from "react";
import PasswordGenerator from "./PasswordGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X } from "lucide-react";

interface VaultEditorProps {
  item: any;
  onSave: (item: any) => void;
  onClose: () => void;
}

export default function VaultEditor({ item, onSave, onClose }: VaultEditorProps) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item?.decrypted) {
      setTitle(item.decrypted.title || "");
      setUsername(item.decrypted.username || "");
      setPassword(item.decrypted.password || "");
      setUrl(item.decrypted.url || "");
      setNotes(item.decrypted.notes || "");
    } else {
      setTitle("");
      setUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
    }
  }, [item]);

  const handlePasswordGenerated = (pwd: string) => {
    setPassword(pwd);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      _id: item._id,
      title,
      username,
      password,
      url,
      notes,
    });
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a]"
        style={{
          background: "var(--background)" // Will use your CSS variable for full solid bg
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {item._id ? "Edit Vault Item" : "Add Vault Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Gmail Account"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., user@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or generate password"
            />
          </div>
          <PasswordGenerator onGenerated={handlePasswordGenerated} />
          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
