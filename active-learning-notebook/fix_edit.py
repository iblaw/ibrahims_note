import re

with open('src/app/notes/[id]/edit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
content = content.replace('const [selectedTopic, setSelectedTopic] = useState<string>("");', 'const [selectedTopics, setSelectedTopics] = useState<string[]>([]);')

# 2. LocalStorage
content = content.replace('if (parsed.selectedTopic) setSelectedTopic(parsed.selectedTopic);', 'if (parsed.selectedTopics) setSelectedTopics(parsed.selectedTopics);')
content = content.replace('const draft = { title, content, selectedCourseId, selectedTopic };', 'const draft = { title, content, selectedCourseId, selectedTopics };')
content = content.replace('}, [title, content, selectedCourseId, selectedTopic, id]);', '}, [title, content, selectedCourseId, selectedTopics, id]);')

# 3. Load from DB
content = content.replace('if (note.course_topic) setSelectedTopic(note.course_topic);', '''if (note.course_topic) {
        if (note.course_topic.startsWith('[')) {
          try { setSelectedTopics(JSON.parse(note.course_topic)); } catch { setSelectedTopics([note.course_topic]); }
        } else {
          setSelectedTopics([note.course_topic]);
        }
      }''')

# 4. Save
content = content.replace('course_topic: selectedTopic || null', 'course_topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null')

with open('src/app/notes/[id]/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
