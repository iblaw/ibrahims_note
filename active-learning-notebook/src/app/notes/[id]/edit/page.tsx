"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Editor, { useMonaco } from "@monaco-editor/react";
import { validateMdx } from "@/app/actions/validateMdx";
import { ArrowLeft, Save, Loader2, Link as LinkIcon, Smartphone, Monitor } from "lucide-react";
import Link from "next/link";

export default function EditNote({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const noteId = resolvedParams.id;
  const router = useRouter();
  const monaco = useMonaco();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Linking state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Validation State
  const [mdxError, setMdxError] = useState<{message: string, line: number, column: number} | null>(null);

  // Mobile Friendly Editor Toggle
  const [useBasicEditor, setUseBasicEditor] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUseBasicEditor(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [noteId]);

  const fetchData = async () => {
    const { data: note } = await supabase.from("notes").select("*").eq("id", noteId).single();
    const { data: userCourses } = await supabase.from("courses").select("*").order("created_at", { ascending: false });

    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedCourseId(note.course_id || "");
      if (note.course_topic) {
        if (note.course_topic.startsWith('[')) {
          try { setSelectedTopics(JSON.parse(note.course_topic)); } catch { setSelectedTopics([note.course_topic]); }
        } else {
          setSelectedTopics([note.course_topic]);
        }
      }
    }

    if (userCourses) {
      setCourses(userCourses);
    }
    
    setLoading(false);
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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    
    await supabase.from("notes").update({
      title,
      content: content,
      course_id: selectedCourseId || null,
      course_topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null
    }).eq("id", noteId);
    
    router.push(`/notes/${noteId}`);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-neutral-400" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      <Link href={`/notes/${noteId}`} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold flex items-center gap-2 mb-8">
        <ArrowLeft size={20} /> Back to Note
      </Link>

      <div className="flex sm:flex-row flex-col justify-between items-start gap-4">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-xl font-extrabold bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-full"
        />
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
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
        </div>

        {selectedCourseId && availableTopics.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Select Topics to Link:</p>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map(t => {
                const isSelected = selectedTopics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTopics(prev => prev.filter(x => x !== t));
                      } else {
                        setSelectedTopics(prev => {
                          const next = [...prev, t];
                          if (next.length === 1) setTitle(t);
                          return next;
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white dark:bg-[#34302d] text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
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
  );
}
