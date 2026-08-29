"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

const PROMPT_TEMPLATE = `Context: You are an expert instructional designer and AI tutor. Your task is to generate a structured Note Document for a specialized Active Learning platform. The user will provide EITHER raw study materials OR just a Topic Name.

Core Philosophy: Do not generate passive blocks of text. The content must adhere to Richard Feynman's learning principles and the science of Active Recall.

CRITICAL INSTRUCTION: You must output the content in Markdown format, but use the exact custom HTML tags below for interactive elements. DO NOT wrap these HTML tags inside markdown code blocks (e.g., no \`\`\`html). Output them directly in the text.

1. Structure by "First Principles"
- Begin every note by breaking the topic down to its most fundamental truths.

2. The Feynman Technique (Simplicity & Jargon)
- Explain concepts as if teaching a 12-year-old.
- Explicitly define jargon in simple terms.

3. Chunking & In-Text Quizzes
- Break the document into logical segments (2-3 paragraphs max).
- At the end of EVERY segment, insert a quiz EXACTLY like this:
<Quiz question="[Question text]" options="[Option 1], [Option 2], [Option 3]" answer="[Exact text of correct option]" />

4. Segment Challenge (Feynman Prompt)
- At major milestones, challenge the user to explain it EXACTLY like this:
<FeynmanPrompt concept="[Concept to explain]" />

5. Extraction for Spaced Repetition (Flashcards)
- At the bottom of the document, generate a list of 5-10 flashcards (short-answer/fill-in-the-blank) EXACTLY like this:
<Flashcard front="[Question]" back="[Answer]" />
`;

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .insert([{ title, content }])
        .select()
        .single();

      if (noteError) throw noteError;

      const regex = /<Flashcard\s+front="([^"]+)"\s+back="([^"]+)"\s*\/?>(?:<\/Flashcard>)?/g;
      let match;
      const extractedCards = [];

      while ((match = regex.exec(content)) !== null) {
        extractedCards.push({
          note_id: note.id,
          front: match[1],
          back: match[2],
        });
      }

      if (extractedCards.length > 0) {
        const { error: flashcardError } = await supabase
          .from("flashcards")
          .insert(extractedCards);
        
        if (flashcardError) throw flashcardError;
      }

      router.push(`/notes/${note.id}`);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <Sparkles className="text-neutral-500" size={36} />
          Create New Note
        </h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !title || !content}
          className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={20} />}
          {isSubmitting ? "Saving..." : "Save Note"}
        </button>
      </div>

      <div className="bg-neutral-100 dark:bg-[#34302d] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-6 items-center justify-between">
        <p className="text-lg text-neutral-700 dark:text-neutral-300 font-medium">
          Need the AI prompt template? Copy it here and paste it into ChatGPT or Gemini to generate your note!
        </p>
        <button
          onClick={handleCopyPrompt}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#403b38] border border-neutral-200 dark:border-neutral-600 rounded-full font-bold hover:bg-neutral-50 dark:hover:bg-[#4d4844] transition-colors"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy AI Prompt"}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Laws of Thermodynamics"
            className="w-full p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold text-xl bg-white dark:bg-[#3a3532]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">
            MDX Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your AI generated Markdown (with custom tags) here..."
            className="w-full min-h-[500px] p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none resize-y font-mono text-sm bg-white dark:bg-[#2a2624] leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
