"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SavedExamCard({ exam, onRemove, baseUrl = "/review/exam" }: { exam: any, onRemove: (id: string) => void, baseUrl?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(exam.title || "Untitled Exam");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(exam.title || "Untitled Exam");

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update({ title: editTitle })
        .eq("id", exam.id);
      
      if (error) throw error;
      setCurrentTitle(editTitle);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update exam title", err);
      alert("Failed to update exam title.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", exam.id);
      
      if (error) throw error;
      onRemove(exam.id);
    } catch (err) {
      console.error("Failed to delete exam", err);
      alert("Failed to delete exam.");
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="p-6 rounded-2xl border-2 border-neutral-100 bg-neutral-50 flex items-center justify-center min-h-[140px]">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border-2 border-neutral-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all bg-white group flex flex-col justify-between">
      <div>
        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full p-2 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 font-bold text-lg outline-none"
              autoFocus
            />
          </div>
        ) : (
          <h3 className="font-bold text-lg text-neutral-800 transition-colors">{currentTitle}</h3>
        )}
        
        <p className="text-sm text-neutral-500 mt-1">
          {new Date(exam.created_at).toLocaleDateString()} - {exam.is_public ? "Public" : "Private"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsEditing(false); setEditTitle(currentTitle); }}
              className="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold text-sm rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-neutral-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
              title="Edit Title"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Delete Exam"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {!isEditing && (
          <Link 
            href={`${baseUrl}/${exam.id}`}
            className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            Open <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
