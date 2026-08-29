"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, Check, X, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
}

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .lte("next_review_date", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCards(data);
    }
    setLoading(false);
  };

  const handleRate = async (rating: "hard" | "good" | "easy") => {
    if (saving) return;
    setSaving(true);
    
    const card = cards[currentIndex];
    let newEase = card.ease_factor;
    let newInterval = card.interval;
    let newReps = card.repetitions + 1;

    // Simplified SM-2 Algorithm
    if (rating === "hard") {
      newEase = Math.max(1.3, newEase - 0.2);
      newInterval = 1;
    } else if (rating === "good") {
      newInterval = newInterval === 0 ? 1 : Math.round(newInterval * newEase);
    } else if (rating === "easy") {
      newEase += 0.15;
      newInterval = newInterval === 0 ? 3 : Math.round(newInterval * newEase * 1.3);
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    await supabase
      .from("flashcards")
      .update({
        ease_factor: newEase,
        interval: newInterval,
        repetitions: newReps,
        next_review_date: nextReviewDate.toISOString(),
      })
      .eq("id", card.id);

    setSaving(false);
    setRevealed(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-neutral-400 mb-4" size={48} />
        <p className="text-neutral-500 font-bold text-lg">Fetching your flashcards...</p>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-24 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-neutral-100 dark:bg-neutral-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-neutral-200 dark:border-neutral-800">
          <BrainCircuit className="text-green-500" size={64} />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
          All caught up!
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium">
          You have reviewed all your due flashcards for today.
        </p>
        <Link href="/archive" className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 inline-flex items-center gap-2 mt-8">
          Return to Archive <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <BrainCircuit className="text-neutral-500" size={32} />
          Spaced Repetition Review
        </h1>
        <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-full font-bold text-neutral-600 dark:text-neutral-400">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-neutral-800 dark:bg-neutral-200 h-full transition-all duration-500"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      <div className="bubbly-card min-h-[400px] flex flex-col justify-center items-center text-center p-8 sm:p-16 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#34302d]">
        <p className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 leading-relaxed">
          {card.front}
        </p>
        
        {!revealed ? (
          <button 
            onClick={() => setRevealed(true)}
            className="mt-8 bubbly-button bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
          >
            Reveal Answer
          </button>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
            <hr className="w-full border-neutral-200 dark:border-neutral-700 my-8" />
            <p className="text-xl sm:text-2xl font-bold text-neutral-600 dark:text-neutral-300 mb-12">
              {card.back}
            </p>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={() => handleRate("hard")}
                disabled={saving}
                className="flex-1 sm:flex-none bubbly-button bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 hover:bg-red-200 font-bold px-8"
              >
                Hard
              </button>
              <button 
                onClick={() => handleRate("good")}
                disabled={saving}
                className="flex-1 sm:flex-none bubbly-button bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 hover:bg-green-200 font-bold px-8"
              >
                Good
              </button>
              <button 
                onClick={() => handleRate("easy")}
                disabled={saving}
                className="flex-1 sm:flex-none bubbly-button bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 hover:bg-blue-200 font-bold px-8"
              >
                Easy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
