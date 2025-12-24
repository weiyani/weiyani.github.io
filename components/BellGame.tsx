import React, { useState, useEffect } from 'react';
import { X, Timer, Bell } from 'lucide-react';

interface SantaGameProps {
  onClose: () => void;
}

interface Decoration {
  id: string;
  x: number;
  y: number;
  isSanta: boolean;
  emoji: string;
  found: boolean;
}

// 与🎅相似的红色系emoji - 10个
const SIMILAR_SANTA_EMOJIS = [
  '😊', '😍', '🥰', '😘', '😄', '🤗', '😇', '🥳', '😂', '🤣'
];

// 其他丰富的装饰emoji
const DECORATIVE_EMOJIS = [
  // 圣诞节日系列
  '🎄', '⛄', '🎁', '🧦', '🕯️', '❄️', '☃️', '🎊',
  // 表情符号
  '😊', '😍', '🥰', '😘', '😄', '🤗', '😇', '🥳', '😂', '🤣',
  // 食物甜点
  '🍰', '🎂', '🧁', '🍪', '🍩', '🍭', '🍬', '🍫',
  // 花朵植物
  '🌺', '🌸', '🌼', '🌻', '🌷', '🏵️', '💐',
  // 其他装饰
  '❤️', '💕', '🌹', '🎈', '🎀',   '🍎', '🍓', '🍒', '🌶️', '🔴'
];

// 关卡配置
const LEVEL_CONFIG = [
  { level: 1, santas: 5, decorations: 80, timeLimit: 45, name: '新手上路' },  // LV1: 简单
  { level: 2, santas: 10, decorations: 150, timeLimit: 60, name: '渐入佳境' }, // LV2: 中等
  { level: 3, santas: 15, decorations: 250, timeLimit: 80, name: '高手之路' }, // LV3: 困难
  { level: 4, santas: 20, decorations: 300, timeLimit: 100, name: '极限挑战' }, // LV4: 极限
];

