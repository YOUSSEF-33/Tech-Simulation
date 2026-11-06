export function LockIcon({ safe, className = 'h-3.5 w-3.5' }: { safe: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="none">
      <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d={safe ? 'M7 9V6.5a3 3 0 0 1 6 0V9' : 'M7 9V6.5A3 3 0 0 1 12.5 5.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
