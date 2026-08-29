"use client";

import { Sparkles } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
}

export default function Flashcard({ front, back }: FlashcardProps) {
  // We extract flashcards to the database and study them in the Review Hub.
  // Rendering them inline in the MDX clutters the document.
  return null;
}
