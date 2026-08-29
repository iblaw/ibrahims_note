import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import QuizSession from "./QuizSession";

export default async function NoteQuizPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("title, content")
    .eq("id", id)
    .single();

  if (error || !note) {
    notFound();
  }

  // Extract all quizzes from the MDX content
  const quizRegex = /<Quiz\s+question="([^"]+)"\s+options="([^"]+)"\s+answer="([^"]+)"\s*\/?>(?:<\/Quiz>)?/g;
  
  const quizzes = [];
  let match;
  while ((match = quizRegex.exec(note.content)) !== null) {
    quizzes.push({
      question: match[1],
      options: match[2].split("|").map(opt => opt.trim()),
      answer: match[3].trim()
    });
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href={`/notes/${id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} />
          Back to Note
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Mastery Quiz: {note.title}
        </h1>
        <p className="text-lg text-neutral-600 font-medium">
          Test your knowledge on the entire note. {quizzes.length} questions extracted.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="modern-card p-12 text-center border-orange-200">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">No Quizzes Found</h2>
          <p className="text-neutral-500 font-medium">
            This note doesn&apos;t seem to contain any interactive quizzes. Try updating the note content with standard &lt;Quiz&gt; tags.
          </p>
        </div>
      ) : (
        <QuizSession quizzes={quizzes} />
      )}
    </div>
  );
}
