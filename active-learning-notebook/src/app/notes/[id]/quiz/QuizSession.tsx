"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

interface QuizData {
  question: string;
  options: string[];
  answer: string;
}

export default function QuizSession({ quizzes }: { quizzes: QuizData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuiz = quizzes[currentIndex];

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    setIsSubmitted(true);
    if (selectedOption === currentQuiz.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <div className="modern-card p-12 text-center">
        <div className="text-xl font-extrabold text-orange-500 mb-6">{percentage}%</div>
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Quiz Complete!</h2>
        <p className="text-lg text-neutral-600 font-medium mb-8">
          You scored {score} out of {quizzes.length} correctly.
        </p>
        <button onClick={restart} className="modern-button bg-neutral-800 text-white shadow-neutral-300">
          <RotateCcw size={20} className="inline mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="modern-card p-8 sm:p-12">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Question {currentIndex + 1} of {quizzes.length}
        </span>
        <span className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
          Score: {score}
        </span>
      </div>

      <h2 className="text-xl font-extrabold text-neutral-800 mb-8 leading-tight">
        {currentQuiz.question}
      </h2>

      <div className="space-y-4 mb-8">
        {currentQuiz.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuiz.answer;
          
          let stateClass = "border-neutral-200 hover:border-orange-500 hover:bg-orange-50 text-neutral-700 bg-white";
          
          if (isSubmitted) {
            if (isCorrect) {
              stateClass = "border-green-500 bg-green-50 text-green-800";
            } else if (isSelected && !isCorrect) {
              stateClass = "border-red-500 bg-red-50 text-red-800";
            } else {
              stateClass = "border-neutral-200 opacity-50 bg-neutral-50 text-neutral-500";
            }
          } else if (isSelected) {
            stateClass = "border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-200";
          }

          return (
            <button
              key={idx}
              onClick={() => !isSubmitted && setSelectedOption(option)}
              disabled={isSubmitted}
              className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all ${stateClass} flex items-center justify-between`}
            >
              <span>{option}</span>
              {isSubmitted && isCorrect && <CheckCircle2 className="text-green-500" size={20} />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="modern-button bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-neutral-300"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="modern-button bg-orange-500 text-white shadow-orange-500/30 flex items-center gap-2"
          >
            {currentIndex < quizzes.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
