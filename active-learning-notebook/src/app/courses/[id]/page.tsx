"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2, Circle, Edit2, Save, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import PublishCourseButton from "@/components/PublishCourseButton";

export default function CourseView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"syllabus" | "timetable">("syllabus");
  
  // Edit State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroup, setEditGroup] = useState("");

  const [linkedNotes, setLinkedNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchCourseAndNotes();
  }, [courseId]);

  const fetchCourseAndNotes = async () => {
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();
    
    if (courseData) {
      setCourse(courseData);
      setEditTitle(courseData.title);
      setEditGroup(courseData.group_name || "Unassigned");
    }

    const { data: notesData } = await supabase
      .from("notes")
      .select("id, title, course_topic")
      .eq("course_id", courseId);

    if (notesData) {
      setLinkedNotes(notesData);
    }
    
    setLoading(false);
  };

  const saveTitle = async () => {
    if (!course || !editTitle.trim()) return;
    await supabase.from("courses").update({ title: editTitle }).eq("id", course.id);
    setCourse({ ...course, title: editTitle });
    setIsEditingTitle(false);
  };

  const saveGroup = async () => {
    if (!course || !editGroup.trim()) return;
    await supabase.from("courses").update({ group_name: editGroup }).eq("id", course.id);
    setCourse({ ...course, group_name: editGroup });
    setIsEditingGroup(false);
  };

  const toggleTopic = async (moduleIndex: number, topicIndex: number) => {
    if (!course) return;

    // Create deep copy of syllabus
    const newSyllabus = JSON.parse(JSON.stringify(course.syllabus));
    const topic = newSyllabus.modules[moduleIndex].topics[topicIndex];
    topic.completed = !topic.completed;

    // Optimistic update
    setCourse({ ...course, syllabus: newSyllabus });

    // Save to DB
    await supabase
      .from("courses")
      .update({ syllabus: newSyllabus })
      .eq("id", course.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-neutral-400" size={48} />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-24">Course not found.</div>;
  }

  let totalTopics = 0;
  let completedTopics = 0;
  course.syllabus.modules?.forEach((m: any) => {
    m.topics?.forEach((t: any) => {
      totalTopics++;
      if (t.completed) completedTopics++;
    });
  });
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex justify-between items-center mb-8">
        <Link href="/courses" className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Courses
        </Link>
        <PublishCourseButton courseId={course.id} isAlreadyPublic={course.is_public || false} />
      </div>

      <div className="flex items-start justify-between">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="text-neutral-500 shrink-0" size={36} />
            <div className="w-full">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 w-full max-w-lg mb-1">
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full p-2 text-xl font-extrabold rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-transparent outline-none"
                    autoFocus
                  />
                  <button onClick={saveTitle} className="p-2 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">
                    <Save size={20} />
                  </button>
                </div>
              ) : (
                <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3 group mb-1">
                  {course.title}
                  <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-all">
                    <Edit2 size={20} />
                  </button>
                </h1>
              )}

              {/* Group Name Editing */}
              {isEditingGroup ? (
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <span className="font-bold text-neutral-500">Parent Course:</span>
                  <input 
                    type="text" 
                    value={editGroup}
                    onChange={e => setEditGroup(e.target.value)}
                    placeholder="e.g. Physics 101"
                    className="w-full p-1 text-sm font-bold rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-transparent outline-none"
                    autoFocus
                  />
                  <button onClick={saveGroup} className="p-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">
                    <Save size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-500 group w-fit">
                  <span>Parent Course: {course.group_name || "Unassigned"}</span>
                  <button onClick={() => setIsEditingGroup(true)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-all">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium ml-12">
            Target Completion: {new Date(course.target_completion_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4 border-b-2 border-neutral-200 dark:border-neutral-800 pb-4 mb-8">
        <button 
          onClick={() => setView("syllabus")}
          className={`font-bold pb-2 -mb-[18px] transition-colors ${view === "syllabus" ? "text-neutral-900 dark:text-white border-b-4 border-neutral-900 dark:border-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
        >
          Syllabus Modules
        </button>
        <button 
          onClick={() => setView("timetable")}
          className={`font-bold pb-2 -mb-[18px] transition-colors ${view === "timetable" ? "text-neutral-900 dark:text-white border-b-4 border-neutral-900 dark:border-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
        >
          Weekly Timetable
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-neutral-800 dark:text-neutral-100">Overall Progress</span>
        <span>{Math.round(progress)}% ({completedTopics}/{totalTopics})</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-4 rounded-full overflow-hidden mb-8">
        <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {view === "syllabus" ? (
        <div className="space-y-8">
          {course.syllabus.modules?.map((module: any, mIndex: number) => (
          <div key={mIndex} className="modern-card bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">
              {module.moduleTitle}
            </h2>
            
            <div className="space-y-3">
              {module.topics?.map((topic: any, tIndex: number) => {
                const linkedNote = linkedNotes.find(n => n.course_topic === topic.title);
                
                return (
                  <div key={tIndex} className="flex items-start gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors group">
                    <button 
                      onClick={() => toggleTopic(mIndex, tIndex)}
                      className={`mt-1 shrink-0 ${topic.completed ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400'}`}
                    >
                      {topic.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div className="flex-grow">
                      <h4 className={`text-lg font-bold ${topic.completed ? 'text-neutral-500 line-through' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {topic.title}
                      </h4>
                      {topic.description && (
                        <p className="text-neutral-500 text-sm font-medium mt-1">{topic.description}</p>
                      )}
                      {linkedNote && (
                        <Link href={`/notes/${linkedNote.id}`} className="inline-flex items-center gap-1 mt-2 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                          <LinkIcon size={12} /> View Note: {linkedNote.title}
                        </Link>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                        {topic.estimatedMinutes} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="space-y-8">
          {(() => {
            // Timetable generation logic
            const maxMinsPerWeek = (course.weekly_hours_commitment || 5) * 60;
            const weeks: any[][] = [];
            let currentWeek: any[] = [];
            let currentWeekMins = 0;

            course.syllabus.modules?.forEach((module: any, mIndex: number) => {
              module.topics?.forEach((topic: any, tIndex: number) => {
                const mins = topic.estimatedMinutes || 30;
                
                // If adding this topic pushes us over the limit (and we already have topics in the week), push week
                if (currentWeekMins + mins > maxMinsPerWeek && currentWeek.length > 0) {
                  weeks.push([...currentWeek]);
                  currentWeek = [];
                  currentWeekMins = 0;
                }
                
                currentWeek.push({ ...topic, moduleTitle: module.moduleTitle, mIndex, tIndex });
                currentWeekMins += mins;
              });
            });
            if (currentWeek.length > 0) weeks.push(currentWeek);

            return weeks.map((weekTopics, wIndex) => {
              const weekMins = weekTopics.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
              const weekHours = Math.round((weekMins / 60) * 10) / 10;
              const allCompleted = weekTopics.every(t => t.completed);

              return (
                <div key={wIndex} className={`modern-card p-6 border ${allCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-white dark:bg-[#34302d] border-neutral-200 dark:border-neutral-700'}`}>
                  <div className="flex justify-between items-center border-b-2 border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                      Week {wIndex + 1}
                    </h2>
                    <span className="text-sm font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                      {weekHours} hours estimated
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {weekTopics.map((topic: any, i: number) => {
                      const linkedNote = linkedNotes.find(n => n.course_topic === topic.title);
                      
                      return (
                        <div key={i} className="flex items-start gap-4 group">
                          <button 
                            onClick={() => toggleTopic(topic.mIndex, topic.tIndex)}
                            className={`mt-1 shrink-0 ${topic.completed ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400'}`}
                          >
                            {topic.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>
                          <div className="flex-grow">
                            <h4 className={`text-lg font-bold ${topic.completed ? 'text-neutral-500 line-through' : 'text-neutral-800 dark:text-neutral-200'}`}>
                              {topic.title}
                            </h4>
                            <p className="text-xs font-bold text-blue-500 dark:text-blue-400 mt-1 uppercase tracking-wider">
                              From: {topic.moduleTitle}
                            </p>
                            {linkedNote && (
                              <Link href={`/notes/${linkedNote.id}`} className="inline-flex items-center gap-1 mt-2 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                <LinkIcon size={12} /> View Note
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
