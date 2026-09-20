export function WaveMotif({ className }: { className?: string }) {
  // Two identical periods side by side so the drift animation loops seamlessly.
  const period =
    "M0 60 C 50 10, 100 10, 150 60 S 250 110, 300 60 S 400 10, 450 60 S 550 110, 600 60";
  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden text-brand ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 1200 120"
        className="h-20 w-[200%] animate-wave motion-reduce:animate-none sm:h-28"
        preserveAspectRatio="none"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1.25" opacity="0.55">
          <path d={period} />
          <path d={period} transform="translate(600 0)" />
        </g>
        <g stroke="currentColor" strokeWidth="1" opacity="0.25">
          <path d={period} transform="translate(75 0)" />
          <path d={period} transform="translate(675 0)" />
        </g>
        <line x1="0" y1="60" x2="1200" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 6" />
      </svg>
    </div>
  );
}
