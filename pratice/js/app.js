const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

createApp({
  components: {
    DashboardTab: window.DashboardTab,
    ForecastTab: window.ForecastTab,
    CustomerTab: window.CustomerTab,
    YieldTab: window.YieldTab,
    ChatbotTab: window.ChatbotTab
  },
  setup() {
    const activePage = ref('forecast');
    const isSidebarOpen = ref(false);
    const selectedFactory = ref('이천');
    const period = ref('3m');
    const scenario = ref('base');
    const selectedGroup = ref('all');
    const bufferPct = ref(20);
    const currentTime = ref('');

    const updateTime = () => {
      currentTime.value = new Date().toLocaleString('ko-KR', { hour12: false });
    };

    let timer;
    onMounted(() => {
      updateTime();
      timer = setInterval(updateTime, 1000);
    });
    onUnmounted(() => clearInterval(timer));

    const periodMult = computed(() => (period.value === '1m' ? 1 : period.value === '3m' ? 3 : 6));
    const scenarioMult = computed(() => (scenario.value === 'bull' ? 1.15 : scenario.value === 'bear' ? 0.85 : 1));
    const periodLabel = computed(() => (period.value === '1m' ? '1개월' : period.value === '3m' ? '3개월' : '6개월'));
    const factoryMult = computed(() => {
      if (selectedFactory.value === '청주') return { demand: 0.95, stock: 1.08 };
      if (selectedFactory.value === '우시') return { demand: 1.05, stock: 0.92 };
      return { demand: 1.0, stock: 1.0 };
    });

    const baseMaterials = ref([
      { code: 'HBM-WF-001', name: '실리콘 웨이퍼 (12인치)', group: 'DRAM 다이', supplier: '신에츠(Shin-Etsu)', supplierCode: 'SE-W12-HX300', stock: 6800, safetyStock: 1900, monthly: 2900 },
      { code: 'HBM-PR-001', name: '포토레지스트 (EUV용)', group: 'DRAM 다이', supplier: 'JSR / TOK', supplierCode: 'JSR-EUV-PR001', stock: 4100, safetyStock: 1300, monthly: 2100 },
      { code: 'HBM-INS-001', name: 'High-k 절연막 (HfO2)', group: 'DRAM 다이', supplier: '다우케미칼(Dow)', supplierCode: 'DOW-HK-HFO2-02', stock: 3700, safetyStock: 1100, monthly: 1800 },
      { code: 'HBM-TSV-001', name: '구리(Cu) TSV 충전재', group: 'TSV 핵심', supplier: '후루카와전기(Furukawa)', supplierCode: 'FRK-CU-TSV-HBM', stock: 2200, safetyStock: 1300, monthly: 1900 },
      { code: 'HBM-TSV-002', name: '절연 라이너 (SiO2)', group: 'TSV 핵심', supplier: '솔브레인(Soulbrain)', supplierCode: 'SB-SIO2-LN-HBM', stock: 2600, safetyStock: 900, monthly: 1400 },
      { code: 'HBM-TSV-003', name: '웨이퍼 박막화 소재', group: 'TSV 핵심', supplier: '디스코(DISCO)', supplierCode: 'DSC-THIN-HBM3', stock: 1900, safetyStock: 1000, monthly: 1500 },
      { code: 'HBM-INTP-001', name: '실리콘 인터포저', group: '인터포저/범프', supplier: 'TSMC / 삼성전자 파운드리', supplierCode: 'TSMC-INTP-CoWoS', stock: 1600, safetyStock: 900, monthly: 1250 },
      { code: 'HBM-BUMP-001', name: '마이크로 범프/솔더', group: '인터포저/범프', supplier: '덕산네오룩스(Duksan)', supplierCode: 'DK-UBUMP-PB-FREE', stock: 2400, safetyStock: 800, monthly: 1200 },
      { code: 'HBM-UF-001', name: '언더필(Underfill)', group: '접착/보호/방열', supplier: '나믹스(Namics)', supplierCode: 'NMC-UF-HBM-EP', stock: 2000, safetyStock: 700, monthly: 1050 },
      { code: 'HBM-TIM-001', name: 'TIM (열계면소재)', group: '접착/보호/방열', supplier: '허니웰(Honeywell)', supplierCode: 'HW-TIM-HC-X70', stock: 1200, safetyStock: 600, monthly: 900 },
      { code: 'HBM-EMC-001', name: 'EMC 몰딩재', group: '접착/보호/방열', supplier: '한화솔루션(Hanwha)', supplierCode: 'HWS-EMC-BK-HBM', stock: 1500, safetyStock: 650, monthly: 940 }
    ]);

    const allMaterials = computed(() =>
      baseMaterials.value.map((m) => {
        const stock = Math.round(m.stock * factoryMult.value.stock);
        const safetyStock = Math.round(m.safetyStock * factoryMult.value.stock);
        const forecast = Math.round(m.monthly * periodMult.value * scenarioMult.value * factoryMult.value.demand);
        const shortage = Math.max(0, forecast - stock + safetyStock);
        const bufferQty = Math.round((shortage * bufferPct.value) / 100);
        const totalOrder = shortage + bufferQty;
        const dailyNeed = Math.max(1, Math.round(forecast / (periodMult.value * 30)));
        const coverage = Math.round(stock / dailyNeed);
        let priority = '낮음';
        if (coverage < 14) priority = '긴급';
        else if (coverage < 30) priority = '높음';
        else if (coverage < 60) priority = '중간';
        return { ...m, stock, safetyStock, forecast, shortage, bufferQty, totalOrder, coverage, priority };
      })
    );

    const filteredMaterials = computed(() =>
      selectedGroup.value === 'all' ? allMaterials.value : allMaterials.value.filter((m) => m.group === selectedGroup.value)
    );

    const chartData = computed(() => [...filteredMaterials.value].sort((a, b) => b.forecast - a.forecast).slice(0, 8));
    const chartMax = computed(() => {
      const vals = chartData.value.flatMap((v) => [v.stock, v.forecast, v.totalOrder]);
      return Math.max(1, Math.ceil(Math.max(...vals) * 1.15));
    });

    const sumForecast = computed(() => filteredMaterials.value.reduce((acc, m) => acc + m.forecast, 0));
    const sumStock = computed(() => filteredMaterials.value.reduce((acc, m) => acc + m.stock, 0));
    const totalOrderQty = computed(() => filteredMaterials.value.reduce((acc, m) => acc + m.totalOrder, 0));
    const urgentCount = computed(() => filteredMaterials.value.filter((m) => m.priority === '긴급' || m.priority === '높음').length);
    const avgCoverage = computed(() => {
      const count = Math.max(filteredMaterials.value.length, 1);
      return Math.round(filteredMaterials.value.reduce((acc, m) => acc + m.coverage, 0) / count);
    });

    const aiRecommendations = computed(() =>
      [...allMaterials.value]
        .filter((m) => m.totalOrder > 0)
        .sort((a, b) => b.totalOrder - a.totalOrder)
        .slice(0, 3)
        .map((m) => {
          const msg =
            m.priority === '긴급'
              ? '즉시 발주 필요 (품귀 가능성 높음)'
              : m.priority === '높음'
                ? `${periodLabel.value} 내 선제 발주 권장`
                : '안정 재고 확보 목적의 계획 발주 권장';
          return { ...m, orderQty: m.totalOrder, msg };
        })
    );

    const clientScoring = ref([
      { name: 'Samsung Electronics', industry: 'Mobile/Server', credit: 95, volume: 91, profit: 83, ltv: 96, score: 92, segment: 'Key Account' },
      { name: 'NVIDIA', industry: 'AI Server', credit: 89, volume: 88, profit: 97, ltv: 98, score: 93, segment: 'Key Account' },
      { name: 'Apple', industry: 'Mobile/PC', credit: 97, volume: 79, profit: 84, ltv: 93, score: 90, segment: 'Key Account' },
      { name: 'Dell', industry: 'PC/Server', credit: 84, volume: 70, profit: 68, ltv: 77, score: 78, segment: 'Growth' },
      { name: 'Tesla', industry: 'Automotive', credit: 81, volume: 64, profit: 72, ltv: 82, score: 76, segment: 'Growth' },
      { name: 'Lenovo', industry: 'PC', credit: 73, volume: 58, profit: 54, ltv: 61, score: 64, segment: 'Watch' }
    ]);

    const allocationRows = computed(() => {
      const base = [
        { name: 'NVIDIA', request: 12000, weight: 1.15 },
        { name: 'Samsung Electronics', request: 9000, weight: 1.08 },
        { name: 'Apple', request: 6500, weight: 1.04 },
        { name: 'Dell', request: 3200, weight: 0.86 },
        { name: 'Tesla', request: 2100, weight: 0.82 }
      ];

      const supply = 26800;
      const denom = base.reduce((a, b) => a + b.request * b.weight, 0);
      let remain = supply;

      const rows = base.map((b) => {
        const alloc = Math.min(b.request, Math.floor((supply * (b.request * b.weight)) / denom));
        remain -= alloc;
        return { ...b, allocated: alloc, backlog: 0, note: '' };
      });

      rows.sort((a, b) => b.weight - a.weight).forEach((r) => {
        if (remain <= 0) return;
        const gap = r.request - r.allocated;
        const plus = Math.min(remain, gap);
        r.allocated += plus;
        remain -= plus;
      });

      rows.forEach((r) => {
        r.backlog = r.request - r.allocated;
        r.note = r.backlog > 0 ? '분할 납품/대체 SKU 제안' : '요청 물량 100% 충족';
      });

      return rows;
    });

    const keyAccountRate = computed(() => {
      const keySet = new Set(['NVIDIA', 'Samsung Electronics', 'Apple']);
      const k = allocationRows.value.filter((r) => keySet.has(r.name));
      const req = k.reduce((a, b) => a + b.request, 0);
      const alloc = k.reduce((a, b) => a + b.allocated, 0);
      return ((alloc / req) * 100).toFixed(1);
    });

    const baseYieldRows = ref([
      { line: 'ICN-L01', product: 'HBM3 24GB', node: '1bnm', target: 88, pred: 81, min: 79 },
      { line: 'ICN-L04', product: 'HBM3E 36GB', node: '1cnm', target: 84, pred: 74, min: 76 },
      { line: 'CJU-L02', product: 'DDR5 16GB', node: '1anm', target: 91, pred: 89, min: 82 },
      { line: 'CJU-L07', product: 'NAND 1TB', node: '176L', target: 93, pred: 90, min: 83 },
      { line: 'WUX-L03', product: 'LPDDR5 16GB', node: '1bnm', target: 90, pred: 85, min: 80 },
      { line: 'WUX-L06', product: 'NAND 512GB', node: '128L', target: 92, pred: 87, min: 82 }
    ]);

    const yieldRows = computed(() => {
      const prefix = selectedFactory.value === '이천' ? 'ICN' : selectedFactory.value === '청주' ? 'CJU' : 'WUX';
      return baseYieldRows.value.filter((row) => row.line.startsWith(prefix));
    });

    const avgPredYield = computed(() => {
      const rows = yieldRows.value;
      if (!rows.length) return '0.0';
      return (rows.reduce((a, b) => a + b.pred, 0) / rows.length).toFixed(1);
    });

    const defects = ref([
      { type: 'Pattern Collapse', step: 'Photo', sev: 5, cause: '습도/PR 점도 편차', action: 'Bake 온도 +2.0C, 챔버 건조도 상향', conf: 94 },
      { type: 'Contamination', step: 'Etching', sev: 4, cause: '가스 라인 파티클 증가', action: 'Purge cycle 증대 + MFC 재교정', conf: 89 },
      { type: 'Scratch', step: 'CMP', sev: 3, cause: '패드 마모 임계치 초과', action: '소모품 교체주기 단축', conf: 91 }
    ]);

    const ragQa = ref([
      {
        q: 'HBM3E 라인 수율이 76% 이하로 떨어질 때 조치?',
        a: '과거 RCA 4건 기준으로 Photo bake +2C, Etch purge +12% 조정 시 2주 내 수율 +4~5%p 개선 사례가 확인되었습니다.'
      },
      {
        q: 'D램 가격 하락세가 지속되면 Q3 재고 손실은?',
        a: '시장 리포트 벡터 검색 기준 -8% ASP 시나리오에서 약 31M$ 수준의 평가손 가능성이 있으며, 서버용 DDR5 우선 출하로 일부 완화 가능합니다.'
      },
      {
        q: 'Pattern Collapse 유사 사례의 표준 레시피는?',
        a: '내부 매뉴얼 VM-PR-17 유사 사례 기준: 노광 에너지 하한 +0.4%, 건조 18초 유지, 습도 42% 이하 제어가 권고됩니다.'
      }
    ]);

    return {
      activePage,
      isSidebarOpen,
      selectedFactory,
      period,
      scenario,
      selectedGroup,
      bufferPct,
      currentTime,
      periodLabel,
      filteredMaterials,
      chartData,
      chartMax,
      sumForecast,
      sumStock,
      totalOrderQty,
      urgentCount,
      avgCoverage,
      aiRecommendations,
      clientScoring,
      allocationRows,
      keyAccountRate,
      yieldRows,
      avgPredYield,
      defects,
      ragQa
    };
  }
}).mount('#app');
