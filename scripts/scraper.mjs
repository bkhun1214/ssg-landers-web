// scripts/scraper.mjs
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// GitHub 금고(Secrets)에서 꺼내온 열쇠로 Supabase 창고 열기
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapeKbo() {
  // 봇 차단을 피하기 위해 진짜 크롬 브라우저를 띄웁니다 (백그라운드 실행)
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('KBO 공식 홈페이지 접속 중...');
    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx');
    
    // 크롤링할 연도와 월 (현재 시점인 2026년 4월 기준)
    const targetYear = '2026';
    const targetMonth = '04';

    await page.selectOption('select[id$="ddlYear"]', targetYear);
    await page.selectOption('select[id$="ddlMonth"]', targetMonth);
    
    // KBO 서버가 데이터를 다 그릴 때까지 3초 정도 여유 있게 기다려줍니다
    await page.waitForTimeout(3000);

    // 브라우저 화면 안에서 테이블 데이터를 싹 다 긁어모읍니다
    const schedules = await page.evaluate(({ targetYear }) => {
      const rows = Array.from(document.querySelectorAll('.tbl-type06 tbody tr'));
      let currentDate = '';
      
      return rows.map(row => {
        if (row.innerText.includes('데이터가 없습니다')) return null;

        // 날짜 파싱
        const dayCell = row.querySelector('.day');
        if (dayCell) {
          const match = dayCell.innerText.match(/(\d{2})\.(\d{2})/);
          if (match) currentDate = `${targetYear}-${match[1]}-${match[2]}`;
        }

        const playCell = row.querySelector('.play');
        if (!playCell || !currentDate) return null;

        // 팀 이름 및 점수 파싱
        const teams = Array.from(playCell.querySelectorAll('span')).map(s => s.innerText.trim());
        const scoreText = playCell.querySelector('em')?.innerText.trim() || "";
        
        let awayScore = null;
        let homeScore = null;
        if (scoreText.includes(':')) {
          const scores = scoreText.split(':').map(Number);
          awayScore = scores[0];
          homeScore = scores[1];
        }

        const time = row.querySelector('.time')?.innerText.trim() || '18:30';
        
        // 구장 정보 (테이블 열의 뒤에서 두 번째 텍스트)
        const tds = Array.from(row.querySelectorAll('td'));
        const location = tds[tds.length - 2]?.innerText.trim() || '미정';

        let status = 'SCHEDULED';
        if (row.innerText.includes('종료')) status = 'FINISHED';
        else if (row.innerText.includes('취소')) status = 'CANCELLED';
        else if (scoreText.includes(':')) status = 'PROGRESS';

        const awayTeam = teams[0];
        const homeTeam = teams[1] || teams[2];

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
          is_ssg_landers: awayTeam.includes('SSG') || homeTeam.includes('SSG')
        };
      }).filter(i => i !== null);
    }, { targetYear });

    console.log(`[크롤링 완료] 총 ${schedules.length}개의 경기를 찾았습니다.`);
    
    if (schedules.length > 0) {
      console.log('Supabase 창고에 데이터를 저장합니다...');
      const { error } = await supabase.from('schedules').upsert(schedules);
      if (error) throw error;
      console.log('✅ 데이터 저장 완료!');
    }

  } catch (err) {
    console.error('❌ 에러 발생:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrapeKbo();