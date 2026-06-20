"use client";

import { useState } from "react";

type Props = {
  emoji: string;
  name: string;
  description: string;
};

export default function BadgeTooltip({ emoji, name, description }: Props) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow((v) => !v)}
        className="text-lg active:scale-110 transition-transform"
        aria-label={name}
      >
        {emoji}
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 rounded-lg bg-surface border border-surface-border shadow-card p-3 text-center"
          >
            <div className="text-sm font-bold text-gold mb-1">{emoji} {name}</div>
            <div className="text-xs text-muted">{description}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface border-r border-b border-surface-border rotate-45 -mt-1" />
          </div>
        </>
      )}
    </span>
  );
}
