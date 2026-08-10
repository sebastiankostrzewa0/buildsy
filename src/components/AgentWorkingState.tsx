"use client";

export default function AgentWorkingState({ stage }: { stage: "parsing" | "searching" }) {
  const label =
    stage === "parsing"
      ? "Agent analizuje zapytanie…"
      : "Agent przeszukuje hurtownie…";

  return (
    <div className="flex items-center gap-3 justify-center py-10 font-heading text-lg text-concrete/90">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-signal" />
      </span>
      {label}
    </div>
  );
}
