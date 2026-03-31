export type GameStatus = 'SCHEDULED' | 'PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface GameSchedule {
  id: string;               // 경기 고유 ID (날짜+팀조합)
  date: string;             // YYYY-MM-DD
  time: string;             // HH:mm
  homeTeam: string;
  awayTeam: string;
  location: string;         // 구장 (예: 문학, 잠실)
  status: GameStatus;       // 경기 상태
  homeScore?: number;       // 종료 시 점수
  awayScore?: number;
  isSsgLanders: boolean;    // SSG 경기 여부 (필터링용)
}