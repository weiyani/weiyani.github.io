import React, { useState, useEffect } from 'react';

interface MusicCountdownProps {
  onComplete: () => void;
}

const MusicCountdown: React.FC<MusicCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    // 倒计时逻辑
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // 倒计时结束，延迟一点再触发完成
      const timer = setTimeout(() => onComplete(), 300);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  if (count === 0) {
    return null; // 倒计时结束直接消失
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
      {/* 简洁的倒计时数字 */}
      <div className="relative">
        {/* 光晕效果 */}
        <div className="absolute inset-0 blur-3xl opacity-60">
          <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse" />
        </div>

        {/* 倒计时数字 */}
        <div 
          className="relative text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-400 animate-scale-pulse drop-shadow-2xl"
          style={{
            textShadow: '0 0 80px rgba(255, 255, 255, 0.8), 0 0 120px rgba(255, 182, 193, 0.6)'
          }}
        >
          {count}
        </div>
      </div>
    </div>
  );
};

export default MusicCountdown;
