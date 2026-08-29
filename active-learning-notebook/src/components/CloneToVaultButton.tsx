"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CloneToVaultButton({ note, flashcards }: { note: any, flashcards: any[] }) {
  const [cloning, setCloning] = useState(false);
  const router = useRouter();

  const handleClone = async () => {
    setCloning(true);
    
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to clone notes!");
      setCloning(false);
      return;
    }

    // 2. Clone the Note
    const { data: newNote, error: noteError } = await supabase
      .from("notes")
      .insert([{
        user_id: user.id,
        title: note.title + " (Clone)",
        content: note.content,
        course_topic: note.course_topic,
        is_public: false
      }])
      .select()
      .single();

    if (noteError || !newNote) {
      alert("Failed to clone note.");
      setCloning(false);
      return;
    }

    // 3. Clone the Flashcards, resetting spaced repetition stats
    if (flashcards && flashcards.length > 0) {
      const newFlashcards = flashcards.map(fc => ({
        user_id: user.id,
        note_id: newNote.id,
        front: fc.front,
        back: fc.back,
        next_review_date: new Date().toISOString(),
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0
      }));

      const { error: fcError } = await supabase
        .from("flashcards")
        .insert(newFlashcards);

      if (fcError) {
        console.error("Failed to clone flashcards", fcError);
      }
    }

    // 4. Redirect to the new cloned note
    router.push(`/notes/${newNote.id}`);
  };

  return (
    <button 
      onClick={handleClone}
      disabled={cloning}
      className="modern-button flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-xl shadow-orange-500/20"
    >
      {cloning ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      Clone to My Vault
    </button>
  );
}
