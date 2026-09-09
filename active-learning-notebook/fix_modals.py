import re

for filename in ['src/components/CreateScheduleModal.tsx', 'src/components/EditScheduleModal.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove weeklyHours state
    content = re.sub(r'const \[weeklyHours.*?;\n', '', content)
    
    # Remove weeklyHours from supabase update/insert
    content = re.sub(r'weekly_hours: weeklyHours,\n\s*', '', content)

    # Remove weeklyHours UI block
    ui_block = r'<div(?:(?!\n\n).)*?Weekly Hours(?:(?!\n\n).)*?</div>'
    content = re.sub(ui_block, '', content, flags=re.DOTALL)
    
    # Also just manually replace the UI block by matching the label
    ui_block2 = r'<div>\s*<label.*?Weekly Hours.*?</label>\s*<input.*?weeklyHours.*?>\s*</div>'
    content = re.sub(ui_block2, '', content, flags=re.DOTALL)
    
    # In case the regex didn't catch it
    if "Weekly Hours" in content:
        lines = content.split('\n')
        new_lines = []
        skip = False
        for line in lines:
            if "Weekly Hours" in line and "<label" in line:
                skip = True
                new_lines.pop() # remove the <div> before it
                continue
            if skip and "</div" in line:
                skip = False
                continue
            if not skip:
                new_lines.append(line)
        content = "\n".join(new_lines)

    # Add a note linking to the profile page
    note = """
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-4 rounded-xl mb-4">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Study Preferences</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Lumen will use your <a href="/profile" className="underline font-bold">Profile</a> settings (Daily Goal, Skipped Days) to generate this timetable.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">"""
          
    content = content.replace('<div className="flex justify-end gap-3 pt-4">', note)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
