'use client';

import Image, { type StaticImageData } from 'next/image';
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

/** The size a replica window is drawn at; the stage scales it to fit. */
export const WINDOW = { width: 880, height: 570 };

/** How close a dragged window may come to the painting's edge. */
const INSET = 10;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** What a window can't be dragged by: its controls. */
const NO_DRAG = 'button, input, textarea, select, a, [data-no-drag]';

/**
 * A painting as the desktop wallpaper with a caveira window on it, drawn at
 * the app's real size and scaled to fit. The window moves by its title bar
 * (anything marked data-drag), like a real one, and stays on the painting.
 */
export function Stage({ painting, alt, children }: { painting: StaticImageData; alt: string; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  // Where the window was dragged, as a share of the stage, so it holds as
  // the page resizes. Written straight to the element: no render mid-drag.
  const offset = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const fit = (width: number) => setScale(width / WINDOW.width);
    fit(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    // A finger keeps scrolling the page.
    if (event.button !== 0 || event.pointerType === 'touch' || !stageRef.current) return;
    if (!target.closest('[data-drag]') || target.closest(NO_DRAG)) return;
    event.preventDefault();
    const el = event.currentTarget;
    const stage = stageRef.current.getBoundingClientRect();
    const win = el.getBoundingClientRect();
    const from = { px: event.clientX, py: event.clientY, ...offset.current };
    const move = (e: PointerEvent) => {
      const dx = clamp(e.clientX - from.px, stage.left + INSET - win.left, stage.right - INSET - win.right);
      const dy = clamp(e.clientY - from.py, stage.top + INSET - win.top, stage.bottom - INSET - win.bottom);
      offset.current = { x: from.x + dx / stage.width, y: from.y + dy / stage.height };
      el.style.translate = `${offset.current.x * 100}cqw ${offset.current.y * 100}cqh`;
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  return (
    <div ref={stageRef} className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/[0.06] sm:aspect-[3/2] sm:rounded-[28px]">
      <Image src={painting} alt={alt} fill placeholder="blur" quality={80} sizes="(min-width: 1024px) 60vw, 100vw" draggable={false} className="select-none object-cover" />
      {/* A size container, so the window's offset (in cqw/cqh) scales with the painting. */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ containerType: 'size' }}>
        <div ref={fitRef} className="relative z-10 w-[92%] sm:w-[84%]" onPointerDown={startDrag}>
          <div className="relative w-full" style={{ aspectRatio: `${WINDOW.width} / ${WINDOW.height}` }}>
            <div
              className="absolute left-0 top-0 overflow-hidden rounded-[12px] bg-app font-sans text-app-text shadow-[0_40px_90px_-24px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.18)]"
              style={{ width: WINDOW.width, height: WINDOW.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
