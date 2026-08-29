"use client";

import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button 
      onClick={handleSignOut}
      className="flex items-center gap-2 text-red-600/70 hover:text-red-600 font-bold transition-colors px-3 py-2 rounded-full hover:bg-red-50"
      title="Sign Out"
    >
      <LogOut size={20} />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
