// src/types/schedule.ts

export type GameStatus = 'SCHEDULED' | 'PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface GameSchedule {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null; // 새로 추가됨!
  awayScore?: number | null; // 새로 추가됨!
  location: string;
  status: GameStatus;
  isSsgLanders: boolean;
}