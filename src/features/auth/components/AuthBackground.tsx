import React from 'react';

interface AuthBackgroundProps {
  isActive: boolean;
}

/**
 * A lightweight ERP process-map background. Keeping this SVG/CSS based avoids
 * a WebGL startup cost on the login route and lets reduced-motion users see the
 * same visual hierarchy without continuous movement.
 */
export const AuthBackground: React.FC<AuthBackgroundProps> = ({ isActive }) => (
  <div
    aria-hidden="true"
    className={`metivon-flow fixed inset-0 z-0 overflow-hidden ${isActive ? 'is-running' : 'is-paused'}`}
  >
    <svg className="h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="metivon-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="0.24" stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="0.62" stopColor="#d946ef" stopOpacity="0.62" />
          <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="metivon-node">
          <stop offset="0" stopColor="#f0f9ff" />
          <stop offset="0.28" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <pattern id="metivon-grid" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#94a3b8" strokeOpacity="0.055" />
        </pattern>
        <filter id="metivon-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#metivon-grid)" />

      <g className="metivon-flow__routes" fill="none" stroke="url(#metivon-route)" strokeWidth="1.25">
        <path d="M-80 205 C180 80 340 330 590 205 S1040 80 1680 210" />
        <path d="M-120 455 C210 320 350 590 655 440 S1160 330 1710 470" />
        <path d="M-70 710 C240 570 415 800 730 675 S1230 570 1690 720" />
      </g>

      <g className="metivon-flow__packets" fill="none" strokeWidth="3" strokeLinecap="round">
        <path pathLength="100" d="M-80 205 C180 80 340 330 590 205 S1040 80 1680 210" stroke="#22d3ee" strokeDasharray="2 98" />
        <path pathLength="100" d="M-120 455 C210 320 350 590 655 440 S1160 330 1710 470" stroke="#d946ef" strokeDasharray="2 98" />
        <path pathLength="100" d="M-70 710 C240 570 415 800 730 675 S1230 570 1690 720" stroke="#fb7185" strokeDasharray="2 98" />
      </g>

      <g className="metivon-flow__nodes" filter="url(#metivon-glow)">
        {[
          [135, 174], [380, 244], [615, 193], [930, 155], [1260, 196],
          [110, 437], [410, 504], [690, 425], [1010, 405], [1350, 450],
          [160, 662], [470, 730], [770, 660], [1100, 626], [1410, 690],
        ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="url(#metivon-node)" />)}
      </g>
    </svg>
  </div>
);
