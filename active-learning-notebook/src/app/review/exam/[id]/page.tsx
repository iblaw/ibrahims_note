import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PenTool, ArrowLeft } from "lucide-react";
import QuizSession from "@/app/notes/[id]/quiz/QuizSession";

export default async function SharedExamPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: examNote, error } = await supabase
    .from("notes")
    .select("title, content, course_topic")
    .eq("id", id)
    .single();

  if (error || !examNote || !["SHARED_EXAM", "GRAND_EXAM"].includes(examNote.course_topic)) {
    notFound();
  }

  let quizzes = [];
  try {
    quizzes = JSON.parse(examNote.content);
  } catch (err) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href={user ? "/review/exam" : "/"} className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} />
          {user ? "Back to Setup" : "Back to Home"}
        </Link>
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold flex items-center gap-2"><PenTool className="text-orange-500"/> {examNote.title || "Shared Grand Exam"}</h1>
        <div className="font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-full flex items-center gap-2">
          {quizzes.length} Questions
        </div>
      </div>
      <QuizSession quizzes={quizzes} isGuest={!user} />
    </div>
  );
}