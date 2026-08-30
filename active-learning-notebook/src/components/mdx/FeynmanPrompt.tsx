"use client";

import { useState } from "react";
import { PenTool, Check, Keyboard, Users, FileText, Star } from "lucide-react";

interface FeynmanPromptProps {
  concept: string;
}

type Method = "type" | "friend" | "note" | null;
type Score = 1 | 2 | 3 | null;

export default function FeynmanPrompt({ concept }: FeynmanPromptProps) {
  const [method, setMethod] = useState<Method>(null);
  const [text, setText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [score, setScore] = useState<Score>(null);

  const handleReset = () => {
    setMethod(null);
    setText("");
    setIsDone(false);
    setScore(null);
  };

  return (
    <div className="my-10 modern-card bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-700/50 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4 text-neutral-800 dark:text-neutral-200">
        <PenTool size={24} />
        <h3 className="text-xl font-bold">Feynman Challenge</h3>
      </div>
      
      <p className="text-lg mb-6 font-medium text-neutral-600 dark:text-neutral-300">
        Explain the concept below as if you were teaching it to a 12-year-old.
      </p>
      
      <div className="bg-white dark:bg-[#34302d] p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-inner mb-8">
        <p className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{concept}</p>
      </div>

      {!method ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">How do you want to explain this?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setMethod("type")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold text-neutral-700 dark:text-neutral-300"
            >
              <Keyboard size={28} />
              Type it out
            </button>
            <button
              onClick={() => setMethod("friend")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold text-neutral-700 dark:text-neutral-300"
            >
              <Users size={28} />
              Explain to a Friend
            </button>
            <button
              onClick={() => setMethod("note")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold text-neutral-700 dark:text-neutral-300"
            >
              <FileText size={28} />
              Write on Paper
            </button>
          </div>
        </div>
      ) : !isDone ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {method === "type" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your simple explanation here..."
              className="w-full min-h-[150px] p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none resize-y bg-transparent font-medium"
            />
          )}
          {method === "friend" && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-300 font-medium">
              <p>Find a friend, family member, or a rubber duck, and explain the concept to them out loud using simple words.</p>
            </div>
          )}
          {method === "note" && (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-medium">
              <p>Grab a notebook or a piece of paper and write down your explanation.</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setMethod(null)}
              className="text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 underline"
            >
              Change method
            </button>
            <button
              onClick={() => setIsDone(true)}
              disabled={method === "type" && text.length < 10}
              className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
            >
              I'm Done Explaining
            </button>
          </div>
        </div>
      ) : !score ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <p className="font-bold text-neutral-800 dark:text-neutral-200 text-lg text-center">
            {method === "friend" ? "Ask your friend to rate your explanation:" : "Time for a self-assessment. How did you do?"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setScore(1)}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-bold text-red-700 dark:text-red-400 text-center"
            >
              <div className="text-3xl mb-1">1</div>
              Struggled / Very Poor
            </button>
            <button
              onClick={() => setScore(2)}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all font-bold text-amber-700 dark:text-amber-400 text-center"
            >
              <div className="text-3xl mb-1">2</div>
              In the middle / Getting there
            </button>
            <button
              onClick={() => setScore(3)}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all font-bold text-green-700 dark:text-green-400 text-center"
            >
              <div className="text-3xl mb-1">3</div>
              Nailed it! (A 12yr old would get it)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-100 dark:bg-[#403b38] text-neutral-900 dark:text-neutral-100 p-6 rounded-xl animate-in fade-in zoom-in-95 duration-300 border border-neutral-200 dark:border-neutral-700 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-sm">
            <Check size={32} strokeWidth={3} />
          </div>
          <h4 className="text-xl font-bold mb-2">Awesome work!</h4>
          {method === "type" && text && (
            <p className="opacity-80 italic mb-4 text-sm bg-black/5 dark:bg-white/5 p-4 rounded-lg text-left">&quot;{text}&quot;</p>
          )}
          <p className="text-base font-medium mb-6">
            {score === 3 
              ? "You've mastered this! Feynman would be proud." 
              : score === 2 
                ? "Good effort! A little more practice and you'll have it down perfectly." 
                : "The first step to learning is identifying what you don't know yet. Keep at it!"}
          </p>
          <button 
            onClick={handleReset}
            className="text-sm underline font-bold hover:text-neutral-600 dark:hover:text-neutral-400"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
