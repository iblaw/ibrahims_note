"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  // Complete bar whenever the route settles
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setVisible(true);
    completeRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 300);
    return () => { if (completeRef.current) clearTimeout(completeRef.current); };
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-orange-500 pointer-events-none"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        boxShadow: visible ? "0 0 12px rgba(255,98,0,0.8)" : "none",
        transition: progress === 100
          ? "width 0.25s ease-out, opacity 0.3s ease 0.2s"
          : progress === 0
          ? "none"
          : "width 0.4s ease-out",
      }}
    />
  );
}
