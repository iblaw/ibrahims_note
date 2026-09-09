"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, BrainCircuit, Clock, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingModal({ userId, initialUsername }: { userId: string, initialUsername?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState<{
    username: string;
    profession: string;
    quiz_preference: string;
    note_length_preference: string;
    mnemonic_preference: string;
    daily_study_goal_hours: string;
    busyness?: string;
    study_days?: string[];
  }>({
    username: initialUsername || "",
    profession: "",
    quiz_preference: "at_end",
    note_length_preference: "detailed",
    mnemonic_preference: "mixed",
    daily_study_goal_hours: "2",
    busyness: "Average",
    study_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  });

  const [goals, setGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState("");
  const predefinedGoals = ["Passing an Exam", "Career Advancement", "General Knowledge"];

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleAddCustomGoal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customGoal.trim()) {
      e.preventDefault();
      if (!goals.includes(customGoal.trim())) {
        setGoals([...goals, customGoal.trim()]);
      }
      setCustomGoal("");
    }
  };

  const handleChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (key === "username") {
      setUsernameError("");
    }
  };

  const [isOpen, setIsOpen] = useState(true);
  const [usernameError, setUsernameError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: preferences.username,
      profession: preferences.profession,
      quiz_preference: preferences.quiz_preference,
      note_length_preference: preferences.note_length_preference,
      mnemonic_preference: preferences.mnemonic_preference,
      primary_learning_goal: goals.length > 0 ? goals.join(", ") : "General",
      daily_study_goal_hours: parseFloat(preferences.daily_study_goal_hours),
      is_onboarded: true,
      updated_at: new Date().toISOString()
    });

    setLoading(false);

    if (error) {
      console.error("Error saving onboarding data:", error);
      if (error.code === '23505' || error.message.includes('profiles_username_key')) {
        setUsernameError("This username is already taken. Please choose another.");
      } else {
        alert("There was an issue saving your profile: " + error.message);
      }
    } else {
      setIsOpen(false);
      router.refresh();
      // Fallback for forcing the layout to re-evaluate the server component
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-4 relative z-10">
            Welcome to Lumen
          </h2>
          <p className="text-lg text-neutral-600 mb-8 font-medium relative z-10">
            You're about to experience the most powerful way to learn. Before we set up your profile, let's look at the science behind why Lumen works.
          </p>
          <button 
            onClick={() => setStep(2)}
            className="w-full modern-button bg-orange-500 text-white shadow-orange-500/30 text-lg py-4 flex items-center justify-center gap-2 relative z-10"
          >
            See The Science <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">The Illusion of Competence</h2>
            <p className="text-lg text-neutral-600 font-medium">
              Studies show that <strong className="text-red-500">Passive Reading</strong> (just re-reading notes or highlighting) leads to a rapid decay in memory. Within 24 hours, you forget up to <strong className="text-red-500">70%</strong> of what you just read.
            </p>
          </div>
          
          <div className="p-8 bg-red-50 rounded-3xl border border-red-100 mb-8">
            <div className="flex justify-center items-center gap-3 text-red-700 font-bold mb-6 text-xl">
              <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">📉</div>
              Passive Learning Retention
            </div>
            {/* CSS Animated Forgetting Curve */}
            <div className="h-40 flex items-end justify-center gap-4 relative max-w-md mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-b-2 border-l-2 border-red-200"></div>
              <div className="w-16 bg-red-400 rounded-t-xl relative z-10 animate-[pulse_2s_ease-in-out_infinite]" style={{ height: '90%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-red-700">100%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-red-400">Day 1</span>
              </div>
              <div className="w-16 bg-red-400 rounded-t-xl relative z-10 opacity-80" style={{ height: '40%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-red-700">40%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-red-400">Day 2</span>
              </div>
              <div className="w-16 bg-red-400 rounded-t-xl relative z-10 opacity-60" style={{ height: '20%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-red-700">20%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-red-400">Day 3</span>
              </div>
              <div className="w-16 bg-red-400 rounded-t-xl relative z-10 opacity-40" style={{ height: '10%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-red-700">10%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-red-400">Day 4</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep(3)}
            className="w-full modern-button bg-neutral-900 text-white py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-neutral-900/20"
          >
            How do we fix this? <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">The Active Solution</h2>
            <p className="text-lg text-neutral-600 font-medium">
              <strong className="text-green-600">Active Recall</strong> forces your brain to retrieve information. Combined with <strong className="text-green-600">Spaced Repetition</strong>, you can boost long-term retention to over <strong className="text-green-600">90%</strong>.
            </p>
          </div>
          
          <div className="p-8 bg-green-50 rounded-3xl border border-green-100 mb-8">
            <div className="flex justify-center items-center gap-3 text-green-700 font-bold mb-6 text-xl">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">📈</div>
              Active Recall + SRS
            </div>
            {/* CSS Animated Active Curve */}
            <div className="h-40 flex items-end justify-center gap-4 relative max-w-md mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-b-2 border-l-2 border-green-200"></div>
              <div className="w-16 bg-green-500 rounded-t-xl relative z-10" style={{ height: '90%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-green-700">100%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600">Review</span>
              </div>
              <div className="w-16 bg-green-500 rounded-t-xl relative z-10 animate-[pulse_2s_ease-in-out_infinite] delay-100" style={{ height: '85%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-green-700">95%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600">Review</span>
              </div>
              <div className="w-16 bg-green-500 rounded-t-xl relative z-10 animate-[pulse_2s_ease-in-out_infinite] delay-200" style={{ height: '92%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-green-700">98%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600">Review</span>
              </div>
              <div className="w-16 bg-green-500 rounded-t-xl relative z-10 animate-[pulse_2s_ease-in-out_infinite] delay-300" style={{ height: '95%' }}>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-green-700">99%</span>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600">Mastered</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep(4)}
            className="w-full modern-button bg-neutral-900 text-white py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-neutral-900/20"
          >
            How Lumen automates this <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500 text-center">
          <div className="text-sm font-bold text-blue-500 tracking-widest uppercase mb-4">Pillar 1 of 3</div>
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">Active Recall & SRS</h2>
          <p className="text-lg text-neutral-600 font-medium mb-8">
            Lumen turns passive notes into active challenges. As you read, we automatically embed quizzes and flashcards into your material, tracking your memory decay and resurfacing cards right before you forget them.
          </p>
          
          <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 mb-8 flex justify-center items-center h-48 relative">
            <div className="w-64 h-32 absolute animate-pulse" style={{ animationDuration: '4s' }}>
              <div className="w-full h-full bg-white border-2 border-blue-200 rounded-2xl shadow-xl flex flex-col justify-center items-center p-4">
                <span className="text-neutral-400 font-bold mb-2">Front</span>
                <span className="text-blue-600 font-extrabold text-lg">What is the powerhouse of the cell?</span>
              </div>
            </div>
            <div className="w-64 h-32 absolute opacity-0 animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
              <div className="w-full h-full bg-blue-500 border-2 border-blue-600 rounded-2xl shadow-xl flex flex-col justify-center items-center p-4 text-white">
                <span className="text-blue-200 font-bold mb-2">Back</span>
                <span className="font-extrabold text-2xl flex items-center gap-2">Mitochondria <span className="text-green-300">✔</span></span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep(5)}
            className="w-full modern-button bg-neutral-900 text-white py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-neutral-900/20"
          >
            Next: Making things stick <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500 text-center">
          <div className="text-sm font-bold text-purple-500 tracking-widest uppercase mb-4">Pillar 2 of 3</div>
          <div className="w-16 h-16 bg-purple-100 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <Sparkles size={32} className="animate-[spin_4s_linear_infinite]" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">Mnemonics</h2>
          <p className="text-lg text-neutral-600 font-medium mb-8">
            Sometimes pure repetition isn't enough. For complex concepts, Lumen generates custom acronyms, stories, and rhymes specifically tailored to how your brain prefers to memorize things.
          </p>
          
          <div className="p-8 bg-purple-50 rounded-3xl border border-purple-100 mb-8 flex flex-col items-center justify-center">
            <div className="flex gap-2 sm:gap-3 mb-6">
              {['R','O','Y','G','B','I','V'].map((letter, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-200 text-purple-800 font-black flex items-center justify-center text-lg sm:text-xl animate-bounce shadow-sm"
                  style={{ animationDelay: `${i * 150}ms`, animationDuration: '2s' }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="bg-white py-3 px-6 rounded-2xl shadow-sm border border-purple-100 animate-pulse">
              <span className="text-purple-600 font-bold italic">"Richard Of York Gave Battle In Vain"</span>
            </div>
          </div>

          <button 
            onClick={() => setStep(6)}
            className="w-full modern-button bg-neutral-900 text-white py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-neutral-900/20"
          >
            Next: Putting it all together <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500 text-center">
          <div className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-4">Pillar 3 of 3</div>
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <BookOpen size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">Master Organization</h2>
          <p className="text-lg text-neutral-600 font-medium mb-8">
            Great learning requires a great plan. Upload your course outlines and Lumen will automatically schedule your study blocks, generating a master timetable so you finish well before exam day.
          </p>
          
          <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100 mb-8">
            <div className="grid grid-cols-7 gap-2 max-w-xs mx-auto">
              {[...Array(14)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-full aspect-square rounded-lg bg-orange-400 animate-pulse" 
                  style={{ animationDelay: `${i * 100}ms`, animationDuration: '2s' }}
                ></div>
              ))}
            </div>
            <p className="text-orange-700 font-bold mt-6 text-sm">Auto-scheduling your study blocks...</p>
          </div>

          <button 
            onClick={() => setStep(7)}
            className="w-full modern-button bg-neutral-900 text-white py-4 text-lg flex justify-center items-center gap-2 shadow-xl shadow-neutral-900/20"
          >
            Got it! Let's personalize my study <span className="text-2xl">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-500">
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
          <BrainCircuit className="text-orange-500" /> Personalize Your Study
        </h2>
        
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Choose a Username</label>
            <input 
              type="text" 
              placeholder="e.g. learning_ninja" 
              value={preferences.username}
              onChange={e => handleChange("username", e.target.value)}
              className={`w-full p-4 rounded-xl border-2 bg-neutral-50 font-bold focus:outline-none transition-colors ${usernameError ? "border-red-500 focus:border-red-600" : "border-neutral-200 focus:border-orange-500"}`}
            />
            {usernameError && (
              <p className="text-red-500 text-sm font-bold mt-2 animate-in slide-in-from-top-1">
                {usernameError}
              </p>
            )}
          </div>

          {/* Profession */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">What is your profession / field of study?</label>
              <input 
                type="text" 
                placeholder="e.g. Medical Student" 
                value={preferences.profession}
                onChange={e => handleChange("profession", e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Daily Study Goal (Hours)</label>
              <input 
                type="number" 
                min="0.5" step="0.5"
                value={preferences.daily_study_goal_hours}
                onChange={e => handleChange("daily_study_goal_hours", e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold"
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Primary Goals (Select all that apply)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedGoals.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`px-4 py-2 rounded-full font-bold text-sm border-2 transition-colors ${goals.includes(g) ? "border-orange-500 bg-orange-100 text-orange-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                >
                  {g}
                </button>
              ))}
              {goals.filter(g => !predefinedGoals.includes(g)).map(custom => (
                <button
                  key={custom}
                  onClick={() => toggleGoal(custom)}
                  className="px-4 py-2 rounded-full font-bold text-sm border-2 border-orange-500 bg-orange-100 text-orange-800 flex items-center gap-2"
                >
                  {custom} <span className="opacity-60 hover:opacity-100">&times;</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type your own goal and press Enter..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={handleAddCustomGoal}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm"
            />
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Quiz Timing Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleChange("quiz_preference", "in_between")} className={`p-4 rounded-xl border-2 font-bold text-left transition-colors ${preferences.quiz_preference === "in_between" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
                <div className="mb-1 text-orange-500"><Clock size={20} /></div>
                In-between sections
              </button>
              <button onClick={() => handleChange("quiz_preference", "at_end")} className={`p-4 rounded-xl border-2 font-bold text-left transition-colors ${preferences.quiz_preference === "at_end" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
                <div className="mb-1 text-orange-500"><BookOpen size={20} /></div>
                At the end of the note
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Note Length Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleChange("note_length_preference", "detailed")} className={`p-3 rounded-xl border-2 font-bold text-center transition-colors ${preferences.note_length_preference === "detailed" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
                Long & Detailed
              </button>
              <button onClick={() => handleChange("note_length_preference", "summary")} className={`p-3 rounded-xl border-2 font-bold text-center transition-colors ${preferences.note_length_preference === "summary" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
                Short & Concise
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Favorite type of Mnemonics?</label>
            <div className="grid sm:grid-cols-3 gap-3">
              <button 
                onClick={() => handleChange("mnemonic_preference", "acronyms")} 
                className={`p-4 rounded-xl border-2 text-left transition-colors ${preferences.mnemonic_preference === "acronyms" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
              >
                <div className="font-bold text-neutral-800">Acronyms & Acrostics</div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">e.g. ROYGBIV, "Please Excuse My Dear Aunt Sally"</div>
              </button>
              
              <button 
                onClick={() => handleChange("mnemonic_preference", "story")} 
                className={`p-4 rounded-xl border-2 text-left transition-colors ${preferences.mnemonic_preference === "story" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
              >
                <div className="font-bold text-neutral-800">Story & Rhymes</div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">e.g. "In 1492, Columbus sailed the ocean blue"</div>
              </button>
              
              <button 
                onClick={() => handleChange("mnemonic_preference", "mixed")} 
                className={`p-4 rounded-xl border-2 text-left transition-colors ${preferences.mnemonic_preference === "mixed" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
              >
                <div className="font-bold text-neutral-800">Mix of Both</div>
                <div className="text-xs text-neutral-500 mt-2 font-medium">Lumen will pick what works best for the topic</div>
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || !preferences.profession || !preferences.username}
          className="w-full modern-button bg-neutral-900 text-white mt-8 py-4 text-lg shadow-xl shadow-neutral-900/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Setup & Enter Lumen"}
        </button>
      </div>
    </div>
  );
}
