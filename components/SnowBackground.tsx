import React, { useEffect, useRef } from 'react';

interface SnowBackgroundProps {
  currentLyric?: string;
  isPlaying?: boolean;
  isPaused?: boolean;
}

const SnowBackground: React.FC<SnowBackgroundProps> = ({ currentLyric = '', isPlaying = false, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
    type: 'circle' | 'heart' | 'lyric';
    rotation: number;
    text?: string;
  }[]>([]);
  const animationIdRef = useRef<number>(0);
  const currentLyricRef = useRef<string>(''); // 新增：持久化 currentLyric

  // 更新 currentLyric 的引用
  useEffect(() => {
    currentLyricRef.current = currentLyric;
  }, [currentLyric]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const count = 80;
    const lyricCount = 15;
    const colors = ['#FF9F1C', '#FFFFFF', '#4CC9F0', '#FFBF00', '#FF6B6B', '#FFC3A0'];
    const lyricColors = [
      '#FF1744', '#FF6B35', '#FFD600', '#00E676', '#00E5FF', '#7C4DFF',
      '#FF4081', '#FF6F00', '#76FF03', '#18FFFF', '#E040FB', '#FFEA00',
    ];

    // 初始化粒子（只在第一次或模式切换时）
    const initParticles = () => {
      const particles = particlesRef.current;
      particles.length = 0;
      
      const totalCount = isPlaying ? lyricCount : count; // 修改判断条件
      
      for (let i = 0; i < totalCount; i++) {
        if (isPlaying) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 28, // 再增加字体大小
            speedX: (Math.random() - 0.5) * 1.5,
            speedY: (Math.random() - 0.5) * 1.5,
            opacity: Math.random() * 0.2 + 0.75, // 透明度：0.75-0.95，更明显
            color: lyricColors[Math.floor(Math.random() * lyricColors.length)],
            type: 'lyric',
            rotation: (Math.random() - 0.5) * 15,
            text: currentLyric || '♪' // 如果没有歌词就显示音符
          });
        } else {
          const isHeart = Math.random() > 0.6;
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * (isHeart ? 15 : 4) + (isHeart ? 10 : 1),
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

    // 只在第一次或粒子类型切换时初始化
    if (particlesRef.current.length === 0) {
      initParticles();
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        if (p.type === 'lyric') {
          // 动态更新歌词文本，使用 ref 获取最新值
          p.text = currentLyricRef.current || '♪';
          
          if (p.text) {
            ctx.font = `bold ${p.radius}px 'Noto Serif SC', serif`;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20; // 增加发光效果
            ctx.shadowColor = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2; // 增加描边宽度
            ctx.strokeText(p.text, 0, 0);
            ctx.fillText(p.text, 0, 0);
            ctx.restore();
          }
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

      animationIdRef.current = requestAnimationFrame(animate);
    };

    if (!isPaused) {
      animate();
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused]); // 依赖 isPaused，当暂停状态改变时重新执行

  // 单独的 effect 处理模式切换（播放/停止）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = 30;
    const lyricCount = 8;
    const colors = ['#FF9F1C', '#FFFFFF', '#4CC9F0', '#FFBF00', '#FF6B6B', '#FFC3A0'];
    const lyricColors = [
      '#FF1744', '#FF6B35', '#FFD600', '#00E676', '#00E5FF', '#7C4DFF',
      '#FF4081', '#FF6F00', '#76FF03', '#18FFFF', '#E040FB', '#FFEA00',
    ];

    const particles = particlesRef.current;
    const wasPlaying = particles.length > 0 && particles[0].type === 'lyric';
    const shouldBeLyric = isPlaying; // 只要音乐在播放就显示歌词粒子，不管currentLyric是否有值

    console.log('🎵 SnowBackground状态:', { isPlaying, currentLyric, wasPlaying, shouldBeLyric, particlesCount: particles.length });

    // 只在模式切换时重新初始化（爱心 ↔ 歌词）
    if (wasPlaying !== shouldBeLyric) {
      console.log('🔄 切换粒子模式:', shouldBeLyric ? '歌词模式' : '爱心模式');
      particles.length = 0;
      const totalCount = shouldBeLyric ? lyricCount : count;
      
      for (let i = 0; i < totalCount; i++) {
        if (shouldBeLyric) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 28, // 再增加字体大小
            speedX: (Math.random() - 0.5) * 1.5,
            speedY: (Math.random() - 0.5) * 1.5,
            opacity: Math.random() * 0.2 + 0.75, // 透明度：0.75-0.95，更明显
            color: lyricColors[Math.floor(Math.random() * lyricColors.length)],
            type: 'lyric',
            rotation: (Math.random() - 0.5) * 15,
            text: currentLyric || '♪' // 如果没有歌词就显示音符
          });
        } else {
          const isHeart = Math.random() > 0.6;
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * (isHeart ? 15 : 4) + (isHeart ? 10 : 1),
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8,
            opacity: Math.random() * 0.5 + 0.1,
            color: isHeart ? '#FF6B6B' : colors[Math.floor(Math.random() * colors.length)],
            type: isHeart ? 'heart' : 'circle',
            rotation: Math.random() * 360
          });
        }
      }
    }
  }, [isPlaying, currentLyric]); // 监听模式切换

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default SnowBackground;
