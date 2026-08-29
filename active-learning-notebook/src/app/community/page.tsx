"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, FileText, UploadCloud, Link as LinkIcon, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";

interface SharedFile {
  id: string;
  title: string;
  file_url: string;
  topic: string;
  created_at: string;
}

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState<"notes" | "courses" | "files" | "requests">("notes");
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [publicNotes, setPublicNotes] = useState<any[]>([]);
  const [publicCourses, setPublicCourses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // File Form state
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Request Form state
  const [reqUsername, setReqUsername] = useState("");
  const [reqContent, setReqContent] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchUser();

    const channel = supabase
      .channel("public:community_requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_requests" },
        (payload) => {
          setRequests((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      // Set default username if they have one in metadata
      if (user.user_metadata?.username) {
        setReqUsername(user.user_metadata.username);
      } else {
        // Fallback to email prefix if no username
        setReqUsername(user.email?.split("@")[0] || "Anonymous");
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
      
    const { data: filesData } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });
      
    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("is_public", true)
      .order("upvotes", { ascending: false }); 
      
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_public", true)
      .order("upvotes", { ascending: false }); 

    const { data: reqData } = await supabase
      .from("community_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (filesData) setFiles(filesData);
    if (notesData) setPublicNotes(notesData);
    if (coursesData) setPublicCourses(coursesData);
    if (reqData) setRequests(reqData);
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
      fetchData();
    } else {
      alert("Failed to share file.");
    }
    setSubmitting(false);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqUsername || !reqContent) return;
    setReqSubmitting(true);
    
    const { error } = await supabase
      .from("community_requests")
      .insert([{ username: reqUsername, content: reqContent }]);
      
    if (!error) {
      setReqContent("");
      fetchData();
    } else {
      alert("Failed to post request.");
    }
    setReqSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3 mb-2">
            <Users className="text-neutral-500" size={36} />
            Community Hub
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Discover study materials, highly-rated notes, and ask for help.
          </p>
        </div>
        
        {activeTab === "files" && (
          <button 
            onClick={() => setShowModal(true)}
            className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center gap-2 justify-center w-fit shadow-neutral-300 dark:shadow-neutral-900"
          >
            <UploadCloud size={20} />
            Share Material
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === "notes" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          <BookOpen size={18} /> Public Notes
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === "courses" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          <BookOpen size={18} /> Public Courses
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === "files" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          <FileText size={18} /> Shared Files
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === "requests" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          <Users size={18} /> Requests Board
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-neutral-400" size={48} />
        </div>
      ) : activeTab === "notes" ? (
        publicNotes.length === 0 ? (
          <div className="text-center py-24 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
            <BookOpen size={48} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">
              No public notes yet
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Be the first to share your notes with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {publicNotes.map((note) => (
              <Link 
                key={note.id} 
                href={`/notes/${note.id}`}
                className="modern-card group flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors p-6 bg-white dark:bg-[#34302d]"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-xs font-bold text-neutral-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  <VoteButtons id={note.id} table="notes" initialUp={note.upvotes} initialDown={note.downvotes} />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : activeTab === "courses" ? (
        publicCourses.length === 0 ? (
          <div className="text-center py-24 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
            <BookOpen size={48} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">No courses published yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Be the first to share your course outline with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicCourses.map((course) => (
              <div 
                key={course.id} 
                className="block modern-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6 hover:border-neutral-400 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 pr-4">{course.title}</h3>
                  <VoteButtons 
                    id={course.id} 
                    table="courses"
                    initialUp={course.upvotes || 0} 
                    initialDown={course.downvotes || 0} 
                  />
                </div>
                {course.group_name && (
                  <p className="text-sm font-bold text-neutral-500 mb-4">Course: {course.group_name}</p>
                )}
                <Link 
                  href={`/courses/${course.id}`} 
                  className="mt-4 block text-center text-sm font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  View Outline
                </Link>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "files" ? (
        files.length === 0 ? (
          <div className="text-center py-24 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
            <FileText size={48} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">No materials shared yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Be the first to share a useful PDF!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <a 
                key={file.id} 
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="modern-card group flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors p-6 bg-white dark:bg-[#34302d]"
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
        )
      ) : (
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Post a Request</h3>
            <form onSubmit={handleRequestSubmit} className="flex flex-col sm:flex-row gap-4">
              <input 
                required
                type="text" 
                value={reqContent}
                onChange={e => setReqContent(e.target.value)}
                placeholder="E.g. Looking for Physics 101 Module 2 past questions..."
                className="p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 outline-none font-bold bg-transparent w-full flex-grow"
              />
              <button 
                type="submit"
                disabled={reqSubmitting}
                className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 shrink-0"
              >
                {reqSubmitting ? "Posting..." : "Post"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-neutral-50 dark:bg-[#2a2624] border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-lg mb-1">{req.content}</h4>
                  <p className="text-sm font-medium text-neutral-500">Requested by <strong className="text-neutral-700 dark:text-neutral-400">{req.username}</strong> • {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => setActiveTab("files")} 
                  className="text-sm font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full h-fit hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  I have this! &rarr;
                </button>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-12 text-neutral-500 font-medium">No requests yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#34302d] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">Share Material</h2>
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
                  className="modern-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 py-2"
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
