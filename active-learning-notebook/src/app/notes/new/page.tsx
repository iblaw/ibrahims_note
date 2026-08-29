"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check, Link as LinkIcon } from "lucide-react";

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
- At the end of EVERY segment, you MUST insert a set of quizzes (at least 3-4 quizzes per section) to comprehensively test the user's understanding of that segment.
- Format EACH quiz EXACTLY like this:
<Quiz question="[Question text]" options="[Option 1] | [Option 2] | [Option 3]" answer="[Exact text of correct option]" />

4. Segment Challenge (Feynman Prompt)
- At major milestones, challenge the user to explain it EXACTLY like this:
<FeynmanPrompt concept="[Concept to explain]" />

5. Extraction for Spaced Repetition (Flashcards)
- Apply the Pareto Principle: Extract the most critical 20% of information that yields 80% of the understanding.
- Generate at least 2-3 flashcards PER SECTION of the document. Do not just summarize the whole document into 5 cards. You should output a robust list (15+ cards for large topics) covering all critical definitions, formulas, and concepts.
- Output them at the bottom of the document EXACTLY like this:
<Flashcard front="[Question]" back="[Answer]" />
`;

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Linking state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  useEffect(() => {
    if (!selectedCourseId) {
      setAvailableTopics([]);
      return;
    }
    const course = courses.find(c => c.id === selectedCourseId);
    if (course && course.syllabus && course.syllabus.modules) {
      const topics: string[] = [];
      course.syllabus.modules.forEach((m: any) => {
        m.topics?.forEach((t: any) => topics.push(t.title));
      });
      setAvailableTopics(topics);
    } else {
      setAvailableTopics([]);
    }
  }, [selectedCourseId, courses]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: note, error: noteError } = await supabase
        .from("notes")
        .insert([{ 
          title, 
          content,
          user_id: user?.id,
          course_id: selectedCourseId || null,
          course_topic: selectedTopic || null
        }])
        .select()
        .single();

      if (noteError) throw noteError;

      const regex = /<Flashcard\s+front="([^"]+)"\s+back="([^"]+)"\s*\/?>(?:<\/Flashcard>)?/g;
      let match;
      const extractedCards = [];

      while ((match = regex.exec(content)) !== null) {
        extractedCards.push({
          note_id: note.id,
          user_id: user?.id,
          front: match[1],
          back: match[2],
          topic: selectedTopic || null,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          next_review_date: new Date().toISOString()
        });
      }

      if (extractedCards.length > 0) {
        const { error: flashcardError } = await supabase
          .from("flashcards")
          .insert(extractedCards);
        
        if (flashcardError) throw flashcardError;
      }

      router.push(`/notes/${note.id}`);
    } catch (error: any) {
      console.error("Error saving note:", JSON.stringify(error, null, 2));
      alert(`Failed to save note: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <Sparkles className="text-neutral-500" size={36} />
          Create New Note
        </h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !title || !content}
          className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 disabled:opacity-50 flex items-center gap-2 justify-center"
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

        {/* Linking Section */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800/50 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <LinkIcon size={18} /> Link to Course Planner (Optional)
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-[#34302d] text-neutral-800 dark:text-neutral-200 outline-none font-medium flex-grow"
            >
              <option value="">-- Select Course Outline --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {selectedCourseId && (
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-[#34302d] text-neutral-800 dark:text-neutral-200 outline-none font-medium flex-grow"
              >
                <option value="">-- Select Topic --</option>
                {availableTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
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
