import re

with open('src/components/OnboardingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update props
content = content.replace(
    "export default function OnboardingModal({ userId }: { userId: string }) {",
    "export default function OnboardingModal({ userId, initialUsername }: { userId: string, initialUsername?: string }) {"
)
content = content.replace(
    'username: "",',
    'username: initialUsername || "",\n    study_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],\n    busyness: "Average",'
)

# 2. Update the main (final) return. We will look for the line:
#   return (
#     <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
#       <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-500">
#         <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
#           <BrainCircuit className="text-orange-500" /> Personalize Your Study
#         </h2>

# Let's split by that specific H2 title
parts = content.split('<h2 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">\n            <BrainCircuit className="text-orange-500" /> Personalize Your Study\n          </h2>')

if len(parts) == 2:
    # Before the return (
    before = parts[0]
    
    # We need to insert the Step 7 logic right before this final return
    # The final return starts with `return (` a few lines up.
    
    # Let's locate the `return (` that is right at the end of `parts[0]`
    idx = before.rfind('return (')
    
    # Extract the stuff before the final return
    code_before_final_return = before[:idx]
    
    new_step_7 = """  if (step === 7) {
    if (initialUsername) {
      setStep(8);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
            <Sparkles className="text-orange-500" /> Account Setup
          </h2>
          <p className="text-neutral-600 font-medium mb-6">Choose a unique username so others can find your public notes.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Username</label>
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
            
            <button 
              onClick={() => setStep(8)}
              disabled={!preferences.username || !!usernameError}
              className="w-full modern-button bg-neutral-900 text-white mt-8 py-4 text-lg shadow-xl shadow-neutral-900/20 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-500">
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
          <BrainCircuit className="text-orange-500" /> Study Preferences
        </h2>
        
        {/* Educational Blurb about Rest (moved from profile settings) */}
        <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-200 mb-6">
          <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
            <Sparkles size={18} /> The Science of Rest
          </h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Cognitive burnout is the #1 reason students miss their deadlines. Lumen uses spaced repetition and cognitive load theory to build your master timetable. Tell us your ideal study days below, and we will automatically weave in necessary rest periods so you learn faster without burning out.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Profession */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">What is your field of study or profession?</label>
            <input 
              type="text" 
              placeholder="e.g. Medical Student, Software Engineer" 
              value={preferences.profession}
              onChange={e => handleChange("profession", e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 font-bold focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Daily Goal & Busyness */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Daily Study Goal (Hours)</label>
              <input 
                type="number" min="0.5" step="0.5"
                value={preferences.daily_study_goal_hours}
                onChange={e => handleChange("daily_study_goal_hours", e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">How busy are your days?</label>
              <select
                value={preferences.busyness || "Average"}
                onChange={(e) => handleChange("busyness", e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-orange-500 bg-neutral-50 font-bold outline-none"
              >
                <option value="Light">Light (Lots of free time)</option>
                <option value="Average">Average (Standard 9-5/Classes)</option>
                <option value="Very Busy">Very Busy (Working & Studying)</option>
              </select>
            </div>
          </div>

          {/* Study Days */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Select your Active Study Days</label>
            <div className="flex flex-wrap gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                const isSelected = (preferences.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      const currentDays = preferences.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                      const newDays = isSelected ? currentDays.filter((d: string) => d !== day) : [...currentDays, day];
                      setPreferences({...preferences, study_days: newDays});
                    }}
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
          </div>
"""
    
    # We strip out the old UI for username and profession. Wait, profession is still needed.
    # The old `parts[1]` contained the inputs. Let's just find the `onClick={handleSubmit}` button.
    after_submit = parts[1][parts[1].find('<button \n            onClick={handleSubmit}'):]
    
    content = code_before_final_return + new_step_7 + after_submit

# Fix the handleSubmit to include new fields
save_block_old = """      const { error } = await supabase.from("profiles").upsert({
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
      });"""

save_block_new = """      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        username: preferences.username,
        profession: preferences.profession,
        daily_study_goal_hours: parseFloat(preferences.daily_study_goal_hours || "2"),
        busyness: preferences.busyness || "Average",
        study_days: preferences.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        quiz_preference: preferences.quiz_preference,
        note_length_preference: preferences.note_length_preference,
        mnemonic_preference: preferences.mnemonic_preference,
        primary_learning_goal: goals.length > 0 ? goals.join(", ") : "General",
        is_onboarded: true,
        updated_at: new Date().toISOString()
      });"""

content = content.replace(save_block_old, save_block_new)

with open('src/components/OnboardingModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
