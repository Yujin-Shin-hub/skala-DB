window.ChatbotTab = {
  name: 'ChatbotTab',
  props: {
    ragQa: Array,
    currentTime: String
  },
  data() {
    return {
      input: '',
      messages: [
        {
          role: 'assistant',
          text: '안녕하세요. RAG 기반 챗봇입니다. 공정 불량 RCA, 장비 매뉴얼, 시장 리포트 관련 질문을 입력해 주세요.',
          time: this.currentTime,
          sources: ['RCA-VectorDB', 'Equipment-Manual', 'Market-Insight']
        }
      ]
    };
  },
  methods: {
    askQuick(question) {
      this.input = question;
      this.send();
    },
    send() {
      const q = this.input.trim();
      if (!q) return;

      this.messages.push({ role: 'user', text: q, time: this.currentTime, sources: [] });

      const matched = (this.ragQa || []).find((item) => q.includes(item.q) || item.q.includes(q));
      const answer = matched
        ? matched.a
        : '관련 문서를 검색한 결과, 즉시 조치 가능한 유사 사례가 부족합니다. 질문을 더 구체화하면 공정 단계/불량 유형 기준으로 재검색해 드리겠습니다.';

      const sources = matched
        ? ['RCA Casebook #24', 'Fab Manual VM-PR-17', 'Market Report 2026-Q1']
        : ['Internal Vector DB Search (Top-K)'];

      this.messages.push({ role: 'assistant', text: answer, time: this.currentTime, sources });
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
          </div>
        </div>
      </div>
    </div>
  `
};
