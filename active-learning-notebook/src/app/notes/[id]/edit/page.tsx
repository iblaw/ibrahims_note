"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function EditNote({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const noteId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Linking state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [noteId]);

  const fetchData = async () => {
    // Fetch the note
    const { data: note } = await supabase.from("notes").select("*").eq("id", noteId).single();
    // Fetch user's courses
    const { data: userCourses } = await supabase.from("courses").select("*").order("created_at", { ascending: false });

    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedCourseId(note.course_id || "");
      setSelectedTopic(note.course_topic || "");
    }

    if (userCourses) {
      setCourses(userCourses);
    }
    
    setLoading(false);
  };

  // Update available topics when selected course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setAvailableTopics([]);
      // Only clear topic if it's a user interaction changing the course, 
      // but simpler to just let it mismatch and let the user select a new one.
      return;
    }
    
    const course = courses.find(c => c.id === selectedCourseId);
    if (course && course.syllabus && course.syllabus.modules) {
      const topics: string[] = [];
      course.syllabus.modules.forEach((m: any) => {
        m.topics?.forEach((t: any) => {
          topics.push(t.title);
        });
      });
      setAvailableTopics(topics);
    } else {
      setAvailableTopics([]);
    }
  }, [selectedCourseId, courses]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    
    await supabase.from("notes").update({
      title,
      content: content,
      course_id: selectedCourseId || null,
      course_topic: selectedTopic || null
    }).eq("id", noteId);
    
    router.push(`/notes/${noteId}`);
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

      <div className="bg-white dark:bg-[#34302d] p-6 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-700 h-[60vh]">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent outline-none resize-none text-neutral-700 dark:text-neutral-300 font-mono text-sm leading-relaxed"
          placeholder="Start writing your MDX note..."
        />
      </div>
    </div>
  );
}
