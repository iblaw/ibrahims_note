"use client";

import { useState } from "react";
import { PenTool, Check } from "lucide-react";

interface FeynmanPromptProps {
  concept: string;
}

export default function FeynmanPrompt({ concept }: FeynmanPromptProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-10 bubbly-card bg-teal-50/50 dark:bg-teal-950/10 border-teal-100 dark:border-teal-900/30">
      <div className="flex items-center gap-3 mb-4 text-teal-900 dark:text-teal-200">
        <PenTool size={24} />
        <h3 className="text-xl font-bold">Feynman Challenge</h3>
      </div>
      
      <p className="text-lg mb-6 font-medium text-teal-800 dark:text-teal-300">
        Explain the concept below as if you were teaching it to a 12-year-old.
      </p>
      
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-teal-200 dark:border-teal-800 shadow-inner mb-6">
        <p className="font-bold text-lg">{concept}</p>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your simple explanation here..."
            className="w-full min-h-[150px] p-4 rounded-xl border-2 border-teal-100 dark:border-teal-900 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all outline-none resize-y bg-transparent font-medium"
          />
          <div className="flex justify-end">
            <button
              onClick={() => setSubmitted(true)}
              disabled={text.length < 10}
              className="bubbly-button bg-teal-500 text-white disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
            >
              Submit Explanation
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-teal-100 dark:bg-teal-900/40 text-teal-900 dark:text-teal-100 p-6 rounded-xl animate-in fade-in zoom-in-95 duration-300 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Check className="text-teal-600" />
            Awesome work!
          </div>
          <p className="opacity-80 italic">&quot;{text}&quot;</p>
          <p className="text-sm font-medium mt-4">
            By forcing yourself to explain it, you&apos;ve just strengthened your neural pathways for this concept.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-sm underline font-bold mt-2 hover:text-teal-600"
          >
            Edit explanation
          </button>
        </div>
      )}
    </div>
  );
}
