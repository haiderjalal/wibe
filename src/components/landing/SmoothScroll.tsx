"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

import "lenis/dist/lenis.css";

/** Inertial scrolling for the marketing page; falls back to native scrolling for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: !reduced, anchors: { offset: -80 } }}>
      {children}
    </ReactLenis>
  );
}
