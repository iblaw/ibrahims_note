"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Book, Calendar, Clock, Loader2, Trophy, BrainCircuit, Flame, GraduationCap, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { generateMasterTimetable } from "@/lib/timetable";
import TopicStudyModal from "@/components/TopicStudyModal";
import EditScheduleModal from "@/components/EditScheduleModal";
import { DashboardSkeleton } from "@/components/Skeleton";
import DailyBriefing from "@/components/DailyBriefing";

export default function Dashboard() {
  const [stats, setStats] = useState({
    cardsDue: 0,
    cardsMastered: 0,
    totalNotes: 0,
    totalCards: 0
  });
  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [todayTopics, setTodayTopics] = useState<any[]>([]);
  const [suggestedNote, setSuggestedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [burnoutWarning, setBurnoutWarning] = useState<{ active: boolean; required: number; allowed: number, dismissed?: boolean, suggestedDate?: string, busyness?: string } | null>(null);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [hasSchedules, setHasSchedules] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
    
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: notesData } = await supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const { data: cardsData } = await supabase.from("flashcards").select("*").eq("user_id", user.id);
    const { data: coursesData } = await supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    if (notesData && cardsData) {
      const now = new Date().toISOString();
      setStats({
        totalNotes: notesData.length,
        totalCards: cardsData.length,
        cardsDue: cardsData.filter(c => c.next_review_date <= now).length,
        cardsMastered: cardsData.filter(c => c.ease_factor >= 2.5).length
      });
      setRecentNotes(notesData.slice(0, 3));
    }

    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData);
      
      const { data: schedulesData } = await supabase.from("schedules").select("*").eq("user_id", user.id);
      if (schedulesData) setSchedules(schedulesData);
      setHasSchedules((schedulesData?.length ?? 0) > 0);
      
      let firstUncompletedTopic: any = null;
      let allTodayTopics: any[] = [];

      // NEW BURNOUT CALCULATION
      let totalRequiredMinutes = 0;
      let earliestTargetDate = new Date(8640000000000000); // Max date
      
      (schedulesData || []).forEach(schedule => {
          const scheduleCourses = coursesData.filter((c: any) => schedule.course_ids.includes(c.id));
          scheduleCourses.forEach((course: any) => {
            course.syllabus?.modules?.forEach((m: any) => {
              m.topics?.forEach((t: any) => {
                if (!t.completed) {
                  totalRequiredMinutes += t.estimatedMinutes || 60;
                  if (!firstUncompletedTopic) firstUncompletedTopic = t.title;
                }
              });
            });
          });
          const tDate = new Date(schedule.target_date);
          if (tDate < earliestTargetDate) earliestTargetDate = tDate;

          // Generate timetable for today
          const timetable = generateMasterTimetable(scheduleCourses, profileData || undefined);
          if (timetable.length > 0) {
            allTodayTopics = [...allTodayTopics, ...timetable[0]];
          }
      });
      
      setTodayTopics(allTodayTopics);

      if (totalRequiredMinutes > 0 && earliestTargetDate.getTime() !== 8640000000000000) {
        const now = new Date();
        const daysRemaining = Math.max(1, Math.ceil((earliestTargetDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
        
        // Calculate active days
        let activeDays = 0;
        const studyDays = profileData?.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        for (let i = 0; i < daysRemaining; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() + i);
          if (studyDays.includes(dayNames[d.getDay()])) {
            activeDays++;
          }
        }
        
        // If they skipped every single day before the deadline, activeDays is 0. Give them at least 1 to avoid infinity.
        activeDays = Math.max(1, activeDays);
        
        const dailyRequiredHours = (totalRequiredMinutes / 60) / activeDays;
        const dailyGoalHours = profileData?.daily_study_goal_hours || 2;
        
        if (dailyRequiredHours > dailyGoalHours) {
          const dismissedStr = localStorage.getItem('dismissedBurnoutDailyHours');
          const isHidden = dismissedStr && dailyRequiredHours <= parseFloat(dismissedStr) + 0.1;
          
          if (!isHidden) {
            // Calculate suggested new date
            const suggestedActiveDaysNeeded = Math.ceil((totalRequiredMinutes / 60) / dailyGoalHours);
            // Approximate calendar days needed by assuming the same ratio of active vs skipped days
            const ratio = studyDays.length / 7;
            const calendarDaysNeeded = Math.ceil(suggestedActiveDaysNeeded / ratio);
            const suggestedDate = new Date();
            suggestedDate.setDate(suggestedDate.getDate() + calendarDaysNeeded);
            
            setBurnoutWarning({
              active: true,
              required: Math.round(dailyRequiredHours * 10) / 10,
              allowed: dailyGoalHours,
              suggestedDate: suggestedDate.toISOString().split('T')[0],
              busyness: profileData?.busyness || "Average"
            });
          }
        }
      }

      // Fetch suggestion based on first uncompleted topic (if they have no schedules yet but have courses)
      if (firstUncompletedTopic && (!schedulesData || schedulesData.length === 0)) {
        // Extremely simple keyword match: we fetch public notes, sort by upvotes, and just find one that includes some words
        const { data: publicNotes } = await supabase
          .from("notes")
          .select("id, title, upvotes")
          .eq("is_public", true)
          .order("upvotes", { ascending: false })
          .limit(10);
        
        if (publicNotes && publicNotes.length > 0) {
          setSuggestedNote(publicNotes[0]);
        }
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }
  const hour = new Date().getHours();
  let greeting = "Good evening!";
  if (hour >= 5 && hour < 12) greeting = "Good morning!";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon!";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* AI Daily Briefing Header */}
      {!loading && (
        <DailyBriefing 
          stats={stats} 
          todayTopics={todayTopics} 
          name={userName} 
          coursesCount={courses.length} 
        />
      )}

      {/* Burnout Warning */}
      {burnoutWarning?.active && !burnoutWarning.dismissed && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/50 p-6 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <AlertTriangle className="text-red-500 shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-1">Burnout Warning 🚨</h3>
                <p className="text-red-700 dark:text-red-400 font-medium">
                  Your daily goal is <strong>{burnoutWarning.allowed} hours</strong> on active study days, but to hit your deadlines you need to study <strong>{burnoutWarning.required} hours/day</strong>. Consider pushing your deadlines back or increasing your weekly commitment!
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {schedules.length > 0 && (
                    <button
                      onClick={() => {
                        const mainSchedule = schedules[0];
                        setEditingSchedule({ ...mainSchedule, weekly_hours: burnoutWarning.required });
                      }}
                      className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                    >
                      Update commitment to {burnoutWarning.required} hours
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setBurnoutWarning({ ...burnoutWarning, dismissed: true });
                      localStorage.setItem('dismissedBurnoutDailyHours', burnoutWarning.required.toString());
                    }}
                    className="text-sm font-bold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline underline-offset-2"
                  >
                    I understand, don't warn me again
                  </button>
                </div>
              </div>
          </div>
          <button 
            onClick={() => setBurnoutWarning({ ...burnoutWarning, dismissed: true })}
            className="text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="modern-card bg-neutral-100 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 mb-4 font-bold">
            <BrainCircuit size={20} /> Flashcards Due
          </div>
          <div className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {stats.cardsDue}
          </div>
        </div>
        {/* ... (other stats removed for brevity, keeping only essential ones) */}
        <div className="modern-card bg-neutral-100 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 mb-4 font-bold">
            <GraduationCap size={20} /> Active Courses
          </div>
          <div className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {courses.length}
          </div>
        </div>
        <div className="modern-card bg-neutral-100 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 mb-4 font-bold">
            <Book size={20} /> Total Notes
          </div>
          <div className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {stats.totalNotes}
          </div>
        </div>
        <div className="modern-card bg-neutral-100 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 mb-4 font-bold">
            <Trophy size={20} /> Mastered
          </div>
          <div className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {stats.cardsMastered}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Courses Manager */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/courses" className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 hover:text-neutral-600 transition-colors">
                <Calendar size={24} /> Study Planner
              </Link>
              <div className="flex gap-2">
                <Link href="/courses" className="text-sm font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">
                  View All Outlines
                </Link>
                <Link href="/courses/new" className="text-sm font-bold bg-neutral-800 text-white px-4 py-2 rounded-full hover:bg-neutral-700 transition-colors hidden sm:block">
                  + Add Course Outline
                </Link>
              </div>
            </div>
            
            <div className="space-y-6">
              {todayTopics.length > 0 && (
                <div className="modern-card bg-white border border-neutral-200/60 shadow-lg shadow-neutral-200/50 p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-xl sm:text-xl font-extrabold flex items-center gap-2 text-neutral-800">
                      <Clock size={24} className="text-orange-500" /> Today's Study Session
                    </h3>
                    <span className="text-xs sm:text-sm font-bold bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full shadow-sm">
                      ~{Math.round((todayTopics.reduce((acc, t) => acc + t.estimatedMinutes, 0) / 60) * 10) / 10} hrs total
                    </span>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    {todayTopics.map((t, tIndex) => (
                      <button 
                        key={tIndex} 
                        onClick={() => setSelectedTopic(t)}
                        className="w-full text-left flex gap-4 items-center p-4 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200/60 transition-all duration-300 group shadow-sm hover:shadow-md bg-white/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                          <span className="font-bold text-sm">{tIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-800 text-base sm:text-lg group-hover:text-orange-600 transition-colors">{t.topicTitle}</h4>
                          <div className="flex flex-wrap gap-2 text-xs font-bold mt-1">
                            <span className="text-neutral-500">{t.courseName}</span>
                            <span className="text-neutral-300 hidden sm:inline">•</span>
                            <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">{t.estimatedMinutes} mins</span>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 hidden sm:block">
                          <ArrowRight size={20} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {courses.length > 0 && !hasSchedules && (
                <div className="modern-card bg-orange-50 border border-orange-200 p-8 text-center">
                  <h3 className="text-xl font-bold text-orange-800 mb-2">Create a Master Timetable!</h3>
                  <p className="text-orange-700 mb-6 font-medium max-w-lg mx-auto">
                    You have course outlines ready, but you haven't organized them into a study schedule yet. Let's build your master timetable so you know exactly what to study each day.
                  </p>
                  <Link 
                    href="/courses" 
                    className="inline-block modern-button bg-orange-500 text-white shadow-orange-500/30 px-8"
                  >
                    Go to Study Planner
                  </Link>
                </div>
              )}

              <h3 className="text-lg font-bold text-neutral-800">Your Course Outlines</h3>
              
              {courses.length === 0 ? (
                <div className="text-center py-12 bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300">
                  <p className="text-neutral-500 font-medium mb-4">No course outlines added yet.</p>
                  <Link href="/courses/new" className="font-bold text-neutral-800 hover:underline">
                    Generate your first study plan &rarr;
                  </Link>
                </div>
              ) : (
                courses.map(course => {
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
                    <Link 
                      key={course.id} 
                      href={`/courses/${course.id}`}
                      className="block modern-card bg-white border border-neutral-200 p-6 hover:border-neutral-400 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 mb-4">
                        <span>{completedTopics} / {totalTopics} Topics</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-800 h-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="modern-card bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-4 drop-shadow-md">Ready to learn?</h2>
            <p className="font-medium opacity-95 mb-8 drop-shadow-sm">
              {stats.cardsDue > 0 
                ? `You have ${stats.cardsDue} flashcards due for review right now. Knock them out!` 
                : "You are all caught up on your reviews! Time to learn something new."}
            </p>
            {stats.cardsDue > 0 ? (
              <Link href="/review" className="modern-button w-full bg-white text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
                Start Review Session <ArrowRight size={18} />
              </Link>
            ) : (
              <Link href="/notes/new" className="modern-button w-full bg-white text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
                Create New Note <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {/* AI Suggestions Engine */}
          {suggestedNote && (
            <div className="modern-card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-6">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-4">
                <Book size={18} /> Suggested for Today
              </div>
              <p className="text-sm font-medium text-neutral-600 mb-2">
                You might find this community note helpful for your studies:
              </p>
              <Link 
                href={`/notes/${suggestedNote.id}`}
                className="block bg-white dark:bg-[#34302d] border border-blue-200 dark:border-blue-800 p-4 rounded-xl hover:border-blue-400 transition-colors"
              >
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-2 line-clamp-2">{suggestedNote.title}</h4>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400">
                  <Trophy size={14} /> Highly Rated by Community
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          courses={courses}
          onClose={() => setEditingSchedule(null)}
          onUpdated={() => {
            setEditingSchedule(null);
            window.location.reload();
          }}
        />
      )}

      {selectedTopic && (
        <TopicStudyModal 
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onComplete={() => {
            setSelectedTopic(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
