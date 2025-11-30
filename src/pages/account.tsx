// pages/account.tsx
import React, { useEffect, useState } from "react";
import TOTPSetup from "../components/TOTPSetup";

interface User {
  email: string;
  // Add other user fields here if needed
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me"); // Example API to get logged in user profile
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (e) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Please log in to access account settings.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Your Account Settings</h1>
      <p>Email: {user.email}</p>
      {/* Add other profile related info here and edit controls if needed */}

      <hr />

      {/* 2FA setup */}
      <TOTPSetup />
    </div>
  );
}
