"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function VoteButtons({ id, table = "notes", initialUp, initialDown }: { id: string, table?: "notes" | "courses", initialUp: number, initialDown: number }) {
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const handleVote = async (type: "up" | "down") => {
    if (voted === type) return; // already voted this way

    const newUp = type === "up" ? upvotes + 1 : (voted === "up" ? upvotes - 1 : upvotes);
    const newDown = type === "down" ? downvotes + 1 : (voted === "down" ? downvotes - 1 : downvotes);

    setUpvotes(newUp);
    setDownvotes(newDown);
    setVoted(type);

    await supabase
      .from(table)
      .update({ upvotes: newUp, downvotes: newDown })
      .eq("id", id);
  };

  return (
    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
      <button 
        onClick={(e) => { e.preventDefault(); handleVote("up"); }}
        className={`p-1 rounded-full transition-colors ${voted === "up" ? "text-green-500 bg-green-100 dark:bg-green-900/30" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
      >
        <ArrowUp size={16} />
      </button>
      <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300 min-w-[2ch] text-center">
        {upvotes - downvotes}
      </span>
      <button 
        onClick={(e) => { e.preventDefault(); handleVote("down"); }}
        className={`p-1 rounded-full transition-colors ${voted === "down" ? "text-red-500 bg-red-100 dark:bg-red-900/30" : "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
      >
        <ArrowDown size={16} />
      </button>
    </div>
  );
}
