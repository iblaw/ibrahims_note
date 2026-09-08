"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, Clock, Layers, ArrowRight, Loader2, PenTool } from "lucide-react";
import Link from "next/link";
import QuizSession from "@/app/notes/[id]/quiz/QuizSession";
import ExamActions from "@/components/ExamActions";
import SavedExamCard from "@/components/SavedExamCard";

export default function ExamModePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [validTopics, setValidTopics] = useState<Set<string>>(new Set());
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [notesData, setNotesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam Settings
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timeLimit, setTimeLimit] = useState<number>(15); // minutes
  const [examStarted, setExamStarted] = useState(false);
  
  // Exam Data
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  const maxAvailableQuestions = useMemo(() => {
    let total = 0;
    const quizRegex = /<Quiz\s+question=/g;
    notesData.forEach(note => {
      if (selectedTopics.includes(note.course_topic)) {
        const matches = note.content.match(quizRegex);
        if (matches) total += matches.length;
      }
    });
    return total;
  }, [notesData, selectedTopics]);

  useEffect(() => {
    if (questionCount > maxAvailableQuestions && maxAvailableQuestions > 0) {
      setQuestionCount(maxAvailableQuestions);
    }
  }, [maxAvailableQuestions, questionCount]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [coursesRes, notesRes, savedExamsRes] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id", user.id),
      supabase.from("notes").select("course_topic, content").eq("user_id", user.id),
      supabase.from("notes").select("id, title, created_at, is_public").in("course_topic", ["SHARED_EXAM", "GRAND_EXAM"]).eq("user_id", user.id).order('created_at', { ascending: false })
    ]);

    const valid = new Set<string>();
    const quizRegex = /<Quiz\s+question=/;
    
    if (notesRes.data) {
      setNotesData(notesRes.data);
      notesRes.data.forEach((note: any) => {
        if (note.course_topic && note.content && quizRegex.test(note.content)) {
          valid.add(note.course_topic);
        }
      });
    }

    if (coursesRes.data) setCourses(coursesRes.data);
    if (savedExamsRes.data) setSavedExams(savedExamsRes.data);
    setValidTopics(valid);
    setLoading(false);
  };

  const startExam = async () => {
    if (selectedTopics.length === 0) return alert("Select at least one topic");
    
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch notes for the selected topics to extract quizzes
    const { data: notes } = await supabase
      .from("notes")
      .select("id, content")
      .eq("user_id", user?.id)
      .in("course_topic", selectedTopics);

    const extractedQuizzes: any[] = [];
    const quizRegex = /<Quiz\s+question="([^"]+)"\s+options="([^"]+)"\s+answer="([^"]+)"\s*\/?>(?:<\/Quiz>)?/g;

    notes?.forEach(note => {
      let match;
      while ((match = quizRegex.exec(note.content)) !== null) {
        extractedQuizzes.push({
          question: match[1],
          options: match[2].split("|").map((opt: string) => opt.trim()),
          answer: match[3].trim(),
          note_id: note.id
        });
      }
    });

    // Shuffle and pick questionCount
    const shuffled = extractedQuizzes.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    setExamQuestions(selected);
    setGenerating(false);
    setExamStarted(true);
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-neutral-400" size={48} /></div>;
  }

  if (examStarted) {
    if (examQuestions.length === 0) {
      return (
        <div className="max-w-3xl mx-auto py-24 text-center">
          <h2 className="text-xl font-bold mb-4">No questions found!</h2>
          <p className="text-neutral-500 mb-8">The topics you selected don't have any quizzes embedded in their notes.</p>
          <button onClick={() => setExamStarted(false)} className="modern-button bg-neutral-800 text-white">Back to Setup</button>
        </div>
      );
    }
    // Very simple wrapper around QuizSession with a timer. In a real scenario, we'd add the countdown timer.
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><PenTool className="text-orange-500"/> Grand Exam</h1>
          <div className="flex items-center gap-4">
            <ExamActions 
              quizzes={examQuestions} 
              defaultTitle={selectedTopics.length === 1 ? `${selectedTopics[0]} Exam` : "Combined Grand Exam"} 
            />
            <div className="font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-full flex items-center gap-2">
              <Clock size={18} /> {timeLimit} Minutes
            </div>
          </div>
        </div>
        <QuizSession quizzes={examQuestions} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in">
      <div className="mb-8">
        <Link href="/review" className="text-neutral-500 font-bold hover:text-orange-500 transition-colors">
          &larr; Back to Review Hub
        </Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12">
        <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-3">
          <BrainCircuit size={36} className="text-indigo-200" /> Exam Mode Setup
        </h1>
        <p className="text-xl font-medium text-indigo-100">
          Combine topics to simulate a real exam. Set your limits and test your mastery.
        </p>
      </div>

      <div className="modern-card p-8 sm:p-12 space-y-8">
        <div>
          <label className="block text-lg font-bold text-neutral-800 mb-4">Select Topics to Include</label>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar border-2 border-neutral-100 rounded-2xl p-4">
            {courses.length === 0 && <p className="text-neutral-500 text-sm">No courses found.</p>}
            {courses.map(course => {
              // Aggregate all valid topics for this course across all modules
              const courseValidTopics: any[] = [];
              course.syllabus?.modules?.forEach((m: any) => {
                m.topics?.forEach((t: any) => {
                  if (validTopics.has(t.title)) {
                    courseValidTopics.push(t);
                  }
                });
              });

              if (courseValidTopics.length === 0) return null;

              const allCourseTopicsSelected = courseValidTopics.every(t => selectedTopics.includes(t.title));

              const toggleCourse = () => {
                if (allCourseTopicsSelected) {
                  setSelectedTopics(prev => prev.filter(id => !courseValidTopics.some(t => t.title === id)));
                } else {
                  const newTopics = courseValidTopics.map(t => t.title).filter(t => !selectedTopics.includes(t));
                  setSelectedTopics(prev => [...prev, ...newTopics]);
                }
              };

              return (
                <div key={course.id} className="mb-6">
                  <label className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-xl cursor-pointer mb-2 group border-b border-neutral-200 pb-2">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      checked={allCourseTopicsSelected}
                      onChange={toggleCourse}
                    />
                    <h4 className="font-bold text-neutral-800 text-sm uppercase tracking-wider group-hover:text-indigo-700">{course.title}</h4>
                  </label>
                  
                  <div className="pl-4 space-y-1 border-l-2 border-neutral-100 ml-4">
                    {courseValidTopics.map((t: any, tidx: number) => (
                      <label key={tidx} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedTopics.includes(t.title)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTopics([...selectedTopics, t.title]);
                            else setSelectedTopics(selectedTopics.filter(id => id !== t.title));
                          }}
                        />
                        <span className="text-neutral-700 font-medium">{t.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Layers size={18}/> Number of Questions</span>
              {selectedTopics.length > 0 && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">Max: {maxAvailableQuestions}</span>}
            </label>
            <input 
              type="number" 
              min="5" max={maxAvailableQuestions || 100}
              value={questionCount}
              onChange={e => {
                const val = Number(e.target.value);
                setQuestionCount(maxAvailableQuestions > 0 ? Math.min(val, maxAvailableQuestions) : val);
              }}
              className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-indigo-500 bg-neutral-50 font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2"><Clock size={18}/> Time Limit (Minutes)</label>
            <input 
              type="number" 
              min="5" max="180"
              value={timeLimit}
              onChange={e => setTimeLimit(Number(e.target.value))}
              className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-indigo-500 bg-neutral-50 font-bold text-lg"
            />
          </div>
        </div>

        <button 
          onClick={startExam}
          disabled={generating || selectedTopics.length === 0}
          className="w-full modern-button bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 py-4 text-lg disabled:opacity-50"
        >
          {generating ? <Loader2 className="animate-spin mx-auto" /> : "Start Grand Exam"}
        </button>
      </div>

      {savedExams.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PenTool className="text-neutral-400" /> Saved Exams</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {savedExams.map((exam) => (
              <SavedExamCard 
                key={exam.id} 
                exam={exam} 
                onRemove={(id) => setSavedExams(prev => prev.filter(e => e.id !== id))} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
