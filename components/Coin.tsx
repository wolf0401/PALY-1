
import React from 'react';

interface CoinProps {
  isHeads: boolean;
  isSpinning: boolean;
}

const Coin: React.FC<CoinProps> = ({ isHeads, isSpinning }) => {
  return (
    <div className={`relative w-20 h-20 md:w-24 md:h-24 transition-all duration-500 transform-gpu ${isSpinning ? 'animate-bounce' : ''}`}>
      <div 
        className={`w-full h-full rounded-full border-[6px] border-[#3d2b1f] flex items-center justify-center shadow-2xl bg-gradient-to-br from-[#8b5a2b] via-[#5d3a1a] to-[#2d1b0d] text-amber-100 font-bold text-2xl transition-transform duration-700 ${isHeads ? 'rotate-0' : 'rotate-180'}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 flex items-center justify-center backface-hidden lishu-font">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-amber-900/30 flex items-center justify-center bg-[#2d1b0d]/50">
            {isHeads ? '陽' : '陰'}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center backface-hidden rotate-180 lishu-font" style={{ transform: 'rotateY(180deg)' }}>
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-amber-900/30 flex items-center justify-center bg-[#2d1b0d]/50">
            {isHeads ? '陰' : '陽'}
          </div>
        </div>
        {/* Ancient square hole detail */}
        <div className="absolute w-6 h-6 border-2 border-amber-900/20 bg-transparent"></div>
      </div>
    </div>
  );
};

export default Coin;
