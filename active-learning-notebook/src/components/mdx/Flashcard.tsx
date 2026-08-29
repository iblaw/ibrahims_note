"use client";

import { Sparkles } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
}

export default function Flashcard({ front, back }: FlashcardProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-full text-sm font-bold my-1 border border-neutral-200 dark:border-neutral-700 mr-2">
      <Sparkles size={14} className="text-neutral-500" />
      <span>Flashcard Extracted</span>
      <span className="opacity-0 w-0 h-0 overflow-hidden absolute">
        Front: {front} | Back: {back}
      </span>
    </div>
  );
}
