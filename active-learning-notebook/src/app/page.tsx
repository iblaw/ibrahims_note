import Link from "next/link";
import { BookOpen, BrainCircuit, Library, ArrowRight } from "lucide-react";
import HeroSignup from "@/components/HeroSignup";

export const metadata = {
  title: "Lumen — Learn deeply, forget nothing",
  description: "Lumen is an evidence-based study notebook for students. Build notes, auto-generate flashcards, schedule study plans and review with spaced repetition.",
  openGraph: {
    title: "Lumen — Learn deeply, forget nothing",
    description: "Lumen is an evidence-based study notebook for students. Build notes, auto-generate flashcards, schedule study plans and review with spaced repetition.",
    url: "/",
    siteName: "Lumen Notebook",
    images: [
      {
        url: "/icon.jpg",
        width: 1200,
        height: 630,
        alt: "Lumen Notebook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen — Learn deeply, forget nothing",
    description: "Evidence-based study notebook: notes, flashcards, study planner.",
    images: ["/icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for the product
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lumen Notebook",
  description: "An evidence-based study notebook that helps students learn deeply using spaced repetition and active recall.",
  url: "/",
  applicationCategory: "Education",
  operatingSystem: "Web",
  author: {
    "@type": "Organization",
    name: "Lumen",
  },
  logo: "/icon.jpg",
};

export default function Home() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSignup />

      {/* Feature Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <h2 className="text-3xl font-extrabold text-neutral-800 mb-6 text-center">How Lumen helps you learn</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <FeatureCard 
            href="/archive"
            icon={<Library className="text-neutral-600" size={32} />}
            title="The Archive"
            description="Store and search your notes organized by course and concept. Turn notes into interactive quizzes."
            colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
          />

          <FeatureCard 
            href="/review"
            icon={<BrainCircuit className="text-neutral-600" size={32} />}
            title="Spaced Repetition"
            description="Smart scheduling surfaces flashcards at the optimal moment to reinforce long-term memory."
            colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
          />

          <FeatureCard 
            href="/community"
            icon={<BookOpen className="text-neutral-600" size={32} />}
            title="Community"
            description="Share resources and discover peer-created notes and question banks."
            colorClass="bg-neutral-50 border-neutral-200 hover:border-neutral-400"
          />
        </div>

        {/* How it works */}
        <div className="mt-12 bg-neutral-100 dark:bg-neutral-900/40 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">How it works — in 3 steps</h3>
          <ol className="list-decimal list-inside space-y-3 text-neutral-700">
            <li><strong>Capture:</strong> Save notes, upload slides or paste key excerpts — structure them by course.</li>
            <li><strong>Distill:</strong> Auto-generate flashcards and concise concept summaries using simple, explain-to-yourself prompts.</li>
            <li><strong>Review:</strong> Follow a daily review schedule tailored to your deadlines using spaced repetition.</li>
          </ol>
        </div>

        {/* Trust / CTA band */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 dark:bg-zinc-900/60 p-6 rounded-2xl">
          <div>
            <h4 className="text-xl font-bold">Trusted by learners</h4>
            <p className="text-neutral-600">Used by students across courses — create your first note and try the review flow in minutes.</p>
          </div>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Explore sample notes</a>
            <Link href="/login" className="bubbly-button bg-orange-500 text-white px-6 py-3 font-bold rounded-full inline-flex items-center justify-center">
              Create your free account
            </Link>
          </div>
        </div>

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
