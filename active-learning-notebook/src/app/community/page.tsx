"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, FileText, UploadCloud, Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface SharedFile {
  id: string;
  title: string;
  file_url: string;
  topic: string;
  created_at: string;
}

export default function CommunityHub() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setFiles(data);
    setLoading(false);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic || !url) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("files")
      .insert([{ title, topic, file_url: url }]);

    if (!error) {
      setShowModal(false);
      setTitle("");
      setTopic("");
      setUrl("");
      fetchFiles();
    } else {
      alert("Failed to share file.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3 mb-2">
            <Users className="text-neutral-500" size={36} />
            Community Hub
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Discover and share raw study materials, PDFs, and past questions.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center gap-2 justify-center w-fit shadow-neutral-300 dark:shadow-neutral-900"
        >
          <UploadCloud size={20} />
          Share Material
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-neutral-400" size={48} />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-24 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
          <FileText size={48} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">
            No materials shared yet
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto mb-8">
            Be the first to share a useful PDF, slide deck, or past question bank with the community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <a 
              key={file.id} 
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bubbly-card group flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <div>
                <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold text-xs px-3 py-1 rounded-full w-fit mb-4">
                  {file.topic}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
                  {file.title}
                </h3>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-neutral-400 mt-6 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                <span className="flex items-center gap-1"><LinkIcon size={16} /> Open Link</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#34302d] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">Share Material</h2>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 2023 Biology Past Questions"
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Topic</label>
                <input 
                  required
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Biology"
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">URL (Drive, Dropbox, etc.)</label>
                <input 
                  required
                  type="url" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 outline-none bg-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 py-2"
                >
                  {submitting ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
