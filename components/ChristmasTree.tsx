import React, { useState } from 'react';
import { Decoration, DecorationType } from '../types';

interface TreeProps {
  onInteraction: (type: 'photo' | 'music' | 'letter' | 'game') => void;
}

const ChristmasTree: React.FC<TreeProps> = ({ onInteraction }) => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  // Use local tree.png from public folder
  const [treeImg, setTreeImg] = useState("/tree.png");
  const [imgError, setImgError] = useState(false);

  // Game specific items: Hammer (Cody), Wrench (May), Yarn (Rose's Room), Book (Hakim), Bee (Tree level), Snowglobe, etc.
const emojis = [
  '🔔',  // 铃铛
  '🎀',  // 蝴蝶结
  '🎁',  // 礼物
  '🧦',  // 圣诞袜
  '🦌',  // 驯鹿
  '⛄',  // 雪人
  '❄️',  // 雪花
];
  const handleTreeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 20% chance for interactive "Book of Love" (Hakim)
    const isInteractive = Math.random() < 0.2; 
    
    const newDecoration: Decoration = {
      id: Date.now().toString(),
      x, 
      y,
      type: isInteractive ? DecorationType.INTERACTIVE : DecorationType.NORMAL,
      emoji: isInteractive ? '📕' : emojis[Math.floor(Math.random() * emojis.length)]
    };

    setDecorations(prev => [...prev, newDecoration]);
  };

  const handleDecorationClick = (e: React.MouseEvent, decoration: Decoration) => {
    e.stopPropagation(); 
    if (decoration.type === DecorationType.INTERACTIVE) {
      const actions: ('photo' | 'music' | 'letter' | 'game')[] = ['photo', 'letter', 'game'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      onInteraction(action);
    }
  };

  return (
    <div className="relative w-64 h-[320px] md:w-[500px] md:h-[600px] mx-auto mt-auto cursor-pointer group select-none flex items-end justify-center" onClick={handleTreeClick}>

      <img 
        src={treeImg}
        alt="Adventure Tree" 
        className="w-full h-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-300"
        draggable={false}
        onError={() => {
            if (!imgError) {
                console.warn("Tree image failed to load, falling back to Unsplash.");
                setImgError(true);
                // Fallback to Unsplash image if local tree.png fails
                setTreeImg("https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80");
            }
        }}
      />

      {/* Decorations Overlay */}
      {decorations.map(dec => (
        <div
          key={dec.id}
          className={`absolute text-xl md:text-4xl select-none transition-transform hover:scale-125 ${dec.type === DecorationType.INTERACTIVE ? 'animate-bounce cursor-pointer z-20 drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]' : 'drop-shadow-md'}`}
          style={{ left: dec.x - 15, top: dec.y - 15 }}
          onClick={(e) => handleDecorationClick(e, dec)}
        >
          {dec.emoji}
        </div>
      ))}
    </div>
  );
};

export default ChristmasTree;