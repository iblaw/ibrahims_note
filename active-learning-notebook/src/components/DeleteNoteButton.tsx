"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/components/ModalPortal";

export default function DeleteNoteButton({ noteId, onDeleted }: { noteId: string, onDeleted?: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    
    if (onDeleted) {
      onDeleted();
    } else {
      router.push("/archive");
    }
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
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#2d2926] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle size={32} />
                <h2 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">Delete Note</h2>
              </div>
              
              <p className="text-neutral-600 dark:text-neutral-300 font-medium mb-8">
                Are you sure you want to delete this note? What would you like to do with its generated flashcards?
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmDelete(true); }}
                  className="w-full text-left p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all font-bold text-neutral-800 dark:text-neutral-200"
                >
                  Delete Note, but KEEP Flashcards
                  <span className="block text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                    Flashcards will become standalone and stay in your Review Hub.
                  </span>
                </button>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmDelete(false); }}
                  className="w-full text-left p-4 rounded-xl border-2 border-red-200 dark:border-red-900/50 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold text-red-700 dark:text-red-400"
                >
                  Delete Note AND its Flashcards
                  <span className="block text-sm text-red-400 dark:text-red-500 font-medium mt-1">
                    Both the note and all attached flashcards will be destroyed.
                  </span>
                </button>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(false); }}
                  className="w-full p-4 font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
