import React, { useEffect, useRef, useState } from 'react';

const Fireworks: React.FC<{ active: boolean; onClose: () => void }> = ({ active, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!active) return;

    // 重置倒计时状态
    setCountdown(5);
    setCanClose(false);

    // 倒计时逻辑
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: any[] = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#F8B229'];

    const createFirework = (x: number, y: number) => {
      const particleCount = 100;
      const angleIncrement = (Math.PI * 2) / particleCount;
      const power = Math.random() * 5 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x,
          y,
          vx: Math.cos(angleIncrement * i) * Math.random() * power,
          vy: Math.sin(angleIncrement * i) * Math.random() * power,
          color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01
        });
      }
    };

    let intervalId = setInterval(() => {
      createFirework(
        Math.random() * canvas.width, 
        Math.random() * canvas.height / 2
      );
    }, 800);

    const animate = () => {
      if (!ctx) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      particles = particles.filter(p => p.alpha > 0);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; 
        p.alpha -= p.decay;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownInterval);
      cancelAnimationFrame(animId);
    };
  }, [active, onClose]);

  if (!active) return null;

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center ${canClose ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={handleClose}
      onTouchEnd={handleClose}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="z-10 text-center animate-bounce pointer-events-none">
        <h1 className="text-6xl md:text-8xl font-chinese font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-500 drop-shadow-lg mb-8">
           爱你一万年!
        </h1>
        {!canClose ? (
          <div className="text-white text-xl md:text-2xl font-chinese">
          </div>
        ) : (
          <p className="text-white text-xl md:text-2xl font-chinese animate-pulse">
            点击任意位置关闭烟花
          </p>
        )}
      </div>
    </div>
  );
};

export default Fireworks;