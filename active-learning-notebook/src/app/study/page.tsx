"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Sparkles, Send, User, Brain, Loader2 } from "lucide-react";

export default function StudyChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: "Hey Ibrahim! 👋 I'm Lumen, your new study partner. I noticed you have some goals set up in your Timetable. What are we focusing on today? We could review your flashcards or start breaking down a new topic!",
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f5] dark:bg-[#1c1a19] transition-colors duration-300">
      
      {/* Header */}
      <header className="shrink-0 h-16 border-b-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-white dark:bg-[#2a2624]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Brain size={18} />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
            Lumen <span className="text-orange-500">Omni-Chat</span>
          </h1>
        </div>
        <a href="/dashboard" className="text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
          Go to Dashboard &rarr;
        </a>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="shrink-0 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 text-center text-sm font-bold border-b border-red-200 dark:border-red-800">
          ⚠️ Connection Error: Please ensure your GOOGLE_GENERATIVE_AI_API_KEY is properly set in .env.local.
        </div>
      )}

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                ${m.role === 'user' 
                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900' 
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                }`}
              >
                {m.role === 'user' ? <User size={20} /> : <Brain size={20} />}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] sm:max-w-xl text-[15px] leading-relaxed shadow-sm
                  ${m.role === 'user'
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 rounded-tr-sm'
                    : 'bg-white dark:bg-[#2a2624] text-neutral-800 dark:text-neutral-200 border-2 border-neutral-100 dark:border-neutral-800 rounded-tl-sm'
                  }`}
                >
                  {/* Basic Markdown Rendering (For now we just render text, later we'll use react-markdown) */}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4">
               <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center justify-center shadow-sm">
                <Brain size={20} />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#2a2624] border-2 border-neutral-100 dark:border-neutral-800 rounded-tl-sm flex items-center gap-2 text-neutral-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Lumen is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="shrink-0 p-4 sm:p-6 bg-white dark:bg-[#2a2624] border-t-2 border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="flex items-end gap-3 p-2 bg-[#f8f7f5] dark:bg-[#1c1a19] border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-colors"
          >
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question, request a quiz, or just vent about your exams..."
              className="flex-1 max-h-40 min-h-[44px] bg-transparent outline-none resize-none px-3 py-2.5 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium text-[15px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) handleSubmit(e as any);
                }
              }}
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 text-white transition-colors shadow-md"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
          <div className="text-center mt-3 flex items-center justify-center gap-2 text-xs font-bold text-neutral-400 dark:text-neutral-500">
            <Sparkles size={14} className="text-orange-400" />
            Powered by Lumen Generative UI
          </div>
        </div>
      </footer>
    </div>
  );
}
