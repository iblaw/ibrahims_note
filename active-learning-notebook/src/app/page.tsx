import Link from "next/link";
import { BookOpen, BrainCircuit, Library, PenSquare, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="text-center space-y-6 max-w-2xl flex flex-col items-center">
        <img src="/mascot/lumen_study.jpg" alt="Lumen Studying" className="w-48 h-48 rounded-full border-4 border-neutral-200 shadow-xl mb-4" />
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-800">
          Learn deeply. <br/>
          <span className="text-neutral-500">Forget nothing.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 font-medium leading-relaxed">
          Your personal archive of knowledge built on active recall and Feynman&apos;s mental models.
        </p>
      </div>

      {/* Primary Action */}
      <Link href="/login" className="bubbly-button bg-neutral-800 text-white text-lg flex items-center gap-2 shadow-neutral-300">
        <ArrowRight size={24} />
        Start Learning Now
      </Link>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
        
        <FeatureCard 
          href="/archive"
          icon={<Library className="text-neutral-600" size={32} />}
          title="The Archive"
          description="Browse your beautifully rendered notes, rich with interactive quizzes."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
        />

        <FeatureCard 
          href="/review"
          icon={<BrainCircuit className="text-neutral-600" size={32} />}
          title="Spaced Repetition"
          description="Review auto-extracted flashcards precisely when you're about to forget them."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
        />

        <FeatureCard 
          href="/community"
          icon={<BookOpen className="text-neutral-600" size={32} />}
          title="Community"
          description="Share and discover raw slides, PDFs, and past questions from other learners."
          colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
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
      <div className="p-3 bg-white rounded-2xl w-fit shadow-sm border border-neutral-100">
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-neutral-600 font-medium leading-relaxed flex-grow">
        {description}
      </p>
      <div className="flex items-center gap-2 font-bold text-sm mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
        Explore <ArrowRight size={16} />
      </div>
    </Link>
  );
}
