"use client";

import { useState } from "react";
import { Folder, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import TopicStudyModal from "@/components/TopicStudyModal";

import { generateMasterTimetable } from "@/lib/timetable";

export default function GroupSection({ groupName, courses, onDeleteCourse, defaultView = "courses" }: { groupName: string, courses: any[], onDeleteCourse: (id: string, e: React.MouseEvent) => void, defaultView?: "courses" | "timetable" }) {
  const [view, setView] = useState<"courses" | "timetable">(defaultView);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const timetable = generateMasterTimetable(courses);

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 border-b-2 border-neutral-200 dark:border-neutral-800 pb-2">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
          <Folder className="text-neutral-400" size={24} /> {groupName}
        </h2>
        
        {courses.length > 1 && (
          <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button 
              onClick={() => setView("courses")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === "courses" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              Outlines
            </button>
            <button 
              onClick={() => setView("timetable")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === "timetable" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              <Calendar size={16} /> Master Timetable
            </button>
          </div>
        )}
      </div>

      {view === "courses" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            let totalTopics = 0;
            let completedTopics = 0;
            course.syllabus?.modules?.forEach((m: any) => {
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
                className="block modern-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6 hover:border-neutral-400 transition-colors relative group"
              >
                <button 
                  onClick={(e) => onDeleteCourse(course.id, e)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full z-10"
                  title="Delete Course Outline"
                >
                  <Trash2 size={16} />
                </button>

                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2 pr-8">{course.title}</h3>
                <div className="flex flex-col gap-1 text-sm font-medium text-neutral-500 mb-4">
                  <span>Target: {new Date(course.target_completion_date).toLocaleDateString()}</span>
                  <span>{completedTopics} of {totalTopics} Topics completed</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-neutral-800 dark:bg-neutral-200 h-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {timetable.length === 0 ? (
            <div className="text-center py-12 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-200 dark:border-green-900/30">
              <div className="w-32 h-32 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">Goal Complete!</h3>
              <p className="text-green-700 dark:text-green-500">You have finished all topics in this course group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {timetable.map((day, dIndex) => {
                const dayMins = day.reduce((acc, t) => acc + t.estimatedMinutes, 0);
                const dayHours = Math.round((dayMins / 60) * 10) / 10;
                
                return (
                  <div key={dIndex} className="modern-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Study Session {dIndex + 1}</h3>
                      <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                        ~{dayHours} hrs total
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {day.map((t, tIndex) => (
                        <button 
                          key={tIndex} 
                          onClick={() => setSelectedTopic(t)}
                          className="w-full text-left flex gap-4 items-start p-3 -mx-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <div className="w-3 h-3 rounded-full bg-orange-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                          <div>
                            <h4 className="font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-orange-500 transition-colors">{t.topicTitle}</h4>
                            <div className="flex gap-2 text-xs font-bold mt-1">
                              <span className="text-neutral-500">{t.courseName}</span>
                              <span className="text-neutral-400">•</span>
                              <span className="text-neutral-500">{t.estimatedMinutes}m</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedTopic && (
        <TopicStudyModal 
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onComplete={() => {
            setSelectedTopic(null);
            // Refresh logic usually required here, so we reload the page for now
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
