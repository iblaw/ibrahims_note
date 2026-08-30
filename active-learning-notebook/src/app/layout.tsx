import type { Metadata } from "next";
import { Inter, Nunito, Merriweather, Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, BrainCircuit, Library, Users, Calendar, User } from "lucide-react";
import { Analytics } from '@vercel/analytics/next';
import FontProvider from "@/components/FontProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: 'swap' });
const merriweather = Merriweather({ weight: ["300", "400", "700", "900"], subsets: ["latin"], variable: "--font-merriweather", display: 'swap' });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: 'swap' });

export const metadata: Metadata = {
  title: "Lumen Notebook",
  description: "A sleek, modern learning platform built on cognitive science.",
};

import { createClient } from "@/lib/supabase/server";

import { NavBar } from "@/components/NavBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${nunito.variable} ${merriweather.variable} ${fredoka.variable} ${jetbrains.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedFont = localStorage.getItem("lumen-font") || "playful";
                document.documentElement.setAttribute("data-font", savedFont);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col font-sans bg-neutral-50">
        <FontProvider>
          <NavBar user={user} />
          {/* Main Content */}
          <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-12">
            {children}
          </main>
          <footer className="w-full text-center py-8 text-neutral-500 font-medium text-sm border-t border-neutral-200 dark:border-neutral-800 mt-auto bg-white dark:bg-[#34302d]">
            <p>&copy; {new Date().getFullYear()} Lumen. Built with ❤️ for better learning.</p>
          </footer>
        </FontProvider>
        <Analytics />
      </body>
    </html>
  );
}
