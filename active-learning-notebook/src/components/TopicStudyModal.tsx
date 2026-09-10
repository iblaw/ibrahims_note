"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, CheckCircle2, Book, Trophy, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import ModalPortal from "@/components/ModalPortal";

export default function TopicStudyModal({ topic, onClose, onComplete }: { topic: any, onClose: () => void, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [suggestedNotes, setSuggestedNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchNotes();
  }, [topic.topicTitle]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Use ilike because course_topic might be a JSON string like '["Topic 1", "Topic 2"]'
      const { data: myNotesData } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("course_id", topic.courseId)
        .ilike("course_topic", `%${topic.topicTitle}%`);
      
      if (myNotesData) {
        setMyNotes(myNotesData);
      }
    }

    // Simple text search on public notes
    const { data } = await supabase
      .from("notes")
      .select("id, title, user_id")
      .eq("is_public", true)
      .ilike("title", `%${topic.topicTitle.split(' ')[0]}%`)
      .limit(2);
    
    if (data) setSuggestedNotes(data);
    setLoading(false);
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    
    // 1. Fetch course
    const { data: course } = await supabase.from("courses").select("syllabus").eq("id", topic.courseId).single();
    if (!course) return;

    // 2. Update syllabus
    const newSyllabus = { ...course.syllabus };
    let found = false;
    for (const mod of newSyllabus.modules || []) {
      for (const t of mod.topics || []) {
        if (t.title === topic.topicTitle) {
          t.completed = true;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // 3. Save
    await supabase.from("courses").update({ syllabus: newSyllabus }).eq("id", topic.courseId);
    
    setMarkingComplete(false);
    onComplete();
  };

  return (
    <ModalPortal>
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[1.5rem] p-6 w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh]">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-neutral-100 text-neutral-500 rounded-full hover:bg-neutral-200 hover:text-neutral-900 transition-colors">
            <X size={20} />
          </button>
          
          <div className="mb-6 pr-10">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-1">{topic.courseName}</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 leading-tight">{topic.topicTitle}</h2>
            <p className="text-neutral-500 font-semibold text-sm mt-1">Estimated time: {topic.estimatedMinutes} minutes</p>
          </div>
          
          <div className="space-y-6">
            
            {/* Notes Section */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-6"><Loader2 className="animate-spin text-neutral-400" /></div>
              ) : (
                <>
                  {myNotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-3">
                        <Book size={16} className="text-orange-500" /> My Linked Notes
                      </h3>
                      <div className="space-y-2">
                        {myNotes.map(n => (
                          <Link key={n.id} href={`/notes/${n.id}`} className="flex items-center justify-between bg-orange-50/50 border border-orange-200 p-3.5 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors group">
                            <h4 className="font-bold text-neutral-800 line-clamp-1">{n.title}</h4>
                            <span className="text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">Open &rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestedNotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-3 mt-5">
                        <Trophy size={16} className="text-blue-500" /> Community Notes
                      </h3>
                      <div className="space-y-2">
                        {suggestedNotes.map(n => (
                          <Link key={n.id} href={`/notes/${n.id}`} className="block bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                            <h4 className="font-bold text-neutral-800 mb-0.5 line-clamp-1">{n.title}</h4>
                            <span className="text-xs font-semibold text-blue-600">Highly Rated</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link 
                      href={`/notes/new?courseId=${topic.courseId}&topic=${encodeURIComponent(topic.topicTitle)}`} 
                      className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-center"
                    >
                      <FileText size={20} className="text-neutral-600" />
                      <span className="text-xs font-bold text-neutral-700">Write Note</span>
                    </Link>
                    <Link 
                      href={`/notes/new?courseId=${topic.courseId}&topic=${encodeURIComponent(topic.topicTitle)}&generate=true`} 
                      className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
                    >
                      <Sparkles size={20} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700">AI Generate</span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button 
                onClick={handleMarkComplete} 
                disabled={markingComplete}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 p-4 rounded-xl transition-all disabled:opacity-70 shadow-md"
              >
                {markingComplete ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                Mark Topic as Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
