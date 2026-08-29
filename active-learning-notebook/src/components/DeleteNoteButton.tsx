"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmDelete = async (keepFlashcards: boolean) => {
    setDeleting(true);
    
    if (keepFlashcards) {
      // Unlink flashcards from this note (making them standalone)
      await supabase.from("flashcards").update({ note_id: null }).eq("note_id", noteId);
    } else {
      // Delete associated flashcards
      await supabase.from("flashcards").delete().eq("note_id", noteId);
    }
    
    // Now delete the note
    await supabase.from("notes").delete().eq("id", noteId);
    
    setShowModal(false);
    router.push("/dashboard");
  };

  return (
    <>
      <button 
        onClick={handleInitialClick}
        disabled={deleting}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
      >
        <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={32} />
              <h2 className="text-xl font-extrabold text-neutral-800">Delete Note</h2>
            </div>
            
            <p className="text-neutral-600 font-medium mb-8">
              Are you sure you want to delete this note? What would you like to do with its generated flashcards?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleConfirmDelete(true)}
                className="w-full text-left p-4 rounded-xl border-2 border-neutral-200 hover:border-orange-500 hover:bg-orange-50 transition-all font-bold text-neutral-800"
              >
                Delete Note, but KEEP Flashcards
                <span className="block text-sm text-neutral-500 font-medium mt-1">
                  Flashcards will become standalone and stay in your Review Hub.
                </span>
              </button>
              
              <button 
                onClick={() => handleConfirmDelete(false)}
                className="w-full text-left p-4 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all font-bold text-red-700"
              >
                Delete Note AND its Flashcards
                <span className="block text-sm text-red-400 font-medium mt-1">
                  Both the note and all attached flashcards will be destroyed.
                </span>
              </button>
              
              <button 
                onClick={() => setShowModal(false)}
                className="w-full p-4 font-bold text-neutral-500 hover:text-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
