export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export enum DecorationType {
  NORMAL = 'NORMAL',
  INTERACTIVE = 'INTERACTIVE'
}

export type BookColor = 'red' | 'blue' | 'green' | 'purple';

export interface Decoration {
  id: string;
  x: number;
  y: number;
  type: DecorationType;
  emoji: string;
  bookColor?: BookColor; // 爱之书的颜色
  action?: 'photo' | 'letter' | 'game' | 'music'; // 对应的动作
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export interface Song {
  name: string;
  url: string;
  isLocal?: boolean;
}