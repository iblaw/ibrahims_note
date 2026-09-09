import type { Metadata } from "next";
import { Inter, Nunito, Merriweather, Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, BrainCircuit, Library, Users, Calendar, User } from "lucide-react";
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
import OnboardingModal from "@/components/OnboardingModal";
import RouteProgressBar from "@/components/RouteProgressBar";
import PageTransition from "@/components/PageTransition";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${nunito.variable} ${merriweather.variable} ${fredoka.variable} ${jetbrains.variable}`}>
      <head>
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col font-sans bg-neutral-50">
        <FontProvider>
          {/* Slim orange progress bar on route change */}
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <NavBar user={user} />
          {/* Main Content */}
          <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-12">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          
          {user && (!profile || !profile.is_onboarded) && (
            <OnboardingModal userId={user.id} initialUsername={profile?.username || user.user_metadata?.username || ""} />
          )}
          
          <footer className="w-full text-center py-8 text-neutral-500 font-medium text-sm border-t border-neutral-200 dark:border-neutral-800 mt-auto bg-white dark:bg-[#34302d]">
            <p>&copy; {new Date().getFullYear()} Lumen. Built with ❤️ for better learning.</p>
          </footer>
        </FontProvider>
      </body>
    </html>
  );
}
