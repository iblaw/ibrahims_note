"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Copy, Check, Calendar, Clock } from "lucide-react";

const PROMPT_TEMPLATE = `Context: You are an expert academic planner and AI tutor. The user is going to provide you with a messy, unstructured course syllabus, outline, or list of topics.

Your task is to organize this syllabus into a deeply structured, chronological JSON format so that a specialized study planner application can generate a timetable from it.

Core Philosophy: You must estimate realistic study times. A single complex topic might take 120 minutes to master, while a simple definition might take 30 minutes. Be realistic, accounting for reading, taking notes, and active recall.

CRITICAL INSTRUCTION: You must output ONLY a valid JSON block, wrapped inside <CoursePlan> tags. DO NOT wrap the tags in markdown code blocks.

Format Example:
<CoursePlan>
{
  "courseTitle": "Introduction to Biology",
  "modules": [
    {
      "moduleTitle": "Module 1: Cellular Foundations",
      "topics": [
        {
          "title": "Cell Theory and Structure",
          "estimatedMinutes": 90,
          "completed": false
        }
      ]
    }
  ]
}
</CoursePlan>

Instructions:
1. "courseTitle" should be the overarching name of the course.
2. Group related topics into logical "modules".
3. "estimatedMinutes" must be an integer (time to master the topic).
4. "completed" must ALWAYS be false.
5. Break large topics into sub-topics so no single topic exceeds 120 minutes.`;

export default function CreateCourse() {
  const [content, setContent] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!content.trim() || !targetDate) return;
    setIsSubmitting(true);

    try {
      // Parse the AI output
      const regex = /<CoursePlan>([\s\S]*?)<\/CoursePlan>/;
      const match = content.match(regex);
      
      if (!match) {
        throw new Error("Could not find <CoursePlan> tags in the text.");
      }

      const syllabusJson = JSON.parse(match[1].trim());
      const title = syllabusJson.courseTitle;

      if (!title) throw new Error("Course title not found in JSON.");

      const { data: course, error } = await supabase
        .from("courses")
        .insert([{ 
          title, 
          syllabus: syllabusJson,
          target_completion_date: new Date(targetDate).toISOString(),
          weekly_hours_commitment: weeklyHours
        }])
        .select()
        .single();

      if (error) throw error;

      router.push(`/courses/${course.id}`);
    } catch (error: any) {
      console.error("Error saving course:", error);
      alert(`Failed to save course: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <GraduationCap className="text-neutral-500" size={36} />
          Plan New Course
        </h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !content || !targetDate}
          className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-neutral-300 dark:shadow-neutral-900 disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={20} />}
          {isSubmitting ? "Generating Plan..." : "Generate Study Plan"}
        </button>
      </div>

      <div className="bg-neutral-100 dark:bg-[#34302d] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-6 items-center justify-between">
        <p className="text-lg text-neutral-700 dark:text-neutral-300 font-medium">
          Copy this prompt, paste it into ChatGPT/Gemini along with your syllabus, and paste the result below.
        </p>
        <button
          onClick={handleCopyPrompt}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#403b38] border border-neutral-200 dark:border-neutral-600 rounded-full font-bold hover:bg-neutral-50 dark:hover:bg-[#4d4844] transition-colors"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy AI Prompt"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bubbly-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6">
          <label className="flex items-center gap-2 text-sm font-bold mb-4 text-neutral-700 dark:text-neutral-300">
            <Calendar size={18} /> Target Completion Date
          </label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 outline-none font-bold bg-transparent"
          />
        </div>
        
        <div className="bubbly-card bg-white dark:bg-[#34302d] border border-neutral-200 dark:border-neutral-700 p-6">
          <label className="flex items-center gap-2 text-sm font-bold mb-4 text-neutral-700 dark:text-neutral-300">
            <Clock size={18} /> Weekly Hours Commitment
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="40"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
              className="flex-grow accent-neutral-800 dark:accent-neutral-200"
            />
            <span className="font-bold text-xl min-w-[3ch]">{weeklyHours}h</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">
          AI Syllabus Output
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the <CoursePlan> JSON output here..."
          className="w-full min-h-[300px] p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-800 transition-all outline-none resize-y font-mono text-sm bg-white dark:bg-[#2a2624] leading-relaxed"
        />
      </div>
    </div>
  );
}
