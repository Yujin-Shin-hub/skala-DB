window.ChatbotTab = {
  name: 'ChatbotTab',
  props: {
    ragQa: Array,
    currentTime: String
  },
  data() {
    return {
      input: "현재 1번 라인에서 발생한 'Pattern Collapse' 불량 원인과 해결 레시피 알려줘",
      messages: [
        {
          role: 'assistant',
          text: '안녕하세요. RAG 기반 챗봇입니다. 공정 불량 RCA, 장비 매뉴얼, 시장 리포트 관련 질문을 입력해 주세요.',
          time: this.currentTime,
          sources: ['RCA-VectorDB', 'Equipment-Manual', 'Market-Insight']
        }
      ],
      lastAnswerMeta: null
    };
  },
  methods: {
    loadRcaExample() {
      this.input = "현재 1번 라인에서 발생한 'Pattern Collapse' 불량 원인과 해결 레시피 알려줘";
    },
    askQuick(question) {
      this.input = question;
      this.send();
    },
    send() {
      const q = this.input.trim();
      if (!q) return;

      this.messages.push({ role: 'user', text: q, time: this.currentTime, sources: [] });

      const isPatternCollapse = q.includes('Pattern Collapse') || q.includes('패턴') || q.includes('레시피');
      const matched = (this.ragQa || []).find((item) => q.includes(item.q) || item.q.includes(q));
      const answer = isPatternCollapse
        ? "현재 1번 라인의 Pattern Collapse 불량은 3년 전 이천 공장 Photo 공정 사례와 92% 유사합니다. 당시 효과가 검증된 조치인 '세정 노즐 압력 5% 하향'과 '노광 후 Bake +2°C'를 우선 적용하는 것을 권장합니다. 예상 개선 폭은 수율 +4.1%p입니다."
        : matched
          ? matched.a
          : '관련 문서를 검색한 결과, 즉시 조치 가능한 유사 사례가 부족합니다. 질문을 더 구체화하면 공정 단계/불량 유형 기준으로 재검색해 드리겠습니다.';

      const sources = isPatternCollapse
        ? ['RCA Casebook ICN-2023-117', 'Photo Tool Manual PT-44', 'Engineer Action Log EAL-774']
        : matched
          ? ['RCA Casebook #24', 'Fab Manual VM-PR-17', 'Market Report 2026-Q1']
          : ['Internal Vector DB Search (Top-K)'];

      this.messages.push({ role: 'assistant', text: answer, time: this.currentTime, sources });
      this.lastAnswerMeta = {
        title: '답변 생성 완료!',
        retrieval: isPatternCollapse ? 'Top-3 유사도 0.92 / 0.88 / 0.85' : 'Top-3 문서 검색 완료',
        confidence: isPatternCollapse ? '신뢰도 92%' : '신뢰도 78%'
      };
      this.input = '';
    }
  },
  template: `
    <div class="card fade-in">
      <div class="card-head">
        <div class="icon-box">✦</div>
        <div class="card-title">RAG 기반 챗봇</div>
        <div class="card-badge">Qwen/Llama + Chroma/FAISS</div>
      </div>

      <div class="row row-2" style="padding:12px;">
        <div class="card" style="box-shadow:none;">
          <div class="card-head" style="padding:10px 12px;">
            <div class="card-title">질의 패널</div>
          </div>
          <div style="padding:12px;display:grid;gap:10px;">
            <div class="stat-item" style="background:#fff7f2;border-color:#ffd8c4;">
              <div class="stat-title">데모 질문 예시 (RCA)</div>
              <div class="stat-desc">현재 1번 라인에서 발생한 'Pattern Collapse' 불량 원인과 해결 레시피 알려줘</div>
              <div style="margin-top:8px;">
                <button class="filter-btn active" @click="loadRcaExample">질문 입력칸에 넣기</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="filter-btn" v-for="q in ragQa" :key="q.q" @click="askQuick(q.q)">{{ q.q }}</button>
            </div>
            <div style="display:flex;gap:8px;">
              <input
                :value="input"
                @input="input = $event.target.value"
                @keyup.enter="send"
                placeholder="예: Pattern Collapse 재발 방지 레시피 알려줘"
                style="flex:1;border:1px solid var(--border2);border-radius:9px;padding:10px 12px;font-size:12px;"
              />
              <button class="filter-btn active" @click="send">질문</button>
            </div>
            <div class="stat-item">
              <div class="stat-title">검색 대상</div>
              <div class="stat-desc">공정 불량 RCA, 장비 트러블슈팅 매뉴얼, 시장 리포트, 내부 조치 이력 로그</div>
            </div>
          </div>
        </div>

        <div class="card" style="box-shadow:none;">
          <div class="card-head" style="padding:10px 12px;">
            <div class="card-title">대화 로그</div>
          </div>
          <div style="padding:12px;display:grid;gap:8px;max-height:500px;overflow:auto;">
            <div v-if="lastAnswerMeta" class="stat-item" style="background:#fff8ef;border-color:#ffd7ae;">
              <div class="stat-title">✓ {{ lastAnswerMeta.title }}</div>
              <div class="stat-desc">{{ lastAnswerMeta.retrieval }} / {{ lastAnswerMeta.confidence }}</div>
            </div>
            <div
              v-for="(m, idx) in messages"
              :key="idx"
              :style="{
                border:'1px solid var(--border)',
                borderRadius:'10px',
                padding:'10px',
                background: m.role==='assistant' ? '#f8f4ff' : '#f6f9ff'
              }"
            >
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                <strong style="font-size:12px;">{{ m.role==='assistant' ? 'RAG BOT' : 'USER' }}</strong>
                <span style="font:600 10px var(--mono);color:var(--text3);">{{ m.time }}</span>
              </div>
              <div style="font-size:12px;line-height:1.55;color:var(--text2);">{{ m.text }}</div>
              <div v-if="m.sources && m.sources.length" style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                <span class="badge b-purple" v-for="s in m.sources" :key="s">{{ s }}</span>
              </div>
            </div>
            <div v-if="lastAnswerMeta" class="stat-item">
              <div class="stat-title">📚 참고한 문서</div>
              <div class="stat-desc">RDB 장애 이력 + Vector DB 매뉴얼/조치 로그를 결합해 통합 응답을 생성했습니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
