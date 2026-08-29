"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignUpMode && !username.trim()) {
      setError("Please choose a username for your account.");
      setLoading(false);
      return;
    }

    const { data, error } = isSignUpMode 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username: username.trim() }
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else if (isSignUpMode && !data.session) {
      setSuccessMsg("Welcome! Please check your email inbox (and spam folder) to confirm your account before logging in.");
      setPassword("");
      setUsername("");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-md modern-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-xl mb-4">✨</div>
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {isSignUpMode ? "Create an Account" : "Welcome to Lumen"}
          </h1>
          <p className="text-neutral-500 font-medium mt-2">
            {isSignUpMode ? "Join the community and start learning." : "Sign in to access your learning vault."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold mb-6 border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm font-bold mb-6 border border-green-200 dark:border-green-900/50">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {isSignUpMode && (
            <div>
              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold bg-neutral-50 dark:bg-[#2a2624]"
                required={isSignUpMode}
                placeholder="e.g. StudyMaster99"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold bg-neutral-50 dark:bg-[#2a2624]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold bg-neutral-50 dark:bg-[#2a2624]"
              required
              minLength={6}
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 p-4 rounded-xl font-bold hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isSignUpMode ? "Create Account" : "Log In")}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button 
            type="button"
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 font-bold transition-colors text-sm"
          >
            {isSignUpMode ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
