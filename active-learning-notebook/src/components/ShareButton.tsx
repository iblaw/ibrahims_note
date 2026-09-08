"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ShareButton({ path, title = "Share", noteId }: { path: string, title?: string, noteId?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // If a noteId is provided, automatically make it public so the shared link actually works for guests
      if (noteId) {
        await supabase.from("notes").update({ is_public: true }).eq("id", noteId);
      }

      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />} 
      {copied ? "Copied Link!" : title}
    </button>
  );
}