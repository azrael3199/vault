import React from "react";

export function CyberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-background">
      {/* Soft radial glows to anchor the neon theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 dark:bg-cyan-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[150px] pointer-events-none" />

      {/* Elegant Dot Pattern (Standard Bento UI) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-40 dark:opacity-30"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="1.5" className="fill-cyan-500/50 dark:fill-cyan-400/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}
