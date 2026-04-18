"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      // Calculate how far down the page the user has scrolled
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Ensure we don't divide by zero
      if (documentHeight === windowHeight) return;

      const totalScroll = documentHeight - windowHeight;
      const currentProgress = (scrollPosition / totalScroll) * 100;
      
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    
    // Initial call
    updateScroll();

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-1 z-[60] transition-all duration-150 ease-out bg-brand-500 shadow-[0_0_10px_var(--brand-500)]"
      style={{ width: `${progress}%` }}
    />
  );
}
