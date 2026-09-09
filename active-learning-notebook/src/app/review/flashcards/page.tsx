"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, Clock, Layers, ArrowRight, Loader2, PenTool, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FlashcardActions from "@/components/FlashcardActions";
import SavedExamCard from "@/components/SavedExamCard";

export default function GrandFlashcardsModePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [validTopics, setValidTopics] = useState<Set<string>>(new Set());
  const [savedDecks, setSavedDecks] = useState<any[]>([]);
  const [flashcardsData, setFlashcardsData] = useState<any[]>([]);
  const [notesData, setNotesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [cardCount, setCardCount] = useState<number>(20);
  const [deckStarted, setDeckStarted] = useState(false);
  
  // Data
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  // Viewer State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const maxAvailableCards = useMemo(() => {
    let total = 0;
    const selectedNoteIds = notesData
      .filter(n => {
        if (!n.course_topic) return false;
        if (n.course_topic.startsWith('[')) {
          try { return JSON.parse(n.course_topic).some((t: string) => selectedTopics.includes(t)); } catch { return false; }
        }
        return selectedTopics.includes(n.course_topic);
      })
      .map(n => n.id);
      
    flashcardsData.forEach(card => {
      if (selectedNoteIds.includes(card.note_id)) total++;
    });
    return total;
  }, [notesData, flashcardsData, selectedTopics]);

  useEffect(() => {
    if (cardCount > maxAvailableCards && maxAvailableCards > 0) {
      setCardCount(maxAvailableCards);
    }
  }, [maxAvailableCards, cardCount]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [coursesRes, notesRes, flashcardsRes, savedDecksRes] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id", user.id),
      supabase.from("notes").select("id, course_topic").eq("user_id", user.id),
      supabase.from("flashcards").select("id, front, back, note_id"),
      supabase.from("notes").select("id, title, created_at, is_public").eq("course_topic", "SHARED_FLASHCARDS").eq("user_id", user.id).order('created_at', { ascending: false })
    ]);

    const valid = new Set<string>();
    
    if (notesRes.data) {
      setNotesData(notesRes.data);
    }
    
    if (flashcardsRes.data && notesRes.data) {
      setFlashcardsData(flashcardsRes.data);
      
      const noteTopicsMap = new Map<string, string>();
      notesRes.data.forEach((note: any) => noteTopicsMap.set(note.id, note.course_topic));
      
      flashcardsRes.data.forEach((card: any) => {
        const topicRaw = noteTopicsMap.get(card.note_id);
        if (topicRaw && topicRaw !== "SHARED_FLASHCARDS" && topicRaw !== "GRAND_EXAM" && topicRaw !== "SHARED_EXAM") {
          if (topicRaw.startsWith('[')) {
            try { JSON.parse(topicRaw).forEach((t: string) => valid.add(t)); } catch {}
          } else {
            valid.add(topicRaw);
          }
        }
      });
    }

    if (coursesRes.data) setCourses(coursesRes.data);
    if (savedDecksRes.data) setSavedDecks(savedDecksRes.data);
    setValidTopics(valid);
    setLoading(false);
  };

  const startDeck = () => {
    if (selectedTopics.length === 0) return alert("Select at least one topic");
    
    setGenerating(true);

    const selectedNoteIds = notesData
      .filter(n => {
        if (!n.course_topic) return false;
        if (n.course_topic.startsWith('[')) {
          try { return JSON.parse(n.course_topic).some((t: string) => selectedTopics.includes(t)); } catch { return false; }
        }
        return selectedTopics.includes(n.course_topic);
      })
      .map(n => n.id);
      
    const availableCards = flashcardsData.filter(card => selectedNoteIds.includes(card.note_id));
    
    // Shuffle and slice
    const shuffled = availableCards.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cardCount);

    setDeckCards(selected);
    setExamStarted(true);
    setGenerating(false);
  };

  const setExamStarted = (val: boolean) => {
    setDeckStarted(val);
    setCurrentIndex(0);
    setRevealed(false);
    setIsFinished(false);
  };

  const nextCard = () => {
    if (currentIndex < deckCards.length - 1) {
      setCurrentIndex(i => i + 1);
      setRevealed(false);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-neutral-400" size={48} /></div>;
  }

  if (deckStarted) {
    if (deckCards.length === 0) {
      return (
        <div className="max-w-3xl mx-auto py-24 text-center">
          <h2 className="text-xl font-bold mb-4">No flashcards found!</h2>
          <p className="text-neutral-500 mb-8">The topics you selected don't have any flashcards.</p>
          <button onClick={() => setExamStarted(false)} className="modern-button bg-neutral-800 text-white">Back to Setup</button>
        </div>
      );
    }
    
    if (isFinished) {
      return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-neutral-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BrainCircuit size={40} />
              </div>
              
              <h1 className="text-4xl font-extrabold text-neutral-900 mb-4">Deck Complete!</h1>
              <p className="text-xl text-neutral-500 mb-10 max-w-lg mx-auto">
                You've reviewed all {deckCards.length} flashcards for your combined topics.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => {
                    setCurrentIndex(0);
                    setRevealed(false);
                    setIsFinished(false);
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Study Again
                </button>
                <button 
                  onClick={() => setExamStarted(false)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                >
                  <ArrowLeft size={20} />
                  Back to Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><PenTool className="text-indigo-500"/> Grand Flashcards</h1>
          <div className="flex items-center gap-4">
            <FlashcardActions 
              flashcards={deckCards} 
              defaultTitle={selectedTopics.length === 1 ? `${selectedTopics[0]} Flashcards` : "Combined Flashcards Deck"} 
            />
            <button onClick={() => setExamStarted(false)} className="text-sm font-bold text-neutral-500 hover:text-neutral-700">Exit Deck</button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
              Card {currentIndex + 1} of {deckCards.length}
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col relative perspective-1000 group">
          <div 
            onClick={() => setRevealed(!revealed)}
            className={`flex-1 relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] cursor-pointer ${revealed ? "[transform:rotateY(180deg)]" : ""}`}
          >
            {/* Front */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border-2 border-neutral-100 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <span className="absolute top-6 left-6 text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Front</span>
              <p className="text-2xl sm:text-4xl font-bold text-neutral-800 leading-tight">
                {deckCards[currentIndex].front}
              </p>
              <p className="absolute bottom-8 text-neutral-400 font-medium animate-pulse flex items-center gap-2">
                <RotateCcw size={16} /> Click to flip
              </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-600 border-2 border-indigo-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center text-white">
              <span className="absolute top-6 left-6 text-xs font-bold text-indigo-200 uppercase tracking-widest bg-indigo-700/50 px-3 py-1 rounded-full">Back</span>
              <p className="text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                {deckCards[currentIndex].back}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 shrink-0 flex justify-center">
          <button
            onClick={nextCard}
            disabled={!revealed}
            className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              revealed 
                ? "bg-neutral-900 text-white shadow-xl hover:bg-black hover:scale-105 active:scale-95" 
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {currentIndex === deckCards.length - 1 ? "Finish Deck" : "Next Card"}
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in">
      <div className="mb-8">
        <Link href="/review" className="text-neutral-500 font-bold hover:text-indigo-500 transition-colors">
          &larr; Back to Review Hub
        </Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12">
        <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-3">
          <BrainCircuit size={36} className="text-indigo-200" /> Grand Flashcards
        </h1>
        <p className="text-xl font-medium text-indigo-100">
          Combine topics to create a massive deck of flashcards and test your memory across multiple subjects.
        </p>
      </div>

      <div className="modern-card p-8 sm:p-12 space-y-8">
        <div>
          <label className="block text-lg font-bold text-neutral-800 mb-4">Select Topics to Include</label>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar border-2 border-neutral-100 rounded-2xl p-4">
            {courses.length === 0 && <p className="text-neutral-500 text-sm">No courses found.</p>}
            {courses.map(course => {
              const courseValidTopics: any[] = [];
              course.syllabus?.modules?.forEach((m: any) => {
                m.topics?.forEach((t: any) => {
                  if (validTopics.has(t.title)) {
                    courseValidTopics.push(t);
                  }
                });
              });

              if (courseValidTopics.length === 0) return null;

              const allCourseTopicsSelected = courseValidTopics.every(t => selectedTopics.includes(t.title));

              const toggleCourse = () => {
                if (allCourseTopicsSelected) {
                  setSelectedTopics(prev => prev.filter(id => !courseValidTopics.some(t => t.title === id)));
                } else {
                  const newTopics = courseValidTopics.map(t => t.title).filter(t => !selectedTopics.includes(t));
                  setSelectedTopics(prev => [...prev, ...newTopics]);
                }
              };

              return (
                <div key={course.id} className="mb-6">
                  <label className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-xl cursor-pointer mb-2 group border-b border-neutral-200 pb-2">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      checked={allCourseTopicsSelected}
                      onChange={toggleCourse}
                    />
                    <h4 className="font-bold text-neutral-800 text-sm uppercase tracking-wider group-hover:text-indigo-700">{course.title}</h4>
                  </label>
                  
                  <div className="pl-4 space-y-1 border-l-2 border-neutral-100 ml-4">
                    {courseValidTopics.map((t: any, tidx: number) => (
                      <label key={tidx} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedTopics.includes(t.title)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTopics([...selectedTopics, t.title]);
                            else setSelectedTopics(selectedTopics.filter(id => id !== t.title));
                          }}
                        />
                        <span className="text-neutral-700 font-medium">{t.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Layers size={18}/> Number of Flashcards</span>
              {selectedTopics.length > 0 && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">Max: {maxAvailableCards}</span>}
            </label>
            <input 
              type="number" 
              min="5" max={maxAvailableCards || 100}
              value={cardCount}
              onChange={e => {
                const val = Number(e.target.value);
                setCardCount(maxAvailableCards > 0 ? Math.min(val, maxAvailableCards) : val);
              }}
              className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-indigo-500 bg-neutral-50 font-bold text-lg"
            />
          </div>
        </div>

        <button 
          onClick={startDeck}
          disabled={generating || selectedTopics.length === 0}
          className="w-full modern-button bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 py-4 text-lg disabled:opacity-50"
        >
          {generating ? <Loader2 className="animate-spin mx-auto" /> : "Start Combined Deck"}
        </button>
      </div>

      {savedDecks.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers className="text-neutral-400" /> Saved Decks</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {savedDecks.map((deck) => (
              <SavedExamCard 
                key={deck.id} 
                exam={deck} 
                onRemove={(id) => setSavedDecks(prev => prev.filter(d => d.id !== id))} 
                baseUrl="/review/flashcards"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
