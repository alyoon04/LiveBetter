'use client';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="50%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* House 1 */}
      <g transform="translate(10, -20)">
        <rect x="5" y="72" width="14" height="18" fill="url(#logoGradient)" rx="0.5" />
        <path d="M4 72 L12 62 L20 72 Z" fill="#A78BFA" />
        <rect x="7" y="75" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="13" y="75" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="9.5" y="82" width="3" height="8" fill="white" opacity="0.5" />
      </g>

      {/* House 2 */}
      <g transform="translate(10, -20)">
        <rect x="22" y="65" width="16" height="25" fill="url(#logoGradient)" rx="0.5" />
        <path d="M21 65 L30 53 L39 65 Z" fill="#A78BFA" />
        <rect x="24.5" y="68" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="31" y="68" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="24.5" y="74" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="31" y="74" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="27.5" y="81" width="4" height="9" fill="white" opacity="0.5" />
      </g>

      {/* House 3 */}
      <g transform="translate(10, -20)">
        <rect x="42" y="68" width="15" height="22" fill="url(#logoGradient)" rx="0.5" />
        <path d="M41 68 L49.5 58 L58 68 Z" fill="#A78BFA" />
        <rect x="44.5" y="71" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="50.5" y="71" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="44.5" y="77" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="50.5" y="77" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="47" y="83" width="4" height="7" fill="white" opacity="0.5" />
      </g>

      {/* House 4 - Tallest */}
      <g transform="translate(10, -20)">
        <rect x="60" y="58" width="18" height="32" fill="url(#logoGradient)" rx="0.5" />
        <path d="M59 58 L69 45 L79 58 Z" fill="#A78BFA" />
        <rect x="62.5" y="61" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="68.5" y="61" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="62.5" y="67" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="68.5" y="67" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="62.5" y="73" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="68.5" y="73" width="4" height="4" fill="white" opacity="0.7" />
        <rect x="65.5" y="81" width="5" height="9" fill="white" opacity="0.5" />
      </g>

      {/* House 5 */}
      <g transform="translate(10, -20)">
        <rect x="81" y="70" width="14" height="20" fill="url(#logoGradient)" rx="0.5" />
        <path d="M80 70 L88 60 L96 70 Z" fill="#A78BFA" />
        <rect x="83" y="73" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="89" y="73" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="83" y="78" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="89" y="78" width="3.5" height="3.5" fill="white" opacity="0.7" />
        <rect x="86" y="83" width="3.5" height="7" fill="white" opacity="0.5" />
      </g>

      {/* Trend line */}
      <g transform="translate(10, -20)">
        <path
          d="M12 62 L30 53 L49.5 50 L69 45 L88 38"
          stroke="#2DD4BF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M88 38 L82 42 L86 47 Z" fill="#2DD4BF" />
        <path d="M88 38 L80 38 L82 42 Z" fill="#2DD4BF" />
        <circle cx="12" cy="62" r="3.5" fill="#0C0C14" stroke="#2DD4BF" strokeWidth="2.5" />
        <circle cx="30" cy="53" r="3.5" fill="#0C0C14" stroke="#2DD4BF" strokeWidth="2.5" />
        <circle cx="49.5" cy="50" r="3.5" fill="#0C0C14" stroke="#2DD4BF" strokeWidth="2.5" />
        <circle cx="69" cy="45" r="3.5" fill="#0C0C14" stroke="#2DD4BF" strokeWidth="2.5" />
        <circle cx="88" cy="38" r="4.5" fill="#2DD4BF" />
      </g>
    </svg>
  );
}
