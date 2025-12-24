import React, { useState } from 'react';
import SnowBackground from './components/SnowBackground';
import Countdown from './components/Countdown';
import ChristmasTree from './components/ChristmasTree';
import MusicPlayer from './components/MusicPlayer';
import MiniGame from './components/MiniGame';
import BellGame from './components/BellGame';
import ChristmasMatch from './components/ChristmasMatch';
import Fireworks from './components/Fireworks';
import MusicCountdown from './components/MusicCountdown';
import { PHOTOS, LOVE_LETTER, getPhotos } from './constants';
import { X, ChevronLeft, ChevronRight, Gamepad, Heart } from 'lucide-react';

// Simple Modals - 移动端优化
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode; title?: string }> = ({ onClose, children, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
    <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border-4 md:border-8 border-game-yellow transform md:rotate-1">
      <button onClick={onClose} className="absolute top-2 right-2 md:top-3 md:right-3 bg-game-orange text-white rounded-full p-1.5 md:p-2.5 hover:bg-red-500 transition-colors shadow-lg border-2 md:border-4 border-white z-10">
        <X size={20} className="md:hidden" strokeWidth={3} />
        <X size={28} className="hidden md:block" strokeWidth={3} />
      </button>
      {title && <h2 className="text-xl md:text-3xl font-chinese text-game-blue text-center mb-4 md:mb-6 border-b-4 border-dotted border-gray-200 pb-2 font-bold pr-8 md:pr-12">{title}</h2>}
      {children}
    </div>
  </div>
);

const PhotoCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [photos, setPhotos] = useState<string[]>(PHOTOS);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 动态加载图片列表
  React.useEffect(() => {
    const loadPhotos = async () => {
      try {
        const dynamicPhotos = await getPhotos();
        if (dynamicPhotos.length > 0) {
          setPhotos(dynamicPhotos);
        }
      } catch (error) {
        console.log('使用默认图片列表');
        // 如果动态加载失败，使用默认的 PHOTOS 数组
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const next = () => setIdx((prev) => (prev + 1) % photos.length);
  const prev = () => setIdx((prev) => (prev - 1 + photos.length) % photos.length);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (loading) {
    return (
      <div className="relative aspect-square bg-gray-900 rounded-lg md:rounded-xl overflow-hidden shadow-xl group border-2 md:border-4 border-white flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-sm">加载图片中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-gray-900 rounded-lg md:rounded-xl overflow-hidden shadow-xl group border-2 md:border-4 border-white">
      {imageError ? (
        <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
          <div>
            <p className="text-lg mb-2">📷</p>
            <p className="text-sm">图片加载失败</p>
            <p className="text-xs text-gray-300 mt-1">请检查图片路径: {photos[idx]}</p>
          </div>
        </div>
      ) : (
        <img
          src={photos[idx]}
          alt="Memory"
          className="w-full h-full object-cover"
          style={{ imageOrientation: 'from-image' }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      <button onClick={prev} className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 md:p-3 rounded-full text-white backdrop-blur-md border-2 border-white/50 hover:bg-game-blue hover:border-game-blue transition-all active:scale-95">
        <ChevronLeft size={20} className="md:hidden" strokeWidth={3} />
        <ChevronLeft className="hidden md:block" strokeWidth={3} />
      </button>
      <button onClick={next} className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 md:p-3 rounded-full text-white backdrop-blur-md border-2 border-white/50 hover:bg-game-blue hover:border-game-blue transition-all active:scale-95">
        <ChevronRight size={20} className="md:hidden" strokeWidth={3} />
        <ChevronRight className="hidden md:block" strokeWidth={3} />
      </button>
      
      {/* Photo frame effect */}
      <div className="absolute inset-0 border-[10px] border-white/10 pointer-events-none rounded-xl"></div>
      
      {/* 页码指示器 - 移动端友好 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs md:text-sm">
        {idx + 1} / {photos.length}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'photo' | 'letter' | 'game' | 'bellGame' | 'matchGame' | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicCountdown, setShowMusicCountdown] = useState(false);
  const [hasPlayedMusic, setHasPlayedMusic] = useState(false); // 记录是否已经播放过

  const handleTreeInteraction = (type: 'photo' | 'music' | 'letter' | 'game' | 'bellGame' | 'matchGame') => {
    // 点击音乐书时
    if (type === 'music') {
      if (!hasPlayedMusic) {
        // 第一次打开，显示倒计时
        setShowMusicCountdown(true);
      } else {
        // 非第一次，直接播放
        setShowMusicPlayer(true);
        setIsMusicPlaying(true);
      }
    } else {
      setActiveModal(type);
    }
  };

  const handleCountdownComplete = () => {
    setShowMusicCountdown(false);
    setShowMusicPlayer(true);
    setIsMusicPlaying(true);
    setHasPlayedMusic(true); // 标记为已播放
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col overflow-hidden font-sans text-gray-800 selection:bg-game-yellow selection:text-black"
      style={{
        background: (isMusicPlaying && showMusicPlayer) 
          ? '#1a1a1a' // 音乐播放时使用深色背景
          : 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' // 默认粉蓝渐变
      }}
    >
      <SnowBackground
        currentLyric={currentLyric}
        isPlaying={isMusicPlaying && showMusicPlayer}
        isPaused={activeModal === 'game'}
      />
      
      {/* 音乐倒计时 */}
      {showMusicCountdown && <MusicCountdown onComplete={handleCountdownComplete} />}
      
      {/* 音乐播放器 - 显示在左上角 */}
      {showMusicPlayer && (
        <MusicPlayer 
          variant="fixed" 
          onLyricChange={setCurrentLyric}
          onPlayingChange={setIsMusicPlaying}
        />
      )}
      
      <Fireworks active={showFireworks} onClose={() => setShowFireworks(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center relative z-10 w-full max-w-7xl mx-auto pt-4 md:pt-10 px-2 md:px-4">
        
        {/* Game Style Header - 移动端优化 */}
        <header className="text-center mb-4 md:mb-10 animate-fade-in-down select-none relative group transform hover:scale-105 transition duration-500">
           {/* Decorative elements behind title */}
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-32 bg-white/30 blur-3xl rounded-full -z-10"></div>
           
           <div className="flex flex-col items-center">
              <div className="bg-game-orange text-white px-3 md:px-4 py-1 rounded shadow-md transform -rotate-3 mb-2 font-chinese text-xs md:text-base tracking-wide md:tracking-widest border-2 border-white">
                  🎄 圣诞快乐 & 纪念日 💍
              </div>
              
              {/* It Takes Two Logo Style */}
              <h1 className="text-3xl md:text-7xl font-logo text-game-yellow drop-shadow-[2px_2px_0_#D35400] md:drop-shadow-[4px_4px_0_#D35400] stroke-text relative z-10 leading-tight">
                我们的 <br/>
                <span className="text-game-orange drop-shadow-[2px_2px_0_#C0392B] md:drop-shadow-[4px_4px_0_#C0392B]">双人成行</span>
              </h1>
              
              <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-3 bg-white/60 backdrop-blur px-3 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-white shadow-sm">
                 <Gamepad className="text-game-blue w-4 h-4 md:w-6 md:h-6" />
                 <p className="text-sm md:text-xl font-chinese font-bold text-gray-600">
                   五周年 · 爱的冒险篇
                 </p>
                 <Heart className="text-red-500 fill-red-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
              </div>
           </div>
        </header>

        <Countdown />

        <div className="flex-1 flex items-end justify-center w-full mt-4 md:mt-0 relative min-h-[300px] md:min-h-0">
          <ChristmasTree onInteraction={handleTreeInteraction} />
          
          {/* Decorative floor/ground to ground the tree */}
          <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-white/40 to-transparent blur-xl -z-10 rounded-full"></div>
        </div>
        
        <div className="pb-4 md:pb-6 text-center text-gray-600/80 text-xs md:text-sm font-chinese tracking-wide animate-pulse px-2">

        </div>
      </main>

      {/* Modals */}
      {activeModal === 'photo' && (
        <Modal onClose={() => setActiveModal(null)} title="幸福瞬间">
          <PhotoCarousel />
        </Modal>
      )}

      {activeModal === 'letter' && (
        <Modal onClose={() => setActiveModal(null)} title="来自圣诞老公的信">
          <div className="font-chinese text-sm md:text-lg text-gray-700 whitespace-pre-line leading-relaxed p-4 md:p-6 bg-[#FFF8E1] rounded-lg md:rounded-xl border-l-4 border-game-book shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10">
               <Gamepad size={60} className="md:hidden" />
               <Gamepad size={100} className="hidden md:block" />
            </div>
            {LOVE_LETTER}
          </div>
        </Modal>
      )}

      {activeModal === 'game' && (
        <MiniGame 
          onClose={() => setActiveModal(null)} 
          onWin={() => {
            // 只触发烟花，不关闭游戏窗口（让玩家可以点击进入LV4）
            setShowFireworks(true);
          }} 
        />
      )}

      {activeModal === 'bellGame' && (
        <BellGame 
          onClose={() => setActiveModal(null)} 
        />
      )}

      {activeModal === 'matchGame' && (
        <ChristmasMatch 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
};

export default App;