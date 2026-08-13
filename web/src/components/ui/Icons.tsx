import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
} as const;

export function ChevronDown(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 5c0-.6.4-1 1-1h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3c0 .6-.4 1-1 1A16 16 0 0 1 4 5Z" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Chat(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
    </svg>
  );
}

export function Send(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 12 20 4l-8 16-2-6-6-2Z" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Bus(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="4" y="4" width="16" height="13" rx="3" />
      <path d="M4 10h16M8 17v2M16 17v2" />
      <circle cx="8.5" cy="13.5" r="1" />
      <circle cx="15.5" cy="13.5" r="1" />
    </svg>
  );
}

export function Leaf(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 20c0-8 6-14 16-14 0 10-6 14-12 14H4Z" />
      <path d="M9 15c2-3 5-5 8-6" />
    </svg>
  );
}

export function Wifi(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M2.5 9a15 15 0 0 1 19 0M6 12.5a10 10 0 0 1 12 0M9.5 16a5 5 0 0 1 5 0" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function CreditCard(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M6.5 15H10" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Minus(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Smartphone(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export function Building(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M14 21V10h4a2 2 0 0 1 2 2v9M4 21h16" />
      <path d="M7.5 8h3M7.5 12h3M7.5 16h3" />
    </svg>
  );
}

export function Megaphone(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 10v4a2 2 0 0 0 2 2h2l8 4V4l-8 4H6a2 2 0 0 0-2 2Z" />
      <path d="M19 9.5a3.5 3.5 0 0 1 0 5" />
    </svg>
  );
}

export function Accessibility(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M5 9h14M12 9v5m0 0 3.5 6M12 14l-3.5 6" />
    </svg>
  );
}

export function Route(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.5" />
    </svg>
  );
}

export function Star(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 3.5 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.9l6-.9L12 3.5Z" />
    </svg>
  );
}
