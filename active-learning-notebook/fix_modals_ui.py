import re

for filename in ['src/components/CreateScheduleModal.tsx', 'src/components/EditScheduleModal.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace label
    content = content.replace("Weekly Hours", "Daily Goal (Hours)")
    
    # Change default value from 10 to 2
    content = content.replace("useState(10)", "useState(2)")
    
    # Add a small note
    note = '<p className="text-xs text-neutral-500 font-bold col-span-2">This overrides your Profile setting for this schedule.</p>'
    if note not in content:
        content = content.replace(
            '<input type="number"',
            note + '\n<input type="number"'
        )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
