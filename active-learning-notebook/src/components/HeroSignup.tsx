"use client";

import { useState } from "react";
import SignUpModal from "./SignUpModal";
import { ArrowRight } from "lucide-react";

export default function HeroSignup() {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SignUpModal open={open} onClose={() => setOpen(false)} />

      <img src="/mascot/lumen_study.jpg" alt="Lumen Studying" className="w-48 h-48 rounded-full border-4 border-neutral-200 shadow-xl mb-4" />

      <div className="text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-800">
          Learn deeply. <br/>
          <span className="text-neutral-500">Forget nothing.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 font-medium leading-relaxed mt-4">
          Lumen helps students build a lifelong, searchable knowledge archive using evidence-based study techniques — spaced repetition, active recall and concept distillation.
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={() => setOpen(true)} className="bubbly-button bg-orange-500 text-white text-lg px-6 py-3 flex items-center gap-2">
            <ArrowRight size={20} />
            Create your free account
          </button>

          <a href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Have an account? Log in</a>
        </div>
      </div>
    </section>
  );
}
