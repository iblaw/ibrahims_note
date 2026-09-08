const fs = require('fs');

let examActions = fs.readFileSync('src/components/ExamActions.tsx', 'utf8');
examActions = examActions.replace(
  'export default function ExamActions({ quizzes, defaultTitle = "Grand Exam" }: { quizzes: any[], defaultTitle?: string }) {',
  'export default function ExamActions({ quizzes, defaultTitle = "Grand Exam", onSaved }: { quizzes: any[], defaultTitle?: string, onSaved?: (exam: any) => void }) {'
);
examActions = examActions.replace(
  'if (error) throw error;',
  'if (error) throw error;\n\n      if (onSaved) onSaved(data);'
);
fs.writeFileSync('src/components/ExamActions.tsx', examActions);

let examPage = fs.readFileSync('src/app/review/exam/page.tsx', 'utf8');
examPage = examPage.replace(
  '<ExamActions \n              quizzes={examQuestions} \n              defaultTitle={selectedTopics.length === 1 ? ${selectedTopics[0]} Exam : "Combined Grand Exam"} \n            />',
  '<ExamActions \n              quizzes={examQuestions} \n              defaultTitle={selectedTopics.length === 1 ? ${selectedTopics[0]} Exam : "Combined Grand Exam"} \n              onSaved={(exam) => setSavedExams(prev => [exam, ...prev])}\n            />'
);
fs.writeFileSync('src/app/review/exam/page.tsx', examPage);
