"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2, Save, Sparkles, Edit3, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

const AI_PROMPT = `Context: You are an expert instructional designer and AI tutor. I want to create a flashcard deck about [Insert Topic Here]. 
Please generate 10-15 flashcards extracting the most critical definitions, concepts, and facts.

Output ONLY in the following format with NO code blocks or markdown wrappers around the HTML tags:
<Flashcard front="[Question]" back="[Answer]" />
<Flashcard front="[Question]" back="[Answer]" />
`;

export default function CreateDeckPage() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [saving, setSaving] = useState(false);
  
  // AI Mode
  const [aiContent, setAiContent] = useState("");
  const [copied, setCopied] = useState(false);

  // Manual Mode
  const [cards, setCards] = useState([{ front: "", back: "" }]);

  const router = useRouter();

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addManualCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const updateManualCard = (index: number, field: "front" | "back", value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const removeManualCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!topic.trim()) {
      alert("Please enter a Deck Name");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const extractedCards = [];
      const baseStats = {
        user_id: user?.id,
        topic: topic.trim(),
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_date: new Date().toISOString()
      };

      if (mode === "ai") {
        const regex = /<Flashcard\s+front="([^"]+)"\s+back="([^"]+)"\s*\/?>(?:<\/Flashcard>)?/g;
        let match;
        while ((match = regex.exec(aiContent)) !== null) {
          extractedCards.push({
            ...baseStats,
            front: match[1],
            back: match[2],
          });
        }
      } else {
        cards.forEach(c => {
          if (c.front.trim() && c.back.trim()) {
            extractedCards.push({ ...baseStats, front: c.front.trim(), back: c.back.trim() });
          }
        });
      }

      if (extractedCards.length === 0) {
        alert("No valid flashcards found to save.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("flashcards").insert(extractedCards);
      if (error) throw error;

      router.push("/review");
    } catch (error: any) {
      console.error(error);
      alert("Failed to save flashcards: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="mb-4">
        <Link href="/review" className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Review Hub
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <BrainCircuit className="text-orange-500" size={36} />
          Create Flashcard Deck
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 disabled:opacity-50 flex items-center gap-2 justify-center px-8"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? "Saving..." : "Save Deck"}
        </button>
      </div>

      <div className="modern-card p-6 border-orange-200 dark:border-orange-900/30">
        <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">
          Deck Name (Topic)
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Biology 101: Cell Structure"
          className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all outline-none font-bold text-xl bg-transparent"
        />
      </div>

      <div className="flex gap-4 border-b-2 border-neutral-200 dark:border-neutral-800 pb-4">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            mode === "ai" 
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
              : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Sparkles size={18} /> Generate with AI
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            mode === "manual" 
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
              : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Edit3 size={18} /> Manual Entry
        </button>
      </div>

      {mode === "ai" ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-neutral-50 dark:bg-[#34302d] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-6 items-center justify-between">
            <p className="text-neutral-700 dark:text-neutral-300 font-medium">
              Copy this prompt into ChatGPT or Gemini to generate your flashcards, then paste the results below.
            </p>
            <button
              onClick={handleCopyPrompt}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#403b38] border border-neutral-200 dark:border-neutral-600 rounded-full font-bold hover:bg-neutral-50 dark:hover:bg-[#4d4844] transition-colors"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy Prompt"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">
              Paste AI Output Here
            </label>
            <textarea
              value={aiContent}
              onChange={(e) => setAiContent(e.target.value)}
              placeholder="<Flashcard front=&quot;...&quot; back=&quot;...&quot; />"
              className="w-full min-h-[400px] p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all outline-none resize-y font-mono text-sm bg-transparent leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {cards.map((card, i) => (
            <div key={i} className="modern-card p-6 flex flex-col gap-4 relative">
              <span className="absolute -top-3 -left-3 bg-neutral-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <button 
                onClick={() => removeManualCard(i)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
              
              <div>
                <label className="block text-xs font-bold mb-1 text-orange-500 uppercase">Front (Question)</label>
                <textarea
                  value={card.front}
                  onChange={(e) => updateManualCard(i, "front", e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-orange-500 resize-y"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-400 uppercase">Back (Answer)</label>
                <textarea
                  value={card.back}
                  onChange={(e) => updateManualCard(i, "back", e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-orange-500 resize-y"
                  rows={2}
                />
              </div>
            </div>
          ))}
          <button 
            onClick={addManualCard}
            className="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 p-4 rounded-2xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            + Add Another Card
          </button>
        </div>
      )}
    </div>
  );
}
