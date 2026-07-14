// Minimal stroke icon set (24x24, currentColor).
type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconOverview = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconMeta = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 16c1.5-8 4-9 6-4s3 8 4.5 8S17 12 20 9" />
  </svg>
);

export const IconGoogle = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v8.5h8.5" />
  </svg>
);

export const IconCreative = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M10 9l5 3-5 3V9z" />
  </svg>
);

export const IconCollapse = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconRefresh = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
  </svg>
);

export const IconCalendar = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </svg>
);

export const IconLayers = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />
  </svg>
);

export const IconMoney = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v10M9.5 9.5c0-1 1-1.6 2.5-1.6s2.5.7 2.5 1.8-1 1.5-2.5 1.5-2.5.5-2.5 1.6 1 1.7 2.5 1.7 2.5-.6 2.5-1.6" />
  </svg>
);

export const IconEye = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconUsers = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.2A3.2 3.2 0 0 1 18 11M21 19c0-2.5-1.3-4.4-3.5-5.2" />
  </svg>
);

export const IconClick = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 4v6M5.5 5.5l2 2M4 9h3M9 12l10 4-4 1.5L13 22 9 12z" />
  </svg>
);

export const IconPlay = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 8.5l5 3.5-5 3.5v-7z" />
  </svg>
);

export const IconHeart = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7c0 5-7 9.3-7 9.3z" />
  </svg>
);

export const IconChat = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5h16v11H8l-4 3V5z" />
  </svg>
);

export const IconTarget = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const IconStack = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
);

export const IconInfo = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconInstagram = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
