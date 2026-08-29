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
import Header from "@/components/Header";

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
        {/* Navigation Bar (client) */}
        {/* Moved to a client header component so we can open the signup modal from the header */}
        <Header user={user} />

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
