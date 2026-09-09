"use client";

import { useCompletion } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function DailyBriefing({ stats, todayTopics, name, coursesCount }: { stats: any, todayTopics: any[], name?: string, coursesCount: number }) {
  const [hasStarted, setHasStarted] = useState(false);
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/briefing',
  });

  useEffect(() => {
    if (!hasStarted && stats && todayTopics) {
      setHasStarted(true);
      complete("", {
        body: { stats, todayTopics, name, coursesCount }
      });
    }
  }, [hasStarted, stats, todayTopics, name, coursesCount, complete]);

  if (!hasStarted) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-800/50 p-6 rounded-2xl flex items-start gap-4 shadow-xl">
      <div className="bg-blue-500/20 p-3 rounded-full shrink-0">
        <Sparkles className="text-blue-300" size={24} />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Your Daily Briefing</h3>
        <p className="text-blue-100 font-medium text-lg leading-relaxed">
          {completion || "Thinking..."}
        </p>
      </div>
    </div>
  );
}
