import re

with open('src/app/profile/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add toggleStudyDay
if "const toggleStudyDay" not in content:
    func = """  const toggleStudyDay = async (day: string) => {
    const currentDays = profile?.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newDays = currentDays.includes(day) ? currentDays.filter((d: string) => d !== day) : [...currentDays, day];
    setProfile({ ...profile, study_days: newDays });
    await supabase.from("profiles").update({ study_days: newDays }).eq("id", user.id);
  };
"""
    content = content.replace("const fetchProfile = async () => {", func + "\n  const fetchProfile = async () => {")

# Add the UI block
ui_block = """
          <h3 className="text-xl font-bold text-neutral-800 mt-10">Study & Burnout Preferences</h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 mb-6">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
              <Sparkles size={18} /> The Science of Rest
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
              Cognitive burnout is the #1 reason students miss their deadlines. Lumen uses spaced repetition and cognitive load theory to build your master timetable. Tell us your ideal study days below, and we will automatically weave in necessary rest periods so you learn faster without burning out.
            </p>
          </div>

          <div className="modern-card space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Daily Study Goal (Hours)</label>
                <input 
                  type="number" min="0.5" step="0.5"
                  value={profile?.daily_study_goal_hours || 2}
                  onChange={(e) => setProfile({ ...profile, daily_study_goal_hours: parseFloat(e.target.value) })}
                  onBlur={() => supabase.from("profiles").update({ daily_study_goal_hours: profile?.daily_study_goal_hours }).eq("id", user.id)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm outline-none"
                />
                <p className="text-xs text-neutral-500 mt-2 font-medium">Be realistic! How much time do you actually have on an active day?</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">How busy are your days usually?</label>
                <select
                  value={profile?.busyness || "Average"}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setProfile({ ...profile, busyness: val });
                    await supabase.from("profiles").update({ busyness: val }).eq("id", user.id);
                  }}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm outline-none"
                >
                  <option value="Light">Light (Lots of free time)</option>
                  <option value="Average">Average (Standard 9-5/Classes)</option>
                  <option value="Very Busy">Very Busy (Working & Studying)</option>
                </select>
                <p className="text-xs text-neutral-500 mt-2 font-medium">Lumen will suggest more rest days if you are highly stressed.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Select your Active Study Days</label>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                  const isSelected = (profile?.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleStudyDay(day)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        isSelected 
                          ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105" 
                          : "bg-white border-neutral-200 text-neutral-500 hover:border-orange-300"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-3 font-medium">Days that are not selected will never be assigned topics in your timetable.</p>
            </div>
          </div>
"""

# Replace the existing "Study Preferences" start
if "Study & Burnout Preferences" not in content:
    content = content.replace(
        '<h3 className="text-xl font-bold text-neutral-800 mt-10">Study Preferences</h3>',
        ui_block + '\n          <h3 className="text-xl font-bold text-neutral-800 mt-10">Other Preferences</h3>'
    )
    
    # Remove the old daily study goal input to prevent duplication
    old_daily_goal = """              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Daily Study Goal (Hours)</label>
                <input 
                  type="number" min="0.5" step="0.5"
                  value={profile?.daily_study_goal_hours || 2}
                  onChange={(e) => setProfile({ ...profile, daily_study_goal_hours: parseFloat(e.target.value) })}
                  onBlur={() => supabase.from("profiles").update({ daily_study_goal_hours: profile?.daily_study_goal_hours }).eq("id", user.id)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold text-sm"
                />
              </div>"""
    content = content.replace(old_daily_goal, "")


with open('src/app/profile/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
