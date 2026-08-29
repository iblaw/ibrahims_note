import Link from "next/link";
import { BookOpen, BrainCircuit, Library, PenSquare, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-100">
          Learn deeply. <br/>
          <span className="text-neutral-500 dark:text-neutral-400">Forget nothing.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
          Your personal archive of knowledge built on active recall and Feynman&apos;s mental models.
        </p>
      </div>

      {/* Primary Action */}
      <Link href="/notes/new" className="bubbly-button bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-lg flex items-center gap-2 shadow-neutral-300 dark:shadow-neutral-900">
        <PenSquare size={24} />
        Create a New Note
      </Link>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
        
        <FeatureCard 
          href="/archive"
          icon={<Library className="text-neutral-600 dark:text-neutral-300" size={32} />}
          title="The Archive"
          description="Browse your beautifully rendered notes, rich with interactive quizzes."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900/50 dark:border-neutral-800 dark:hover:border-neutral-600"
        />

        <FeatureCard 
          href="/review"
          icon={<BrainCircuit className="text-neutral-600 dark:text-neutral-300" size={32} />}
          title="Spaced Repetition"
          description="Review auto-extracted flashcards precisely when you're about to forget them."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900/50 dark:border-neutral-800 dark:hover:border-neutral-600"
        />

        <FeatureCard 
          href="/community"
          icon={<BookOpen className="text-neutral-600 dark:text-neutral-300" size={32} />}
          title="Community"
          description="Share and discover raw slides, PDFs, and past questions from other learners."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900/50 dark:border-neutral-800 dark:hover:border-neutral-600"
        />

      </div>
    </div>
  );
}

function FeatureCard({ 
  href, 
  icon, 
  title, 
  description,
  colorClass
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  colorClass: string;
}) {
  return (
    <Link href={href} className={`bubbly-card group flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${colorClass}`}>
      <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl w-fit shadow-sm border border-neutral-100 dark:border-neutral-700">
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed flex-grow">
        {description}
      </p>
      <div className="flex items-center gap-2 font-bold text-sm mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
        Explore <ArrowRight size={16} />
      </div>
    </Link>
  );
}
