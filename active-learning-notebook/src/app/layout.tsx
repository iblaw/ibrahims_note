import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, BrainCircuit, Library, Users, Calendar, User } from "lucide-react";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lumen Notebook",
  description: "A bubbly, minimalist notebook built on cognitive science.",
};

import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${fredoka.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {/* Navigation Bar */}
        <nav className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center group">
                  <img src="/mascot/lumen_success.jpg" alt="Lumen" className="w-12 h-12 rounded-full border-2 border-orange-200 group-hover:scale-110 transition-transform object-cover shadow-sm" />
                </Link>
              </div>
              {user && (
                <div className="flex space-x-6 items-center">
                  <NavLink href="/notes" icon={<BookOpen size={20} />} label="Dashboard" />
                  <NavLink href="/courses" icon={<Calendar size={20} />} label="Study Planner" />
                  <NavLink href="/archive" icon={<Library size={20} />} label="My Notes" />
                  <NavLink href="/review" icon={<BrainCircuit size={20} />} label="Review" />
                  <NavLink href="/community" icon={<Users size={20} />} label="Community" />
                  <NavLink href="/profile" icon={<User size={20} />} label="Profile" />
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow max-w-5xl mx-auto w-full p-6 lg:p-12">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2 text-foreground/70 hover:text-neutral-900 dark:hover:text-neutral-100 font-bold transition-colors px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
