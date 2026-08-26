import React, { useEffect, useState } from 'react';

/**
 * Full-screen splash screen shown only on the very first page load.
 * Uses a sessionStorage flag so it never shows again during the browser session.
 */
export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 8200); // slightly longer than the last animation (8s)
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a'
    }}>
      <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="splashHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#06b6d4' }} />
            <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
          </linearGradient>
          <filter id="splashNeonGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="500" height="500" fill="#0f172a" />

        {/* Outer hexagon */}
        <path
          d="M250 80 L320 120 L320 200 L250 240 L180 200 L180 120 Z"
          fill="none"
          stroke="url(#splashHexGrad)"
          strokeWidth="4"
          filter="url(#splashNeonGlow)"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate attributeName="stroke-dashoffset" values="600;0" dur="2s" fill="freeze" begin="0.5s" />
        </path>

        {/* Inner hexagon */}
        <path
          d="M250 110 L290 130 L290 180 L250 200 L210 180 L210 130 Z"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="400"
          strokeDashoffset="400"
        >
          <animate attributeName="stroke-dashoffset" values="400;0" dur="1.5s" fill="freeze" begin="1.5s" />
        </path>

        {/* Climbing maze path */}
        <path
          d="M250 200 L250 170 L220 170 L220 140 L280 140 L280 110 L250 110 L250 80"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#splashNeonGlow)"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <animate attributeName="stroke-dashoffset" values="500;0" dur="3s" fill="freeze" begin="2s" />
        </path>

        {/* Connection paths */}
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" begin="3s" />
          <line x1="180" y1="120" x2="140" y2="100" stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="320" y1="120" x2="360" y2="100" stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="180" y1="200" x2="140" y2="220" stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="320" y1="200" x2="360" y2="220" stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />
        </g>

        {/* Node points */}
        <circle cx="250" cy="200" r="0" fill="#06b6d4" filter="url(#splashNeonGlow)">
          <animate attributeName="r" values="0;6;4" dur="0.7s" fill="freeze" begin="2.5s" />
        </circle>
        <circle cx="220" cy="170" r="0" fill="#0ea5e9">
          <animate attributeName="r" values="0;5;3" dur="0.7s" fill="freeze" begin="3s" />
        </circle>
        <circle cx="280" cy="140" r="0" fill="#6366f1">
          <animate attributeName="r" values="0;5;3" dur="0.7s" fill="freeze" begin="3.5s" />
        </circle>
        <circle cx="250" cy="80" r="0" fill="#8b5cf6" filter="url(#splashNeonGlow)">
          <animate attributeName="r" values="0;8;6" dur="0.8s" fill="freeze" begin="4s" />
        </circle>

        {/* Title */}
        <text
          x="250" y="300"
          fontFamily="JetBrains Mono, monospace"
          fontSize="38" fontWeight="800"
          textAnchor="middle"
          fill="#e2e8f0"
          letterSpacing="3"
          opacity="0"
        >
          COGNICLIMB
          <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" begin="4.5s" />
          <animate attributeName="letter-spacing" values="10;3" dur="1s" fill="freeze" begin="4.5s" />
        </text>

        {/* Underline */}
        <line x1="150" y1="315" x2="350" y2="315" stroke="url(#splashHexGrad)" strokeWidth="3" strokeDasharray="200" strokeDashoffset="200">
          <animate attributeName="stroke-dashoffset" values="200;0" dur="1s" fill="freeze" begin="5s" />
        </line>

        {/* Code decoration */}
        <text x="250" y="340" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#64748b" textAnchor="middle" opacity="0">
          [ LEARNING_PATH_INITIALIZED ]
          <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" begin="5.5s" />
        </text>

        {/* Loading bar */}
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="5.8s" />
          <rect x="175" y="355" width="150" height="8" rx="4" fill="#1e293b" />
          <rect x="175" y="355" width="0" height="8" rx="4" fill="url(#splashHexGrad)">
            <animate attributeName="width" values="0;150" dur="2s" fill="freeze" begin="6s" />
          </rect>
        </g>
      </svg>
    </div>
  );
}
