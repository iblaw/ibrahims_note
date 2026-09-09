"use client";

import { useState, useEffect, useRef } from "react";
import MDXViewer from "./mdx/MDXViewer";
import { CheckCircle, Loader2, List, Play, PenTool, Menu, X, BrainCircuit, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { createPortal } from "react-dom";
import ModalPortal from "@/components/ModalPortal";

export default function NoteReaderContainer({ 
  mdxSource, 
  noteId, 
  courseId, 
  topicTitle, 
  isOwner,
  hideQuizzes = false
}: { 
  mdxSource: any, 
  noteId?: string, 
  courseId?: string, 
  topicTitle?: string, 
  isOwner?: boolean,
  hideQuizzes?: boolean
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const [font, setFont] = useState<"fredoka" | "sans" | "serif" | "mono">("sans");
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (!contentRef.current) return;
      const elements = Array.from(contentRef.current.querySelectorAll("h1, h2, h3"));
      if (elements.length === 0) return;

      const newHeadings = elements.map((el, i) => {
        const id = el.id || `heading-${i}-${el.textContent?.trim().replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
        el.id = id;
        return {
          id,
          text: el.textContent || "",
          level: Number(el.tagName[1])
        };
      });
      setHeadings(newHeadings);

      const handleScroll = () => {
        let currentActiveId = elements[0].id;
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          // 150px accounts for top nav / padding
          if (rect.top <= 150) {
            currentActiveId = el.id;
          }
        }
        setActiveId((prev) => (prev !== currentActiveId ? currentActiveId : prev));
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Check on mount

      return () => window.removeEventListener("scroll", handleScroll);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [mdxSource]);

  const fontClasses = {
    fredoka: "font-sans",
    sans: "font-[system-ui,sans-serif]",
    serif: "font-serif",
    mono: "font-mono"
  };

  const handleMarkComplete = async () => {
    if (!courseId || !topicTitle) return;
    setMarkingComplete(true);
    try {
      const { data: course } = await supabase.from("courses").select("syllabus").eq("id", courseId).single();
      if (course) {
        const newSyllabus = { ...course.syllabus };
        let found = false;
        for (const mod of newSyllabus.modules || []) {
          for (const t of mod.topics || []) {
            if (t.title === topicTitle) {
              t.completed = true;
              found = true;
              break;
            }
          }
          if (found) break;
        }
        await supabase.from("courses").update({ syllabus: newSyllabus }).eq("id", courseId);
        setIsCompleted(true);
      }
    } catch (e) {
      console.error(e);
    }
    setMarkingComplete(false);
  };

  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeId && tocRef.current) {
      const activeEl = tocRef.current.querySelector(`a[href="#${activeId}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeId]);

  const trackerContentNode = (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)]">
      <h4 className="font-extrabold text-neutral-800 dark:text-neutral-200 flex items-center justify-between mb-4 shrink-0">
        <span className="flex items-center gap-2"><List size={18} /> Table of Contents</span>
        {mobileMenuOpen && (
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 text-neutral-500">
            <X size={20} />
          </button>
        )}
      </h4>
      <div ref={tocRef} className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {headings.map(h => (
          <a 
            key={h.id} 
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className={`block text-sm transition-all duration-200 ${
              activeId === h.id 
                ? "text-orange-600 dark:text-orange-400 font-bold translate-x-1" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium"
            }`}
            style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}
          >
            {h.text}
          </a>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 space-y-3 shrink-0">
        {courseId && topicTitle && isOwner ? (
          <button
            onClick={handleMarkComplete}
            disabled={markingComplete || isCompleted}
            className={`w-full flex items-center justify-center gap-2 p-3 font-bold rounded-xl transition-colors border ${
              isCompleted 
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800" 
                : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-orange-300 dark:bg-[#2a2624] dark:border-neutral-600"
            }`}
          >
            {markingComplete ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} className={isCompleted ? "text-green-600" : "text-neutral-400"} />}
            {isCompleted ? "Completed!" : "Mark Completed"}
          </button>
        ) : !isOwner ? (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 p-3 font-bold rounded-xl transition-colors border bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:border-orange-800/50"
          >
            <CheckCircle size={18} />
            Sign up to track progress
          </Link>
        ) : null}
        
        {noteId && (
          <>
            <Link 
              href={`/notes/${noteId}/quiz`}
              className="w-full flex items-center justify-center gap-2 p-3 font-bold rounded-xl bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
            >
              <BrainCircuit size={18} /> Practice Quizzes
            </Link>
            <Link 
              href={`/notes/${noteId}/flashcards`}
              className="w-full flex items-center justify-center gap-2 p-3 font-bold rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <Sparkles size={18} /> Spaced Repetition
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {mounted && typeof document !== "undefined" ? createPortal(
        <>
          {/* Mobile Sticky Action Button to open TOC */}
          <div className="lg:hidden fixed bottom-6 right-6 z-[100] pointer-events-auto">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="modern-button bg-neutral-900 text-white rounded-full p-4 shadow-2xl flex items-center gap-2"
            >
              <Menu size={24} /> 
              <span className="font-bold">Tracker</span>
            </button>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[110] lg:hidden flex justify-end bg-neutral-900/20 backdrop-blur-sm pointer-events-auto">
              <div className="w-80 h-full bg-white dark:bg-[#34302d] shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                {trackerContentNode}
              </div>
            </div>
          )}
        </>,
        document.body
      ) : null}

      {/* Desktop Sidebar TOC */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-neutral-50 dark:bg-[#34302d] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700">
          {trackerContentNode}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#34302d] p-1 rounded-xl">
            <button 
              onClick={() => setFont("sans")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${font === "sans" ? "bg-white dark:bg-[#4a4542] text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              Clean
            </button>
            <button 
              onClick={() => setFont("serif")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${font === "serif" ? "bg-white dark:bg-[#4a4542] text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              Classic
            </button>
          </div>
        </div>
        <div ref={contentRef} className={`prose prose-lg dark:prose-invert max-w-[65ch] mx-auto prose-headings:font-extrabold prose-a:text-blue-600 dark:prose-a:text-blue-400 ${fontClasses[font]}`}>
          <MDXViewer mdxSource={mdxSource} hideQuizzes={hideQuizzes} />
        </div>
      </div>
    </div>
  );
}
