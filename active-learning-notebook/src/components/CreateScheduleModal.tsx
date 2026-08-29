"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X } from "lucide-react";

export default function CreateScheduleModal({ courses, onClose, onCreated }: { courses: any[], onClose: () => void, onCreated: () => void }) {
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourses.length === 0) return alert("Select at least one course");
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("schedules").insert({
      user_id: user?.id || null,
      name,
      target_date: new Date(targetDate).toISOString(),
      weekly_hours: weeklyHours,
      course_ids: selectedCourses
    });

    setLoading(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Create Master Timetable</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Schedule Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finals Prep" className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-500 font-bold bg-neutral-50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Target Date</label>
              <input type="date" required value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-500 font-bold bg-neutral-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Weekly Hours</label>
              <input type="number" min="1" required value={weeklyHours} onChange={e => setWeeklyHours(Number(e.target.value))} className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-500 font-bold bg-neutral-50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2 mt-4">Select Courses to Include</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCourses([...selectedCourses, course.id]);
                      else setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                    }}
                  />
                  <span className="font-bold text-neutral-800">{course.title}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bubbly-button bg-neutral-900 text-white mt-6">
            {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Generate Timetable"}
          </button>
        </form>
      </div>
    </div>
  );
}
