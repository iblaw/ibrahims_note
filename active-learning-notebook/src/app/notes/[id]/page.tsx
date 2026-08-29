import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import NoteReaderContainer from "@/components/NoteReaderContainer";
import QuickAssignDropdown from "@/components/QuickAssignDropdown";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Edit2, Copy, BrainCircuit } from "lucide-react";
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
    .eq("note_id", id);

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
      <div className="flex items-center justify-between mb-8">
        <Link href={isOwner ? "/archive" : "/community"} className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} />
          Back to {isOwner ? "Archive" : "Community"}
        </Link>
        <div className="flex items-center gap-2">
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
        <h1 className="text-5xl font-extrabold text-neutral-900 tracking-tight">
          {note.title}
        </h1>
        <div className="flex items-center gap-2 text-neutral-500 font-bold">
          <CalendarDays size={18} />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="bubbly-card p-8 sm:p-12 md:px-16 mb-12">
        {isOwner && (
          <div className="mb-8 border-b-2 border-neutral-100 pb-8">
            <QuickAssignDropdown noteId={id} currentTopic={note.course_topic} />
          </div>
        )}
        <NoteReaderContainer mdxSource={mdxSource} />
      </div>

      {flashcards && flashcards.length > 0 && (
        <div className="bubbly-card p-8 sm:p-12 md:px-16 border-orange-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-100 text-orange-500 p-3 rounded-2xl">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-800">Attached Flashcards</h2>
              <p className="text-neutral-500 font-medium">{flashcards.length} cards generated from this note</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {flashcards.map((fc, i) => (
              <div key={fc.id} className="bg-neutral-50 border-2 border-neutral-100 rounded-2xl p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-bold text-neutral-400 bg-white px-2 py-1 rounded-lg border border-neutral-200">
                  #{i + 1}
                </span>
                <div className="mb-4">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Front</span>
                  <p className="font-bold text-neutral-800">{fc.front}</p>
                </div>
                <div className="pt-4 border-t-2 border-neutral-200 border-dashed">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Back</span>
                  <p className="font-medium text-neutral-600">{fc.back}</p>
                </div>
              </div>
            ))}
          </div>

          {!isOwner && (
            <div className="mt-8 text-center bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <p className="text-orange-800 font-bold mb-4">Want to study these flashcards with Active Recall?</p>
              <CloneToVaultButton note={note} flashcards={flashcards} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
