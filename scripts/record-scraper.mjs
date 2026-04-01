// scripts/record-scraper.mjs (디버깅 강화 버전)
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const TARGETS = [
  { type: '팀', category: '순위', url: 'https://www.koreabaseball.com/TeamRank/TeamRank.aspx' },
  { type: '선수', category: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx' },
  { type: '선수', category: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx' },
  { type: '팀', category: '타자', url: 'https://www.koreabaseball.com/Record/Team/HitterBasic/Basic1.aspx' }
];

async function scrapeRecords() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let allData = [];

  try {
    for (const target of TARGETS) {
      console.log(`📡 [${target.type} - ${target.category}] 접속 중: ${target.url}`);
      await page.goto(target.url, { waitUntil: 'networkidle' }); // 네트워크가 조용해질 때까지 대기
      
      // 표가 나타날 때까지 최대 10초 대기
      try {
        await page.waitForSelector('.tbl-type06, .tData', { timeout: 10000 });
      } catch (e) {
        console.log(`⚠️ ${target.category} 표를 찾지 못했습니다. 건너뜁니다.`);
        continue;
      }

      const scrapedData = await page.evaluate(({ type, category }) => {
        const table = document.querySelector('.tbl-type06') || document.querySelector('.tData');
        if (!table) return [];

        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr'));

        return rows.map((row, index) => {
          const tds = Array.from(row.querySelectorAll('td'));
          if (tds.length < 2) return null; // 유효하지 않은 행 제외

          let statsObj = {};
          let name = '';
          let teamName = '';

          headers.forEach((header, i) => {
            const val = tds[i]?.innerText.trim() || "";
            statsObj[header] = val;
            if (header === '팀명' || header === '선수명') name = val;
            if (header === '팀명' && type === '선수') teamName = val;
          });

          if (!name) name = tds[1]?.innerText.trim();

          return {
            id: `${type}-${category}-${name}-${index}`, // ID 중복 방지
            record_type: type,
            category: category,
            name: name,
            team_name: teamName || name,
            stats: statsObj
          };
        }).filter(item => item !== null && item.name);
      }, target);

      console.log(`✅ ${target.category} 데이터 수집 완료: ${scrapedData.length}건`);
      allData.push(...scrapedData);
    }

    if (allData.length > 0) {
      console.log(`📦 총 ${allData.length}건을 Supabase에 저장합니다...`);
      
      // 먼저 기존 데이터를 삭제 (잘 지워지는지 확인)
      const { error: delError } = await supabase.from('kbo_advanced_stats').delete().neq('id', '0');
      if (delError) console.error('❌ 삭제 단계 에러:', delError);

      // 데이터 저장
      const { error: insError } = await supabase.from('kbo_advanced_stats').insert(allData);
      if (insError) {
        console.error('❌ 저장 단계 에러:', insError);
      } else {
        console.log('🎉 모든 데이터가 성공적으로 저장되었습니다!');
      }
    } else {
      console.log('⚠️ 수집된 데이터가 하나도 없습니다.');
    }

  } catch (err) {
    console.error('❌ 치명적 에러 발생:', err);
  } finally {
    await browser.close();
  }
}

scrapeRecords();