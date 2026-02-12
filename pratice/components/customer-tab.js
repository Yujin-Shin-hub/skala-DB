window.CustomerTab = {
  name: 'CustomerTab',
  props: {
    clientScoring: Array,
    allocationRows: Array,
    keyAccountRate: [String, Number]
  },
  template: `
    <div>
      <div class="card mb14 fade-in">
        <div class="card-head">
          <div class="icon-box">②</div>
          <div class="card-title">고객 스코어링 AI 결과</div>
          <div class="card-badge">XGBoost Classifier + Logistic Regression</div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>고객사</th>
                <th>산업군</th>
                <th style="text-align:right">신용도</th>
                <th style="text-align:right">거래규모</th>
                <th style="text-align:right">수익성</th>
                <th style="text-align:right">LTV</th>
                <th style="text-align:right">AI 점수</th>
                <th>세그먼트</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clientScoring" :key="c.name">
                <td class="td-name">{{ c.name }}</td>
                <td>{{ c.industry }}</td>
                <td class="td-num">{{ c.credit }}</td>
                <td class="td-num">{{ c.volume }}</td>
                <td class="td-num">{{ c.profit }}</td>
                <td class="td-num">{{ c.ltv }}</td>
                <td class="td-num">{{ c.score }}</td>
                <td>
                  <span class="badge" :class="c.segment==='Key Account' ? 'b-green' : c.segment==='Growth' ? 'b-blue' : 'b-yellow'">{{ c.segment }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row row-2-1 fade-in">
        <div class="card">
          <div class="card-head">
            <div class="icon-box">③</div>
            <div class="card-title">물량 배분 최적화 결과 (HBM3 24GB 기준)</div>
            <div class="card-badge">LP / OR-Tools</div>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>고객사</th>
                  <th style="text-align:right">요청</th>
                  <th style="text-align:right">배정</th>
                  <th style="text-align:right">미배정</th>
                  <th>코멘트</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in allocationRows" :key="a.name">
                  <td class="td-name">{{ a.name }}</td>
                  <td class="td-num">{{ a.request.toLocaleString() }}</td>
                  <td class="td-num" style="color:var(--green)">{{ a.allocated.toLocaleString() }}</td>
                  <td class="td-num" :style="{color:a.backlog>0?'var(--sk-red)':'var(--text2)'}">{{ a.backlog.toLocaleString() }}</td>
                  <td>{{ a.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="icon-box">✓</div><div class="card-title">영업/고객 전략</div></div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item"><div class="stat-title">핵심고객 충족률</div><div class="stat-desc"><strong>{{ keyAccountRate }}%</strong> 유지. 단기 수익과 장기 파트너십(LTV) 균형 확보.</div></div>
            <div class="stat-item"><div class="stat-title">신규 고객 발굴</div><div class="stat-desc">기존 구매 패턴과 유사한 AI 서버/자동차 고객군을 우선 타깃팅.</div></div>
            <div class="stat-item"><div class="stat-title">가격/계약 전략</div><div class="stat-desc">고수익 제품(HBM) 중심 장기 계약 비중 확대, 저마진 품목은 분기별 재협상.</div></div>
          </div>
        </div>
      </div>
    </div>
  `
};
