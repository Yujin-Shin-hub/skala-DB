window.YieldTab = {
  name: 'YieldTab',
  props: {
    yieldRows: Array,
    defects: Array,
    ragQa: Array
  },
  template: `
    <div>
      <div class="row row-2 mb14 fade-in">
        <div class="card">
          <div class="card-head">
            <div class="icon-box">④</div>
            <div class="card-title">Virtual Metrology (수율 예측)</div>
            <div class="card-badge">RandomForest + LSTM + GradientBoosting</div>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>라인</th>
                  <th>제품</th>
                  <th>공정노드</th>
                  <th style="text-align:right">목표 수율</th>
                  <th style="text-align:right">예측 수율</th>
                  <th style="text-align:right">최소 운영 수율</th>
                  <th>권고</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="y in yieldRows" :key="y.line">
                  <td class="td-code">{{ y.line }}</td>
                  <td>{{ y.product }}</td>
                  <td>{{ y.node }}</td>
                  <td class="td-num">{{ y.target }}%</td>
                  <td class="td-num" :style="{color:y.pred<y.min?'var(--sk-red)':'var(--green)'}">{{ y.pred }}%</td>
                  <td class="td-num">{{ y.min }}%</td>
                  <td>
                    <span class="badge" :class="y.pred<y.min ? 'b-red' : y.pred<y.target ? 'b-yellow':'b-green'">
                      {{ y.pred<y.min ? '생산 속도 조정 + 튜닝' : y.pred<y.target ? '레시피 보정' : '계획 유지' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="icon-box">⑤</div>
            <div class="card-title">Defect Classifier</div>
            <div class="card-badge">CNN + ResNet + IsolationForest</div>
          </div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item" v-for="d in defects" :key="d.type">
              <div class="stat-title">{{ d.type }} · {{ d.step }} · Sev {{ d.sev }}</div>
              <div class="stat-desc">원인: {{ d.cause }} / 조치: {{ d.action }} (신뢰도 {{ d.conf }}%)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row row-2 fade-in">
        <div class="card">
          <div class="card-head">
            <div class="icon-box">⑥</div>
            <div class="card-title">RAG 기반 LLM 질의응답</div>
            <div class="card-badge">Qwen/Llama + Chroma/FAISS</div>
          </div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item" v-for="q in ragQa" :key="q.q">
              <div class="stat-title">Q. {{ q.q }}</div>
              <div class="stat-desc">A. {{ q.a }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="icon-box">▲</div><div class="card-title">수율 향상 실행 전략</div></div>
          <div class="stat-list" style="padding:12px;">
            <div class="stat-item"><div class="stat-title">1) Break-even 미달 라인 차단</div><div class="stat-desc">min_operating_yield 미달 시 즉시 생산량을 줄이고 Recipe 최적화를 우선 수행.</div></div>
            <div class="stat-item"><div class="stat-title">2) 공정 편차 실시간 제어</div><div class="stat-desc">온도/압력/가스 유량 drift 감지 즉시 경보 발행, 엔지니어에게 권장 파라미터 제공.</div></div>
            <div class="stat-item"><div class="stat-title">3) RCA 재사용으로 MTTR 단축</div><div class="stat-desc">유사 불량 사례를 RAG로 즉시 검색해 평균 조치시간(MTTR)과 수율 정상화 시간을 단축.</div></div>
          </div>
        </div>
      </div>
    </div>
  `
};
