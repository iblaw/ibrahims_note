"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Library, Search, Loader2, ArrowRight, Share } from "lucide-react";
import Link from "next/link";
import DeleteNoteButton from "@/components/DeleteNoteButton";

export default function MyNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  };

  const publishNote = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault(); // Stop Link navigation
    await supabase.from("notes").update({ is_public: true }).eq("id", noteId);
    setNotes(notes.map(n => n.id === noteId ? { ...n, is_public: true } : n));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3 mb-2">
            <Library className="text-neutral-500" size={36} />
            My Notes
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Search your personal vault of AI-generated study materials.
          </p>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text"
          placeholder="Search topics, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 pl-12 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none font-bold text-lg bg-white dark:bg-[#3a3532]"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-neutral-400" size={48} />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-24 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
          <img src="/mascot/lumen_empty.jpg" alt="Lumen confused" className="w-48 h-48 mx-auto object-contain mb-4 rounded-3xl mix-blend-multiply dark:mix-blend-lighten" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">
            {search ? "No notes found matching your search" : "Your vault is empty"}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-8">
            Create your first AI-powered study note to fill up your vault.
          </p>
          <Link href="/notes/new" className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900">
            Create Note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Link 
              key={note.id} 
              href={`/notes/${note.id}`}
              className="bubbly-card group flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors p-6 bg-white dark:bg-[#34302d]"
            >
              <div className="relative">
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DeleteNoteButton noteId={note.id} />
                </div>
                <h3 className="text-xl font-bold mb-2 pr-12 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
                  {note.title}
                </h3>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm font-bold text-neutral-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                
                {note.is_public ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Public
                  </span>
                ) : (
                  <button 
                    onClick={(e) => publishNote(e, note.id)}
                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors z-10"
                  >
                    <Share size={12} /> Publish
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
