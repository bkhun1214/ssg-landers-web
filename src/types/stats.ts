// src/types/stats.ts

// 기존 실시간 순위 타입
export interface TeamRanking {
  rank: number;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

// 신규: 과거 시즌 순위 타입
export interface PastSeasonRanking {
  season: number;      // 예: 2023, 2024
  rankings: Array<{
    rank: number;
    teamName: string;
    note?: string;     // 우승 여부 등 비고
  }>;
}

export interface PlayerStat {
  rank: number;
  name: string;
  team: string;
  value: number;
  category: 'BATTER' | 'PITCHER';
  subCategory: string;
}