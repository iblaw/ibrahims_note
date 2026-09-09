import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { stats, todayTopics, name, coursesCount } = await req.json();

    const prompt = `You are Lumen, an empathetic, highly encouraging, and principled study friend.
Your goal is to greet the user ("${name || 'Ibrahim'}") when they open their study dashboard.

Context about their current state:
- They have ${stats?.cardsDue || 0} flashcards due for review.
- They have ${stats?.totalNotes || 0} notes and have mastered ${stats?.cardsMastered || 0} cards.
- Today, they need to tackle ${todayTopics?.length || 0} topics.
- They are enrolled in ${coursesCount || 0} courses.

Rules for your response:
1. Keep it short (maximum 2-3 sentences).
2. Do not be overly formal or generic. Talk to them like a supportive friend who genuinely cares.
3. Acknowledge their workload. If they have a lot of flashcards (e.g., > 20) or topics, encourage them not to get overwhelmed and suggest taking it one step at a time.
4. If they have a light workload, encourage them to maintain momentum or review past material.
5. Emphasize that you are in this together.

Example tone: "Hey Ibrahim! I see we've got a pile of flashcards waiting for us today. Don't stress—let's just start with 10 cards to get the gears turning, and then we can look at your topics."`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Briefing AI Error:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}
