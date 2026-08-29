"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else if (isSignUp && !data.session) {
      setSuccessMsg("Welcome! Please check your email inbox (and spam folder) to confirm your account before logging in.");
      // Clear form
      setPassword("");
    } else {
      router.push("/notes");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-md bubbly-card bg-white p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-extrabold text-neutral-900">Welcome to Lumen</h1>
          <p className="text-neutral-500 font-medium mt-2">Sign in to access your learning vault.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 border border-green-200">
            {successMsg}
          </div>
        )}

        <form className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 transition-all outline-none font-bold bg-neutral-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 transition-all outline-none font-bold bg-neutral-50"
              required
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <button 
              onClick={(e) => handleEmailLogin(e, false)}
              disabled={loading}
              className="flex-1 bg-neutral-800 text-white p-3 rounded-xl font-bold hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Log In"}
            </button>
            <button 
              onClick={(e) => handleEmailLogin(e, true)}
              disabled={loading}
              className="flex-1 bg-neutral-100 text-neutral-800 p-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 border border-neutral-200"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
