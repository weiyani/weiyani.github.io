import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { BookOpen, Trophy, Skull } from 'lucide-react';

interface MiniGameProps {
  onWin: () => void;
  onClose: () => void;
}

const MiniGame: React.FC<MiniGameProps> = ({ onWin, onClose }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12; 
  const GAME_SPEED = 6;
  const WIN_SCORE = 520; // 520 is meaningful in Chinese culture (I love you)
  
  // Representing "Cody" (Green) or "May" (Blue)
  const playerRef = useRef({ x: 50, y: 200, dy: 0, width: 40, height: 40, grounded: false, color: '#4CC9F0' });
  const obstaclesRef = useRef<{x: number, y: number, w: number, h: number, type: 'bee' | 'toolbox'}[]>([]);
  const collectiblesRef = useRef<{x: number, y: number, collected: boolean}[]>([]); // Books/Pages
  const scoreRef = useRef(0);

  const initGame = () => {
    playerRef.current = { x: 50, y: 200, dy: 0, width: 40, height: 40, grounded: false, color: '#4CC9F0' };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const jump = () => {
    if (playerRef.current.grounded) {
      playerRef.current.dy = JUMP_FORCE;
      playerRef.current.grounded = false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === GameState.PLAYING) jump();
        if (gameState === GameState.IDLE || gameState === GameState.GAME_OVER) initGame();
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
       e.preventDefault(); 
       if (gameState === GameState.PLAYING) jump();
       if (gameState === GameState.IDLE || gameState === GameState.GAME_OVER) initGame();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('touchstart', handleTouch);
    }
  }, [gameState]);

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

      // Spawn Obstacles (Bees from the tree level)
      if (frameCount % 90 === 0) {
        obstacles.push({
          x: canvas.width,
          y: canvas.height - 20 - (Math.random() * 40 + 30), 
          w: 30,
          h: 30,
          type: 'bee'
        });
      }

      // Spawn Collectibles (Dr. Hakim's Pages)
      if (frameCount % 20 === 0) {
        collectibles.push({
          x: canvas.width,
          y: canvas.height - 50 - (Math.random() * 100), 
          collected: false
        });
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= GAME_SPEED;

        // Draw Bee (Yellow/Black stripes)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000'; // Stripes
        ctx.fillRect(obs.x + 5, obs.y + 5, 20, 5);
        ctx.fillRect(obs.x + 5, obs.y + 15, 20, 5);
        
        // Wings
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.ellipse(obs.x + 15, obs.y - 5, 10, 5, 0, 0, Math.PI*2);
        ctx.fill();

        if (
          player.x < obs.x + obs.w &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.h &&
          player.height + player.y > obs.y
        ) {
          setGameState(GameState.GAME_OVER);
          return;
        }

        if (obs.x + obs.w < 0) obstacles.splice(i, 1);
      }

      // Update & Draw Collectibles (Pages)
      for (let i = collectibles.length - 1; i >= 0; i--) {
        let item = collectibles[i];
        if (item.collected) continue;
        
        item.x -= GAME_SPEED;

        // Draw Book Page
        ctx.fillStyle = '#E71D36'; // Red cover like Dr. Hakim
        ctx.fillRect(item.x, item.y, 20, 25);
        ctx.fillStyle = '#FFF'; // Pages
        ctx.fillRect(item.x + 2, item.y + 2, 16, 21);

        const dx = (player.x + player.width/2) - (item.x + 10);
        const dy = (player.y + player.height/2) - (item.y + 12);
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
            collectibles.splice(i, 1);
            scoreRef.current += 10;
            setScore(scoreRef.current);
            if (scoreRef.current >= WIN_SCORE) {
                setGameState(GameState.WON);
                onWin();
                return;
            }
        }
        
        if (item.x < -20) collectibles.splice(i, 1);
      }

      // Draw Player (Alternates colors to simulate 'It Takes Two')
      ctx.fillStyle = Math.floor(frameCount / 30) % 2 === 0 ? '#4CC9F0' : '#70C1B3'; // Blue (May) / Green (Cody)
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Head
      ctx.fillStyle = '#F5D0A9';
      ctx.fillRect(player.x + 5, player.y - 10, 30, 10);

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
        <button onClick={onClose} className="absolute top-1 right-2 md:top-2 md:right-4 text-gray-400 hover:text-red-500 text-2xl md:text-3xl font-display z-10">✕</button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6 px-2 md:px-4 text-gray-800 gap-2">
          <h2 className="text-xl md:text-4xl font-logo text-game-blue drop-shadow-sm transform md:-rotate-2">双人成行大冒险</h2>
          <div className="flex items-center gap-1 md:gap-2 text-lg md:text-2xl font-bold text-game-book bg-yellow-100 px-3 md:px-6 py-1 md:py-2 rounded-full border-2 border-game-orange">
            <BookOpen className="text-game-book w-4 h-4 md:w-6 md:h-6" /> {score} / {WIN_SCORE}
          </div>
        </div>

        <canvas ref={canvasRef} className="w-full bg-slate-100 rounded-lg md:rounded-xl shadow-inner cursor-pointer border-2 md:border-4 border-slate-200" />

        <div className="mt-3 md:mt-6 text-center font-display">
            {gameState === GameState.IDLE && (
                <p className="text-lg md:text-2xl animate-bounce text-game-orange tracking-wider">点击开始：为了爱而奔跑!</p>
            )}
            {gameState === GameState.GAME_OVER && (
                <div className="flex flex-col items-center gap-2">
                    <p className="text-2xl md:text-3xl text-gray-700">哎呀! 需要合作!</p>
                    <button 
                        onClick={initGame}
                        className="px-6 md:px-8 py-2 md:py-3 bg-game-green text-white rounded-full text-lg md:text-xl hover:scale-110 transition shadow-lg border-b-4 border-teal-600 active:scale-95"
                    >
                        重新挑战
                    </button>
                </div>
            )}
            {gameState === GameState.WON && (
                <div className="text-2xl md:text-4xl text-game-orange font-bold flex items-center justify-center gap-2 animate-pulse">
                    <Trophy className="text-yellow-500 w-8 h-8 md:w-12 md:h-12" /> 修复成功! 爱意满满!
                </div>
            )}
            {gameState === GameState.PLAYING && (
                <p className="text-sm md:text-lg text-gray-400 font-sans font-bold">
                  <span className="hidden md:inline">按空格键跳跃</span>
                  <span className="md:hidden">点击屏幕跳跃</span>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MiniGame;