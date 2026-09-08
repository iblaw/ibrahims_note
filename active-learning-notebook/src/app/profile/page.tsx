"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Calendar, Trophy, Book, LogOut, Loader2, Sparkles, Clock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ notes: 0, courses: 0, flashcards: 0 });
  const [loading, setLoading] = useState(true);

  // Edit Username State
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) {
      setProfile(profileData);
      setNewUsername(profileData.username);
    }

    const [notesRes, coursesRes, cardsRes] = await Promise.all([
      supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id)
    ]);

    setStats({
      notes: notesRes.count || 0,
      courses: coursesRes.count || 0,
      flashcards: cardsRes.count || 0,
    });

    setLoading(false);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }
    setSavingUsername(true);
    setUsernameError("");

    // Upsert profile
    const { data, error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: newUsername.trim()
    }).select().single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        setUsernameError("This username is already taken.");
      } else {
        setUsernameError("Error saving username.");
      }
    } else {
      setProfile(data);
      setIsEditingUsername(false);
    }
    setSavingUsername(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  const displayName = profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Lumen Scholar";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
          <Sparkles size={24} />
        </div>
        <h1 className="text-xl sm:text-xl font-extrabold text-neutral-800 tracking-tight">
          Hey there, {displayName}! ⚡
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="modern-card relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 z-10 text-white font-extrabold text-xl uppercase">
              {displayName.charAt(0)}
            </div>
            
            <div className="z-10 w-full">
              {isEditingUsername ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-3 py-2 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-center font-bold"
                  />
                  {usernameError && <p className="text-red-500 text-xs font-bold">{usernameError}</p>}
                  <div className="flex gap-2 justify-center mt-2">
                    <button 
                      onClick={handleSaveUsername} 
                      disabled={savingUsername}
                      className="px-4 py-1.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {savingUsername ? "Saving..." : "Save"}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(profile?.username || "");
                        setUsernameError("");
                      }}
                      className="px-4 py-1.5 bg-neutral-200 text-neutral-700 font-bold rounded-lg hover:bg-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group cursor-pointer flex flex-col items-center justify-center" onClick={() => setIsEditingUsername(true)}>
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    @{profile?.username || "choose_username"} 
                    <span className="text-neutral-300 group-hover:text-orange-500 transition-colors text-xs">Edit</span>
                  </h2>
                </div>
              )}
            </div>

            <p className="text-neutral-500 font-medium flex items-center justify-center gap-2 mt-4 z-10">
              <Mail size={16} /> {user?.email}
            </p>
            <p className="text-neutral-400 text-xs font-bold mt-2 z-10">
              Joined {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors border border-neutral-200"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-neutral-800">Learning Statistics</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="modern-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Book size={24} />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-sm">Total Notes</p>
                <p className="text-xl font-extrabold text-neutral-900">{stats.notes}</p>
              </div>
            </div>
            
            <div className="modern-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-sm">Course Outlines</p>
                <p className="text-xl font-extrabold text-neutral-900">{stats.courses}</p>
              </div>
            </div>

            <div className="modern-card sm:col-span-2 flex items-center gap-4 relative overflow-hidden border-orange-200 bg-orange-50/50">
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <Trophy size={120} className="text-orange-400 -mb-8 -mr-8" />
              </div>
              <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                <Sparkles size={28} />
              </div>
              <div>
                <p className="text-orange-700 font-bold text-sm">Flashcards in Vault</p>
                <p className="text-xl font-extrabold text-orange-600">{stats.flashcards}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-neutral-800 mt-10">App Appearance</h3>
          <div className="modern-card space-y-4">
            <p className="font-bold text-neutral-600 text-sm">App Font Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "playful", label: "Playful" },
                { id: "casual", label: "Casual" },
                { id: "classic", label: "Classic" },
                { id: "serious", label: "Serious" },
                { id: "mono", label: "Mono" },
              ].map(font => (
                <button
                  key={font.id}
                  onClick={() => {
                    localStorage.setItem("lumen-font", font.id);
                    document.documentElement.setAttribute("data-font", font.id);
                  }}
                  className="p-3 border-2 border-neutral-200 rounded-xl font-bold hover:border-orange-400 hover:bg-orange-50 transition-colors focus:border-orange-500 focus:bg-orange-50 outline-none"
                  style={{
                    fontFamily: 
                      font.id === "playful" ? "var(--font-fredoka)" :
                      font.id === "casual" ? "var(--font-nunito)" :
                      font.id === "classic" ? "var(--font-merriweather)" :
                      font.id === "serious" ? "var(--font-inter)" :
                      "var(--font-jetbrains)"
                  }}
                >
                  {font.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-neutral-400 mt-2">
              Select a font to instantly update the look and feel of the entire app. Your preference is saved automatically!
            </p>
          </div>

          <h3 className="text-xl font-bold text-neutral-800 mt-10">Study Preferences</h3>
          <div className="modern-card space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Profession / Study Area</label>
                <input 
                  type="text" 
                  value={profile?.profession || ""}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  onBlur={() => supabase.from("profiles").update({ profession: profile?.profession }).eq("id", user.id)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Daily Study Goal (Hours)</label>
                <input 
                  type="number" min="0.5" step="0.5"
                  value={profile?.daily_study_goal_hours || 2}
                  onChange={(e) => setProfile({ ...profile, daily_study_goal_hours: parseFloat(e.target.value) })}
                  onBlur={() => supabase.from("profiles").update({ daily_study_goal_hours: profile?.daily_study_goal_hours }).eq("id", user.id)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm"
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Note Length</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setProfile({ ...profile, note_length_preference: "detailed" });
                      supabase.from("profiles").update({ note_length_preference: "detailed" }).eq("id", user.id);
                    }}
                    className={`p-3 rounded-xl border-2 font-bold text-sm text-center transition-colors ${profile?.note_length_preference === "detailed" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                  >
                    Long & Detailed
                  </button>
                  <button 
                    onClick={() => {
                      setProfile({ ...profile, note_length_preference: "summary" });
                      supabase.from("profiles").update({ note_length_preference: "summary" }).eq("id", user.id);
                    }}
                    className={`p-3 rounded-xl border-2 font-bold text-sm text-center transition-colors ${profile?.note_length_preference === "summary" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                  >
                    Short & Concise
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Primary Goals</label>
                <input 
                  type="text" 
                  placeholder="e.g. Exam, Career, General (comma separated)"
                  value={profile?.primary_learning_goal || ""}
                  onChange={(e) => setProfile({ ...profile, primary_learning_goal: e.target.value })}
                  onBlur={() => supabase.from("profiles").update({ primary_learning_goal: profile?.primary_learning_goal }).eq("id", user.id)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm"
                />
                <p className="text-xs text-neutral-500 mt-1">Comma-separated list of your study goals.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Quiz Timing Preference</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setProfile({ ...profile, quiz_preference: "in_between" });
                    supabase.from("profiles").update({ quiz_preference: "in_between" }).eq("id", user.id);
                  }}
                  className={`p-3 rounded-xl border-2 font-bold text-sm text-left transition-colors ${profile?.quiz_preference === "in_between" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                >
                  <div className="mb-1 text-orange-500"><Clock size={18} /></div>
                  In-between sections
                </button>
                <button 
                  onClick={() => {
                    setProfile({ ...profile, quiz_preference: "at_end" });
                    supabase.from("profiles").update({ quiz_preference: "at_end" }).eq("id", user.id);
                  }}
                  className={`p-3 rounded-xl border-2 font-bold text-sm text-left transition-colors ${profile?.quiz_preference === "at_end" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                >
                  <div className="mb-1 text-orange-500"><BookOpen size={18} /></div>
                  At the end of the note
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Mnemonics Preference</label>
              <div className="grid sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => {
                    setProfile({ ...profile, mnemonic_preference: "acronyms" });
                    supabase.from("profiles").update({ mnemonic_preference: "acronyms" }).eq("id", user.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${profile?.mnemonic_preference === "acronyms" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <div className="font-bold text-neutral-800 text-sm">Acronyms & Acrostics</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">e.g. ROYGBIV</div>
                </button>
                
                <button 
                  onClick={() => {
                    setProfile({ ...profile, mnemonic_preference: "story" });
                    supabase.from("profiles").update({ mnemonic_preference: "story" }).eq("id", user.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${profile?.mnemonic_preference === "story" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <div className="font-bold text-neutral-800 text-sm">Story & Rhymes</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">e.g. In 1492, Columbus...</div>
                </button>
                
                <button 
                  onClick={() => {
                    setProfile({ ...profile, mnemonic_preference: "mixed" });
                    supabase.from("profiles").update({ mnemonic_preference: "mixed" }).eq("id", user.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${profile?.mnemonic_preference === "mixed" ? "border-purple-500 bg-purple-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <div className="font-bold text-neutral-800 text-sm">Mix of Both</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">Lumen picks what works best</div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
