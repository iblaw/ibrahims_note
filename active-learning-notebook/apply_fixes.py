import re

# 1. Update dashboard/page.tsx
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the dailyGoalHours definition
old_daily_goal = "const dailyGoalHours = profileData?.daily_study_goal_hours || 2;"
new_daily_goal = "const dailyGoalHours = (schedulesData && schedulesData.length > 0 && schedulesData[0].weekly_hours) ? schedulesData[0].weekly_hours : (profileData?.daily_study_goal_hours || 2);"
content = content.replace(old_daily_goal, new_daily_goal)

# Ensure busyness is in the setBurnoutWarning type
if "busyness?: string" not in content:
    content = content.replace("suggestedDate?: string } | null>(null);", "suggestedDate?: string, busyness?: string } | null>(null);")

# Update setBurnoutWarning
set_block_match = re.search(r'setBurnoutWarning\(\{\s*active: true,\s*required: Math\.round\(dailyRequiredHours \* 10\) / 10,\s*allowed: dailyGoalHours,\s*suggestedDate: suggestedDate\.toISOString\(\)\.split\(\'T\'\)\[0\]\s*\}\);', content)
if set_block_match:
    new_set = """setBurnoutWarning({
                active: true,
                required: Math.round(dailyRequiredHours * 10) / 10,
                allowed: dailyGoalHours,
                suggestedDate: suggestedDate.toISOString().split('T')[0],
                busyness: profileData?.busyness || "Average"
              });"""
    content = content.replace(set_block_match.group(0), new_set)

# Replace the UI
ui_regex = r'<p className="text-red-700 dark:text-red-400 font-medium">.*?I understand, don\'t warn me again\s*</button>\s*</div>'
new_ui = """<p className="text-red-700 dark:text-red-400 font-medium">
                    Your daily goal is <strong>{burnoutWarning.allowed} hours</strong> on active study days, but to hit your deadlines you need to study <strong>{burnoutWarning.required} hours/day</strong>. Consider pushing your deadlines back or increasing your daily goal!
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {schedules.length > 0 && burnoutWarning.suggestedDate && (
                      <button
                        onClick={() => {
                          const mainSchedule = schedules[0];
                          setEditingSchedule({ ...mainSchedule, target_date: burnoutWarning.suggestedDate });
                        }}
                        className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                      >
                        Extend Deadline to {new Date(burnoutWarning.suggestedDate).toLocaleDateString()}
                      </button>
                    )}
                    
                    {schedules.length > 0 && burnoutWarning.busyness !== "Very Busy" && (
                      <button
                        onClick={() => {
                          const mainSchedule = schedules[0];
                          const suggestedAdd = burnoutWarning.busyness === "Light" ? 2 : 1;
                          setEditingSchedule({ ...mainSchedule, weekly_hours: burnoutWarning.allowed + suggestedAdd });
                        }}
                        className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                      >
                        Suggest +{burnoutWarning.busyness === "Light" ? 2 : 1}h Daily Goal
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
                  </div>"""

content = re.sub(ui_regex, new_ui, content, flags=re.DOTALL)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update Modals
for filename in ['src/components/CreateScheduleModal.tsx', 'src/components/EditScheduleModal.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        m_content = f.read()
    
    m_content = m_content.replace('<p className="text-xs text-neutral-500 font-bold col-span-2">This overrides your Profile setting for this schedule.</p>\n', '')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(m_content)
