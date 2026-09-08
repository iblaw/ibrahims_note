"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function PublicUpsellPrompt() {
  return (
    <div className="mt-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <Sparkles size={48} className="mx-auto mb-6 text-orange-100" />
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 drop-shadow-md">
          Level up your learning with Lumen
        </h2>
        <p className="text-xl sm:text-2xl font-medium text-orange-50 mb-8 max-w-2xl mx-auto drop-shadow-sm">
          You just crushed this topic. Imagine what you could do with spaced repetition, active recall, and personalized master timetables.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login"
            className="modern-button bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 py-4 px-8 text-lg flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 w-full sm:w-auto"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
          <Link 
            href="/"
            className="modern-button bg-orange-600/50 text-white border border-orange-400/50 hover:bg-orange-600/70 py-4 px-8 text-lg w-full sm:w-auto"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
