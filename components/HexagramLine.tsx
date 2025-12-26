
import React from 'react';
import { LineType } from '../types';

interface HexagramLineProps {
  type: LineType;
  label?: string;
  isMoving?: boolean;
}

const HexagramLine: React.FC<HexagramLineProps> = ({ type, label, isMoving }) => {
  const isYang = type === LineType.YoungYang || type === LineType.OldYang;
  
  return (
    <div className="flex items-center space-x-6 w-full h-10 group">
      {label && <span className="text-sm text-amber-100/40 w-16 lishu-font">{label}</span>}
      <div className="flex-1 flex justify-center items-center h-full">
        {isYang ? (
          <div className={`h-3 w-full max-w-[180px] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] relative transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`}>
            {type === LineType.OldYang && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-4 border-[#1a1a1a] bg-amber-600 animate-pulse"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full max-w-[180px] justify-between items-center h-full space-x-4">
            <div className={`h-3 w-[45%] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`} />
            {type === LineType.OldYin && <div className="text-amber-500 font-bold text-lg lishu-font drop-shadow-md">✕</div>}
            <div className={`h-3 w-[45%] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HexagramLine;
