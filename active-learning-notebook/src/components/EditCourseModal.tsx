import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, Folder, Calendar, Code, AlertCircle } from "lucide-react";
import ModalPortal from "@/components/ModalPortal";

export default function EditCourseModal({ course, existingGroups, onClose, onUpdated }: { course: any, existingGroups: string[], onClose: () => void, onUpdated: () => void }) {
  const [title, setTitle] = useState(course.title || "");
  const [targetDate, setTargetDate] = useState(course.target_completion_date ? new Date(course.target_completion_date).toISOString().split("T")[0] : "");
  const [groupName, setGroupName] = useState(course.group_name || "");
  const [loading, setLoading] = useState(false);
  
  // Advanced Syllabus Editing
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syllabusStr, setSyllabusStr] = useState(JSON.stringify(course.syllabus, null, 2));
  const [jsonError, setJsonError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setJsonError("");

    let parsedSyllabus = course.syllabus;
    if (showAdvanced) {
      try {
        parsedSyllabus = JSON.parse(syllabusStr);
      } catch (err) {
        setJsonError("Invalid JSON format. Please check for syntax errors.");
        setLoading(false);
        return;
      }
    }

    await supabase.from("courses").update({
      title,
      group_name: groupName.trim() || null,
      target_completion_date: new Date(targetDate).toISOString(),
      syllabus: parsedSyllabus
    }).eq("id", course.id);

    setLoading(false);
    onUpdated();
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="bg-white dark:bg-[#2d2926] rounded-[2rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl relative border-2 border-orange-200 dark:border-orange-900/30 flex flex-col my-auto max-h-[90vh]">
          <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors z-10">
            <X size={24} />
          </button>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 shrink-0 pr-8">Edit Course Outline</h2>
          
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            <form id="edit-course-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1">Course Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 font-bold bg-neutral-50 dark:bg-[#1a1816] text-neutral-900 dark:text-neutral-100 outline-none" />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  <Folder size={16} /> Course Grouping
                </label>
                <input type="text" list="edit-group-suggestions" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Fall Semester 2026" className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 font-bold bg-neutral-50 dark:bg-[#1a1816] text-neutral-900 dark:text-neutral-100 outline-none" />
                <datalist id="edit-group-suggestions">
                  {existingGroups.map((group) => (
                    <option key={group} value={group} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  <Calendar size={16} /> Target Date
                </label>
                <input type="date" required value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 font-bold bg-neutral-50 dark:bg-[#1a1816] text-neutral-900 dark:text-neutral-100 outline-none" />
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  <Code size={16} /> {showAdvanced ? "Hide Advanced Syllabus Editor" : "Advanced: Edit Syllabus JSON"}
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-neutral-500 mb-2">Edit the raw JSON to modify modules, add or remove topics, or fix typos.</p>
                    {jsonError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm font-bold mb-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-900">
                        <AlertCircle size={16} /> {jsonError}
                      </div>
                    )}
                    <textarea 
                      value={syllabusStr}
                      onChange={(e) => setSyllabusStr(e.target.value)}
                      className="w-full h-64 p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 font-mono text-xs bg-neutral-50 dark:bg-[#1a1816] text-neutral-900 dark:text-neutral-100 outline-none resize-y"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          <button form="edit-course-form" type="submit" disabled={loading} className="w-full modern-button bg-gradient-to-r from-orange-400 to-amber-500 text-white mt-6 shrink-0 shadow-xl shadow-orange-500/20">
            {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
