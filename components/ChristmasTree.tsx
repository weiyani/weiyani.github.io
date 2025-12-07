import React, { useState } from 'react';
import { Decoration, DecorationType, BookColor } from '../types';
import { Book, Image, Mail, Gamepad2, CheckCircle2 } from 'lucide-react';

interface TreeProps {
  onInteraction: (type: 'photo' | 'music' | 'letter' | 'game') => void;
}

// 爱之书配置：每种颜色对应固定功能
const BOOK_CONFIG = [
  { color: 'red' as BookColor, emoji: '📕', action: 'letter' as const, name: '红色爱之书' },
  { color: 'blue' as BookColor, emoji: '📘', action: 'photo' as const, name: '蓝色爱之书' },
  { color: 'green' as BookColor, emoji: '📗', action: 'game' as const, name: '绿色爱之书' },
  { color: 'purple' as BookColor, emoji: '📙', action: 'music' as const, name: '黄色爱之书' },
];

const ChristmasTree: React.FC<TreeProps> = ({ onInteraction }) => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [foundBooks, setFoundBooks] = useState<Set<BookColor>>(new Set());
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

    // 20% 几率生成爱之书
    const isInteractive = Math.random() < 0.2;
    
    let newDecoration: Decoration;
    
    if (isInteractive) {
      // 随机选择一个还没找到的书
      const unfoundBooks = BOOK_CONFIG.filter(book => !foundBooks.has(book.color));
      
      if (unfoundBooks.length > 0) {
        const selectedBook = unfoundBooks[Math.floor(Math.random() * unfoundBooks.length)];
        newDecoration = {
          id: Date.now().toString(),
          x,
          y,
          type: DecorationType.INTERACTIVE,
          emoji: selectedBook.emoji,
          bookColor: selectedBook.color,
          action: selectedBook.action
        };
      } else {
        // 所有书都找到了，生成普通装饰
        newDecoration = {
          id: Date.now().toString(),
          x,
          y,
          type: DecorationType.NORMAL,
          emoji: emojis[Math.floor(Math.random() * emojis.length)]
        };
      }
    } else {
      // 普通装饰
      newDecoration = {
        id: Date.now().toString(),
        x,
        y,
        type: DecorationType.NORMAL,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      };
    }

    setDecorations(prev => [...prev, newDecoration]);
  };

  const handleDecorationClick = (e: React.MouseEvent, decoration: Decoration) => {
    e.stopPropagation();
    if (decoration.type === DecorationType.INTERACTIVE && decoration.action && decoration.bookColor) {
      // 标记为已找到
      setFoundBooks(prev => new Set(prev).add(decoration.bookColor!));
      // 触发对应动作
      onInteraction(decoration.action);
      // 移除该装饰（书被打开后消失）
      setDecorations(prev => prev.filter(d => d.id !== decoration.id));
    }
  };

  return (
    <div className="relative w-full">
      {/* 待寻找的爱之书列表 */}
      <div className="mb-4 md:mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-4 border-2 border-game-yellow shadow-lg max-w-2xl mx-auto">
        <h3 className="text-sm md:text-lg font-chinese font-bold text-game-blue text-center mb-2 md:mb-3 flex items-center justify-center gap-2">
          <Book className="w-4 h-4 md:w-5 md:h-5" />
          待寻找的爱之书 ({foundBooks.size}/{BOOK_CONFIG.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {BOOK_CONFIG.map(book => {
            const isFound = foundBooks.has(book.color);
            
            return (
              <div
                key={book.color}
                className={`relative flex flex-col items-center p-2 md:p-3 rounded-xl border-2 transition-all ${
                  isFound
                    ? 'bg-green-100 border-green-400 opacity-60'
                    : 'bg-white border-game-orange hover:scale-105'
                }`}
              >
                {isFound && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 text-green-600 fill-green-100" />
                )}
                <span className="text-2xl md:text-3xl mb-1">{book.emoji}</span>
                <span className="text-xs md:text-sm font-chinese font-bold text-gray-700 text-center">
                  {book.name}
                </span>
              </div>
            );
          })}
        </div>
        {/* 功能说明 */}
        <div className="mt-3 text-center text-xs md:text-sm text-gray-600 font-chinese">
          💡 点击装扮圣诞树，随机掉落惊喜爱之书! 📕
        </div>
        {foundBooks.size === BOOK_CONFIG.length && (
          <div className="mt-3 text-center text-sm md:text-base font-chinese font-bold text-game-orange animate-bounce">
            🎉 所有爱之书已集齐！
          </div>
        )}
      </div>

      {/* 圣诞树 */}
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
          className={`absolute text-xl md:text-4xl select-none transition-transform hover:scale-125 ${
            dec.type === DecorationType.INTERACTIVE
              ? 'animate-bounce cursor-pointer z-20 drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]'
              : 'drop-shadow-md'
          }`}
          style={{ left: dec.x - 15, top: dec.y - 15 }}
          onClick={(e) => handleDecorationClick(e, dec)}
        >
          {dec.emoji}
        </div>
      ))}
      </div>
    </div>
  );
};

export default ChristmasTree;