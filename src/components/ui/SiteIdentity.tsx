import React from 'react';

interface SiteIdentityProps {
  /**
   * Size of the logo in pixels
   */
  size?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the logo should have hover effects
   */
  interactive?: boolean;
}

/**
 * Site identity component featuring the Unmask.life logo
 * Renders an SVG version of the brand mask logo with gradient styling
 */
export const SiteIdentity: React.FC<SiteIdentityProps> = ({
  size = 48,
  className = '',
  interactive = false
}) => {
  const baseClasses = 'transition-all duration-300';
  const interactiveClasses = interactive 
    ? 'hover:scale-110 hover:drop-shadow-lg cursor-pointer' 
    : '';
  
  return (
    <div
      className={`inline-block ${baseClasses} ${interactiveClasses} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 400 400" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="unmask-logo-title"
        className="w-full h-full"
      >
        <title id="unmask-logo-title">Unmask.life Logo</title>
        
        <defs>
          <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main mask shape */}
        <path 
          d="M200 60
             Q280 60 340 120
             Q360 140 360 170
             L360 220
             Q360 280 320 320
             Q280 340 240 350
             L200 380
             L160 350
             Q120 340 80 320
             Q40 280 40 220
             L40 170
             Q40 140 60 120
             Q120 60 200 60 Z"
          fill="url(#maskGradient)"
          filter="url(#glow)"
        />
        
        {/* Left eye cutout */}
        <ellipse 
          cx="150" 
          cy="180" 
          rx="45" 
          ry="35" 
          fill="#0a0a0a"
        />
        
        {/* Right eye cutout */}
        <ellipse 
          cx="250" 
          cy="180" 
          rx="45" 
          ry="35" 
          fill="#0a0a0a"
        />
        
        {/* Heart shape at bottom */}
        <path
          d="M200 280
             Q185 270 170 275
             Q160 280 160 290
             Q160 300 170 310
             L200 335
             L230 310
             Q240 300 240 290
             Q240 280 230 275
             Q215 270 200 280 Z"
          fill="#0a0a0a"
        />
        
        {/* Crack detail at top */}
        <path
          d="M200 60
             L195 75
             L200 90
             L205 85
             L210 95
             L205 105
             L200 100
             L195 110
             L200 120"
          stroke="#0a0a0a"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

export default SiteIdentity;