import Link from "next/link";
import { BookOpen, BrainCircuit, Library, PenSquare, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="text-center space-y-6 max-w-2xl flex flex-col items-center">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-4 border-white dark:border-[#2a2624] shadow-xl mb-4 text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-24 md:h-24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </div>
        <h1 className="text-xl sm:text-xl font-extrabold tracking-tight text-neutral-800">
          Learn deeply. <br/>
          <span className="text-neutral-500">Forget nothing.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 font-medium leading-relaxed px-4">
          Your personal archive of knowledge built on active recall and Feynman&apos;s mental models.
        </p>
      </div>

      {/* Primary Action */}
      <Link href="/login" className="modern-button bg-neutral-800 text-white text-lg flex items-center gap-2 shadow-neutral-300">
        <ArrowRight size={24} />
        Start Learning Now
      </Link>

    </div>
  );
}
