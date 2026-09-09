import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to fetch the profile!
if "const [profile, setProfile]" not in content:
    content = content.replace(
        "const [userName, setUserName] = useState(\"\");",
        "const [userName, setUserName] = useState(\"\");\n  const [profile, setProfile] = useState<any>(null);"
    )

if "const { data: profileData }" not in content:
    # Add profile fetch to fetchDashboardData
    fetch_block = """    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
    
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);"""
    
    content = re.sub(r'const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\s+if \(!user\) return;\s+setUserName\([^)]+\);', fetch_block, content)


# Now fix the timetable call and burnout warning
# Old: const timetable = generateMasterTimetable(scheduleCourses);
# New: const timetable = generateMasterTimetable(scheduleCourses, profileData);

content = content.replace("const timetable = generateMasterTimetable(scheduleCourses);", "const timetable = generateMasterTimetable(scheduleCourses, profileData);")

# Update Burnout logic
# Instead of tracking allowed vs required WEEKLY hours from the schedule, we check DAILY hours.
burnout_old = """        if (totalRequiredHoursWeekly > totalAllowedHoursWeekly) {
          const dismissedHoursStr = localStorage.getItem('dismissedBurnoutHours');
          const isHidden = dismissedHoursStr && totalRequiredHoursWeekly <= parseFloat(dismissedHoursStr) + 0.1;
          
          if (!isHidden) {
            setBurnoutWarning({
              active: true,
              required: Math.round(totalRequiredHoursWeekly),
              allowed: totalAllowedHoursWeekly
            });
          }
        }"""

# New burnout logic:
# Total required minutes = remainingMinutes
# Target Date - Now = Days Remaining. 
# Filter out skipped days from Days Remaining to get Active Days.
# Daily Required Hours = (remainingMinutes / 60) / Active Days.
# If Daily Required Hours > Profile Daily Goal -> Warning.
burnout_new = """        // NEW BURNOUT CALCULATION
        let totalRequiredMinutes = 0;
        let earliestTargetDate = new Date(8640000000000000); // Max date
        
        schedulesData.forEach(schedule => {
          const scheduleCourses = coursesData.filter((c: any) => schedule.course_ids.includes(c.id));
          scheduleCourses.forEach((course: any) => {
            course.syllabus?.modules?.forEach((m: any) => {
              m.topics?.forEach((t: any) => {
                if (!t.completed) totalRequiredMinutes += t.estimatedMinutes || 60;
              });
            });
          });
          const tDate = new Date(schedule.target_date);
          if (tDate < earliestTargetDate) earliestTargetDate = tDate;
        });

        if (totalRequiredMinutes > 0 && earliestTargetDate.getTime() !== 8640000000000000) {
          const now = new Date();
          const daysRemaining = Math.max(1, Math.ceil((earliestTargetDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
          
          // Calculate active days
          let activeDays = 0;
          const studyDays = profileData?.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          
          for (let i = 0; i < daysRemaining; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            if (studyDays.includes(dayNames[d.getDay()])) {
              activeDays++;
            }
          }
          
          // If they skipped every single day before the deadline, activeDays is 0. Give them at least 1 to avoid infinity.
          activeDays = Math.max(1, activeDays);
          
          const dailyRequiredHours = (totalRequiredMinutes / 60) / activeDays;
          const dailyGoalHours = profileData?.daily_study_goal_hours || 2;
          
          if (dailyRequiredHours > dailyGoalHours) {
            const dismissedStr = localStorage.getItem('dismissedBurnoutDailyHours');
            const isHidden = dismissedStr && dailyRequiredHours <= parseFloat(dismissedStr) + 0.1;
            
            if (!isHidden) {
              // Calculate suggested new date
              const suggestedActiveDaysNeeded = Math.ceil((totalRequiredMinutes / 60) / dailyGoalHours);
              // Approximate calendar days needed by assuming the same ratio of active vs skipped days
              const ratio = studyDays.length / 7;
              const calendarDaysNeeded = Math.ceil(suggestedActiveDaysNeeded / ratio);
              const suggestedDate = new Date();
              suggestedDate.setDate(suggestedDate.getDate() + calendarDaysNeeded);
              
              setBurnoutWarning({
                active: true,
                required: Math.round(dailyRequiredHours * 10) / 10,
                allowed: dailyGoalHours,
                suggestedDate: suggestedDate.toISOString().split('T')[0]
              });
            }
          }
        }"""

# Replace the giant scheduling block inside fetchDashboardData
old_block_regex = r"let totalRequiredHoursWeekly = 0;.*?if \(totalRequiredHoursWeekly > totalAllowedHoursWeekly\) \{.*?\n\s+\}\n\s+\}\n\s+\}"
content = re.sub(old_block_regex, burnout_new, content, flags=re.DOTALL)

# Update the burnout UI to use the new suggestedDate logic
ui_old = """                  <button
                    onClick={() => {
                      const mainSchedule = schedules[0];
                      setEditingSchedule({ ...mainSchedule, weekly_hours: burnoutWarning.required });
                    }}
                    className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Update commitment to {burnoutWarning.required} hours
                  </button>"""

ui_new = """                  <button
                    onClick={() => {
                      const mainSchedule = schedules[0];
                      setEditingSchedule({ ...mainSchedule, target_date: burnoutWarning.suggestedDate });
                    }}
                    className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Extend Deadline to {(burnoutWarning as any).suggestedDate}
                  </button>"""

content = content.replace(ui_old, ui_new)
content = content.replace("localStorage.setItem('dismissedBurnoutHours'", "localStorage.setItem('dismissedBurnoutDailyHours'")

content = content.replace(
  "You committed to <strong>{burnoutWarning.allowed} hours/week</strong> of study, but to hit your deadlines you need to study <strong>{burnoutWarning.required} hours/week</strong>",
  "Your daily goal is <strong>{burnoutWarning.allowed} hours</strong> on active study days, but to hit your deadlines you need to study <strong>{burnoutWarning.required} hours/day</strong>"
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
