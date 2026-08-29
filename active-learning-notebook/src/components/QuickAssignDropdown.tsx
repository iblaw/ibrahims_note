"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link as LinkIcon, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickAssignDropdown({ noteId, currentTopic }: { noteId: string, currentTopic: string | null }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && courses.length === 0) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    setLoading(true);
    // Assuming auth is coming soon, this should ideally filter by user_id
    const { data } = await supabase.from("courses").select("*").order("title");
    if (data) setCourses(data);
    setLoading(false);
  };

  const assignTopic = async (topicTitle: string) => {
    await supabase.from("notes").update({ course_topic: topicTitle }).eq("id", noteId);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
      >
        <LinkIcon size={16} />
        {currentTopic ? `Linked: ${currentTopic}` : "Assign to Course Topic"}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-neutral-400" /></div>
          ) : courses.length === 0 ? (
            <div className="p-4 text-center text-sm font-bold text-neutral-500">No courses available</div>
          ) : (
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="space-y-1">
                  <div className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider px-2 pt-2">{course.title}</div>
                  {course.syllabus?.modules?.map((m: any, mIdx: number) => (
                    m.topics?.map((t: any, tIdx: number) => (
                      <button
                        key={`${mIdx}-${tIdx}`}
                        onClick={() => assignTopic(t.title)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold hover:bg-neutral-100 transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate pr-4 text-neutral-700 group-hover:text-neutral-900">{t.title}</span>
                        {currentTopic === t.title && <Check size={14} className="text-blue-600 shrink-0" />}
                      </button>
                    ))
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
