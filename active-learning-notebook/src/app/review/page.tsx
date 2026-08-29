"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, Check, ArrowRight, Loader2, Search, Play, Calendar } from "lucide-react";
import Link from "next/link";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  notes: {
    title: string;
  };
}

export default function ReviewPage() {
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Session State
  const [sessionCards, setSessionCards] = useState<Flashcard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    // Fetch all cards and join with notes to get the topic title
    const { data, error } = await supabase
      .from("flashcards")
      .select(`
        *,
        notes ( title )
      `)
      .order("next_review_date", { ascending: true });

    if (!error && data) {
      setAllCards(data as Flashcard[]);
    }
    setLoading(false);
  };

  const startSession = (topicFilter?: string) => {
    const now = new Date().toISOString();
    let due = allCards.filter(c => c.next_review_date <= now);
    
    if (topicFilter) {
      due = due.filter(c => c.notes?.title === topicFilter);
    }
    
    setSessionCards(due);
    setCurrentIndex(0);
    setRevealed(false);
  };

  const handleRate = async (rating: "hard" | "good" | "easy") => {
    if (saving || !sessionCards) return;
    setSaving(true);
    
    const card = sessionCards[currentIndex];
    let newEase = card.ease_factor;
    let newInterval = card.interval;
    let newReps = card.repetitions + 1;

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

    // Update local state to reflect new date so lobby is accurate if we return
    setAllCards(prev => prev.map(c => c.id === card.id ? { ...c, next_review_date: nextReviewDate.toISOString() } : c));

    setSaving(false);
    setRevealed(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-neutral-400 mb-4" size={48} />
      </div>
    );
  }

  // LOBBY VIEW
  if (sessionCards === null) {
    const now = new Date().toISOString();
    
    // Group by topic
    const grouped: Record<string, { total: number; due: number }> = {};
    allCards.forEach(card => {
      const topic = card.notes?.title || "Unknown Topic";
      if (!grouped[topic]) grouped[topic] = { total: 0, due: 0 };
      grouped[topic].total += 1;
      if (card.next_review_date <= now) grouped[topic].due += 1;
    });

    const topics = Object.entries(grouped)
      .filter(([topic]) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b[1].due - a[1].due); // Sort by most due cards first

    const totalDue = allCards.filter(c => c.next_review_date <= now).length;

    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3 mb-2">
              <BrainCircuit className="text-neutral-500" size={36} />
              Review Hub
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
              You have <strong className="text-neutral-900 dark:text-white">{totalDue}</strong> cards due today across all topics.
            </p>
          </div>
          <button 
            onClick={() => startSession()}
            disabled={totalDue === 0}
            className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play size={18} /> Review All Due
          </button>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="Search for a specific topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold text-lg bg-white dark:bg-[#3a3532]"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map(([topic, stats]) => (
            <div key={topic} className="bubbly-card bg-white dark:bg-[#34302d] border-2 border-neutral-200 dark:border-neutral-700 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 line-clamp-2">{topic}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-3 py-1 rounded-full text-sm">
                    {stats.due} Due Today
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-bold text-sm">
                    {stats.total} Total
                  </span>
                </div>
              </div>
              <button 
                onClick={() => startSession(topic)}
                disabled={stats.due === 0}
                className="w-full bubbly-button bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {stats.due > 0 ? "Review Topic" : "All caught up"}
              </button>
            </div>
          ))}
          {topics.length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500 font-medium">
              No topics found. Create a note to generate flashcards!
            </div>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE SESSION VIEW
  if (currentIndex >= sessionCards.length) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-24 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-neutral-100 dark:bg-neutral-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-neutral-200 dark:border-neutral-800">
          <BrainCircuit className="text-green-500" size={64} />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
          Session Complete!
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium">
          You crushed it. Memory pathways strengthened.
        </p>
        <button 
          onClick={() => setSessionCards(null)}
          className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 inline-flex items-center gap-2 mt-8"
        >
          Back to Review Hub <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  const card = sessionCards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
            <BrainCircuit className="text-neutral-500" size={32} />
            Focus Session
          </h1>
          <p className="text-neutral-500 font-bold mt-2">{card.notes?.title}</p>
        </div>
        <button 
          onClick={() => setSessionCards(null)}
          className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-full font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 transition-colors"
        >
          Exit Session
        </button>
      </div>

      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-neutral-800 dark:bg-neutral-200 h-full transition-all duration-500"
          style={{ width: `${((currentIndex) / sessionCards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Container */}
      <div className="perspective-1000 w-full min-h-[400px]">
        <div 
          className={`relative w-full h-full min-h-[400px] transition-transform duration-700 [transform-style:preserve-3d] ${revealed ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 bubbly-card flex flex-col justify-center items-center text-center p-8 sm:p-16 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#34302d] [backface-visibility:hidden]">
            <p className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 leading-relaxed">
              {card.front}
            </p>
            <button 
              onClick={() => setRevealed(true)}
              className="mt-8 bubbly-button bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
            >
              Reveal Answer
            </button>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 bubbly-card flex flex-col justify-center items-center text-center p-8 sm:p-16 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#34302d] [backface-visibility:hidden] [transform:rotateY(180deg)]">
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
        </div>
      </div>
    </div>
  );
}
