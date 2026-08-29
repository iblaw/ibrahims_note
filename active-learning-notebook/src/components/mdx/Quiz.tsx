"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizProps {
  question: string;
  options: string; // Comma separated string from MDX
  answer: string;
}

export default function Quiz({ question, options, answer }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  
  const optionsList = options.split(",").map(o => o.trim());
  const isCorrect = selected === answer.trim();

  return (
    <div className="my-8 bubbly-card bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30">
      <h3 className="text-xl font-bold mb-4 text-orange-900 dark:text-orange-200">
        ✨ Quick Recall
      </h3>
      <p className="text-lg mb-6 font-medium">{question}</p>
      
      <div className="space-y-3">
        {optionsList.map((opt, idx) => {
          const isSelected = selected === opt;
          const isActuallyCorrect = opt === answer.trim();
          
          let buttonStyles = "bg-white dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-zinc-700 border-neutral-200 dark:border-zinc-600";
          
          if (selected) {
            if (isActuallyCorrect) {
              buttonStyles = "bg-green-100 dark:bg-green-900/40 border-green-400 text-green-900 dark:text-green-100";
            } else if (isSelected) {
              buttonStyles = "bg-red-100 dark:bg-red-900/40 border-red-400 text-red-900 dark:text-red-100";
            } else {
              buttonStyles = "bg-white dark:bg-zinc-800 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !selected && setSelected(opt)}
              disabled={!!selected}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center justify-between ${buttonStyles}`}
            >
              <span>{opt}</span>
              {selected && isActuallyCorrect && <CheckCircle2 className="text-green-500" />}
              {selected && isSelected && !isActuallyCorrect && <XCircle className="text-red-500" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={`mt-6 p-4 rounded-xl text-center font-bold animate-in fade-in zoom-in-95 duration-300 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? "Brilliant! You got it right. 🎉" : "Not quite! Remember to review this concept."}
        </div>
      )}
    </div>
  );
}
