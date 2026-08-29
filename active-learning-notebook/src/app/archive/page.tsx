import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Book, Plus, ArrowRight } from "lucide-react";

export const revalidate = 0; // Disable cache for this page so it always fetches fresh data

export default async function Archive() {
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-2">
            The Archive
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Your personal library of deeply understood concepts.
          </p>
        </div>
        
        <Link 
          href="/notes/new" 
          className="bubbly-button bg-orange-400 text-white flex items-center gap-2 justify-center w-fit shadow-orange-200"
        >
          <Plus size={20} />
          New Note
        </Link>
      </div>

      {(!notes || notes.length === 0) ? (
        <div className="text-center py-24 bg-orange-50/50 dark:bg-orange-950/10 rounded-3xl border-2 border-dashed border-orange-200 dark:border-orange-900/30">
          <Book size={48} className="mx-auto text-orange-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">
            Your archive is empty
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto mb-8">
            Start building your knowledge base by creating your first active learning note.
          </p>
          <Link href="/notes/new" className="text-orange-500 font-bold hover:underline">
            Create Note &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note) => {
            const dateStr = new Date(note.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <Link 
                key={note.id} 
                href={`/notes/${note.id}`}
                className="bubbly-card group flex flex-col justify-between hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-neutral-500 text-sm font-medium mb-6">
                    Created {dateStr}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-neutral-400 group-hover:text-orange-400 transition-colors">
                  <span>Review content</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
