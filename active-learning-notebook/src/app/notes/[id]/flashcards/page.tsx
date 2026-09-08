"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, ArrowLeft, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";
import PublicUpsellPrompt from "@/components/PublicUpsellPrompt";
import ShareFlashcardButton from "@/components/ShareFlashcardButton";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function NoteFlashcardsPage({ params }: { params: { id: string } }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");

  // Need to unwrap params in Next.js 15
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    // Handling Next.js params unwrapping
    const unwrapParams = async () => {
      const p = await params;
      setNoteId(p.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (noteId) fetchCards(noteId);
  }, [noteId]);

  const fetchCards = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsGuest(!user);

    const { data: note } = await supabase.from("notes").select("title").eq("id", id).single();
    if (note) setNoteTitle(note.title);

    const { data } = await supabase
      .from("flashcards")
      .select("id, front, back")
      .eq("note_id", id);

    if (data) setCards(data);
    setLoading(false);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setRevealed(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setIsFinished(false);
  };

  if (loading) {
    return <div className="flex justify-center p-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <Link href={`/notes/${noteId}`} className="inline-flex items-center gap-2 text-neutral-500 mb-8"><ArrowLeft size={20} /> Back to Note</Link>
        <h2 className="text-xl font-bold mb-4">No flashcards found for this note.</h2>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-24 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="bg-neutral-100 dark:bg-neutral-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
            <BrainCircuit className="text-green-500" size={64} />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4">
            Practice Complete!
          </h1>
          <button onClick={restart} className="modern-button bg-neutral-800 text-white mr-4">
            <RotateCcw size={20} className="inline mr-2" /> Try Again
          </button>
          <Link href={`/notes/${noteId}`} className="modern-button bg-neutral-200 text-neutral-800">
            Back to Note
          </Link>
        </div>
        {isGuest && <PublicUpsellPrompt />}
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/notes/${noteId}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Note
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <ShareFlashcardButton flashcards={cards} defaultTitle={`${noteTitle} Flashcards`} />
        </div>
      </div>

      <h1 className="text-xl font-extrabold text-center mb-8">{noteTitle} - Practice Mode</h1>

      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-8">
        <div 
          className="bg-orange-500 h-full transition-all duration-500"
          style={{ width: `${(currentIndex / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Container */}
      <div className="perspective-1000 w-full min-h-[400px]">
        <div className={`relative w-full h-full min-h-[400px] transition-transform duration-700 [transform-style:preserve-3d] ${revealed ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 modern-card flex flex-col justify-center items-center text-center p-8 sm:p-16 border-2 border-neutral-200 bg-white [backface-visibility:hidden]">
            <p className="text-xl sm:text-xl font-bold text-neutral-800 mb-8 leading-relaxed">
              {card.front}
            </p>
            <button 
              onClick={() => setRevealed(true)}
              className="mt-8 modern-button bg-neutral-100 border-2 border-neutral-300 text-neutral-800 hover:bg-neutral-200"
            >
              Reveal Answer
            </button>
          </div>

          {/* Back */}
          <div className="absolute inset-0 modern-card flex flex-col justify-center items-center text-center p-8 sm:p-16 border-2 border-neutral-200 bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xl sm:text-xl font-bold text-neutral-600 mb-12">
              {card.back}
            </p>
            <button 
              onClick={nextCard}
              className="modern-button bg-orange-500 text-white shadow-orange-500/30 font-bold px-8 flex items-center gap-2"
            >
              {currentIndex < cards.length - 1 ? "Next Card" : "Finish"} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
