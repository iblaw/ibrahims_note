"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

export default function SignUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your inbox — a confirmation email has been sent if required.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign up"
        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 ease-out scale-100"
      >
        <button
          className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
          onClick={onClose}
          aria-label="Close sign up"
        >
          <X />
        </button>

        <h2 className="text-2xl font-extrabold mb-2">Create your free account</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Join Lumen to start creating notes, scheduling study plans and reviewing flashcards.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2 bg-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-200 dark:border-neutral-700 p-2 bg-transparent"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              className="bubbly-button bg-orange-500 text-white hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? "Creating…" : "Sign up"}
            </button>
            <button type="button" className="text-sm text-neutral-500 underline" onClick={() => {
              setEmail("");
              setPassword("");
            }}>
              Clear
            </button>
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
