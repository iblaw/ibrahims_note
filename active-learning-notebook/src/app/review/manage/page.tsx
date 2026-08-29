"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { BrainCircuit, Loader2, ArrowLeft, Trash2, Edit2, Check, X, Plus } from "lucide-react";
import Link from "next/link";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

import { Suspense } from "react";

// (Keep all the code logic in an inner component)
function ManageDeckContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";
  const router = useRouter();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  // New Card State
  const [isAdding, setIsAdding] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    if (topic) fetchCards();
  }, [topic]);

  const fetchCards = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We fetch cards where topic matches, OR notes.title matches (legacy format)
    const { data } = await supabase
      .from("flashcards")
      .select(`*, notes ( title )`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const filtered = data.filter((c: any) => (c.topic || c.notes?.title || "General") === topic);
      setCards(filtered);
    }
    setLoading(false);
  };

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editFront.trim() || !editBack.trim()) return;
    await supabase.from("flashcards").update({ front: editFront, back: editBack }).eq("id", id);
    setCards(cards.map(c => c.id === id ? { ...c, front: editFront, back: editBack } : c));
    setEditingId(null);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Delete this flashcard?")) return;
    await supabase.from("flashcards").delete().eq("id", id);
    setCards(cards.filter(c => c.id !== id));
  };

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    setSavingNew(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.from("flashcards").insert([{
      user_id: user?.id,
      topic,
      front: newFront.trim(),
      back: newBack.trim(),
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      next_review_date: new Date().toISOString()
    }]).select().single();

    if (!error && data) {
      setCards([data, ...cards]);
      setNewFront("");
      setNewBack("");
      setIsAdding(false);
    }
    setSavingNew(false);
  };

  const handleDeleteDeck = async () => {
    if (!confirm(`Are you absolutely sure you want to delete the entire '${topic}' deck and ALL its flashcards? This cannot be undone.`)) return;
    
    const ids = cards.map(c => c.id);
    if (ids.length > 0) {
      await supabase.from("flashcards").delete().in("id", ids);
    }
    router.push("/review");
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-neutral-400" size={48} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="mb-4 flex justify-between items-center">
        <Link href="/review" className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Review Hub
        </Link>
        <button 
          onClick={handleDeleteDeck}
          className="text-red-500 hover:text-red-600 font-bold flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 size={18} /> Delete Entire Deck
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="bg-orange-100 text-orange-500 p-4 rounded-2xl">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            {topic}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Manage {cards.length} flashcards in this deck
          </p>
        </div>
      </div>

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 p-6 rounded-2xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex justify-center items-center gap-2"
        >
          <Plus size={20} /> Add New Card to Deck
        </button>
      ) : (
        <div className="modern-card p-6 space-y-4 border-orange-200">
          <h3 className="font-bold text-orange-600">Create New Flashcard</h3>
          <div>
            <label className="block text-xs font-bold mb-1 text-neutral-500">Front (Question)</label>
            <textarea 
              value={newFront} 
              onChange={e => setNewFront(e.target.value)} 
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-orange-500" 
              rows={2} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-neutral-500">Back (Answer)</label>
            <textarea 
              value={newBack} 
              onChange={e => setNewBack(e.target.value)} 
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-orange-500" 
              rows={2} 
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-500 font-bold hover:bg-neutral-100 rounded-lg">
              Cancel
            </button>
            <button 
              onClick={handleAddCard}
              disabled={savingNew || !newFront.trim() || !newBack.trim()}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {savingNew ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {cards.map((fc, i) => (
          <div key={fc.id} className="modern-card bg-white dark:bg-[#34302d] border-2 border-neutral-200 dark:border-neutral-700 p-6 relative group">
            <span className="absolute top-4 right-4 text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
              #{cards.length - i}
            </span>
            
            {editingId === fc.id ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-orange-500 uppercase block mb-1">Front</label>
                  <textarea 
                    value={editFront}
                    onChange={e => setEditFront(e.target.value)}
                    className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-transparent"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase block mb-1">Back</label>
                  <textarea 
                    value={editBack}
                    onChange={e => setEditBack(e.target.value)}
                    className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-transparent"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={cancelEdit} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                    <X size={16} />
                  </button>
                  <button onClick={() => saveEdit(fc.id)} className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-lg">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 pr-8">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Front</span>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">{fc.front}</p>
                </div>
                <div className="pt-4 border-t-2 border-neutral-100 dark:border-neutral-700 border-dashed">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Back</span>
                  <p className="font-medium text-neutral-600 dark:text-neutral-400">{fc.back}</p>
                </div>
                
                <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => startEdit(fc)} className="p-1.5 text-neutral-500 hover:text-neutral-700 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteCard(fc.id)} className="p-1.5 text-red-500 hover:text-red-700 bg-white dark:bg-neutral-800 shadow-sm border border-red-100 dark:border-red-900/30 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManageDeckPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="animate-spin text-neutral-400" size={48} /></div>}>
      <ManageDeckContent />
    </Suspense>
  );
}
