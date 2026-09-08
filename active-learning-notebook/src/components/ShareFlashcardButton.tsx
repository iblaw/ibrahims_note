"use client";
import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ShareFlashcardButton({ flashcards, defaultTitle = "Shared Flashcards" }: { flashcards: any[], defaultTitle?: string }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("notes")
        .insert([{
          title: defaultTitle,
          content: JSON.stringify(flashcards),
          course_topic: "SHARED_FLASHCARDS",
          is_public: true,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/review/flashcards/${data.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to share flashcards", err);
      alert("Failed to create shareable link.");
    }
    setSharing(false);
  };

  return (
    <button 
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
    >
      {sharing ? <Loader2 size={16} className="animate-spin" /> : copied ? <Check size={16} /> : <Share2 size={16} />} 
      {sharing ? "Generating Link..." : copied ? "Copied Link!" : "Share Flashcards"}
    </button>
  );
}
