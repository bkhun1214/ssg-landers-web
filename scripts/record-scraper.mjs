import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 💡 수집할 모든 타겟 URL을 배열에 넣습니다. (일단 핵심 4개만 먼저 테스트용으로 넣었습니다)
const TARGETS = [
  { type: '팀', category: '순위', url: 'https://www.koreabaseball.com/TeamRank/TeamRank.aspx' },
  { type: '선수', category: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx' },
  { type: '선수', category: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx' },
  { type: '팀', category: '타자', url: 'https://www.koreabaseball.com/Record/Team/HitterBasic/Basic1.aspx' }
  // 성공하시면 파트너님이 찾으신 나머지 URL(수비, 주루 등)도 여기에 추가만 하시면 됩니다!
];

async function scrapeRecords() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let allData = [];

  try {
    for (const target of TARGETS) {
      console.log(`[${target.type} - ${target.category}] 수집 중...`);
      await page.goto(target.url);
      await page.waitForTimeout(3000); // 넉넉하게 대기

      const scrapedData = await page.evaluate(({ type, category }) => {
        // KBO 데이터 표를 찾습니다
        const table = document.querySelector('.tbl-type06') || document.querySelector('.tData');
        if (!table) return [];

        // 표의 머리글(컬럼명)을 추출합니다 (예: 순위, 팀명, 타율, 홈런 등)
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr'));

        return rows.map((row, index) => {
          const tds = Array.from(row.querySelectorAll('td'));
          if (tds.length < headers.length) return null;

          let statsObj = {};
          let name = '';
          let teamName = '';

          // 💡 HTML 표의 칸(td)을 아까 찾은 머리글(headers)과 1:1로 매칭합니다.
          headers.forEach((header, i) => {
            const val = tds[i].innerText.trim();
            statsObj[header] = val; // 예: {"타율": "0.312"}
            
            // 이름과 소속팀 찾기
            if (header === '팀명' || header === '선수명') name = val;
            if (header === '팀명' && type === '선수') teamName = val; // 선수 기록일 경우
          });

          // 팀 기록인데 팀명을 못 찾았을 경우 방어 코드
          if (!name && type === '팀') name = tds[1]?.innerText.trim() || `팀${index}`;

          return {
            id: `${type}-${category}-${name}`,
            record_type: type,
            category: category,
            name: name,
            team_name: type === '선수' ? teamName : name,
            stats: statsObj // 파싱된 스탯 뭉치 JSON
          };
        }).filter(item => item !== null && item.name !== '');
      }, target);

      allData.push(...scrapedData);
    }

    console.log(`총 ${allData.length}건의 데이터를 수집했습니다. DB에 저장합니다...`);
    // 전체 덮어쓰기 로직
    await supabase.from('kbo_advanced_stats').delete().neq('id', '0');
    const { error } = await supabase.from('kbo_advanced_stats').insert(allData);
    if (error) throw error;
    console.log('✅ 만능 기록실 DB 업데이트 완료!');

  } catch (err) {
    console.error('❌ 크롤링 에러:', err);
  } finally {
    await browser.close();
  }
}

scrapeRecords();