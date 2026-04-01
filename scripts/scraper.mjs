// scripts/scraper.mjs
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapeKbo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 현재 날짜 정보 가져오기
    const now = new Date();
    // 한국 시간(KST) 보정 (GitHub 서버는 UTC 기준이므로 9시간 더해줌)
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    const year = kstNow.getFullYear().toString();
    const month = (kstNow.getMonth() + 1).toString().padStart(2, '0');
    const todayStr = kstNow.toISOString().split('T')[0]; // 예: "2026-04-01"

    console.log(`[${todayStr}] 업데이트 시작 - ${year}년 ${month}월 데이터를 확인합니다.`);

    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx');
    
    // 2. 현재 연도와 월 선택
    await page.selectOption('select[id$="ddlYear"]', year);
    await page.selectOption('select[id$="ddlMonth"]', month);
    await page.waitForTimeout(3000);

    // 3. 해당 월의 데이터 파싱
    const monthSchedules = await page.evaluate(({ year }) => {
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

        const teams = Array.from(playCell.querySelectorAll('span'))
          .map(s => s.innerText.trim())
          .filter(t => t !== 'vs' && t !== '');

        if (teams.length < 2) return null;
        
        const scoreText = playCell.querySelector('em')?.innerText.trim() || "";
        let awayScore = null, homeScore = null;
        if (scoreText.includes(':')) {
          [awayScore, homeScore] = scoreText.split(':').map(Number);
        }

        const time = row.querySelector('.time')?.innerText.trim() || '18:30';
        const location = Array.from(row.querySelectorAll('td')).pop()?.innerText.trim() || '';

        return {
          id: `${currentDate}-${teams[1]}-${teams[0]}`,
          date: currentDate,
          time: time,
          away_team: teams[0],
          home_team: teams[1],
          away_score: awayScore,
          home_score: homeScore,
          location: location,
          status: row.innerText.includes('종료') ? 'FINISHED' : 
                  (row.innerText.includes('취소') ? 'CANCELLED' : 
                  (scoreText.includes(':') ? 'PROGRESS' : 'SCHEDULED')),
          is_ssg_landers: teams.some(t => t.includes('SSG'))
        };
      }).filter(i => i !== null);
    }, { year });

    // 💡 파트너님의 핵심 요청: "오늘 경기"만 혹은 "이번 달 경기"만 업데이트
    // 여기서는 이번 달 페이지를 한 번 불렀으니, 이번 달 130건을 한 번에 upsert 합니다.
    // 어차피 과거 데이터는 upsert 시 내용이 같으면 아무 일도 일어나지 않으므로 안전합니다.
    
    console.log(`총 ${monthSchedules.length}건의 데이터를 확인했습니다.`);
    
    if (monthSchedules.length > 0) {
      const { error } = await supabase.from('schedules').upsert(monthSchedules);
      if (error) throw error;
      console.log('✅ 데이터베이스 동기화 완료!');
    }

  } catch (err) {
    console.error('❌ 에러 발생:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrapeKbo();