const fs = require('fs');
let code = fs.readFileSync('src/app/review/flashcards/page.tsx', 'utf8');

code = code.replace(
  '<FlashcardActions \n              flashcards={deckCards} \n              defaultTitle={selectedTopics.length === 1 ? \\${selectedTopics[0]} Flashcards\\ : "Combined Flashcards Deck"} \n            />',
  '<FlashcardActions \n              flashcards={deckCards} \n              defaultTitle={selectedTopics.length === 1 ? \\${selectedTopics[0]} Flashcards\\ : "Combined Flashcards Deck"} \n              onSaved={(deck) => setSavedDecks([deck, ...savedDecks])}\n            />'
);

fs.writeFileSync('src/app/review/flashcards/page.tsx', code);
