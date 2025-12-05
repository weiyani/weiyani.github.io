import React, { useState, useEffect } from 'react';
import { WEDDING_DATE } from '../constants';
import { TimeLeft } from '../types';
import { Gamepad2, Star, Heart } from 'lucide-react';

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [anniversaryYear, setAnniversaryYear] = useState<number>(5);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      // Parse the wedding date string (YYYY-MM-DD) manually to avoid local timezone ambiguity
      const dateParts = WEDDING_DATE.split('-');
      const weddingYear = parseInt(dateParts[0]);
      const weddingMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
      const weddingDay = parseInt(dateParts[2]);

      // Beijing Time Offset (UTC+8) in milliseconds
      const BEIJING_OFFSET = 8 * 60 * 60 * 1000;

      // Get current UTC time
      // now.getTime() is UTC timestamp.
      // However, we want to know what "year" it is in Beijing right now.
      const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nowBeijingTimestamp = nowUtc + BEIJING_OFFSET;
      
      // Determine the current year in Beijing
      const currentYearInBeijing = new Date(nowBeijingTimestamp).getUTCFullYear();

      // Function to get the specific anniversary timestamp in UTC
      // Target: Midnight (00:00:00) Beijing Time on the anniversary date.
      // Formula: Date.UTC(Year, Month, Day) gives UTC midnight. 
      // Since BJ is UTC+8, BJ Midnight is UTC 16:00 of the PREVIOUS day. 
      // Or simply: UTC Midnight Timestamp - 8 hours.
      const getBeijingAnniversaryTime = (year: number) => {
        return Date.UTC(year, weddingMonth, weddingDay, 0, 0, 0) - BEIJING_OFFSET;
      };

      let targetTimestamp = getBeijingAnniversaryTime(currentYearInBeijing);
      let targetAnniversaryYear = currentYearInBeijing;

      // If we have already passed the anniversary in Beijing time, target next year
      if (now.getTime() > targetTimestamp) {
        targetAnniversaryYear = currentYearInBeijing + 1;
        targetTimestamp = getBeijingAnniversaryTime(targetAnniversaryYear);
      }

      const yearsTogether = targetAnniversaryYear - weddingYear;
      setAnniversaryYear(yearsTogether);

      const difference = targetTimestamp - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-md rounded-3xl border-4 border-game-yellow shadow-[0_10px_0_rgba(0,0,0,0.1)] max-w-3xl mx-auto mt-10 z-10 relative transform -rotate-1 transition hover:rotate-0 duration-300">
      {/* HUD Header */}
      <div className="absolute -top-6 bg-game-orange text-white px-8 py-2 rounded-full font-chinese text-xl md:text-2xl border-2 border-white shadow-lg tracking-widest flex items-center gap-2">
         <Star fill="white" size={20} /> 当前任务：庆祝 {anniversaryYear} 周年 <Star fill="white" size={20} />
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        <h2 className="text-xl md:text-3xl font-chinese text-gray-700 text-center flex items-center gap-2">
           <Heart className="text-red-500 fill-red-500 animate-pulse" /> 周年倒计时 <Heart className="text-red-500 fill-red-500 animate-pulse" />
        </h2>
      </div>
      
      <div className="grid grid-cols-4 gap-2 md:gap-6 w-full">
        <TimeUnit value={timeLeft.days} label="天" color="bg-game-blue" />
        <TimeUnit value={timeLeft.hours} label="时" color="bg-game-green" />
        <TimeUnit value={timeLeft.minutes} label="分" color="bg-game-yellow" />
        <TimeUnit value={timeLeft.seconds} label="秒" color="bg-game-orange" />
      </div>
      
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className={`flex flex-col items-center ${color} p-2 md:p-4 rounded-xl shadow-lg border-b-4 border-black/20 text-white transform transition hover:scale-105`}>
    <span className="text-3xl md:text-6xl font-logo font-bold tabular-nums drop-shadow-md">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-white font-chinese font-bold text-sm md:text-lg mt-1 tracking-wider">{label}</span>
  </div>
);

export default Countdown;