"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Calendar, Library, Users, BrainCircuit, User } from "lucide-react";
import SignUpModal from "./SignUpModal";

export default function Header({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <img src="/mascot/lumen_success.jpg" alt="Lumen" className="w-12 h-12 rounded-full border-2 border-orange-200 group-hover:scale-110 transition-transform object-cover shadow-sm" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
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

            {/* CTA area: show Sign up when not authenticated, otherwise keep Profile link */}
            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-foreground/70 hover:text-neutral-900 dark:hover:text-neutral-100 px-3 py-2 rounded-full">
                  Log in
                </Link>
                <button onClick={() => setOpen(true)} className="bubbly-button bg-orange-500 text-white px-4 py-2 font-bold rounded-full">
                  Sign up
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SignUpModal open={open} onClose={() => setOpen(false)} />
    </nav>
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
