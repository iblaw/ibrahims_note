import re

with open('src/app/notes/new/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
content = content.replace('const [selectedTopic, setSelectedTopic] = useState<string>("");', 'const [selectedTopics, setSelectedTopics] = useState<string[]>([]);')

# 2. LocalStorage
content = content.replace('if (parsed.selectedTopic) setSelectedTopic(parsed.selectedTopic);', 'if (parsed.selectedTopics) setSelectedTopics(parsed.selectedTopics);')
content = content.replace('const draft = { title, content, selectedCourseId, selectedTopic };', 'const draft = { title, content, selectedCourseId, selectedTopics };')
content = content.replace('}, [title, content, selectedCourseId, selectedTopic]);', '}, [title, content, selectedCourseId, selectedTopics]);')

# 3. Search Params
content = content.replace('setSelectedTopic(topicParam);', 'setSelectedTopics([topicParam]);')

# 4. Prompt
content = content.replace('if (selectedTopic) {', 'if (selectedTopics.length > 0) {')
content = content.replace('\"\"', '\"\"')
content = content.replace('this topic', 'these topics')

# 5. Save Note
content = content.replace('course_topic: selectedTopic || null', 'course_topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null')

# 6. Save Flashcard
content = content.replace('topic: selectedTopic || null,', 'topic: selectedTopics.length > 0 ? JSON.stringify(selectedTopics) : null,')

with open('src/app/notes/new/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
