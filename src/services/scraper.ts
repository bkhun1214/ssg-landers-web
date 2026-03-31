// src/services/scraper.ts
import axios from 'axios';

// 상용 환경에서 봇 차단을 방지하기 위한 기본 헤더 설정
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
};

export const scraperClient = axios.create({
  timeout: 5000, // 5초 이상 응답 지연 시 요청 취소
  headers: DEFAULT_HEADERS,
});

/**
 * 범용 HTML Fetcher 함수
 * @param url 타겟 웹페이지 URL
 * @returns HTML 문자열 (실패 시 null)
 */
export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await scraperClient.get(url);
    if (response.status === 200) {
      return response.data;
    }
    console.warn(`[Scraper Warning] Non-200 status code received: ${response.status} from ${url}`);
    return null;
  } catch (error) {
    console.error(`[Scraper Error] Failed to fetch data from ${url}:`, error);
    return null;
  }
}