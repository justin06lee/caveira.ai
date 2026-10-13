'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

/** A shell command with a copy button. */
export function Command({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-white/[0.08] bg-black/40 py-2 pl-4 pr-2 font-mono text-[12.5px]">
      <span className="select-none text-cinder">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-ash [scrollbar-width:none]">{children}</code>
      <button
        type="button"
        aria-label="Copy command"
        onClick={() => {
          navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          });
        }}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-smoke transition hover:bg-white/[0.08] hover:text-ash"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
