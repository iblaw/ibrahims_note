import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import NoteReaderContainer from "@/components/NoteReaderContainer";
import QuickAssignDropdown from "@/components/QuickAssignDropdown";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Edit2, Copy, BrainCircuit, Play, PenTool } from "lucide-react";
import PublishButton from "@/components/PublishButton";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import CloneToVaultButton from "@/components/CloneToVaultButton";
import { createClient } from "@/lib/supabase/server";

export default async function ViewNote({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !note) {
    notFound();
  }

  const isOwner = user?.id === note.user_id;

  // Fetch associated flashcards
  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("note_id", id)
    .order("created_at", { ascending: true });

  // Serialize the MDX content for the client component
  const mdxSource = await serialize(note.content, {
    parseFrontmatter: true,
  });

  const dateStr = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link href={isOwner ? "/archive" : "/community"} className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} />
          Back to {isOwner ? "Archive" : "Community"}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {isOwner ? (
            <>
              <Link 
                href={`/notes/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                <Edit2 size={16} /> Edit
              </Link>
              <DeleteNoteButton noteId={id} />
              <PublishButton noteId={id} isAlreadyPublic={note.is_public} />
            </>
          ) : (
            <CloneToVaultButton note={note} flashcards={flashcards || []} />
          )}
        </div>
      </div>

      <div className="mb-12 space-y-4">
        {!isOwner && note.is_public && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-sm rounded-full mb-4">
            <Copy size={14} /> Community Note
          </div>
        )}
        <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">
          {note.title}
        </h1>
        <div className="flex items-center gap-2 text-neutral-500 font-bold">
          <CalendarDays size={18} />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="modern-card p-4 sm:p-8 md:px-16 mb-12">
        {isOwner && (
          <div className="mb-8 border-b-2 border-neutral-100 pb-8">
            <QuickAssignDropdown noteId={id} currentTopic={note.course_topic} />
          </div>
        )}
        <NoteReaderContainer 
          mdxSource={mdxSource} 
          noteId={id} 
          courseId={note.course_id} 
          topicTitle={note.course_topic} 
          isOwner={isOwner} 
        />
      </div>
      
      {/* Action Buttons: Quiz and Flashcards */}
      {isOwner && (
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link 
            href={`/notes/${id}/quiz`}
            className="flex-1 modern-button bg-orange-500 text-white hover:bg-orange-600 py-4 text-lg shadow-orange-500/30"
          >
            <PenTool size={24} />
            Quiz Now
          </Link>
          <Link 
            href={`/review?topic=${encodeURIComponent(note.course_topic || note.title)}`}
            className="flex-1 modern-button bg-blue-600 text-white hover:bg-blue-700 py-4 text-lg shadow-blue-600/30"
          >
            <Play size={24} />
            Study Flashcards
          </Link>
        </div>
      )}

      {!isOwner && flashcards && flashcards.length > 0 && (
        <div className="mt-8 text-center bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <p className="text-orange-800 font-bold mb-4">Want to study these flashcards with Active Recall?</p>
          <CloneToVaultButton note={note} flashcards={flashcards} />
        </div>
      )}
    </div>
  );
}
