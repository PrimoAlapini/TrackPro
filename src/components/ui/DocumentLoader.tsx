export function DocumentLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <div className="flex items-center justify-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeMap[size]}
      >
        <style>{`
          @keyframes flipDoc {
            0% { transform: translateY(0) scale(0.95); opacity: 0.5; }
            50% { transform: translateY(-6px) scale(1); opacity: 1; }
            100% { transform: translateY(0) scale(0.95); opacity: 0.5; }
          }
          .page-1 { animation: flipDoc 1.5s ease-in-out infinite 0s; }
          .page-2 { animation: flipDoc 1.5s ease-in-out infinite 0.3s; }
          .page-3 { animation: flipDoc 1.5s ease-in-out infinite 0.6s; }
        `}</style>

        {/* Feuille 3 (Fond) */}
        <rect className="page-3" x="16" y="12" width="28" height="36" rx="4" fill="var(--input)" stroke="var(--border)" strokeWidth="1.5" />
        
        {/* Feuille 2 (Milieu) */}
        <rect className="page-2" x="20" y="16" width="28" height="36" rx="4" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
        
        {/* Feuille 1 (Devant) */}
        <g className="page-1">
          <rect x="24" y="20" width="28" height="36" rx="4" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
          <line x1="29" y1="28" x2="43" y2="28" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="34" x2="39" y2="34" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
          
          {/* Badge de statut validé */}
          <circle cx="43" cy="46" r="5" fill="var(--primary)" />
          <path d="M40.5 46L42 47.5L45.5 44" stroke="var(--card)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}
