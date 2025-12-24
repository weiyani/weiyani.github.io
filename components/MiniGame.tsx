import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { BookOpen, Trophy, Skull, Shield } from 'lucide-react';

interface MiniGameProps {
  onWin: () => void;
  onClose: () => void;
}

const MiniGame: React.FC<MiniGameProps> = ({ onWin, onClose }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1); // 当前关卡
  const [readyForNextLevel, setReadyForNextLevel] = useState(false); // 准备进入下一关
  const [hasTriggeredFireworks, setHasTriggeredFireworks] = useState(false); // 是否已触发烟花
  const [finalScore, setFinalScore] = useState(0); // 保存LV4失败时的最终分数
  const [retryCount, setRetryCount] = useState(0); // 当前关卡重试次数
  const [shields, setShields] = useState(0); // 当前拥有的护盾数
  const [isLv4EasyMode, setIsLv4EasyMode] = useState(false); // LV4 是否为简单模式
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const GRAVITY = 0.6;
  
  // 关卡配置
  const LEVEL_CONFIG = [
    { level: 1, jumpForce: -13, speed: 6, scoreToPass: 520, isInfinite: false },  // LV1: 基础难度
    { level: 2, jumpForce: -12, speed: 7.5, scoreToPass: 520, isInfinite: false },  // LV2: 降低跳跃,提升速度
    { level: 3, jumpForce: -11.5, speed: 8.5, scoreToPass: 520, isInfinite: false },   // LV3: 继续降低跳跃,加快速度
    {
      level: 4,
      jumpForce: isLv4EasyMode ? -12 : -11.5, // 简单模式: LV1参数 (-13), 困难模式: LV3参数 (-12)
      speed: isLv4EasyMode ? 7.5 : 8.5,         // 简单模式: LV1参数 (7.5), 困难模式: LV3参数 (8.5)
      scoreToPass: 0,
      isInfinite: true
    },     // LV4: 无限模式
  ];
  
  const currentLevelConfig = LEVEL_CONFIG[level - 1];
  
  // Representing "Cody" (Green) or "May" (Blue)
  const playerRef = useRef({ x: 50, y: 200, dy: 0, width: 40, height: 40, grounded: false, color: '#4CC9F0' });
  const obstaclesRef = useRef<{x: number, y: number, w: number, h: number, type: 'bee' | 'toolbox'}[]>([]);
  const collectiblesRef = useRef<{x: number, y: number, collected: boolean}[]>([]); // Books/Pages
  const scoreRef = useRef(0);
  const shieldsRef = useRef(0);
  
  // 新增：控制蜜蜂生成的引用
  const heartsSinceLastBeeRef = useRef(0);
  const nextBeeThresholdRef = useRef(Math.floor(Math.random() * 5) + 5); // 5-9个爱心后生成蜜蜂

  const initGame = () => {
    playerRef.current = { x: 50, y: 200, dy: 0, width: 40, height: 40, grounded: false, color: '#4CC9F0' };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    heartsSinceLastBeeRef.current = 0;
    nextBeeThresholdRef.current = Math.floor(Math.random() * 5) + 5;
    shieldsRef.current = shields; // 同步护盾数量到 Ref
    setGameState(GameState.PLAYING);
    setReadyForNextLevel(false); // 重置下一关准备状态
  };

  const jump = () => {
    if (playerRef.current.grounded) {
      playerRef.current.dy = currentLevelConfig.jumpForce; // 使用当前关卡的跳跃力
      playerRef.current.grounded = false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === GameState.PLAYING) jump();
        // 仅在初始状态且未准备好下一关时允许通过按键开始
        if (gameState === GameState.IDLE && !readyForNextLevel) initGame();
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
       // 检查是否点击了关闭按钮或重试按钮，如果是则不阻止
       const target = e.target as HTMLElement;
       if (target.closest('button')) {
         return; // 允许按钮的点击事件正常触发
       }
       
       e.preventDefault();
       if (gameState === GameState.PLAYING) jump();
       // 仅在初始状态且未准备好下一关时允许通过点击开始
       if (gameState === GameState.IDLE && !readyForNextLevel) initGame();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('touchstart', handleTouch);
    }
  }, [gameState, readyForNextLevel]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
       return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        canvas.width = Math.min(window.innerWidth - 40, 800);
        canvas.height = 300;
    };
    resize();

    let frameCount = 0;

    const gameLoop = () => {
      if (gameState !== GameState.PLAYING) return;
      
      frameCount++;
      const player = playerRef.current;
      const obstacles = obstaclesRef.current;
      const collectibles = collectiblesRef.current;

      // Draw Background (Shed/Garden style)
      ctx.fillStyle = '#FFF8E1'; // Light warm bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor
      ctx.fillStyle = '#8D6E63'; // Wood/Earth
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      player.dy += GRAVITY;
      player.y += player.dy;

      if (player.y + player.height > canvas.height - 20) {
        player.y = canvas.height - 20 - player.height;
        player.dy = 0;
        player.grounded = true;
      }

      // Spawn Collectibles (Hearts) & Obstacles (Bees)
      // 蜜蜂生成逻辑修改：随机出现在 5-9 个爱心之后
      if (frameCount % 15 === 0) {
        // 生成爱心
        collectibles.push({
          x: canvas.width,
          y: canvas.height - 50 - (Math.random() * 100),
          collected: false
        });

        // 检查是否需要生成蜜蜂
        heartsSinceLastBeeRef.current += 1;
        if (heartsSinceLastBeeRef.current >= nextBeeThresholdRef.current) {
          // 重置计数器和阈值
          heartsSinceLastBeeRef.current = 0;
          nextBeeThresholdRef.current = Math.floor(Math.random() * 3) + 4;

          // 决定蜜蜂的高度类型
          // 50%概率生成低位蜜蜂（需要跳跃），50%概率生成高位蜜蜂（可以钻过去）
          const isHighBee = Math.random() > 0.9;
          
          let beeY;
          if (isHighBee) {
             // 高位蜜蜂：位于头部上方，不需要跳跃即可通过
             // 玩家高度40，地面y = canvas.height - 20
             // 玩家头部 y = canvas.height - 60
             // 蜜蜂高度30
             // 蜜蜂底部 < 玩家头部 => beeY + 30 < canvas.height - 60 => beeY < canvas.height - 90
             // 设置在 canvas.height - 130 到 canvas.height - 100 之间
             beeY = canvas.height - 20 - (Math.random() * 30 + 80);
          } else {
             // 低位蜜蜂：原有逻辑，需要跳跃
             beeY = canvas.height - 20 - (Math.random() * 40 + 30);
          }

          obstacles.push({
            x: canvas.width + 40, // 稍微错开一点，避免和爱心完全重叠
            y: beeY,
            w: 30,
            h: 30,
            type: 'bee'
          });
        }
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= currentLevelConfig.speed; // 使用当前关卡的速度

        // Draw Bee emoji 🐝
        ctx.font = `${obs.w * 1.5}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText('🐝', obs.x, obs.y + obs.h / 2);

        if (
          player.x < obs.x + obs.w &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.h &&
          player.height + player.y > obs.y
        ) {
          // 检查是否有护盾
          if (shieldsRef.current > 0) {
            shieldsRef.current -= 1;
            setShields(shieldsRef.current); // 更新 UI
            obstacles.splice(i, 1); // 移除蜜蜂，抵消一次伤害
            continue; // 继续游戏
          }

          // 游戏失败，先保存分数（LV4用），然后清零
          if (level === 4) {
            setFinalScore(scoreRef.current); // 保存LV4最终分数
          }
          // 保存当前分数用于显示（在清零前）
          setFinalScore(scoreRef.current);
          
          scoreRef.current = 0;
          setScore(0);
          setRetryCount(prev => prev + 1); // 增加重试次数
          setGameState(GameState.GAME_OVER);
          return;
        }

        if (obs.x + obs.w < -10) obstacles.splice(i, 1); // 提前清理，减少渲染负担
      }

      // Update & Draw Collectibles (Hearts)
      for (let i = collectibles.length - 1; i >= 0; i--) {
        let item = collectibles[i];
        if (item.collected) continue;
        
        item.x -= currentLevelConfig.speed; // 使用当前关卡的速度

        // Draw Heart emoji 💗
        ctx.font = '30px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText('💗', item.x, item.y);

        const dx = (player.x + player.width/2) - (item.x + 10);
        const dy = (player.y + player.height/2) - (item.y + 12);
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
            collectibles.splice(i, 1);
            scoreRef.current += 10;
            setScore(scoreRef.current);
            
            // 关卡升级逻辑（达到分数后等待手动点击）
            // 每关都是520分，不累加
            if (!currentLevelConfig.isInfinite && scoreRef.current >= currentLevelConfig.scoreToPass) {
              console.log('🎮 达到通关分数:', { level, score: scoreRef.current, target: currentLevelConfig.scoreToPass });
              if (level < 3) {
                // LV1和LV2达到分数后暂停，等待手动点击进入下一关
                console.log('✅ LV1/LV2 通关，等待手动进入下一关');
                setReadyForNextLevel(true);
                setGameState(GameState.IDLE); // 暂停游戏
                return;
              } else if (level === 3) {
                // LV3达到520分时，触发烟花胜利
                console.log('🎆 LV3 通关，触发烟花');
                setGameState(GameState.WON);
                // 只在第一次达到520分时触发烟花
                if (!hasTriggeredFireworks) {
                  onWin(); // 触发烟花
                  setHasTriggeredFireworks(true);
                }
                setReadyForNextLevel(true); // 准备进入LV4
                return;
              }
            }
        }
        
        if (item.x < -10) collectibles.splice(i, 1); // 提前清理，减少渲染负担
      }

      // Draw Player (More human-like character)
      // 身体（蓝色或绿色交替）
      ctx.fillStyle = Math.floor(frameCount / 30) % 2 === 0 ? '#4CC9F0' : '#70C1B3'; // Blue (May) / Green (Cody)
      ctx.fillRect(player.x + 10, player.y + 15, 20, 25); // 身体
      
      // 头部（圆形）
      ctx.fillStyle = '#F5D0A9'; // 肤色
      ctx.beginPath();
      ctx.arc(player.x + 20, player.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 眼睛
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(player.x + 17, player.y + 8, 2, 0, Math.PI * 2);
      ctx.arc(player.x + 23, player.y + 8, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 嘴巴（微笑）
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x + 20, player.y + 10, 5, 0, Math.PI);
      ctx.stroke();
      
      // 手臂（动态摆动）
      const armSwing = Math.sin(frameCount * 0.2) * 3;
      ctx.fillStyle = Math.floor(frameCount / 30) % 2 === 0 ? '#4CC9F0' : '#70C1B3';
      // 左手
      ctx.fillRect(player.x + 5, player.y + 20 + armSwing, 5, 15);
      // 右手
      ctx.fillRect(player.x + 30, player.y + 20 - armSwing, 5, 15);
      
      // 腿部（跑步动画）
      const legAnimation = Math.floor(frameCount / 10) % 2;
      if (legAnimation === 0) {
        // 左腿前，右腿后
        ctx.fillRect(player.x + 12, player.y + 35, 6, 10); // 左腿
        ctx.fillRect(player.x + 22, player.y + 37, 6, 8);  // 右腿
      } else {
        // 右腿前，左腿后
        ctx.fillRect(player.x + 12, player.y + 37, 6, 8);  // 左腿
        ctx.fillRect(player.x + 22, player.y + 35, 6, 10); // 右腿
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, onWin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 md:p-4">
      <div className="bg-white border-4 md:border-8 border-game-orange rounded-2xl md:rounded-3xl p-3 md:p-6 w-full max-w-4xl relative shadow-[0_0_0_5px_#FFBF00] md:shadow-[0_0_0_10px_#FFBF00] transform md:rotate-1">
        <button onClick={onClose} className="absolute top-1 right-2 md:top-2 md:right-4 text-gray-400 hover:text-red-500 text-2xl md:text-3xl font-display z-50 bg-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95">✕</button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6 px-2 md:px-4 text-gray-800 gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-xl md:text-4xl font-logo text-game-blue drop-shadow-sm transform md:-rotate-2">为爱奔跑大冒险</h2>
            <div className="flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm md:text-xl font-bold shadow-lg">
              LV{level}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shields > 0 && (
              <div className="flex items-center gap-1 md:gap-2 text-lg md:text-2xl font-bold text-blue-600 bg-blue-100 px-3 md:px-6 py-1 md:py-2 rounded-full border-2 border-blue-400">
                <Shield className="w-4 h-4 md:w-6 md:h-6" />
                {shields}
              </div>
            )}
            <div className="flex items-center gap-1 md:gap-2 text-lg md:text-2xl font-bold text-game-book bg-yellow-100 px-3 md:px-6 py-1 md:py-2 rounded-full border-2 border-game-orange">
              <BookOpen className="text-game-book w-4 h-4 md:w-6 md:h-6" />
              {level < 4 ? (
                <>{score} / {currentLevelConfig.scoreToPass}</>
              ) : (
                <>{score}</>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="w-full bg-slate-100 rounded-lg md:rounded-xl shadow-inner cursor-pointer border-2 md:border-4 border-slate-200" />

        <div className="mt-3 md:mt-6 text-center font-display">
            {gameState === GameState.IDLE && !readyForNextLevel && (
                <p className="text-lg md:text-2xl animate-bounce text-game-orange tracking-wider">点击开始：为了爱而奔跑!</p>
            )}
            {gameState === GameState.IDLE && readyForNextLevel && (
                <div className="flex flex-col items-center gap-3">
                    <p className="text-2xl md:text-3xl text-green-600 font-bold">🎉 完成 LV{level}！</p>
                    <button 
                        onClick={() => {
                          // 进入下一关时，分数清零
                          scoreRef.current = 0;
                          setScore(0);
                          setRetryCount(0); // 重置重试次数
                          setShields(0); // 重置护盾
                          setLevel(level + 1);
                          setReadyForNextLevel(false);
                          initGame();
                        }}
                        className="px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xl md:text-2xl font-bold hover:scale-110 transition shadow-lg border-b-4 border-purple-700 active:scale-95 animate-pulse"
                    >
                        进入 LV{level + 1} →
                    </button>
                </div>
            )}
            {gameState === GameState.GAME_OVER && (
                <div className="flex flex-col items-center gap-2">
                    <p className="text-2xl md:text-3xl text-gray-700">哎呀! 需要更多爱!</p>
                    
                    {/* 护盾兑换按钮 - 仅在 LV2/LV3 且重试 5 次以上时显示 */}
                    {(level === 2 || level === 3) && retryCount >= 5 && finalScore >= 160 && (
                      <div className="flex flex-col items-center gap-2 mb-2 p-3 bg-blue-50 rounded-xl border-2 border-blue-200 animate-pulse">
                        <p className="text-sm text-blue-600 font-bold">
                          🛡️ 护盾救援：上次获得 {finalScore} 爱心
                        </p>
                        <button
                          onClick={() => {
                            const newShields = Math.floor(finalScore / 160);
                            if (newShields > 0) {
                              setShields(prev => prev + newShields);
                              setFinalScore(prev => prev % 160); // 扣除已兑换的分数
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-md hover:scale-105 active:scale-95"
                        >
                          <Shield className="w-4 h-4" />
                          消耗爱心兑换 {Math.floor(finalScore / 160)} 个护盾
                        </button>
                      </div>
                    )}

                    {level === 4 && (
                      <div className="mb-2 p-3 md:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                        <p className="text-xl md:text-3xl font-bold text-purple-600 mb-1">最终分数</p>
                        <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {finalScore}
                        </p>
                      </div>
                    )}
                    {level === 4 && (
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setIsLv4EasyMode(true)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition ${isLv4EasyMode ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                          简单模式 (LV1速度)
                        </button>
                        <button
                          onClick={() => setIsLv4EasyMode(false)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition ${!isLv4EasyMode ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                          困难模式 (LV3速度)
                        </button>
                      </div>
                    )}
                    <button
                        onClick={() => {
                          scoreRef.current = 0;
                          setScore(0);
                          setFinalScore(0); // 重置最终分数
                          // 不重置关卡，保持当前关卡
                          initGame();
                        }}
                        className="px-6 md:px-8 py-2 md:py-3 bg-game-green text-white rounded-full text-lg md:text-xl hover:scale-110 transition shadow-lg border-b-4 border-teal-600 active:scale-95"
                    >
                        重新挑战 LV{level}
                    </button>
                </div>
            )}
            {gameState === GameState.WON && (
                <div className="flex flex-col items-center gap-3">
                    <div className="text-2xl md:text-4xl text-game-orange font-bold flex items-center justify-center gap-2 animate-pulse">
                        <Trophy className="text-yellow-500 w-8 h-8 md:w-12 md:h-12" /> 完成LV3！准备进入极限挑战...
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => setIsLv4EasyMode(true)}
                        className={`px-4 py-2 rounded-full text-lg font-bold transition border-b-4 active:scale-95 ${isLv4EasyMode ? 'bg-green-500 border-green-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-400'}`}
                      >
                        简单模式
                      </button>
                      <button
                        onClick={() => setIsLv4EasyMode(false)}
                        className={`px-4 py-2 rounded-full text-lg font-bold transition border-b-4 active:scale-95 ${!isLv4EasyMode ? 'bg-red-500 border-red-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-400'}`}
                      >
                        困难模式
                      </button>
                    </div>
                    <button
                        onClick={() => {
                          console.log('🔥 点击进入LV4按钮');
                          // 进入LV4时，分数清零
                          scoreRef.current = 0;
                          setScore(0);
                          setRetryCount(0);
                          setShields(0);
                          setLevel(4);
                          setReadyForNextLevel(false);
                          initGame();
                          console.log('✅ 已进入LV4');
                        }}
                        className="mt-3 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xl md:text-2xl font-bold hover:scale-110 transition shadow-lg border-b-4 border-red-700 active:scale-95 animate-bounce"
                    >
                        进入 LV4 无限模式 ({isLv4EasyMode ? '简单' : '困难'}) 🔥
                    </button>
                </div>
            )}
            {gameState === GameState.PLAYING && (
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <p className="text-sm md:text-lg text-gray-400 font-sans font-bold">
                    <span className="hidden md:inline">按空格键跳跃</span>
                    <span className="md:hidden">点击屏幕跳跃</span>
                  </p>
                  <div className="text-xs md:text-sm text-gray-500 font-chinese">
                    {level < 3 ? (
                      <span>达到 <span className="font-bold text-purple-600">{currentLevelConfig.scoreToPass}</span> 分进入下一关 | 速度: {currentLevelConfig.speed} | 跳跃: {Math.abs(currentLevelConfig.jumpForce)}</span>
                    ) : level === 3 ? (
                      <span>达到 <span className="font-bold text-orange-600">{currentLevelConfig.scoreToPass}</span> 分完成LV3，解锁极限挑战！ | 速度: {currentLevelConfig.speed} | 跳跃: {Math.abs(currentLevelConfig.jumpForce)}</span>
                    ) : (
                      <span className="font-bold text-pink-600">🎉 LV4 无限模式 ({isLv4EasyMode ? '简单' : '困难'})！看看你的爱有多少！</span>
                    )}
                  </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MiniGame;