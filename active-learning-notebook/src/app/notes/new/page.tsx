"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check, Link as LinkIcon, Smartphone, Monitor, X, Search } from "lucide-react";

import Editor, { useMonaco } from "@monaco-editor/react";
import { validateMdx } from "@/app/actions/validateMdx";

export default function CreateNote() {
  const { complete, completion, isLoading: isGenerating, stop } = useCompletion({ 
    api: "/api/generate-note",
    onFinish: (prompt, result) => {
      setContent(result);
    }
  });

  useEffect(() => {
    if (completion) {
      setContent(completion);
    }
  }, [completion]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const monaco = useMonaco();
  
  // Linking state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState("");

  const [profile, setProfile] = useState<any>(null);
  
  // Validation State
  const [mdxError, setMdxError] = useState<{message: string, line: number, column: number} | null>(null);

  // Mobile Friendly Editor Toggle
  const [useBasicEditor, setUseBasicEditor] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Auto-detect mobile devices to default to basic editor
    if (typeof window !== "undefined") {
      setUseBasicEditor(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchProfile();
    
    // Auto-fill from query params if navigated from the master timetable
    const searchParams = new URLSearchParams(window.location.search);
    const courseIdParam = searchParams.get('courseId');
    const topicParam = searchParams.get('topic');

    if (courseIdParam) setSelectedCourseId(courseIdParam);
    if (topicParam) {
      setSelectedTopics([topicParam]);
      setTitle(topicParam); // Auto-title the note with the topic name
    }
  }, []);

  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const generateParam = searchParams.get('generate');
    
    // Only auto-generate if generate=true, profile is loaded, and we haven't started yet
    if (generateParam === 'true' && profile && !isGenerating && !content) {
      // Small timeout to ensure states (like selectedTopics) are fully applied
      setTimeout(() => {
        complete(getDynamicPrompt());
        // Remove generate=true from URL so it doesn't trigger again on reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('generate');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }, 500);
    }
  }, [profile, complete]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
    }
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  function getDynamicPrompt() {
    let quizInstruction = `3. Chunking & In-Text Quizzes\n- Break the document into logical segments (2-3 paragraphs max).\n- At the end of EVERY segment, you MUST insert a set of quizzes (at least 3-4 quizzes per section) to comprehensively test the user's understanding of that segment.\n- Format EACH quiz EXACTLY like this:\n<Quiz question="[Question text]" options="[Option 1] | [Option 2] | [Option 3]" answer="[Exact text of correct option]" />`;

    let mnemonicInstruction = "";
    if (profile?.mnemonic_preference === "acronyms") {
      mnemonicInstruction = `\n\n6. Mnemonics (Acronyms & Acrostics)\n- Throughout the note, proactively create Acronyms and Acrostics to help the user memorize lists, formulas, or complex concepts.`;
    } else if (profile?.mnemonic_preference === "story") {
      mnemonicInstruction = `\n\n6. Mnemonics (Stories & Rhymes)\n- Throughout the note, proactively create short stories, vivid imagery, or rhymes to help the user memorize complex concepts.`;
    } else if (profile?.mnemonic_preference === "mixed") {
      mnemonicInstruction = `\n\n6. Mnemonics\n- Throughout the note, proactively create mixed mnemonics (Acronyms, Stories, Rhymes) to help the user memorize complex concepts.`;
    }

    let lengthInstruction = "You must output a comprehensive, structured Note Document.";
    if (profile?.note_length_preference === "summary") {
      lengthInstruction = "You must output a concise, summarized Note Document focusing ONLY on the absolute core concepts. Keep it short and to the point.";
    } else if (profile?.note_length_preference === "detailed") {
      lengthInstruction = "You must output a long, highly-detailed Note Document exploring every facet of the topic with thorough explanations and examples.";
    }

    let topicInstruction = "";
    if (selectedTopics.length > 0) {
      topicInstruction = `\n\n*** TARGET TOPIC ***\nThe user is requesting a note specifically on the following topics: "${selectedTopics.join(', ')}".\nEnsure the generated Note Document focuses completely on explaining these topics accurately and thoroughly.`;
    }

    let personaInstruction = "";
    if (profile?.field_of_study || profile?.primary_goal || profile?.learning_style) {
      personaInstruction = `\n\n*** USER PERSONA & CONTEXT ***\nTailor your explanations, examples, and analogies to resonate with this user's specific background and goals:`;
      if (profile.field_of_study) personaInstruction += `\n- Field of Study/Profession: ${profile.field_of_study}`;
      if (profile.primary_goal) personaInstruction += `\n- Primary Goal: ${profile.primary_goal}`;
      if (profile.learning_style) personaInstruction += `\n- Learning Style: ${profile.learning_style}`;
    }

    return `Context: You are an expert instructional designer and AI tutor. Your task is to generate a Note Document for a specialized Active Learning platform.${personaInstruction}${topicInstruction}

Core Philosophy: Do not generate passive blocks of text. The content must adhere to Richard Feynman's learning principles and the science of Active Recall.

CRITICAL INSTRUCTION: You must output the content in Markdown format, but use the exact custom HTML tags below for interactive elements. DO NOT wrap these HTML tags inside markdown code blocks (e.g., no \`\`\`html). Output them directly in the text.

1. Overall Length & Depth
- ${lengthInstruction}

2. The Feynman Technique (Simplicity & Jargon)
- Explain concepts as if teaching a 12-year-old.
- Explicitly define jargon in simple terms.

${quizInstruction}

4. Segment Challenge (Feynman Prompt)
- At major milestones, challenge the user to explain it EXACTLY like this:
<FeynmanPrompt concept="[Concept to explain]" />

5. Extraction for Spaced Repetition (Flashcards)
- Apply the Pareto Principle: Extract the most critical 20% of information that yields 80% of the understanding.
- Generate at least 2-3 flashcards PER SECTION of the document. Do not just summarize the whole document into 5 cards. You should output a robust list (15+ cards for large topics) covering all critical definitions, formulas, and concepts.
- Output them at the bottom of the document EXACTLY like this:
<Flashcard front="[Question]" back="[Answer]" />${mnemonicInstruction}

ANTI-LAZINESS RULES (MANDATORY):
- You MUST generate the COMPLETE note from start to finish. Do NOT stop, truncate, or trail off mid-generation under any circumstances.
- Every section MUST contain its required quizzes and flashcards as specified above. Do not skip or reduce them even for long topics.
- Do NOT write placeholder text like "[Continue as needed]", "[More content here]", "..." or "etc." — write everything out in full.
- Do NOT summarise or compress sections to save space. Each section must be fully written.
- Do NOT deviate from the custom HTML tag formats specified above. Using markdown code blocks around these tags will break the application.
- Your response is INVALID if it is incomplete, cuts off early, or omits required interactive elements (Quiz, Flashcard, FeynmanPrompt tags).`;
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

  // Real-time MDX Validation with Debounce
  useEffect(() => {
    if (!content) return;
    
    const timeoutId = setTimeout(async () => {
      const res = await validateMdx(content);
      if (res.success) {
        setMdxError(null);
        if (monaco) {
          const models = monaco.editor.getModels();
          if (models.length > 0) monaco.editor.setModelMarkers(models[0], "mdx", []);
        }
      } else if (res.error) {
        setMdxError(res.error);
        if (monaco) {
          const models = monaco.editor.getModels();
          if (models.length > 0) {
            monaco.editor.setModelMarkers(models[0], "mdx", [{
              startLineNumber: res.error.line,
              startColumn: res.error.column || 1,
              endLineNumber: res.error.line,
              endColumn: 1000,
              message: res.error.message,
              severity: monaco.MarkerSeverity.Error
            }]);
          }
        }
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timeoutId);
  }, [content, monaco]);

  const jumpToError = () => {
    if (monaco && mdxError) {
      const editors = monaco.editor.getEditors();
      if (editors.length > 0) {
        const editor = editors[0];
        editor.revealLineInCenter(mdxError.line);
        editor.setPosition({ lineNumber: mdxError.line, column: mdxError.column || 1 });
        editor.focus();
      }
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getDynamicPrompt());
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
          course_topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null
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
          topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null,
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
              className="p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-[#34302d] text-neutral-800 dark:text-neutral-200 outline-none font-medium flex-1 min-w-0 text-ellipsis"
            >
              <option value="">-- Select Course Outline --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {selectedCourseId && availableTopics.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Selected Topics:</p>
              
              {/* Selected Topics List */}
              {selectedTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTopics.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTopics(prev => prev.filter(x => x !== t))}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-red-500 transition-colors group"
                    >
                      {t}
                      <X size={14} className="opacity-70 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 italic mb-4">No topics selected yet.</p>
              )}

              {/* Topic Search */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-blue-400 dark:text-blue-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search available topics..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-[#34302d] text-neutral-800 dark:text-neutral-200 outline-none font-medium text-sm focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Filtered Available Topics */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {availableTopics
                  .filter(t => !selectedTopics.includes(t))
                  .filter(t => t.toLowerCase().includes(topicSearch.toLowerCase()))
                  .map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedTopics(prev => {
                          const next = [...prev, t];
                          if (next.length === 1 && !title) setTitle(t);
                          return next;
                        });
                        setTopicSearch(""); // Clear search after selection
                      }}
                      className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors bg-white dark:bg-[#34302d] text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {t}
                    </button>
                  ))}
                  {availableTopics.filter(t => !selectedTopics.includes(t) && t.toLowerCase().includes(topicSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-neutral-500 italic">No topics match your search.</p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
              MDX Content
            </label>
            <button 
              onClick={() => setUseBasicEditor(!useBasicEditor)}
              className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors bg-neutral-100 dark:bg-[#3a3532] px-3 py-1.5 rounded-lg"
            >
              {useBasicEditor ? <Monitor size={14} /> : <Smartphone size={14} />}
              {useBasicEditor ? "Switch to Advanced Editor" : "Switch to Basic Editor (Faster/Mobile)"}
            </button>
          </div>
          <div className="space-y-4">
            {mdxError && !useBasicEditor && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
                <div>
                  <p className="text-red-800 dark:text-red-400 font-bold text-sm">Syntax Error Detected</p>
                  <p className="text-red-600 dark:text-red-300 text-xs font-mono mt-1">{mdxError.message}</p>
                </div>
                <button 
                  onClick={jumpToError}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800/40 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold transition-colors"
                >
                  Go to Line {mdxError.line}
                </button>
              </div>
            )}
            
            {useBasicEditor ? (
              <div className="bg-white dark:bg-[#3a3532] p-2 rounded-3xl shadow-sm border-2 border-neutral-200 dark:border-neutral-700 h-[70vh] flex flex-col">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your generated MDX here... (Native Mobile Textbox)"
                  className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm text-neutral-800 dark:text-neutral-200"
                />
              </div>
            ) : (
              <div className="bg-[#1e1e1e] p-2 rounded-3xl shadow-sm border border-neutral-700 h-[70vh] overflow-hidden">
                <Editor
                  height="100%"
                  language="markdown"
                  theme="vs-dark"
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
