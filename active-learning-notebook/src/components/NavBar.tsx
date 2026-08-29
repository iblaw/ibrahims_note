"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, BrainCircuit, Library, Users, Calendar, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function NavBar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", icon: <BookOpen size={20} />, label: "Dashboard" },
    { href: "/courses", icon: <Calendar size={20} />, label: "Study Planner" },
    { href: "/archive", icon: <Library size={20} />, label: "My Notes" },
    { href: "/review", icon: <BrainCircuit size={20} />, label: "Review" },
    { href: "/community", icon: <Users size={20} />, label: "Community" },
    { href: "/profile", icon: <User size={20} />, label: "Profile" },
  ];

  return (
    <nav className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              </div>
              <span className="font-bold text-xl hidden sm:block text-neutral-800 dark:text-neutral-100">Lumen</span>
            </Link>
          </div>
          
          {user && (
            <>
              {/* Desktop Nav */}
              <div className="hidden lg:flex space-x-1 items-center">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex items-center gap-2 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${pathname === link.href ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' : 'text-neutral-600 dark:text-neutral-300'}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && user && (
        <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg ${pathname === link.href ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
