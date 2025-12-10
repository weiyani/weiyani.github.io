import React, { useState, useEffect } from 'react';
import { X, Timer, Sparkles } from 'lucide-react';

interface ChristmasMatchProps {
  onClose: () => void;
}

interface Tile {
  id: string;
  row: number;
  col: number;
  emoji: string;
  matched: boolean;
  selected: boolean;
}

// 圣诞主题emoji
const CHRISTMAS_EMOJIS = [
  '🎅', '🎄', '⛄', '🎁', '🔔', '⭐', '🕯️', '🦌',
  '🧦', '❄️', '☃️', '🎀', '🍪', '🥛', '🌟', '✨',
];

// 关卡配置
const LEVEL_CONFIG = [
  { level: 1, rows: 6, cols: 8, timeLimit: 180, name: '新手上路' },   // LV1: 6x8=48格
  { level: 2, rows: 8, cols: 10, timeLimit: 240, name: '渐入佳境' },  // LV2: 8x10=80格
  { level: 3, rows: 10, cols: 12, timeLimit: 300, name: '高手之路' }, // LV3: 10x12=120格
  { level: 4, rows: 12, cols: 14, timeLimit: 360, name: '极限挑战' }, // LV4: 12x14=168格
];

const ChristmasMatch: React.FC<ChristmasMatchProps> = ({ onClose }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [level, setLevel] = useState(1);
  const [readyForNextLevel, setReadyForNextLevel] = useState(false);
  
  const currentLevelConfig = LEVEL_CONFIG[level - 1];
  const totalTiles = currentLevelConfig.rows * currentLevelConfig.cols;

  // 初始化游戏棋盘
  const initGame = () => {
    const newTiles: Tile[] = [];
    const { rows, cols } = currentLevelConfig;
    
    // 计算需要多少对emoji
    const pairsNeeded = (rows * cols) / 2;
    const emojis: string[] = [];
    
    // 生成成对的emoji
    for (let i = 0; i < pairsNeeded; i++) {
      const emoji = CHRISTMAS_EMOJIS[i % CHRISTMAS_EMOJIS.length];
      emojis.push(emoji, emoji);
    }
    
    // 打乱顺序
    for (let i = emojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }
    
    // 创建棋盘
    let emojiIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newTiles.push({
          id: `tile-${row}-${col}`,
          row,
          col,
          emoji: emojis[emojiIndex++],
          matched: false,
          selected: false,
        });
      }
    }
    
    setTiles(newTiles);
    setSelectedTiles([]);
    setMatchedCount(0);
    setTimeLeft(currentLevelConfig.timeLimit);
    setGameState('playing');
    setReadyForNextLevel(false);
  };

  // 检查两个方块是否可以连接（最多2个转角）
  const canConnect = (tile1: Tile, tile2: Tile): boolean => {
    const { rows, cols } = currentLevelConfig;
    
    // 创建扩展棋盘状态（增加外围一圈虚拟空格）
    // 棋盘坐标映射：board[row+1][col+1] 对应 tiles[row][col]
    const boardRows = rows + 2;
    const boardCols = cols + 2;
    const board: boolean[][] = Array(boardRows).fill(null).map(() => Array(boardCols).fill(false));
    
    tiles.forEach(t => {
      if (!t.matched && t.id !== tile1.id && t.id !== tile2.id) {
        board[t.row + 1][t.col + 1] = true; // 加1偏移
      }
    });
    
    // BFS搜索路径（使用扩展坐标）
    const queue: { row: number; col: number; turns: number }[] = [
      { row: tile1.row + 1, col: tile1.col + 1, turns: 0 }
    ];
    const visited = new Set<string>();
    visited.add(`${tile1.row + 1},${tile1.col + 1}`);
    
    const directions = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // 找到目标（使用扩展坐标）
      if (current.row === tile2.row + 1 && current.col === tile2.col + 1) {
        return true;
      }
      
      // 尝试四个方向
      for (const dir of directions) {
        let nr = current.row + dir.dr;
        let nc = current.col + dir.dc;
        let newTurns = current.turns;
        
        // 计算转角数
        if (current.turns > 0) {
          newTurns = current.turns + 1;
        }
        
        // 转角超过2个，跳过
        if (newTurns > 2) continue;
        
        // 沿着当前方向一直走（在扩展棋盘范围内）
        while (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
          const key = `${nr},${nc}`;
          
          // 到达目标（使用扩展坐标）
          if (nr === tile2.row + 1 && nc === tile2.col + 1) {
            return true;
          }
          
          // 遇到障碍物
          if (board[nr][nc]) break;
          
          // 访问过的节点
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({
              row: nr,
              col: nc,
              turns: newTurns,
            });
          }
          
          nr += dir.dr;
          nc += dir.dc;
        }
      }
    }
    
    return false;
  };

  // 处理方块点击
  const handleTileClick = (tile: Tile) => {
    if (gameState !== 'playing' || tile.matched) return;
    
    // 第一次选择
    if (selectedTiles.length === 0) {
      setSelectedTiles([tile]);
      setTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, selected: true } : t
      ));
      return;
    }
    
    // 点击同一个方块，取消选择
    if (selectedTiles[0].id === tile.id) {
      setSelectedTiles([]);
      setTiles(prev => prev.map(t => ({ ...t, selected: false })));
      return;
    }
    
    // 第二次选择，检查是否匹配
    const firstTile = selectedTiles[0];
    
    // emoji不同，重新选择
    if (firstTile.emoji !== tile.emoji) {
      setSelectedTiles([tile]);
      setTiles(prev => prev.map(t => ({
        ...t,
        selected: t.id === tile.id,
      })));
      return;
    }
    
    // 相同emoji，检查是否可以连接
    const canConnectResult = canConnect(firstTile, tile);
    
    if (canConnectResult) {
      // 可以连接，直接消除
      setTiles(prev => prev.map(t => 
        t.id === firstTile.id || t.id === tile.id
          ? { ...t, matched: true, selected: false }
          : { ...t, selected: false }
      ));
      setSelectedTiles([]);
      setMatchedCount(prev => prev + 2);
    } else {
      // 不能连接，重新选择
      setSelectedTiles([tile]);
      setTiles(prev => prev.map(t => ({
        ...t,
        selected: t.id === tile.id,
      })));
    }
  };

  // 初始化游戏
  useEffect(() => {
    // 准备棋盘数据
    const newTiles: Tile[] = [];
    const { rows, cols } = currentLevelConfig;
    
    // 计算需要多少对emoji
    const pairsNeeded = (rows * cols) / 2;
    const emojis: string[] = [];
    
    // 生成成对的emoji
    for (let i = 0; i < pairsNeeded; i++) {
      const emoji = CHRISTMAS_EMOJIS[i % CHRISTMAS_EMOJIS.length];
      emojis.push(emoji, emoji);
    }
    
    // 打乱顺序
    for (let i = emojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }
    
    // 创建棋盘
    let emojiIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newTiles.push({
          id: `tile-${row}-${col}`,
          row,
          col,
          emoji: emojis[emojiIndex++],
          matched: false,
          selected: false,
        });
      }
    }
    
    setTiles(newTiles);
    setSelectedTiles([]);
    setMatchedCount(0);
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
    if (matchedCount === totalTiles && gameState === 'playing' && matchedCount > 0) {
      if (level < 4) {
        setReadyForNextLevel(true);
      } else {
        setGameState('won');
      }
    }
  }, [matchedCount, gameState, level, totalTiles]);

  const handleRetry = () => {
    initGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4">
      <div className="bg-gradient-to-br from-red-50 to-green-50 rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-6xl w-full max-h-[95vh] overflow-hidden relative shadow-2xl border-4 border-red-400">
        
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
            <h2 className="text-2xl md:text-4xl font-chinese font-bold text-red-700 flex items-center gap-2">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
              圣诞连连看
            </h2>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm md:text-lg font-bold shadow-lg">
              LV{level}
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 font-chinese mb-3">
            {currentLevelConfig.name}
          </p>
          
          <div className="flex justify-center gap-4 md:gap-8 mt-3">
            <div className="bg-white/80 px-4 py-2 rounded-lg shadow border-2 border-red-400">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-600" />
                <span className="text-lg md:text-2xl font-bold" style={{ color: timeLeft <= 30 ? '#dc2626' : '#ea580c' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            
            <div className="bg-white/80 px-4 py-2 rounded-lg shadow border-2 border-red-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-lg md:text-2xl font-bold text-green-700">
                  {matchedCount}/{totalTiles}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 mt-2 font-chinese">
            连接相同图案，路径不超过2个转角！
          </p>
        </div>

        {/* 游戏区域 */}
        <div className="relative w-full bg-gradient-to-b from-blue-50 to-white rounded-xl overflow-auto border-4 border-red-500 shadow-inner p-2 md:p-4" style={{ maxHeight: '60vh' }}>
          <div 
            className="grid gap-1 md:gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${currentLevelConfig.cols}, minmax(0, 1fr))`,
              maxWidth: `${currentLevelConfig.cols * 60}px`,
            }}
          >
            {tiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={tile.matched}
                className={`
                  aspect-square flex items-center justify-center text-2xl md:text-4xl
                  rounded-lg transition-all duration-300 border-2
                  ${tile.matched 
                    ? 'opacity-0 pointer-events-none' 
                    : tile.selected
                      ? 'bg-yellow-300 border-yellow-500 scale-110 shadow-lg'
                      : 'bg-white border-red-300 hover:bg-red-50 hover:scale-105 cursor-pointer shadow'
                  }
                `}
              >
                {!tile.matched && tile.emoji}
              </button>
            ))}
          </div>
          

          
          {/* 开始游戏提示 */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
              <div className="bg-white/95 rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-red-400 max-w-md animate-bounce-in">
                <div className="text-6xl md:text-8xl mb-4">🎄</div>
                <h3 className="text-2xl md:text-4xl font-chinese font-bold text-red-700 mb-2">
                  准备好了吗？
                </h3>
                <p className="text-gray-600 font-chinese text-sm md:text-base mb-4">
                  在{currentLevelConfig.timeLimit}秒内消除所有方块！
                </p>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full text-xl font-bold hover:scale-110 transition shadow-lg border-b-4 border-red-700 active:scale-95 animate-pulse"
                >
                  开始挑战 🚀
                </button>
              </div>
            </div>
          )}
          
          {/* 通关弹窗 */}
          {readyForNextLevel && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
              <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-green-400 max-w-md animate-bounce-in">
                <div className="text-6xl md:text-8xl mb-4">🎉</div>
                <h3 className="text-2xl md:text-4xl font-chinese font-bold text-green-600 mb-2">
                  完成 LV{level}！
                </h3>
                <p className="text-gray-600 font-chinese text-sm md:text-base mb-4">
                  你在 {currentLevelConfig.timeLimit - timeLeft} 秒内完成了挑战！
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
          
          {/* 全部通关 */}
          {gameState === 'won' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
              <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow-2xl border-4 border-yellow-400 max-w-md animate-bounce-in">
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
          
          {/* 失败提示 */}
          {gameState === 'lost' && (
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-chinese font-bold">
                ⏰ 时间到！{matchedCount}/{totalTiles}
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

export default ChristmasMatch;
