"use client";
import { useState } from "react";
import { Share2, Check, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ExamActions({ quizzes, defaultTitle = "Grand Exam", onSaved }: { quizzes: any[], defaultTitle?: string, onSaved?: (exam: any) => void }) {
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"save" | "share">("save");
  const [titleInput, setTitleInput] = useState(defaultTitle);

  const triggerModal = (action: "save" | "share") => {
    setModalAction(action);
    setTitleInput(defaultTitle);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    setModalOpen(false);
    const customTitle = titleInput.trim() || defaultTitle;
    const isPublic = modalAction === "share";

    if (isPublic) setSharing(true);
    else setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("notes")
        .insert([{
          title: customTitle,
          content: JSON.stringify(quizzes),
          course_topic: "GRAND_EXAM",
          is_public: isPublic,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (onSaved) onSaved(data);

      if (isPublic) {
        const url = `${window.location.origin}/review/exam/${data.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(`Failed to ${modalAction} exam`, err);
      alert(`Failed to ${modalAction} exam.`);
    }
    
    setSharing(false);
    setSaving(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => triggerModal("save")}
          disabled={saving || sharing}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />} 
          {saving ? "Saving..." : saved ? "Saved!" : "Save Exam"}
        </button>

        <button 
          onClick={() => triggerModal("share")}
          disabled={sharing || saving}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {sharing ? <Loader2 size={16} className="animate-spin" /> : copied ? <Check size={16} /> : <Share2 size={16} />} 
          {sharing ? "Generating Link..." : copied ? "Copied Link!" : "Share Publicly"}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {modalAction === "share" ? <Share2 className="text-indigo-600" /> : <Save className="text-neutral-600" />}
                {modalAction === "share" ? "Share Grand Exam" : "Save Grand Exam"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-neutral-700 mb-2">Exam Title</label>
              <input 
                type="text" 
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmAction()}
                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-indigo-500 bg-neutral-50 font-bold text-lg outline-none transition-colors"
                placeholder="e.g., Biology Midterm Practice"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-xl transition-all ${
                  modalAction === "share" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20" : "bg-neutral-900 hover:bg-neutral-800 shadow-neutral-900/20"
                }`}
              >
                {modalAction === "share" ? "Share & Copy Link" : "Save Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
