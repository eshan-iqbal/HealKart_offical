"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInPageContent />
    </Suspense>
  );
}

function SignInPageContent() {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle redirect after successful login
  useEffect(() => {
    if (user && success) {
      const redirectUrl = searchParams.get('redirect_url') || '/';
      console.log('Redirecting to:', redirectUrl);
      // Use setTimeout to ensure the user state is fully updated
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    }
  }, [user, success, router, searchParams]);

  // Also handle redirect when user is already logged in
  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = searchParams.get('redirect_url') || '/';
      console.log('User already logged in, redirecting to:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    const result = await login(email, password);
    console.log('Login result:', result);
    
    if (result.success) {
      setEmail("");
      setPassword("");
      setSuccess(true);
    } else {
      setError(result.error || "Invalid email or password");
    }
  };

  // Show loading if user is being fetched
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't show sign-in form if user is already logged in
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Login successful! Redirecting...</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account? <a href="/sign-up" className="text-primary underline">Sign Up</a>
        </div>
      </div>
    </div>
  );
} 