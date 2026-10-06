import type { ReactNode, SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
  strokeWidth?: number;
}

const createIcon = (paths: ReactNode, defaultStroke = 2) =>
  function Icon({ size = 18, strokeWidth = defaultStroke, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {paths}
      </svg>
    );
  };

export const WaveIcon = createIcon(<path d="M3 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0" />, 2.4);
export const ArrowUpIcon = createIcon(
  <>
    <path d="M5 12l7-7 7 7" />
    <path d="M12 5v14" />
  </>,
  2.2,
);
export const SendIcon = createIcon(<path d="M5 12h14M13 6l6 6-6 6" />, 2.4);
export const CheckIcon = createIcon(<path d="M5 12l5 5L20 7" />, 2.6);
export const DashedCircleIcon = createIcon(<circle cx="12" cy="12" r="8" strokeDasharray="3 3" />);
export const AttachIcon = createIcon(<path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 7" />);
export const MicIcon = createIcon(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" />
  </>,
);
export const CursorIcon = createIcon(<path d="M4 4l7 17 2.5-7.5L21 11z" />);
export const ChevronDownIcon = createIcon(<path d="M6 9l6 6 6-6" />);
