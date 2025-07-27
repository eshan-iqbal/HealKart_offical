"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const { register, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await register(email, password, fullName, phone, address);
    if (success) {
      // Redirect immediately to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      setError("Registration failed. Email may already be in use.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account? <a href="/sign-in" className="text-primary underline">Sign In</a>
        </div>
      </div>
    </div>
  );
} 