window.ForecastTab = {
  name: 'ForecastTab',
  props: {
    selectedFactory: String,
    period: String,
    periodLabel: String,
    scenario: String,
    selectedGroup: String,
    bufferPct: Number,
    currentTime: String,
    filteredMaterials: Array,
    chartData: Array,
    chartMax: Number,
    sumForecast: Number,
    sumStock: Number,
    totalOrderQty: Number,
    urgentCount: Number,
    avgCoverage: Number,
    aiRecommendations: Array
  },
  emits: ['update:period', 'update:scenario', 'update:selectedGroup', 'update:bufferPct', 'update:selectedFactory'],
  template: `
    <div>
      <div class="filter-bar fade-in">
        <div class="filter-label">공장</div>
        <select class="filter-select" :value="selectedFactory" @change="$emit('update:selectedFactory',$event.target.value)">
          <option value="이천">이천</option>
          <option value="청주">청주</option>
          <option value="우시">우시</option>
        </select>
        <div class="filter-label">기간</div>
        <button class="filter-btn" :class="{active: period==='1m'}" @click="$emit('update:period','1m')">1개월</button>
        <button class="filter-btn" :class="{active: period==='3m'}" @click="$emit('update:period','3m')">3개월</button>
        <button class="filter-btn" :class="{active: period==='6m'}" @click="$emit('update:period','6m')">6개월</button>
        <div class="filter-label" style="margin-left:10px">소재군</div>
        <select class="filter-select" :value="selectedGroup" @change="$emit('update:selectedGroup',$event.target.value)">
          <option value="all">전체</option>
          <option value="DRAM 다이">DRAM 다이</option>
          <option value="TSV 핵심">TSV 핵심</option>
          <option value="인터포저/범프">인터포저/범프</option>
          <option value="접착/보호/방열">접착/보호/방열</option>
        </select>
        <div class="filter-label" style="margin-left:10px">시나리오</div>
        <select class="filter-select" :value="scenario" @change="$emit('update:scenario',$event.target.value)">
          <option value="base">기준</option>
          <option value="bull">낙관 (수요↑)</option>
          <option value="bear">비관 (수요↓)</option>
        </select>
        <button class="download-btn">↓ Excel 다운로드</button>
      </div>

      <div class="ai-banner fade-in">
        <div class="banner-title">★ AI 추천 발주 계획</div>
        <div class="banner-list">
          <div class="banner-item" v-for="rec in aiRecommendations" :key="rec.code">
            <span class="dot">✓</span>
            <span>
              <strong>{{ rec.code }}</strong> ({{ rec.name }}) : {{ rec.msg }}
              <strong>({{ rec.orderQty.toLocaleString() }}개 발주 권장)</strong>
            </span>
          </div>
        </div>
        <div class="banner-foot">
          <span>◈ AI ① Demand Forecaster: SARIMAX + XGBoost + LSTM + Prophet</span>
          <span>◈ 학습 데이터: SERVICE + 외부 시장 리포트 + 원자재 뉴스</span>
          <span>◈ 예측 정확도: MAPE 11.6%</span>
          <span>◈ 마지막 업데이트: {{ currentTime }}</span>
        </div>
      </div>

      <div class="row row-3 mb18 fade-in">
        <div class="card">
          <div class="kpi">
            <div class="kpi-label">총 발주 필요량</div>
            <div class="kpi-value" style="color:var(--sk-red)">{{ totalOrderQty.toLocaleString() }}<span style="font-size:15px;font-weight:600"> 개</span></div>
            <div class="kpi-sub">여유분 {{ bufferPct }}% 포함</div>
            <div class="kpi-bar"><div class="kpi-fill" style="width:100%;background:var(--sk-red)"></div></div>
          </div>
        </div>
        <div class="card">
          <div class="kpi">
            <div class="kpi-label">긴급 발주 소재</div>
            <div class="kpi-value" style="color:var(--yellow)">{{ urgentCount }}<span style="font-size:15px;font-weight:600"> 건</span></div>
            <div class="kpi-sub">재고 30일치 미만</div>
            <div class="kpi-bar"><div class="kpi-fill" :style="{width: (urgentCount/Math.max(filteredMaterials.length,1)*100)+'%', background:'var(--yellow)'}"></div></div>
          </div>
        </div>
        <div class="card">
          <div class="kpi">
            <div class="kpi-label">평균 재고 커버리지</div>
            <div class="kpi-value" style="color:var(--blue)">{{ avgCoverage }}<span style="font-size:15px;font-weight:600"> 일</span></div>
            <div class="kpi-sub">목표 60일 대비</div>
            <div class="kpi-bar"><div class="kpi-fill" :style="{width: Math.min(avgCoverage/90*100,100)+'%', background:'var(--blue)'}"></div></div>
          </div>
        </div>
      </div>

      <div class="card mb18 fade-in">
        <div class="card-head">
          <div class="icon-box">↗</div>
          <div class="card-title">HBM 핵심 소재 수요 예측 (향후 {{ periodLabel }})</div>
          <div class="card-badge">AI ①</div>
        </div>

        <div class="buffer">
          <div class="buffer-title">여유분(BUFFER) 설정</div>
          <div class="buffer-row">
            <span style="font-size:12px;color:var(--text2)">안전 여유율</span>
            <input type="range" min="5" max="50" step="5" :value="bufferPct" @input="$emit('update:bufferPct',Number($event.target.value))" />
            <span style="font:700 11px var(--mono);color:var(--blue)">{{ bufferPct }}%</span>
          </div>
        </div>

        <div class="formula">
          <span class="term t-purple">총 발주 필요량</span>
          <span>=</span>
          <span class="term t-orange">예측 수요</span>
          <span>-</span>
          <span class="term t-blue">현재고</span>
          <span>+</span>
          <span class="term t-green">안전재고</span>
          <span>+</span>
          <span class="term t-red">여유분 {{ bufferPct }}%</span>
        </div>

        <div class="legend">
          <span><i style="background:var(--blue)"></i>현재고</span>
          <span><i style="background:var(--sk-red)"></i>예측 수요</span>
          <span><i style="background:var(--purple)"></i>총 발주 필요량</span>
        </div>

        <div class="chart-wrap">
          <div class="group" v-for="item in chartData" :key="item.code">
            <div class="bar" :style="{height:(item.stock/chartMax*170)+'px', background:'var(--blue)'}"></div>
            <div class="bar" :style="{height:(item.forecast/chartMax*170)+'px', background:'var(--sk-red)'}"></div>
            <div class="bar" :style="{height:(item.totalOrder/chartMax*170)+'px', background:'var(--purple)', opacity: item.totalOrder>0 ? 1 : .15}"></div>
            <div class="xlabel">{{ item.code }}</div>
          </div>
        </div>
      </div>

      <div class="card fade-in">
        <div class="card-head">
          <div class="icon-box">▦</div>
          <div class="card-title">소재별 상세 예측 데이터</div>
          <div class="card-badge">{{ filteredMaterials.length }}개 소재</div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>내부코드</th>
                <th>소재명</th>
                <th>소재군</th>
                <th>대표 협력사</th>
                <th>협력사 코드</th>
                <th style="text-align:right">현재고</th>
                <th style="text-align:right">예측 수요</th>
                <th style="text-align:right">안전재고</th>
                <th style="text-align:right">순 부족량</th>
                <th style="text-align:right">여유분</th>
                <th style="text-align:right">총 발주</th>
                <th>우선순위</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in filteredMaterials" :key="m.code">
                <td class="td-code">{{ m.code }}</td>
                <td class="td-name">{{ m.name }}</td>
                <td><span class="badge b-blue">{{ m.group }}</span></td>
                <td>{{ m.supplier }}</td>
                <td class="td-code">{{ m.supplierCode }}</td>
                <td class="td-num">{{ m.stock.toLocaleString() }}</td>
                <td class="td-num">{{ m.forecast.toLocaleString() }}</td>
                <td class="td-num">{{ m.safetyStock.toLocaleString() }}</td>
                <td class="td-num" :style="{color:m.shortage>0?'var(--sk-red)':'var(--green)'}">{{ m.shortage.toLocaleString() }}</td>
                <td class="td-num">{{ m.bufferQty.toLocaleString() }}</td>
                <td class="td-num" style="color:var(--purple)">{{ m.totalOrder.toLocaleString() }}</td>
                <td>
                  <span class="badge" :class="{
                    'b-red': m.priority==='긴급',
                    'b-yellow': m.priority==='높음',
                    'b-blue': m.priority==='중간',
                    'b-green': m.priority==='낮음'
                  }">{{ m.priority }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">총 예측 수요</div>
            <div class="summary-value" style="color:var(--sk-red)">{{ sumForecast.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">총 현재고</div>
            <div class="summary-value" style="color:var(--blue)">{{ sumStock.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">총 발주 필요량</div>
            <div class="summary-value" style="color:var(--purple)">{{ totalOrderQty.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">긴급 소재 수</div>
            <div class="summary-value" style="color:var(--yellow)">{{ urgentCount }}</div>
          </div>
        </div>
      </div>
    </div>
  `
};
