"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "entered" | "exit">("entered");
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setTransitionStage("exit");
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage("enter");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionStage("entered"));
      });
    }, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (transitionStage === "exit") return;
    setDisplayChildren(children);
  }, [children]);

  const style: React.CSSProperties =
    transitionStage === "exit"
      ? { opacity: 0, transform: "translateY(6px)", transition: "opacity 0.12s ease-out, transform 0.12s ease-out" }
      : transitionStage === "enter"
      ? { opacity: 0, transform: "translateY(6px)", transition: "none" }
      : { opacity: 1, transform: "translateY(0)", transition: "opacity 0.25s ease-out, transform 0.25s ease-out" };

  return <div style={style}>{displayChildren}</div>;
}