const SantaGame: React.FC<SantaGameProps> = ({ onClose }) => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [foundSantas, setFoundSantas] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle'); // 初始为 idle
  const [level, setLevel] = useState(1); // 当前关卡
  const [readyForNextLevel, setReadyForNextLevel] = useState(false); // 准备进入下一关
  
  const currentLevelConfig = LEVEL_CONFIG[level - 1];

  // 初始化装饰品
  const initGame = () => {
    const newDecorations: Decoration[] = [];
    const santaPositions: {x: number, y: number}[] = [];
    
    // 先创建圣诞老人位置
    for (let i = 0; i < currentLevelConfig.santas; i++) {
      const position = {
        x: Math.random() * 90 + 5, // 5-95%
        y: Math.random() * 90 + 5, // 5-95%
      };
      santaPositions.push(position);
      newDecorations.push({
        id: `santa-${i}-${Date.now()}`,
        x: position.x,
        y: position.y,
        isSanta: true,
        emoji: '🎅',
        found: false
      });
    }
    
    // 创建干扰装饰 - 允许部分遮挡但确保圣诞老人至少1/4可见
    const minDistance = 2; // 缩小最小距离，允许部分遮挡
    for (let i = 0; i < currentLevelConfig.decorations - currentLevelConfig.santas; i++) {
      let attempts = 0;
      let x: number = 0;
      let y: number = 0;
      let tooClose: boolean = false;
      
      // 尝试找到一个不会完全遮挡圣诞老人的位置
      do {
        x = Math.random() * 90 + 5;
        y = Math.random() * 90 + 5;
        tooClose = santaPositions.some(santa => {
          const distance = Math.sqrt(Math.pow(x - santa.x, 2) + Math.pow(y - santa.y, 2));
          return distance < minDistance; // 只避免完全重叠
        });
        attempts++;
      } while (tooClose && attempts < 5); // 减少尝试次数，允许更多随机性
      
      // 随机选择emoji：30%概率使用相似emoji，70%概率使用装饰emoji
      const usesSimilar = Math.random() < 0.3;
      const emojiPool = usesSimilar ? SIMILAR_SANTA_EMOJIS : DECORATIVE_EMOJIS;
      
      newDecorations.push({
        id: `decor-${i}-${Date.now()}`,
        x: x!,
        y: y!,
        isSanta: false,
        emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
        found: false
      });
    }
    
    setDecorations(newDecorations);
    setFoundSantas(0);
    setTimeLeft(currentLevelConfig.timeLimit);
    setGameState('playing'); // 开始游戏
    setReadyForNextLevel(false);
  };

  // 初始化游戏 - 只在关卡变化时设置数据，不自动开始
  useEffect(() => {
    // 准备游戏数据但不开始
    const newDecorations: Decoration[] = [];
    const santaPositions: {x: number, y: number}[] = [];
    
    // 先创建圣诞老人位置
    for (let i = 0; i < currentLevelConfig.santas; i++) {
      const position = {
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
      };
      santaPositions.push(position);
      newDecorations.push({
        id: `santa-${i}-${Date.now()}`,
        x: position.x,
        y: position.y,
        isSanta: true,
        emoji: '🎅',
        found: false
      });
    }
    
    // 创建干扰装饰 - 允许部分遮挡但确保圣诞老人至少1/4可见
    const minDistance = 3; // 缩小最小距离
    for (let i = 0; i < currentLevelConfig.decorations - currentLevelConfig.santas; i++) {
      let attempts = 0;
      let x: number = 0;
      let y: number = 0;
      let tooClose: boolean = false;
      
      do {
        x = Math.random() * 90 + 5;
        y = Math.random() * 90 + 5;
        tooClose = santaPositions.some(santa => {
          const distance = Math.sqrt(Math.pow(x - santa.x, 2) + Math.pow(y - santa.y, 2));
          return distance < minDistance;
        });
        attempts++;
      } while (tooClose && attempts < 5);
      
      // 随机选择emoji：30%概率使用相似emoji，70%概率使用装饰emoji
      const usesSimilar = Math.random() < 0.3;
      const emojiPool = usesSimilar ? SIMILAR_SANTA_EMOJIS : DECORATIVE_EMOJIS;
      
      newDecorations.push({
        id: `decor-${i}-${Date.now()}`,
        x: x!,
        y: y!,
        isSanta: false,
        emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
        found: false
      });
    }
    
    setDecorations(newDecorations);
    setFoundSantas(0);
    setTimeLeft(currentLevelConfig.timeLimit);
    if (level === 1) {
      setGameState('idle'); // 第一关显示开始提示
    } else {
      setGameState('playing'); // 其他关卡直接开始
    }
  }, [level]);

  // 倒计时
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (timeLeft <= 0) {
      setGameState('lost');
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // 检查胜利条件
  useEffect(() => {
    if (foundSantas === currentLevelConfig.santas && gameState === 'playing') {
      if (level < 4) {
        // LV1-LV3 通关，准备进入下一关
        setReadyForNextLevel(true);
      } else {
        // LV4 最后一关，游戏胜利
        setGameState('won');
      }
    }
  }, [foundSantas, gameState, level]);

  const handleDecorationClick = (e: React.MouseEvent, decoration: Decoration) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (gameState !== 'playing' || decoration.found) return;
    
    if (decoration.isSanta) {
      setDecorations(prev => 
        prev.map(d => d.id === decoration.id ? { ...d, found: true } : d)
      );
      setFoundSantas(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    initGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-4xl w-full max-h-[95vh] overflow-hidden relative shadow-2xl border-4 border-yellow-400">
        
        {/* 关闭按钮 */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg z-20"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* 标题和信息栏 */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl md:text-4xl font-chinese font-bold text-yellow-800 flex items-center gap-2">
              <Bell className="w-6 h-6 md:w-8 md:h-8" />
              寻找圣诞圣诞老人
            </h2>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm md:text-lg font-bold shadow-lg">
              LV{level}
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 font-chinese mb-3">
            {currentLevelConfig.name}
          </p>
          
          <div className="flex justify-center gap-4 md:gap-8 mt-3">
            <div className="bg-white/80 px-4 py-2 rounded-lg shadow border-2 border-yellow-400">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-600" />
                <span className="text-lg md:text-2xl font-bold" style={{ color: timeLeft <= 10 ? '#dc2626' : '#ea580c' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            
            <div className="bg-white/80 px-4 py-2 rounded-lg shadow border-2 border-yellow-400">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <span className="text-lg md:text-2xl font-bold text-yellow-700">
                  {foundSantas}/{currentLevelConfig.santas}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 mt-2 font-chinese">
            在{currentLevelConfig.timeLimit}秒内找到所有隐藏的🎅铃铛！
          </p>
        </div>

        {/* 游戏区域 - 圣诞树背景 */}
        <div className="relative w-full aspect-[3/4] md:aspect-video bg-gradient-to-b from-blue-50 to-white rounded-xl overflow-hidden border-4 border-yellow-500 shadow-inner">
          {/* 圣诞树背景 - 100%不透明度 */}
          <img 
            src="/tree.png"
            alt="Christmas Tree" 
            className="absolute inset-0 w-full h-full object-contain opacity-100"
            draggable={false}
          />
          
          {/* 装饰品 - 只有铃铛可点击 */}
          {decorations.map(decoration => (
            <button
              key={decoration.id}
              type="button"
              className={`absolute text-2xl md:text-4xl select-none z-10 bg-transparent border-0 ${
                decoration.found 
                  ? 'scale-0 opacity-0 transition-all duration-300 pointer-events-none' 
                  : decoration.isSanta
                    ? 'cursor-pointer hover:scale-125 active:scale-110 transition-transform opacity-100'
                    : 'pointer-events-none opacity-85' // 干扰物90%透明度
              }`}
              style={{ 
                left: `${decoration.x}%`, 
                top: `${decoration.y}%`,
                transform: 'translate(-50%, -50%)',
                padding: decoration.isSanta ? '12px' : '0',
                margin: decoration.isSanta ? '-12px' : '0',
                touchAction: 'manipulation'
              }}
              onClick={(e) => decoration.isSanta && handleDecorationClick(e, decoration)}
            >
              {decoration.emoji}
            </button>
          ))}
          
          {/* 失败时显示未找到的圣诞老人位置 - 静态高亮 */}
          {gameState === 'lost' && decorations
            .filter(d => d.isSanta && !d.found)
            .map(santa => (
              <div
                key={`highlight-${santa.id}`}
                className="absolute z-30"
                style={{ 
                  left: `${santa.x}%`, 
                  top: `${santa.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* 静态红色圆圈 */}
                <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 -translate-x-1/2 -translate-y-1/2 bg-red-500/30 rounded-full border-4 border-red-500"></div>
                {/* 箭头指示 */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 text-2xl font-bold">↓</div>
              </div>
            ))
          }
          
          {/* 开始游戏提示 */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white/95 rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-yellow-400 max-w-md animate-bounce-in">
                <div className="text-6xl md:text-8xl mb-4">🎅</div>
                <h3 className="text-2xl md:text-4xl font-chinese font-bold text-yellow-700 mb-2">
                  准备好了吗？
                </h3>
                <p className="text-gray-600 font-chinese text-sm md:text-base mb-4">
                  在{currentLevelConfig.timeLimit}秒内找到 {currentLevelConfig.santas} 个圣诞老人！
                </p>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xl font-bold hover:scale-110 transition shadow-lg border-b-4 border-yellow-700 active:scale-95 animate-pulse"
                >
                  开始挑战 🚀
                </button>
              </div>
            </div>
          )}
          
          {/* 游戏结果弹窗 - 提高z-index确保在所有装饰品上方 */}
          {readyForNextLevel && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-green-400 max-w-md animate-bounce-in pointer-events-auto">
                <div className="text-6xl md:text-8xl mb-4">🎉</div>
                <h3 className="text-2xl md:text-4xl font-chinese font-bold text-green-600 mb-2">
                  完成 LV{level}！
                </h3>
                <p className="text-gray-600 font-chinese text-sm md:text-base mb-4">
                  你在 {currentLevelConfig.timeLimit - timeLeft} 秒内找到了所有圣诞老人！
                </p>
                <button
                  onClick={() => {
                    setLevel(level + 1);
                    setReadyForNextLevel(false);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xl font-bold hover:scale-110 transition shadow-lg border-b-4 border-purple-700 active:scale-95 animate-pulse"
                >
                  进入 LV{level + 1} →
                </button>
              </div>
            </div>
          )}
          
          {gameState === 'won' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-yellow-400 max-w-md animate-bounce-in pointer-events-auto">
                <div className="text-6xl md:text-8xl mb-4">🏆</div>
                <h3 className="text-2xl md:text-4xl font-chinese font-bold text-orange-600 mb-2">
                  全部通关！
                </h3>
                <p className="text-gray-600 font-chinese text-sm md:text-base mb-4">
                  你完成了所有 {LEVEL_CONFIG.length} 个关卡的挑战！
                </p>
                <button
                  onClick={onClose}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-chinese font-bold hover:bg-orange-600 transition-colors"
                >
                  太棒了！
                </button>
              </div>
            </div>
          )}
          
          {/* 失败时在右上角显示简洁提示和重试按钮 */}
          {gameState === 'lost' && (
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-chinese font-bold">
                ⏰ 时间到！{foundSantas}/{currentLevelConfig.santas}
              </div>
              <button
                onClick={handleRetry}
                className="bg-white text-red-500 px-4 py-2 rounded-lg font-chinese font-bold hover:bg-red-50 transition-colors shadow-lg border-2 border-red-500 text-sm"
              >
                🔄 重新开始
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SantaGame;
