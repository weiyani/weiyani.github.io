import React, { useEffect, useRef } from 'react';

interface SnowBackgroundProps {
  currentLyric?: string;
  isPlaying?: boolean;
}

const SnowBackground: React.FC<SnowBackgroundProps> = ({ currentLyric = '', isPlaying = false }) => {
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

    // Magical spores/dandelion seeds mixed with Hearts or Lyrics
    const particles: { 
      x: number; 
      y: number; 
      radius: number; 
      speedX: number; 
      speedY: number; 
      opacity: number; 
      color: string;
      type: 'circle' | 'heart' | 'lyric';
      rotation: number;
      text?: string; // 用于存储歌词字符
    }[] = [];
    
    const count = 80;
    const lyricCount = 12; // 歌词粒子数量，避免重叠
    const colors = ['#FF9F1C', '#FFFFFF', '#4CC9F0', '#FFBF00', '#FF6B6B', '#FFC3A0']; // Warmer colors added
    const lyricColors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF', '#FF6FB5', '#9D84B7']; // 歌词彩色

    // 初始化粒子
    const initParticles = () => {
      particles.length = 0; // 清空数组
      
      // 根据是否播放音乐决定粒子数量
      const totalCount = (isPlaying && currentLyric) ? lyricCount : count;
      
      for (let i = 0; i < totalCount; i++) {
        // 如果正在播放音乐且有歌词，显示完整歌词行；否则显示爱心
        if (isPlaying && currentLyric) {
          // 每个粒子显示完整的歌词行
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 8 + 8, // 歌词字体大小：8-16px
            speedX: (Math.random() - 0.5) * 1.2, 
            speedY: (Math.random() - 0.5) * 1.2, 
            opacity: Math.random() * 0.3 + 0.7, // 透明度：0.3-0.6
            color: lyricColors[Math.floor(Math.random() * lyricColors.length)],
            type: 'lyric',
            rotation: (Math.random() - 0.5) * 10, // 轻微旋转
            text: currentLyric // 完整歌词行
          });
        } else {
          // 默认显示爱心和圆点
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
      }
    };

    initParticles();

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

        if (p.type === 'lyric' && p.text) {
            // 显示完整歌词行
            ctx.font = `bold ${p.radius}px 'Noto Serif SC', serif`;
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillText(p.text, 0, 0);
            ctx.restore();
        } else if (p.type === 'heart') {
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
  }, [currentLyric, isPlaying]); // 添加依赖

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

export default SnowBackground;