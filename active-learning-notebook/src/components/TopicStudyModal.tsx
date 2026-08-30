"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, CheckCircle2, Book, Trophy } from "lucide-react";
import Link from "next/link";

export default function TopicStudyModal({ topic, onClose, onComplete }: { topic: any, onClose: () => void, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [myNote, setMyNote] = useState<any>(null);

  useEffect(() => {
    fetchNotes();
  }, [topic.topicTitle]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: myNoteData } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("course_id", topic.courseId)
        .eq("course_topic", topic.topicTitle)
        .limit(1)
        .single();
      
      if (myNoteData) {
        setMyNote(myNoteData);
      }
    }

    // Simple text search on public notes
    const { data } = await supabase
      .from("notes")
      .select("id, title, user_id")
      .eq("is_public", true)
      .ilike("title", `%${topic.topicTitle.split(' ')[0]}%`)
      .limit(3);
    
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
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-xl shadow-2xl relative border-2 border-orange-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors">
          <X size={24} />
        </button>
        
        <div className="mb-6 pr-8">
          <span className="text-sm font-bold text-orange-500 uppercase tracking-wider block mb-2">{topic.courseName}</span>
          <h2 className="text-xl font-extrabold text-neutral-900 leading-tight">{topic.topicTitle}</h2>
          <p className="text-neutral-500 font-bold mt-2">Estimated study time: {topic.estimatedMinutes} minutes</p>
        </div>
        
        <div className="space-y-6">
          {myNote ? (
            <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
                <Book size={20} /> My Note for this Topic
              </h3>
              <Link href={`/notes/${myNote.id}`} className="block bg-white border-2 border-orange-300 p-4 rounded-xl hover:border-orange-500 hover:shadow-md transition-all">
                <h4 className="font-extrabold text-neutral-800 mb-1">{myNote.title}</h4>
                <div className="text-sm text-orange-600 font-bold">Open Note &rarr;</div>
              </Link>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
                <Book size={20} /> Suggested Community Notes
              </h3>
              
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-400" /></div>
              ) : suggestedNotes.length > 0 ? (
                <div className="space-y-3">
                  {suggestedNotes.map(n => (
                    <Link key={n.id} href={`/notes/${n.id}`} className="block bg-white border border-blue-200 p-4 rounded-xl hover:border-blue-400 transition-colors">
                      <h4 className="font-bold text-neutral-800 mb-1 line-clamp-1">{n.title}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                        <Trophy size={14} /> Highly Rated by Community
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 font-medium text-sm">No community notes found for this topic yet. Be the first to create one!</p>
              )}
              
              <Link 
                href={`/notes/new?courseId=${topic.courseId}&topic=${encodeURIComponent(topic.topicTitle)}`} 
                className="mt-4 block text-center bg-white text-blue-700 font-bold py-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Generate AI Notes for this Topic
              </Link>
            </div>
          )}

          <button 
            onClick={handleMarkComplete} 
            disabled={markingComplete}
            className="w-full modern-button bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 p-4 text-lg"
          >
            {markingComplete ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Mark Topic as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
