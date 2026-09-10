import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = streamText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Note Generation AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate note' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
