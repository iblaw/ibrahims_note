"use client";

import { useState, useEffect, useRef } from "react";
import MDXViewer from "./mdx/MDXViewer";
import { CheckCircle, Loader2, List } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NoteReaderContainer({ 
  mdxSource, 
  noteId, 
  courseId, 
  topicTitle, 
  isOwner 
}: { 
  mdxSource: any, 
  noteId?: string, 
  courseId?: string, 
  topicTitle?: string, 
  isOwner?: boolean 
}) {
  const [font, setFont] = useState<"fredoka" | "sans" | "serif" | "mono">("sans");
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    const elements = Array.from(contentRef.current.querySelectorAll("h1, h2, h3"));
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Sidebar TOC */}
      {headings.length > 0 && (
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-4 bg-neutral-50 dark:bg-[#34302d] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-extrabold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 mb-4">
              <List size={18} /> Table of Contents
            </h4>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {headings.map(h => (
                <a 
                  key={h.id} 
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block text-sm transition-all duration-200 ${
                    activeId === h.id 
                      ? "text-orange-600 dark:text-orange-400 font-bold translate-x-1" 
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium"
                  }`}
                  style={{ paddingLeft: \`\${(h.level - 1) * 0.75}rem\` }}
                >
                  {h.text}
                </a>
              ))}
            </div>
            
            {/* Mark as Completed Button */}
            {isOwner && courseId && topicTitle && (
              <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete || isCompleted}
                  className={\`w-full flex items-center justify-center gap-2 p-3 font-bold rounded-xl transition-colors border \${
                    isCompleted 
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800" 
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-orange-300 dark:bg-[#2a2624] dark:border-neutral-600"
                  }\`}
                >
                  {markingComplete ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} className={isCompleted ? "text-green-600" : "text-neutral-400"} />}
                  {isCompleted ? "Completed!" : "Mark Completed"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#34302d] p-1 rounded-xl">
            <button 
              onClick={() => setFont("sans")}
              className={\`px-3 py-1.5 rounded-lg text-sm font-bold transition-all \${font === "sans" ? "bg-white dark:bg-[#4a4542] text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}\`}
            >
              Clean
            </button>
            <button 
              onClick={() => setFont("serif")}
              className={\`px-3 py-1.5 rounded-lg text-sm font-bold transition-all \${font === "serif" ? "bg-white dark:bg-[#4a4542] text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}\`}
            >
              Classic
            </button>
          </div>
        </div>
        <div ref={contentRef} className={\`prose prose-lg dark:prose-invert max-w-[65ch] mx-auto prose-headings:font-extrabold prose-a:text-blue-600 dark:prose-a:text-blue-400 \${fontClasses[font]}\`}>
          <MDXViewer mdxSource={mdxSource} />
        </div>
      </div>
    </div>
  );
}
