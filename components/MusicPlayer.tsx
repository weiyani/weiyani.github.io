import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Disc } from 'lucide-react';
import { Song } from '../types';
import { DEFAULT_SONGS } from '../constants';

interface LyricLine {
  time: number;
  text: string;
}

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs] = useState<Song[]>(DEFAULT_SONGS);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLyric, setCurrentLyric] = useState<string>("");

  useEffect(() => {
    // Fetch and parse lyrics
    fetch('/歌词.txt')
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n');
        const parsedLyrics: LyricLine[] = [];
        const timeExp = /\[(\d{2}):(\d{2})(\.\d{2,3})?\]/;

        lines.forEach(line => {
          const match = timeExp.exec(line);
          if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = match[3] ? parseFloat(match[3]) : 0;
            const time = minutes * 60 + seconds + milliseconds;
            const text = line.replace(timeExp, '').trim();
            if (text) {
              parsedLyrics.push({ time, text });
            }
          }
        });
        setLyrics(parsedLyrics);
      })
      .catch(err => console.error("Failed to load lyrics:", err));
      
    // Try to trigger play programmatically on mount to handle autoplay policies better
    const playAudio = async () => {
        if (audioRef.current) {
            try {
                await audioRef.current.play();
                // State update handled by onPlay event
            } catch (err) {
                console.log("Autoplay blocked by browser policy. User interaction required.");
            }
        }
    };
    playAudio();
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
      }
      // setIsPlaying is handled by onPlay/onPause events
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      // Find the last lyric line that has a time less than or equal to current time
      const activeLine = lyrics.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
      }, { time: 0, text: "" }); // default
      
      // Update only if text is different and not empty (unless it's the start)
      if (activeLine.text) {
          setCurrentLyric(activeLine.text);
      }
    }
  };

  return (
    <div className="fixed top-2 md:top-4 right-2 md:right-4 z-50 flex flex-col items-end gap-2">
      <div className="bg-white/90 backdrop-blur-md p-1.5 md:p-2 pl-3 md:pl-4 pr-1.5 md:pr-2 rounded-full shadow-lg border border-white flex items-center gap-2 md:gap-3 transition-all hover:shadow-xl group">
        <audio 
          ref={audioRef} 
          src={songs[0].url} 
          loop={true}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <div className="relative">
          <div className={`absolute inset-0 bg-christmas-red rounded-full opacity-20 ${isPlaying ? 'animate-ping' : ''}`}></div>
          <div className={`bg-christmas-red p-1.5 md:p-2 rounded-full relative z-10 ${isPlaying ? 'animate-spin-slow' : ''}`}>
             <Disc size={16} className="text-white md:hidden" />
             <Disc size={20} className="text-white hidden md:block" />
          </div>
        </div>

        <div className="hidden md:flex flex-col w-40 truncate">
          <span className="text-xs text-christmas-gold font-bold font-chinese">正在播放</span>
          <span className="text-xs text-slate-700 truncate font-chinese">{songs[0].name}</span>
        </div>

        <button 
          onClick={togglePlay}
          className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700 active:scale-95"
        >
          {isPlaying ? <Pause size={16} className="md:hidden" /> : <Play size={16} className="md:hidden" />}
          {isPlaying ? <Pause size={20} className="hidden md:block" /> : <Play size={20} className="hidden md:block" />}
        </button>
      </div>

      {/* Lyric Display Bubble - 移动端优化 */}
      {currentLyric && isPlaying && (
        <div className="bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-md border border-christmas-blue/30 max-w-[280px] md:max-w-md animate-fade-in transition-all duration-300">
           <p className="text-christmas-green font-chinese text-center text-xs md:text-base font-medium leading-relaxed">
             ♪ {currentLyric} ♪
           </p>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;