"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PublishButton({ noteId, isAlreadyPublic }: { noteId: string, isAlreadyPublic: boolean }) {
  const [publishing, setPublishing] = useState(false);
  const [isPublic, setIsPublic] = useState(isAlreadyPublic);

  const publishNote = async () => {
    setPublishing(true);
    await supabase.from("notes").update({ is_public: true }).eq("id", noteId);
    setIsPublic(true);
    setPublishing(false);
  };

  if (isPublic) {
    return (
      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-bold py-2 px-4 rounded-full">
        Live in Community
      </span>
    );
  }

  return (
    <button 
      onClick={publishNote}
      disabled={publishing}
      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 text-sm py-2 px-4 flex items-center gap-2 rounded-lg font-bold"
    >
      {publishing ? "Publishing..." : "Publish to Community"}
    </button>
  );
}
