import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, BrainCircuit, Library, Users } from "lucide-react";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Active Learning Notebook",
  description: "A bubbly, minimalist notebook built on cognitive science.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${nunito.variable} antialiased min-h-screen flex flex-col`}>
        {/* Navigation Bar */}
        <nav className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="font-extrabold text-2xl tracking-tight flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  <span className="text-neutral-800 dark:text-neutral-100">
                    Aura
                  </span>
                </Link>
              </div>
              <div className="flex space-x-6">
                <NavLink href="/notes" icon={<BookOpen size={20} />} label="Notes" />
                <NavLink href="/archive" icon={<Library size={20} />} label="Archive" />
                <NavLink href="/review" icon={<BrainCircuit size={20} />} label="Review" />
                <NavLink href="/community" icon={<Users size={20} />} label="Community" />
              </div>
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
