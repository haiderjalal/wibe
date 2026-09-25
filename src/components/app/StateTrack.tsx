"use client";

import { motion } from "motion/react";

import type { EventState } from "@/lib/types";

const TRACK: EventState[] = ["draft", "submitted", "approved", "published"];
const LABEL: Record<EventState, string> = {
  draft: "Draft",
  submitted: "In review",
  approved: "Approved",
  published: "Live",
  rejected: "Not approved",
  suspended: "Suspended",
};

export function stateLabel(state: EventState): string {
  return LABEL[state];
}

/** Progress along the listing lifecycle; rejected and suspended branch off in red. */
export function StateTrack({ state }: { state: EventState }) {
  const branched = state === "rejected" || state === "suspended";
  const reached = branched ? (state === "rejected" ? 1 : 2) : TRACK.indexOf(state);

  return (
    <div className="flex items-center gap-1.5" aria-label={`Status: ${LABEL[state]}`}>
      {TRACK.map((s, i) => (
        <motion.span
          key={s}
          title={LABEL[s]}
          className="h-1.5 flex-1 rounded-full"
          initial={false}
          animate={{
            backgroundColor: i <= reached ? (branched && i === reached ? "#ff6f7d" : "#ffb547") : "rgba(163,168,216,0.18)",
          }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        />
      ))}
      <span className={`ml-2 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.12em] ${branched ? "text-dusk" : state === "published" ? "text-pine" : "text-sodium"}`}>
        {LABEL[state]}
      </span>
    </div>
  );
}
