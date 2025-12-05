import React, { useEffect, useRef } from 'react';

const SnowBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Magical spores/dandelion seeds mixed with Hearts
    const particles: { 
      x: number; 
      y: number; 
      radius: number; 
      speedX: number; 
      speedY: number; 
      opacity: number; 
      color: string;
      type: 'circle' | 'heart';
      rotation: number;
    }[] = [];
    
    const count = 50;
    const colors = ['#FF9F1C', '#FFFFFF', '#4CC9F0', '#FFBF00', '#FF6B6B', '#FFC3A0']; // Warmer colors added

    for (let i = 0; i < count; i++) {
      const isHeart = Math.random() > 0.6; // 40% chance of being a heart
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (isHeart ? 15 : 4) + (isHeart ? 10 : 1), // Hearts are bigger
        speedX: (Math.random() - 0.5) * 0.8, 
        speedY: (Math.random() - 0.5) * 0.8, 
        opacity: Math.random() * 0.5 + 0.1,
        color: isHeart ? '#FF6B6B' : colors[Math.floor(Math.random() * colors.length)],
        type: isHeart ? 'heart' : 'circle',
        rotation: Math.random() * 360
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around screen
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        if (p.type === 'heart') {
            ctx.font = `${p.radius}px sans-serif`;
            ctx.fillText('💗', p.x, p.y);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

export default SnowBackground;