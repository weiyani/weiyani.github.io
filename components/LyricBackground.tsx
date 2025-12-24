import React from 'react';

interface LyricBackgroundProps {
  lyric: string;
  isPlaying: boolean;
}

const LyricBackground: React.FC<LyricBackgroundProps> = ({ lyric, isPlaying }) => {
  if (!lyric || !isPlaying) return null;

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden px-4">
      {/* 多层背景歌词效果 */}
      <div className="w-full flex items-center justify-center">
        {/* 最远层 - 淡淡的背景 */}
        <p className="absolute text-[6rem] md:text-[10rem] lg:text-[14rem] font-chinese font-black text-christmas-red/8 blur-2xl animate-pulse w-full text-center">
          {lyric}
        </p>
        
        {/* 主歌词 - 清晰彩色渐变 */}
        <p className="relative text-[3rem] md:text-[5rem] lg:text-[8rem] font-chinese font-black bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent animate-fade-in w-full text-center leading-tight px-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          {lyric}
        </p>
      </div>
      
      {/* 音符装饰 */}
      <div className="absolute top-1/4 left-1/4 text-4xl md:text-6xl animate-float opacity-30 text-pink-400">
        ♪
      </div>
      <div className="absolute bottom-1/3 right-1/4 text-4xl md:text-6xl animate-float-delayed opacity-30 text-yellow-400">
        ♫
      </div>
      <div className="absolute top-1/3 right-1/3 text-3xl md:text-5xl animate-float opacity-25 text-blue-400">
        ♪
      </div>
      <div className="absolute bottom-1/4 left-1/3 text-4xl md:text-6xl animate-float-delayed opacity-25 text-green-400">
        ♫
      </div>
    </div>
  );
};

export default LyricBackground;
