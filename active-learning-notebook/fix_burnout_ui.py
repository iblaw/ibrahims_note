import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update BurnoutWarning state to include busyness
content = content.replace(
    "suggestedDate?: string } | null>(null);",
    "suggestedDate?: string, busyness?: string } | null>(null);"
)

# 2. Update setBurnoutWarning call
old_set = """            setBurnoutWarning({
              active: true,
              required: Math.round(dailyRequiredHours * 10) / 10,
              allowed: dailyGoalHours,
              suggestedDate: suggestedDate.toISOString().split('T')[0]
            });"""

new_set = """            setBurnoutWarning({
              active: true,
              required: Math.round(dailyRequiredHours * 10) / 10,
              allowed: dailyGoalHours,
              suggestedDate: suggestedDate.toISOString().split('T')[0],
              busyness: profileData?.busyness || "Average"
            });"""
content = content.replace(old_set, new_set)

# 3. Update the UI for Burnout Warning
old_ui = """                  <p className="text-red-700 dark:text-red-400 font-medium">
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
                    )}"""

new_ui = """                  <p className="text-red-700 dark:text-red-400 font-medium">
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
                    )}"""

content = content.replace(old_ui, new_ui)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
