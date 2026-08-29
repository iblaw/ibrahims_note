"use client";

import { Sparkles } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
}

export default function Flashcard({ front, back }: FlashcardProps) {
  // In a real app, this component might not render much directly in the note view.
  // Instead, the fact that it exists in the MDX would trigger a background 
  // extraction to save it to the Spaced Repetition database.
  // For the note view, we will just show a subtle "Card Saved" badge.

  return (
    <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm font-bold my-1 border border-indigo-100 dark:border-indigo-900/50 mr-2">
      <Sparkles size={14} className="text-indigo-500" />
      <span>Flashcard Extracted</span>
      <span className="opacity-0 w-0 h-0 overflow-hidden absolute">
        Front: {front} | Back: {back}
      </span>
    </div>
  );
}
