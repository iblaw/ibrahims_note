-- Add topic to flashcards table
ALTER TABLE flashcards ADD COLUMN topic TEXT;

-- Update existing flashcards to inherit their note's topic
UPDATE flashcards
SET topic = notes.course_topic
FROM notes
WHERE flashcards.note_id = notes.id AND notes.course_topic IS NOT NULL;
