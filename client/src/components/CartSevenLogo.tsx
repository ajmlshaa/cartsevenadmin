import React from 'react';

interface CartSevenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightMode?: boolean;
}

export const CartSevenLogo: React.FC<CartSevenLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightMode = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic CartSeven Stylized Cart-7 Icon matching user uploaded image */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(255,85,0,0.35)]"
        >
          {/* Speed motion lines in orange */}
          <line x1="10" y1="36" x2="28" y2="36" stroke="#FF5500" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
          <line x1="5" y1="46" x2="30" y2="46" stroke="#FF5500" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="12" y1="56" x2="26" y2="56" stroke="#FF5500" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />

          {/* Cart Basket back frame in orange */}
          <path
            d="M 28 32 L 35 60 L 52 60"
            stroke="#FF5500"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cart Basket navy front wall */}
          <path
            d="M 52 60 L 78 60 L 88 38"
            stroke="#0A1931"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cart stylized 7 bold ribbon in vibrant orange */}
          <path
            d="M 26 24 C 28 20 34 20 38 20 L 76 20 C 82 20 86 24 85 30 C 83 34 80 37 74 37 L 54 37 L 42 64"
            fill="none"
            stroke="url(#cartOrangeGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cart Wheels in deep navy with orange center */}
          <circle cx="43" cy="74" r="6" fill="#0A1931" stroke="#FF5500" strokeWidth="2.5" />
          <circle cx="68" cy="74" r="6" fill="#0A1931" stroke="#FF5500" strokeWidth="2.5" />

          {/* Ground motion swoosh */}
          <path
            d="M 32 84 Q 56 82 78 84"
            stroke="#FF5500"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          <defs>
            <linearGradient id="cartOrangeGrad" x1="20" y1="20" x2="85" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="40%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#E63900" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center tracking-tight font-extrabold select-none">
          <span className={`${textSizes} font-black ${lightMode ? 'text-[#0A1931]' : 'text-white'}`}>
            Cart
          </span>
          <span className={`${textSizes} text-[#FF5500] font-black`}>Seven</span>
        </div>
      )}
    </div>
  );
};
