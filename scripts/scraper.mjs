// scripts/scraper.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function scrapeKbo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const now = new Date();
    // 한국 시간(KST) 보정
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const year = kstNow.getFullYear().toString();
    const month = (kstNow.getMonth() + 1).toString().padStart(2, '0');
    
    // 💡 브라우저 안으로 넘겨줄 '오늘 날짜 문자열'을 미리 생성합니다.
    const todayString = kstNow.toISOString().split('T')[0];

    console.log(`[${year}-${month}] 일정 업데이트 시작...`);

    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx', { waitUntil: 'networkidle' });
    await page.selectOption('select[id$="ddlYear"]', year);
    await page.selectOption('select[id$="ddlMonth"]', month);
    await page.waitForTimeout(3000);

    // 💡 year와 함께 todayString을 evaluate 내부로 배달합니다!
    const monthSchedules = await page.evaluate(({ year, todayString }) => {
      const rows = Array.from(document.querySelectorAll('.tbl-type06 tbody tr'));
      let currentDate = '';

      return rows.map(row => {
        if (row.innerText.includes('데이터가 없습니다')) return null;

        const dayCell = row.querySelector('.day');
        if (dayCell) {
          const match = dayCell.innerText.match(/(\d{2})\.(\d{2})/);
          if (match) currentDate = `${year}-${match[1]}-${match[2]}`;
        }

        const playCell = row.querySelector('.play');
        if (!playCell || !currentDate) return null;

        // 모든 span 태그 텍스트 가져오기
        const spanTexts = Array.from(playCell.querySelectorAll('span'))
          .map(s => s.innerText.trim())
          .filter(t => t !== 'vs' && t !== '');

        // 💡 핵심 1: 숫자로 변환했을 때 숫자인 것(점수)은 빼고, 순수 팀명만 추출합니다.
        const teams = spanTexts.filter(t => isNaN(Number(t)));

        if (teams.length < 2) return null;

        const awayTeam = teams[0];
        const homeTeam = teams[1];

        // 💡 핵심 2: 점수 추출. em 태그에 있거나 span 태그 안에 숫자로 섞여 있는 경우를 모두 대비합니다.
        let awayScore = null;
        let homeScore = null;

        const scoreText = playCell.querySelector('em')?.innerText.trim() || "";
        if (scoreText.includes(':')) {
          [awayScore, homeScore] = scoreText.split(':').map(Number);
        } else {
          // span 태그에 점수가 섞여 있을 경우 (예: ['키움', '0', '11', 'SSG'])
          const numbers = spanTexts.filter(t => !isNaN(Number(t)));
          if (numbers.length >= 2) {
            awayScore = Number(numbers[0]);
            homeScore = Number(numbers[1]);
          }
        }

        const time = row.querySelector('.time')?.innerText.trim() || '18:30';

        // 💡 모든 칸(td)을 가져온 뒤, 맨 마지막('비고')이 아닌 '뒤에서 두 번째(구장)' 칸을 정확히 조준합니다.
        const tds = Array.from(row.querySelectorAll('td'));
        let location = '';
        if (tds.length >= 2) {
          location = tds[tds.length - 2].innerText.trim();
          
          // 혹시라도 구장 칸이 밀려서 '-'가 잡히면, 바로 앞칸이나 뒷칸을 확인하는 안전장치
          if (location === '-' || location === '') {
            location = tds[tds.length - 3]?.innerText.trim() || tds[tds.length - 1]?.innerText.trim();
          }
        }

        // 상태값 확인
        let status = 'SCHEDULED';
        
        // 💡 밖에서 전달받은 todayString을 사용하여 에러 없이 날짜를 비교합니다.
        const isPastDate = new Date(currentDate) < new Date(todayString); 

        if (row.innerText.includes('종료')) {
          status = 'FINISHED';
        } else if (row.innerText.includes('취소')) {
          status = 'CANCELLED';
        } else if (awayScore !== null && homeScore !== null) {
          // 점수는 있는데 '종료' 글자가 없더라도, 날짜가 어제 이전이면 'FINISHED'로 간주
          if (isPastDate) {
            status = 'FINISHED';
          } else {
            status = 'PROGRESS'; // 오늘 경기인데 점수가 있으면 '경기 중'
          }
        }

        return {
          id: `${currentDate}-${homeTeam}-${awayTeam}`,
          date: currentDate,
          time: time,
          away_team: awayTeam,
          home_team: homeTeam,
          away_score: awayScore,
          home_score: homeScore,
          location: location,
          status: status,
          is_ssg_landers: teams.some(t => t.includes('SSG'))
        };
      }).filter(i => i !== null);
    }, { year, todayString }); // 💡 여기서 짐을 싸서 evaluate 내부로 던져줍니다!

    if (monthSchedules.length > 0) {
      console.log(`총 ${monthSchedules.length}건 DB 저장 중...`);
      // onConflict: 'id' 옵션으로 기존 데이터를 안전하게 덮어씁니다.
      const { error } = await supabase.from('schedules').upsert(monthSchedules, { onConflict: 'id' });
      if (error) throw error;
      console.log('✅ 올바른 일정 데이터 동기화 완료!');
    }

  } catch (err) {
    console.error('❌ 에러:', err);
  } finally {
    await browser.close();
  }
}

scrapeKbo();