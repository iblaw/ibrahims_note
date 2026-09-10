import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Hello world',
    });
    console.log("Success:", text);
  } catch (err: any) {
    console.error("AI Error:", err.message || err);
  }
}

main();
