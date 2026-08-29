"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GraduationCap, Trash2, Folder, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import GroupSection from "@/components/GroupSection";
import CreateScheduleModal from "@/components/CreateScheduleModal";
import EditScheduleModal from "@/components/EditScheduleModal";
import { Edit2 } from "lucide-react";

export default function CoursesManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"outlines" | "timetables">("outlines");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coursesData } = await supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const { data: schedulesData } = await supabase.from("schedules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    
    if (coursesData) setCourses(coursesData);
    if (schedulesData) setSchedules(schedulesData);
    setLoading(false);
  };

  const deleteCourse = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this course outline? This cannot be undone.")) return;
    
    await supabase.from("courses").delete().eq("id", id);
    setCourses(courses.filter(c => c.id !== id));
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this master timetable?")) return;
    await supabase.from("schedules").delete().eq("id", id);
    setSchedules(schedules.filter(s => s.id !== id));
  };

  // Group courses by group_name for the outlines view
  const groupedCourses = courses.reduce((acc, course) => {
    const group = course.group_name || "Unassigned Outlines";
    if (!acc[group]) acc[group] = [];
    acc[group].push(course);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-neutral-800 flex items-center gap-3 mb-2">
              <GraduationCap className="text-neutral-500" size={36} />
              Study Planner
            </h1>
            <p className="text-lg text-neutral-600 font-medium">
              Manage your course outlines and master timetables.
            </p>
          </div>
          
          <div className="flex gap-3">
            {activeTab === "outlines" ? (
              <Link 
                href="/courses/new" 
                className="bubbly-button bg-neutral-800 text-white flex items-center gap-2 shadow-neutral-300"
              >
                <Plus size={20} /> Add Outline
              </Link>
            ) : (
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="bubbly-button bg-neutral-800 text-white flex items-center gap-2 shadow-neutral-300"
              >
                <Plus size={20} /> Create Timetable
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("outlines")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "outlines" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Course Outlines
          </button>
          <button 
            onClick={() => setActiveTab("timetables")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "timetables" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Master Timetables
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-neutral-400" size={48} />
        </div>
      ) : activeTab === "outlines" ? (
        courses.length === 0 ? (
          <div className="text-center py-24 bg-neutral-100 rounded-3xl border-2 border-dashed border-neutral-300">
            <img src="/mascot/lumen_empty.jpg" alt="Lumen looking for courses" className="w-48 h-48 mx-auto object-contain mb-4 rounded-3xl mix-blend-multiply" />
            <h2 className="text-2xl font-bold text-neutral-700 mb-2">No course outlines yet</h2>
            <Link href="/courses/new" className="bubbly-button bg-neutral-800 text-white shadow-neutral-300 inline-block mt-4">
              Create First Outline
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
              <GroupSection 
                key={groupName} 
                groupName={groupName} 
                courses={groupCourses as any[]} 
                onDeleteCourse={deleteCourse} 
              />
            ))}
          </div>
        )
      ) : (
        schedules.length === 0 ? (
          <div className="text-center py-24 bg-neutral-100 rounded-3xl border-2 border-dashed border-neutral-300">
            <img src="/mascot/lumen_empty.jpg" alt="Lumen looking for courses" className="w-48 h-48 mx-auto object-contain mb-4 rounded-3xl mix-blend-multiply" />
            <h2 className="text-2xl font-bold text-neutral-700 mb-2">No timetables yet</h2>
            <p className="text-neutral-500 font-medium max-w-md mx-auto mb-8">Group your courses together to generate an optimized study schedule.</p>
            <button onClick={() => setShowScheduleModal(true)} className="bubbly-button bg-neutral-800 text-white shadow-neutral-300 inline-block mt-4">
              Create Master Timetable
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {schedules.map(schedule => {
              const scheduleCourses = courses.filter(c => schedule.course_ids.includes(c.id));
              return (
                <div key={schedule.id} className="bg-white rounded-3xl p-6 border-2 border-neutral-200">
                  <div className="flex justify-end gap-3 mb-4">
                    <button onClick={() => setEditingSchedule(schedule)} className="text-neutral-500 hover:text-neutral-800 p-2 font-bold text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-2 transition-colors">
                      <Edit2 size={16} /> Edit Settings
                    </button>
                    <button onClick={() => deleteSchedule(schedule.id)} className="text-red-500 hover:text-red-700 p-2 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-2 transition-colors">
                      <Trash2 size={16} /> Delete Timetable
                    </button>
                  </div>
                  <GroupSection 
                    groupName={schedule.name} 
                    courses={scheduleCourses as any[]} 
                    onDeleteCourse={deleteCourse} 
                    defaultView="timetable"
                  />
                </div>
              );
            })}
          </div>
        )
      )}

      {showScheduleModal && (
        <CreateScheduleModal 
          courses={courses} 
          onClose={() => setShowScheduleModal(false)} 
          onCreated={() => {
            setShowScheduleModal(false);
            fetchData();
          }}
        />
      )}

      {editingSchedule && (
        <EditScheduleModal 
          schedule={editingSchedule}
          courses={courses} 
          onClose={() => setEditingSchedule(null)} 
          onUpdated={() => {
            setEditingSchedule(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
