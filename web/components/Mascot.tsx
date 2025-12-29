"use client";

export function Mascot({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-sm"
      >
        {/* 昭和レトロなパンダ風マスコット */}
        {/* 耳 */}
        <circle cx="25" cy="25" r="12" fill="#333" />
        <circle cx="75" cy="25" r="12" fill="#333" />
        
        {/* 顔 */}
        <circle cx="50" cy="55" r="40" fill="white" stroke="#333" strokeWidth="2" />
        
        {/* 目のまわりの黒い部分 */}
        <ellipse cx="35" cy="50" rx="10" ry="12" fill="#333" />
        <ellipse cx="65" cy="50" rx="10" ry="12" fill="#333" />
        
        {/* 目 */}
        <circle cx="35" cy="48" r="3" fill="white" />
        <circle cx="65" cy="48" r="3" fill="white" />
        
        {/* ほっぺ */}
        <circle cx="25" cy="65" r="5" fill="#ffb6c1" fillOpacity="0.6" />
        <circle cx="75" cy="65" r="5" fill="#ffb6c1" fillOpacity="0.6" />
        
        {/* 鼻 */}
        <circle cx="50" cy="62" r="4" fill="#333" />
        
        {/* 口 */}
        <path
          d="M42 72 Q50 78 58 72"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 蝶ネクタイ */}
        <path d="M40 90 L60 98 L60 82 Z" fill="#ff4500" />
        <path d="M60 90 L40 98 L40 82 Z" fill="#ff4500" />
        <circle cx="50" cy="90" r="3" fill="#ff4500" />
      </svg>
    </div>
  );
}

