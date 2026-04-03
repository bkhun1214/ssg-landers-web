// src/components/AutoScroller.tsx
'use client';

import { useEffect } from 'react';

export default function AutoScroller({ targetId }: { targetId: string | null }) {
  useEffect(() => {
    if (targetId) {
      // 렌더링이 완전히 끝난 후 안전하게 스크롤하기 위해 약간의 지연(setTimeout)을 줍니다.
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          // block: 'center'를 주면 해당 카드가 화면 중앙에 오도록 예쁘게 멈춥니다!
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [targetId]);

  return null; // 화면에 아무것도 그리지 않는 투명 컴포넌트입니다.
}