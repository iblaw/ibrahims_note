"use client";

import { useState } from "react";
import MDXViewer from "./mdx/MDXViewer";

export default function NoteReaderContainer({ mdxSource }: { mdxSource: any }) {
  const [font, setFont] = useState<"fredoka" | "sans" | "serif" | "mono">("sans");

  const fontClasses = {
    fredoka: "font-sans", // This maps to Fredoka now via globals.css
    sans: "font-[system-ui,sans-serif]",
    serif: "font-serif",
    mono: "font-mono"
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
          <button 
            onClick={() => setFont("fredoka")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${font === "fredoka" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Bubbly
          </button>
          <button 
            onClick={() => setFont("sans")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${font === "sans" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Clean
          </button>
          <button 
            onClick={() => setFont("serif")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${font === "serif" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
          >
            Classic
          </button>
        </div>
      </div>
      <div className={`prose prose-lg max-w-[65ch] mx-auto prose-headings:font-bold prose-a:text-blue-600 ${fontClasses[font]}`}>
        <MDXViewer mdxSource={mdxSource} />
      </div>
    </div>
  );
}
