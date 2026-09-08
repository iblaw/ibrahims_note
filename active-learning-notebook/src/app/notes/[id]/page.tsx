import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import NoteReaderContainer from "@/components/NoteReaderContainer";
import QuickAssignDropdown from "@/components/QuickAssignDropdown";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Edit2, Copy, BrainCircuit, Play, PenTool } from "lucide-react";
import PublishButton from "@/components/PublishButton";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import CloneToVaultButton from "@/components/CloneToVaultButton";
import PublicUpsellPrompt from "@/components/PublicUpsellPrompt";
import ShareButton from "@/components/ShareButton";
import { createClient } from "@/lib/supabase/server";

export default async function ViewNote({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile to get quiz preference
  let hideQuizzes = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("quiz_preference").eq("id", user.id).single();
    if (profile?.quiz_preference === "at_end") {
      hideQuizzes = true;
    }
  } else {
    // Guest users default to quizzes at the end for a better reading experience
    hideQuizzes = true;
  }

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
  let mdxSource: any = null;
  let mdxError: string | null = null;
  let rawContent = note.content || "";
  let wasAutoFixed = false;
  
  try {
    mdxSource = await serialize(rawContent, {
      parseFrontmatter: true,
    });
  } catch (err: any) {
    console.warn("Initial MDX Compilation failed. Attempting auto-fix...", err.message);
    
    // Auto-fix 1: Unescaped less-than signs before a number (e.g. `<5`)
    let sanitizedContent = rawContent.replace(/<(\d)/g, '&lt;$1');
    
    // Auto-fix 2: Unescaped less-than signs before a space (e.g. `< `)
    sanitizedContent = sanitizedContent.replace(/<(\s)/g, '&lt;$1');

    try {
      // Try compiling again with the sanitized content
      mdxSource = await serialize(sanitizedContent, {
        parseFrontmatter: true,
      });
      wasAutoFixed = true;
    } catch (err2: any) {
      console.error("MDX Compilation Error after auto-fix:", err2);
      mdxError = err2.message || "Failed to parse markdown";
      
      const errorMessage = `
> [!WARNING]
> **MDX Rendering Failed**
> 
> The AI-generated markdown contains invalid syntax (such as an unclosed HTML tag or an unescaped \`<\` character) and could not be rendered.
> 
> **How to fix this:**
> 1. Click the **Edit** button above.
> 2. Look for any \`<\` signs that are not part of a valid HTML tag (e.g., \`<Quiz>\` or \`<Flashcard>\`).
> 3. If you find something like \`x < y\`, add spaces around it, or replace the \`<\` with \`&lt;\`.
> 4. Ensure all \`<Quiz>\`, \`<Flashcard>\`, and \`<FeynmanPrompt>\` tags are closed properly.
> 
> **Error Details:**
> \`\`\`
> ${mdxError}
> \`\`\`
`;
      mdxSource = await serialize(errorMessage, { parseFrontmatter: true });
    }
  }

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
              <ShareButton path={`/notes/${id}`} title="Share Note" noteId={id} />
              <DeleteNoteButton noteId={id} />
              <PublishButton noteId={id} isAlreadyPublic={note.is_public} />
            </>
          ) : (
            user && <CloneToVaultButton note={note} flashcards={flashcards || []} />
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
          hideQuizzes={hideQuizzes}
        />
      </div>
      


      {!isOwner && user && flashcards && flashcards.length > 0 && (
        <div className="mt-8 text-center bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <p className="text-orange-800 font-bold mb-4">Want to study these flashcards with Active Recall?</p>
          <CloneToVaultButton note={note} flashcards={flashcards} />
        </div>
      )}

      {!user && (
        <PublicUpsellPrompt />
      )}
    </div>
  );
}
