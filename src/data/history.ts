// src/data/history.ts
import type { PastSeasonRanking } from "@/types/stats";

export const PAST_SEASONS_DATA: PastSeasonRanking[] = [
  {
    season: 2025,
    rankings: [
      { rank: 1, teamName: "KIA", note: "한국시리즈 우승" },
      { rank: 2, teamName: "LG" },
      { rank: 3, teamName: "삼성" },
      { rank: 4, teamName: "KT" },
      { rank: 5, teamName: "SSG", note: "와일드카드 진출" },
      { rank: 6, teamName: "두산" },
      { rank: 7, teamName: "롯데" },
      { rank: 8, teamName: "한화" },
      { rank: 9, teamName: "NC" },
      { rank: 10, teamName: "키움" },
    ],
  },
  {
    season: 2024,
    rankings: [
      { rank: 1, teamName: "KIA", note: "통합 우승" },
      { rank: 2, teamName: "삼성" },
      { rank: 3, teamName: "LG" },
      { rank: 4, teamName: "두산" },
      { rank: 5, teamName: "KT" },
      { rank: 6, teamName: "SSG", note: "5위 결정전 패배" },
      { rank: 7, teamName: "롯데" },
      { rank: 8, teamName: "한화" },
      { rank: 9, teamName: "NC" },
      { rank: 10, teamName: "키움" },
    ],
  },
  {
    season: 2023,
    rankings: [
      { rank: 1, teamName: "LG", note: "통합 우승" },
      { rank: 2, teamName: "KT" },
      { rank: 3, teamName: "SSG", note: "준플레이오프 직행" },
      { rank: 4, teamName: "NC" },
      { rank: 5, teamName: "두산" },
      { rank: 6, teamName: "KIA" },
      { rank: 7, teamName: "롯데" },
      { rank: 8, teamName: "한화" },
      { rank: 9, teamName: "키움" },
      { rank: 10, teamName: "삼성" },
    ],
  }
];