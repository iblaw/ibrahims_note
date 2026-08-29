"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) return;
    
    setDeleting(true);
    await supabase.from("notes").delete().eq("id", noteId);
    
    // Redirect to notes dashboard
    router.push("/notes");
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
      title="Delete Note"
    >
      <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
