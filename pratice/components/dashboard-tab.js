window.DashboardTab = {
  name: 'DashboardTab',
  props: {
    totalOrderQty: Number,
    keyAccountRate: [String, Number],
    avgPredYield: [String, Number]
  },
  template: `
    <div>
      <div class="row row-4 mb14 fade-in">
        <div class="card"><div class="kpi"><div class="kpi-label">통합 AI 서비스</div><div class="kpi-value" style="color:var(--purple)">6</div><div class="kpi-sub">운영 모듈 (①~⑥)</div></div></div>
        <div class="card"><div class="kpi"><div class="kpi-label">예상 공급 리스크</div><div class="kpi-value" style="color:var(--sk-red)">{{ totalOrderQty.toLocaleString() }}</div><div class="kpi-sub">부족분 기준 필요 조달량</div></div></div>
        <div class="card"><div class="kpi"><div class="kpi-label">핵심 고객 충족률</div><div class="kpi-value" style="color:var(--blue)">{{ keyAccountRate }}%</div><div class="kpi-sub">Allocation Optimizer 결과</div></div></div>
        <div class="card"><div class="kpi"><div class="kpi-label">평균 예측 수율</div><div class="kpi-value" style="color:var(--green)">{{ avgPredYield }}%</div><div class="kpi-sub">Virtual Metrology 기준</div></div></div>
      </div>

      <div class="card mb14 fade-in">
        <div class="card-head">
          <div class="icon-box">AI</div>
          <div class="card-title">Hybrid Intelligence 아키텍처 요약</div>
          <div class="card-badge">RDB + Vector DB + MLOps + LLM</div>
        </div>
        <div class="arch-grid" style="padding:14px;">
          <div class="arch-item"><h4>① 수요 예측 AI</h4><p>SERVICE + 외부 트렌드 기반 시계열 예측으로 소재별 수요를 산출합니다.</p></div>
          <div class="arch-item"><h4>② 고객 스코어링 AI</h4><p>신용도/거래규모/수익성/LTV를 점수화하여 고객 중요도를 계산합니다.</p></div>
          <div class="arch-item"><h4>③ 물량 배분 최적화 AI</h4><p>공급 부족 시 ②의 점수와 수익성을 반영해 최적 할당안을 제시합니다.</p></div>
          <div class="arch-item"><h4>④ 수율 예측 AI</h4><p>온도/압력/가스 유량 등 공정 변수로 수율 저하를 사전에 탐지합니다.</p></div>
          <div class="arch-item"><h4>⑤ 불량 분류 AI</h4><p>불량 이미지/로그의 유형을 자동 분류하고 원인 후보를 연결합니다.</p></div>
          <div class="arch-item"><h4>⑥ RAG 기반 LLM</h4><p>RCA/매뉴얼/시장 보고서 검색 기반으로 자연어 질의응답을 제공합니다.</p></div>
        </div>
      </div>

      <div class="row row-2 fade-in">
        <div class="card">
          <div class="card-head"><div class="icon-box">↺</div><div class="card-title">데이터/서빙 플로우</div></div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item"><div class="stat-title">2, 3번 서비스</div><div class="stat-desc">RDB 데이터를 벡터 DB에 적재하고 LLM 오케스트레이션으로 고객 스코어링/물량 배분 인사이트를 서빙합니다.</div></div>
            <div class="stat-item"><div class="stat-title">1, 4, 5번 서비스</div><div class="stat-desc">MLOps 기반 예측 모델로 결과를 생성하고, 보고서/설명 필요 시 ⑥ LLM(RAG)을 후단에 붙여 해석 리포트를 제공합니다.</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="icon-box">!</div><div class="card-title">이번 주 실행 전략</div></div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item"><div class="stat-title">HBM-TSV-001 선제 확보</div><div class="stat-desc">후루카와 TSV 충전재 부족 리스크가 높아 2주 선행 구매발주 권장.</div></div>
            <div class="stat-item"><div class="stat-title">HBM3E 라인 튜닝</div><div class="stat-desc">예측 수율이 최소 운영 수율 근접. Recipe 미세조정 및 수율 모니터링 강화.</div></div>
            <div class="stat-item"><div class="stat-title">Key Account 할당 방어</div><div class="stat-desc">NVIDIA/Apple/Samsung 우선 물량 배분으로 이탈 리스크 최소화.</div></div>
          </div>
        </div>
      </div>
    </div>
  `
};
