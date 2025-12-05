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

export interface Decoration {
  id: string;
  x: number;
  y: number;
  type: DecorationType;
  emoji: string;
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