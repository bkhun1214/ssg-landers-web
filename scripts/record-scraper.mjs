// scripts/record-scraper.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapePlayerStats() {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--disable-blink-features=AutomationControlled'] 
  });
  const page = await browser.newPage();
  let allData = [];

  try {
    const TARGETS = [
      { category: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx' },
      { category: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx' }
    ];

    for (const target of TARGETS) {
      console.log(`\n📡 [${target.category}] 사이트 접속 중...`);
      await page.goto(target.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      let pageNum = 1;

      // 💡 모든 페이지를 순회하기 위한 무한 루프 시작!
      while (true) {
        console.log(`📄 [${target.category}] ${pageNum}페이지 추출 중...`);

        // 1. 현재 화면의 표 데이터 추출
        const scrapedData = await page.evaluate((category) => {
          const table = document.querySelector('.tbl-type06 table') || document.querySelector('table');
          if (!table) return [];

          const rows = Array.from(table.querySelectorAll('tbody tr'));
          const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());

          return rows.map((row) => {
            const tds = Array.from(row.querySelectorAll('td'));
            if (tds.length < 5 || row.innerText.includes('데이터가 없습니다')) return null;

            let statsObj = {};
            let playerName = '';
            let teamName = '';
            let rank = 0;

            headers.forEach((header, i) => {
              const val = tds[i]?.innerText.trim() || "";
              if (header === '순위') rank = parseInt(val) || 0;
              if (header === '선수명') {
                  const aTag = tds[i].querySelector('a');
                  playerName = aTag ? aTag.innerText.trim() : val;
              }
              if (header === '팀명') teamName = val;
              statsObj[header] = val;
            });

            if (!playerName) return null;

            return {
              id: `${category}-${playerName}-${teamName}`,
              player_name: playerName,
              team_name: teamName,
              category: category,
              rank: rank,
              stats: statsObj
            };
          }).filter(item => item !== null);
        }, target.category);

        allData.push(...scrapedData);

        // 2. 다음 페이지(버튼) 찾아서 클릭하기
        pageNum++;
        
        // KBO 페이징 영역 전체 잡기
        const pagerLocator = page.locator('.paging, [id$="ucPager"]');
        
        // 우리가 찾아야 할 '다음 숫자' (예: 2, 3, 4...)
        const nextNumLocator = pagerLocator.getByText(String(pageNum), { exact: true });

        if (await nextNumLocator.count() > 0) {
          const el = nextNumLocator.first();
          const tagName = await el.evaluate(e => e.tagName.toLowerCase());

          // <a> 태그(클릭 가능한 링크)일 때만 클릭
          if (tagName === 'a') {
            await el.click();
            await page.waitForTimeout(3000); // 💡 서버에서 새 표를 받아올 때까지 충분히 대기
            continue; // 루프를 다시 돌면서 새 화면 추출!
          } else {
            // 이미 활성화된 숫자(strong 등)라면 클릭할 필요 없이 계속 진행
            continue; 
          }
        }

        // 3. 만약 화면에 다음 숫자가 안 보인다면? (예: 1~5페이지 끝남) -> '다음' 블록(>) 화살표 찾기!
        const nextBlockBtn = pagerLocator.locator('a.next, a:has(img[alt*="다음"])').first();

        if (await nextBlockBtn.count() > 0) {
          await nextBlockBtn.click();
          await page.waitForTimeout(3000);

          // 화살표를 눌렀는데도 우리가 찾는 다음 숫자가 안 나왔다면 진짜 마지막 페이지!
          const verifyLocator = pagerLocator.getByText(String(pageNum), { exact: true });
          if (await verifyLocator.count() === 0) {
            console.log(`✅ [${target.category}] 마지막 페이지 도달 완료!`);
            break;
          }
        } else {
          // '다음' 화살표조차 없으면 진짜 끝!
          console.log(`✅ [${target.category}] 마지막 페이지 도달 완료!`);
          break;
        }
      }
    }

    // 💡 모든 선수 데이터를 긁어모았으니, 기존 DB를 비우고 한 번에 밀어넣기!
    if (allData.length > 0) {
      console.log(`\n🧹 총 ${allData.length}명의 데이터 수집 완료! 기존 데이터를 초기화합니다...`);
      const { error: deleteError } = await supabase
        .from('player_stats')
        .delete()
        .in('category', ['타자', '투수']);

      if (deleteError) {
        throw new Error(`기존 데이터 삭제 실패: ${deleteError.message}`);
      }

      console.log('💾 KBO 전체 선수 기록을 저장하는 중...');
      const { error } = await supabase.from('player_stats').upsert(allData, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('🎉 KBO 전체 선수 기록이 Supabase에 성공적으로 갱신되었습니다!');
    } else {
      console.log('⚠️ 수집된 데이터가 없습니다.');
    }

  } catch (err) {
    console.error('❌ 에러:', err);
  } finally {
    await browser.close();
  }
}

scrapePlayerStats();