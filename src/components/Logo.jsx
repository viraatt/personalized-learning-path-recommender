import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * CogniClimb Logo component.
 * Renders the SVG graphic only (no title text) with "Cogni Climb" beside it.
 * Uses unique filter/gradient IDs to avoid clashes with SplashScreen.
 */
export default function Logo() {
  return (
    <NavLink to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
      <svg
        width="40"
        height="40"
        viewBox="180 75 140 175"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#06b6d4' }} />
            <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
          </linearGradient>
          <filter id="logoNeonGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer hexagon */}
        <path
          d="M250 80 L320 120 L320 200 L250 240 L180 200 L180 120 Z"
          fill="none"
          stroke="url(#logoHexGrad)"
          strokeWidth="4"
          filter="url(#logoNeonGlow)"
        />
        {/* Inner hexagon */}
        <path
          d="M250 110 L290 130 L290 180 L250 200 L210 180 L210 130 Z"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Climbing maze path */}
        <path
          d="M250 200 L250 170 L220 170 L220 140 L280 140 L280 110 L250 110 L250 80"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoNeonGlow)"
        />
        {/* Node points */}
        <circle cx="250" cy="200" r="6" fill="#06b6d4" filter="url(#logoNeonGlow)" />
        <circle cx="220" cy="170" r="5" fill="#0ea5e9" />
        <circle cx="280" cy="140" r="5" fill="#6366f1" />
        <circle cx="250" cy="80" r="8" fill="#8b5cf6" filter="url(#logoNeonGlow)" />
      </svg>
      <span style={{ fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(90deg,#06b6d4,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Cogni<span style={{ WebkitTextFillColor: '#8b5cf6' }}>Climb</span>
      </span>
    </NavLink>
  );
}
