"use client";

import { useEffect, useState } from "react";

export default function FontProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFont = localStorage.getItem("lumen-font") || "playful";
    document.documentElement.setAttribute("data-font", savedFont);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
