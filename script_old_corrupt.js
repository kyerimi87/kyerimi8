// --- LOGIN & USER STATE LOGIC ---
// Expanded to setup global state
let currentUser = null;

function showLogin() {
    const loginScreen = document.getElementById('login-screen');
    const app = document.getElementById('app');

    loginScreen.classList.remove('hidden');
    loginScreen.style.display = 'flex';
    app.classList.add('hidden'); // Hide main app
}

function checkLogin() {
    const idInput = document.getElementById('login-id');
    const pwInput = document.getElementById('login-pw');
    const id = idInput.value.trim().toLowerCase(); // Case insensitive
    const pw = pwInput.value;
    const loginScreen = document.getElementById('login-screen');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const authBtn = document.getElementById('auth-btn');
    const topLoginBtn = document.getElementById('top-login-btn');

    // Flexible regex: allow 'student' followed by any number
    const isStudent = /^student\d+$/.test(id);

    // Admin login (1111/1111)
    if (id === '1111' && pw === '1111') {
        currentUser = 'admin';
        loginScreen.style.display = 'none';

        // Show App
        const app = document.getElementById('app');
        if (app) app.classList.remove('hidden');

        userName.innerText = '관리자님';
        userRole.innerText = '선생님 모드';

        if (topLoginBtn) topLoginBtn.style.display = 'none';

        switchTab('home');
    }
    // Student login (studentXX or simply 'student' / 1111)
    else if ((isStudent || id === 'student') && pw === '1111') {
        currentUser = id;
        loginScreen.style.display = 'none';

        // Show App
        const app = document.getElementById('app');
        if (app) app.classList.remove('hidden');

        userName.innerText = id + ' 학생';
        userRole.innerText = '수강생';

        if (topLoginBtn) topLoginBtn.style.display = 'none';

        // Load Checklist State for this user
        loadCheckState();
        switchTab('home');
    } else {
        alert('아이디 또는 비밀번호를 확인해주세요.\n\n[학습용 계정]\n아이디: student1 ~ student30\n비밀번호: 1111');
        pwInput.value = '';
        idInput.focus();
    }
}

function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        currentUser = null;
        document.getElementById('user-name').innerText = '게스트';
        document.getElementById('user-role').innerText = '비로그인 상태';

        // Reset Login Button
        const topLoginBtn = document.getElementById('top-login-btn');
        if (topLoginBtn) {
            topLoginBtn.style.display = 'block';
            topLoginBtn.innerHTML = '<i class="fa-solid fa-key"></i> 로그인';
            topLoginBtn.onclick = showLogin;
        }

        alert('로그아웃 되었습니다.');
        location.reload(); // Reload to clear state
    }
}



// --- CHECKLIST PERSISTENCE ---
function saveCheckState() {
    if (!currentUser) return;
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    checks.forEach(chk => {
        state[chk.id] = chk.checked;
    });
    localStorage.setItem('checklist_' + currentUser, JSON.stringify(state));
}

function loadCheckState() {
    if (!currentUser) return;
    const saved = localStorage.getItem('checklist_' + currentUser);
    if (saved) {
        const state = JSON.parse(saved);
        for (const [id, checked] of Object.entries(state)) {
            const el = document.getElementById(id);
            if (el) el.checked = checked;
        }
    } else {
        // Reset checks if no data
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    }
}


// --- WORKSHEET MODAL LOGIC ---
const worksheets = {
    'kwl': {
        title: 'K-W-L 표',
        desc: '주제에 대해 이미 아는 것(K), 알고 싶은 것(W), 배운 것(L)을 정리해봅니다.',
        html: `
            <div class="ws-grid-3">
                <div class="ws-col"><h4>K (What I Know)</h4><textarea placeholder="이미 알고 있는 내용을 적어보세요."></textarea></div>
                <div class="ws-col"><h4>W (What I Want to know)</h4><textarea placeholder="더 알고 싶은 내용을 질문으로 만들어보세요."></textarea></div>
                <div class="ws-col"><h4>L (What I Learned)</h4><textarea placeholder="수업 후 배운 내용을 정리해보세요."></textarea></div>
            </div>
        `
    },
    'mindmap': {
        title: '마인드맵 (Mind Map)',
        desc: '중심 주제를 가운데 두고 가지를 뻗어 나가며 생각을 확장해봅니다.',
        html: `
            <div style="text-align:center; height:100%; display:flex; flex-direction:column; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="중심 주제 입력 (예: 나의 여행)" style="font-size:1.5rem; text-align:center;">
                <div style="flex:1; border:2px dashed #ddd; border-radius:10px; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <textarea placeholder="가지 1: 생각나는 단어들..."></textarea>
                    <textarea placeholder="가지 2: 연관된 이미지..."></textarea>
                    <textarea placeholder="가지 3: 구체적인 계획..."></textarea>
                    <textarea placeholder="가지 4: 자유로운 아이디어..."></textarea>
                </div>
            </div>
        `
    },
    'venn': {
        title: '비교/대조 (Venn Diagram)',
        desc: '두 대상의 공통점과 차이점을 찾아 정리해봅니다.',
        html: `
            <div class="ws-grid-3">
                <div class="ws-col"><h4>A 만의 특징</h4><textarea placeholder="예: 우리나라의 인사법"></textarea></div>
                <div class="ws-col"><h4>공통점 (교집합)</h4><textarea placeholder="두 문화의 비슷한 점"></textarea></div>
                <div class="ws-col"><h4>B 만의 특징</h4><textarea placeholder="예: 태국의 인사법"></textarea></div>
            </div>
        `
    },
    'char': {
        title: '인물 분석표',
        desc: '인물의 내면과 외면을 깊이 있게 탐구해봅니다.',
        html: `
            <div style="display:flex; gap:10px; height:100%;">
                <div class="ws-col" style="flex:1"><h4>외적 특징</h4><textarea placeholder="생김새, 옷차림, 행동 말투 등"></textarea></div>
                <div class="ws-col" style="flex:1"><h4>내적 특징</h4><textarea placeholder="성격, 가치관, 고민, 꿈 등"></textarea></div>
                <div class="ws-col" style="flex:1"><h4>내가 느낀 점</h4><textarea placeholder="이 사람을 보며 나는 어떤 생각이 들었나요?"></textarea></div>
            </div>
        `
    },
    'cause': {
        title: '원인과 결과 (Fishbone)',
        desc: '문제의 근본적인 원인을 찾아 해결책을 모색합니다.',
        html: `
            <div style="display:flex; flex-direction:column; height:100%; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="문제 상황 (Result) 입력">
                <div class="ws-grid-3" style="flex:1;">
                    <div class="ws-col"><h4>원인 1 (환경)</h4><textarea></textarea></div>
                    <div class="ws-col"><h4>원인 2 (사람)</h4><textarea></textarea></div>
                    <div class="ws-col"><h4>원인 3 (소통)</h4><textarea></textarea></div>
                </div>
            </div>
        `
    },
    'flow': {
        title: '사건 흐름도 (Flow Chart)',
        desc: '시간의 흐름이나 사건의 순서대로 내용을 정리합니다.',
        html: `
            <div style="display:flex; flex-direction:column; gap:10px; height:100%; overflow-y:auto;">
                <input type="text" class="ws-list-input" placeholder="1단계 (처음): ">
                <input type="text" class="ws-list-input" placeholder="2단계 (전개): ">
                <input type="text" class="ws-list-input" placeholder="3단계 (위기): ">
                <input type="text" class="ws-list-input" placeholder="4단계 (절정): ">
                <input type="text" class="ws-list-input" placeholder="5단계 (결말): ">
            </div>
        `
    },
    'tree': {
        title: '개념 구조도 (Structure Tree)',
        desc: '핵심 개념을 중심으로 하위 내용을 체계적으로 분류합니다.',
        html: `
            <div style="height:100%; display:flex; flex-direction:column; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="대주제 (책 제목)" style="text-align:center; font-weight:bold;">
                <div style="display:flex; gap:10px; flex:1;">
                    <div class="ws-col" style="flex:1"><h4>Chapter 1</h4><textarea></textarea></div>
                    <div class="ws-col" style="flex:1"><h4>Chapter 2</h4><textarea></textarea></div>
                    <div class="ws-col" style="flex:1"><h4>Chapter 3</h4><textarea></textarea></div>
                </div>
            </div>
        `
    },
    'predict': {
        title: '표지 및 제목 추리',
        desc: '단서를 통해 내용을 예측하며 상상력을 발휘해봅니다.',
        html: `
            <div class="ws-grid-3">
                <div class="ws-col"><h4>단서 찾기</h4><textarea placeholder="표지의 그림, 제목의 글자체 등에서 힌트를 찾아보세요."></textarea></div>
                <div class="ws-col"><h4>내용 상상하기</h4><textarea placeholder="어떤 이야기가 펼쳐질까요?"></textarea></div>
                <div class="ws-col"><h4>질문 만들기</h4><textarea placeholder="작가에게 궁금한 점은?"></textarea></div>
            </div>
        `
    }
};

function openWorksheet(type) {
    const modal = document.getElementById('worksheet-modal');
    const body = document.getElementById('worksheet-body');
    const ws = worksheets[type];

    if (ws) {
        body.innerHTML = `
            <div class="ws-title">${ws.title}</div>
            <p class="ws-desc">${ws.desc}</p>
            ${ws.html}
        `;
        modal.classList.remove('hidden');
    }
}

function closeWorksheet() {
    document.getElementById('worksheet-modal').classList.add('hidden');
}


// --- TRAVEL TEST LOGIC ---
const testQuestions = [
    { q: "여행을 갈 때 계획은 어떻게 세우나요?", a: "분 단위로 엑셀에 정리한다", b: "대충 비행기랑 숙소만 잡는다" },
    { q: "관광지에서 예쁜 기념품을 발견했다!", a: "예산에 없으니 패스...", b: "일단 사고 본다! 예쁘니까." },
    { q: "친구가 갑자기 맛집을 바꾸자고 한다면?", a: "동선 꼬이는데... (스트레스)", b: "오 그래? 거기도 좋지!" },
    { q: "숙소를 고를 때 가장 중요한 것은?", a: "위치, 가격, 리뷰 분석 결과", b: "사진 봤을 때 꽂히는 느낌" },
    { q: "짐 싸기는 언제 시작하나요?", a: "일주일 전부터 리스트 작성", b: "전날 밤이나 당일 아침" }
];
let currentQIndex = 0;
let score = 0;

function openTestModal() {
    document.getElementById('test-modal').classList.remove('hidden');
    restartTest();
}

function closeTestModal() {
    document.getElementById('test-modal').classList.add('hidden');
}

function restartTest() {
    currentQIndex = 0;
    score = 0;
    document.getElementById('test-question-container').classList.remove('hidden');
    document.getElementById('test-result-container').classList.add('hidden');
    showQuestion();
}

function showQuestion() {
    const qData = testQuestions[currentQIndex];
    document.getElementById('test-q-text').innerText = `Q${currentQIndex + 1}. ${qData.q}`;
    document.getElementById('opt-a').innerText = qData.a;
    document.getElementById('opt-b').innerText = qData.b;
    const percent = ((currentQIndex) / testQuestions.length) * 100;
    document.getElementById('test-progress').style.width = percent + '%';
}

function nextTest(choice) {
    if (choice === 0) score++;
    currentQIndex++;
    if (currentQIndex < testQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('test-question-container').classList.add('hidden');
    const rContainer = document.getElementById('test-result-container');
    rContainer.classList.remove('hidden');
    document.getElementById('test-progress').style.width = '100%';
    const rIcon = document.getElementById('r-icon');
    const rTitle = document.getElementById('r-title');
    const rDesc = document.getElementById('r-desc');
    if (score >= 3) {
        rIcon.innerText = "📐";
        rTitle.innerText = "완벽주의 설계자 (Planner)";
        rDesc.innerHTML = "당신은 치밀한 계획으로 실패 없는 여행을 만드는 설계자입니다!<br>예상치 못한 변수만 조심한다면 최고의 가이드가 될 수 있어요.";
    } else {
        rIcon.innerText = "🌬️";
        rTitle.innerText = "자유로운 탐험가 (Improviser)";
        rDesc.innerHTML = "당신은 발길 닿는 대로 떠나는 낭만적인 탐험가입니다!<br>우연히 마주친 풍경에서 더 큰 감동을 느끼는 타입이시네요.";
    }
}


// --- CHATBOT & UI LOGIC ---
function toggleChat() {
    document.getElementById('chat-window').classList.toggle('hidden');
}

function handleEnter(e) { if (e.key === 'Enter') sendMsg(); }

function sendMsg() {
    const input = document.getElementById('chat-input');
    const txt = input.value.trim();
    if (!txt) return;
    addMessage(txt, 'user-msg');
    input.value = '';
    setTimeout(() => {
        addMessage(getBotResponse(txt), 'bot-msg');
    }, 600);
}

function addMessage(text, cls) {
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = `msg ${cls}`;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function switchIntroTab(introId) {
    // 1. Update Buttons
    const buttons = document.querySelectorAll('.sub-nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Find button by data-target attribute
    const targetBtn = document.querySelector(`.sub-nav-btn[data-target="${introId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    // 2. Update Content
    const contents = document.querySelectorAll('.intro-tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const targetContent = document.getElementById(`intro-tab-${introId}`);
    if (targetContent) targetContent.classList.add('active');
}

function getBotResponse(txt) {
    txt = txt.toLowerCase();
    if (txt.includes('안녕')) return "안녕하세요! 여행 멘토입니다. 무엇을 도와드릴까요?";
    if (txt.includes('1단원')) return "1단원은 '나'를 돌아보는 시간이에요. 인생 여행 그래프를 그려보셨나요?";
    if (txt.includes('체크리스트')) return "체크리스트는 수행평가와 직결되니 꼼꼼히 채워주세요!";
    return "좋은 질문이네요! 씽킹 툴을 사용해서 생각을 더 깊게 정리해보는 건 어떨까요?";
}

function switchTab(tabId, subTarget = null) {
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Tab mapping
    const map = { 'home': 0, 'unit1': 1, 'unit2': 2, 'unit3': 3, 'unit4': 4, 'unit5': 5 };
    if (map[tabId] !== undefined && document.querySelectorAll('.nav-links li')[map[tabId]]) {
        document.querySelectorAll('.nav-links li')[map[tabId]].classList.add('active');
    }

    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        // Trigger renders
        if (tabId === 'unit1') {
            renderUnit1Lessons();
            renderUnit1Steps();
            if (subTarget === 'grid') {
                setTimeout(() => {
                    const grid = document.getElementById('unit1-steps-grid');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        if (tabId === 'unit2') {
            renderUnitLessons('unit2');
            renderUnitSteps('unit2');
            if (subTarget === 'grid') {
                setTimeout(() => {
                    const grid = document.getElementById('unit2-steps-grid');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        if (tabId === 'unit3') {
            renderUnitLessons('unit3');
            renderUnitSteps('unit3');
            if (subTarget === 'grid') {
                setTimeout(() => {
                    const grid = document.getElementById('unit3-steps-grid');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        if (tabId === 'unit4') {
            renderUnitLessons('unit4');
            renderUnitSteps('unit4');
            if (subTarget === 'grid') {
                setTimeout(() => {
                    const grid = document.getElementById('unit4-steps-grid');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }
}

function u1Answer(type) {
    const r = document.getElementById('u1-result');
    r.classList.remove('hidden');
    r.innerHTML = type === 'J' ? "나노 단위 계획러! 🔍" : "자유로운 영혼! 🌬️";
}
function u2Answer(isO) {
    const r = document.getElementById('u2-result');
    r.classList.remove('hidden');
    r.innerHTML = isO ? "땡! ❌ 태국에선 머리를 만지면 안돼요." : "정답! ⭕ 머리는 신성한 부위랍니다.";
}
function u3Check() {
    const v = document.getElementById('u3-select').value;
    const f = document.getElementById('u3-feedback');
    if (v == 'B') f.innerHTML = "현명한 타협입니다! 👍";
    else if (v == '0') f.innerText = "선택해주세요.";
    else f.innerHTML = "조금 더 좋은 방법이 있을까요? 🤔";
}
function updateBook() {
    document.getElementById('preview-title').innerText = document.getElementById('input-title').value || "나의 여행";
    document.getElementById('preview-author').innerText = "지은이: " + (document.getElementById('input-author').value || "나");
}
function changeColor(c) {
    document.getElementById('book-preview').style.background = c;
}

// --- UNIT 2 & 3 ENHANCED LEARNING PATH LOGIC ---
const unitLearningData = {
    unit2: {
        steps: [
            {
                id: 1, title: '주의 집중', menuLabel: '여행의 첫인상', desc: '낯선 문화 장면을 통해 호기심을 유발하고 탐구 질문을 생성합니다.', activities: [
                    { id: 'A1', title: '감정 한 단어 선택', desc: '영상/사진을 보고 떠오른 감정을 한 단어로 고르고 이유를 적기', time: '5분', group: '개인' },
                    { id: 'A2', title: '문화 요소 빙고', desc: '문화 키워드로 빙고를 만들고 궁금한 칸에 질문 적기', time: '10분', group: '모둠' },
                    { id: 'A5', title: '음식 미스터리 박스', desc: '음식 사진을 보고 재료와 의미를 추리한 뒤 실제와 비교하기', time: '12분', group: '모둠' },
                    { id: 'A7', title: '2진실 1오해', desc: '문화 관련 진실과 오해를 토론하며 편견 깨기', time: '12분', group: '모둠' }
                ]
            },
            {
                id: 2, title: '목표 제시', menuLabel: '오늘의 미션', desc: '단원 목표를 학생의 언어로 재구성하여 학습 계약을 만듭니다.', activities: [
                    { id: 'B1', title: '목표 재구성', desc: '성취기준을 \'나는 ~할 수 있다\' 문장으로 바꾸기', time: '7분', group: '개인' },
                    { id: 'B3', title: '트랙 선택', desc: '음식/언어/음악 중 탐구할 문화 요소 선택하기', time: '5분', group: '개인' }
                ]
            },
            {
                id: 3, title: '선수학습 회상', menuLabel: '나의 문화 렌즈', desc: '자기 생활문화와 이전 경험을 활성화하여 비교의틀을 만듭니다.', activities: [
                    { id: 'C1', title: '나의 문화 스냅샷', desc: '나의 식사/인사 습관 중 2개를 사진/글로 정리하기', time: '12분', group: '개인' },
                    { id: 'C6', title: '편견 체크', desc: '나의 숨은 편견을 익명으로 작성하고 원인 탐색하기', time: '10분', group: '전체' }
                ]
            },
            {
                id: 4, title: '내용 제시', menuLabel: '탐구 자료실', desc: '여행지의 인문·자연환경과 문화 요소를 조사하고 구성합니다.', activities: [
                    { id: 'D1', title: '환경 스캔', desc: '지도를 통해 기후/지형과 문화의 연결고리 찾기', time: '15분', group: '모둠' },
                    { id: 'D4', title: '언어 미니 필드워크', desc: '인사말/감사 표현과 사용 상황 조사하기', time: '15분', group: '모둠' },
                    { id: 'D7', title: '인포포스터 초안', desc: '조사 결과를 한 장의 포스터로 시각화하기', time: '20분', group: '모둠' }
                ]
            },
            {
                id: 5, title: '학습 안내', menuLabel: '문화 해석 도구', desc: '문화 상대주의와 공감적 읽기 전략으로 해석을 돕습니다.', activities: [
                    { id: 'E1', title: '상대주의 카드 적용', desc: '문화 상대주의 관점에서 해석 문장 2개 만들기', time: '10분', group: '모둠' },
                    { id: 'E6', title: '공감 문장틀', desc: '\'~했을 것 같다\' 문장틀로 반응 연습하기', time: '10분', group: '짝' }
                ]
            },
            {
                id: 6, title: '수행 유도', menuLabel: '직접 해보기', desc: '인터뷰, 역할극 등을 통해 학습한 내용을 표현합니다.', activities: [
                    { id: 'F2', title: '인터뷰 역할극', desc: '현지인과 여행자 역할로 문화 이해 인터뷰 수행', time: '25분', group: '모둠' },
                    { id: 'F4', title: '타문화 시점 편지', desc: '현지인의 관점에서 여행자에게 보내는 편지 쓰기', time: '20분', group: '개인' }
                ]
            },
            {
                id: 7, title: '피드백 제공', menuLabel: '성장 피드백', desc: '공감과 근거 관점에서 서로의 수행을 개선합니다.', activities: [
                    { id: 'G1', title: '별 2개 + 소원 1개', desc: '친구 작품의 강점 2개와 개선점 1개 남기기', time: '12분', group: '전체' },
                    { id: 'G4', title: '존중 언어로 바꾸기', desc: '단정적 표현을 맥락 언어로 바꿔쓰기', time: '10분', group: '개인' }
                ]
            },
            {
                id: 8, title: '평가', menuLabel: '성과 확인', desc: '루브릭을 기준으로 결과물을 점검하고 완성합니다.', activities: [
                    { id: 'H1', title: '최종 비교 발표', desc: '나 vs 타문화 비교와 성찰을 담은 3분 발표', time: '25분', group: '모둠' },
                    { id: 'H3', title: '루브릭 자기 점검', desc: '5가지 기준에 따른 자기 평가와 근거 작성', time: '12분', group: '개인' }
                ]
            },
            {
                id: 9, title: '전이와 확장', menuLabel: '여행 이후의 나', desc: '배운 것을 일상과 세계 시민 실천으로 연결합니다.', activities: [
                    { id: 'I1', title: '감정 에세이', desc: '\'너를 통해 알게 된 나\' 성찰 에세이 완성', time: '25분', group: '개인' },
                    { id: 'I8', title: '나의 편견 서약', desc: '미래의 언어 습관과 태도 서약 3가지 작성', time: '12분', group: '개인' }
                ]
            }
        ]
    },
    unit3: {
        steps: [
            {
                id: 1, title: '주의 집중', menuLabel: '우리라는 이름으로', desc: '동행자와의 관계와 갈등에 대한 호기심을 엽니다.', activities: [
                    { id: '3.1.1', title: '동행 유형 투표', desc: '혼자·가족·친구 여행 사진을 보고 선호도 투표하기', time: '5분', group: '전체' },
                    { id: '3.1.2', title: '갈등 한 줄 이야기', desc: '기억에 남는 여행 갈등 상황 한 문장 적기', time: '5분', group: '개인' }
                ]
            },
            {
                id: 2, title: '목표 제시', menuLabel: '공모체 미션', desc: '관계와 협력의 목표를 확인하고 학습 기대치를 설정합니다.', activities: [
                    { id: '3.2.1', title: '미션 카드 읽기', desc: '관계·협력 목표를 자신의 말로 재구성하기', time: '5분', group: '개인' }
                ]
            },
            {
                id: 3, title: '선수학습 회상', menuLabel: '관계의 기억', desc: '과거 여행에서의 인적 네트워크와 갈등 해결 경험을 떠올립니다.', activities: [
                    { id: '3.3.1', title: '관계 맵 그리기', desc: '과거 여행 동행자들과의 관계 구조화하기', time: '10분', group: '개인' }
                ]
            },
            {
                id: 4, title: '내용 제시', menuLabel: '갈등과 협력', desc: '다양한 여행 에세이를 통해 관계의 유형과 특성을 분석합니다.', activities: [
                    { id: '3.4.1', title: '여행 에세이 분석', desc: '동행 갈등을 다룬 텍스트 읽고 원인 분석하기', time: '15분', group: '모둠' },
                    { id: '3.4.2', title: '관계 유형 비교', desc: '혼자 vs 여럿 여행의 장단점 비교표 완성', time: '10분', group: '모둠' }
                ]
            },
            {
                id: 5, title: '학습 안내', menuLabel: '소통의 기술', desc: '감정 소통과 갈등 해결을 위한 전략 프레임을 익힙니다.', activities: [
                    { id: '3.5.1', title: '분석 질문 가이드', desc: '감정·소통 관점의 질문지로 심층 사고하기', time: '10분', group: '개인' }
                ]
            },
            {
                id: 6, title: '수행 유도', menuLabel: '함께 걷기', desc: '조별 여행 코스를 설계하며 협력적 의사결정을 실천합니다.', activities: [
                    { id: '3.6.1', title: '공동 코스 설계', desc: '여행 일정과 역할 분담을 협력하여 계획하기', time: '25분', group: '모둠' },
                    { id: '3.6.2', title: '갈등 조정 역할극', desc: '예상 갈등 상황을 상황극으로 풀어보기', time: '15분', group: '모둠' }
                ]
            },
            {
                id: 7, title: '피드백 제공', menuLabel: '서로의 거울', desc: '동료의 계획을 검토하며 상호 존중 피드백을 나눕니다.', activities: [
                    { id: '3.7.1', title: '라운드 테이블 피드백', desc: '조별 발표 후 강점과 개선점 공유하기', time: '15분', group: '전체' }
                ]
            },
            {
                id: 8, title: '평가', menuLabel: '우리의 성과', desc: '책임과 역할 완수 여부를 성찰하고 가치를 시각화합니다.', activities: [
                    { id: '3.8.1', title: '협력 성찰일지', desc: '자신의 역할 수행과 기여도 자기 평가', time: '10분', group: '개인' },
                    { id: '3.8.2', title: '공동체 가치 포스터', desc: '우리가 발견한 공동 여행의 의미 표현하기', time: '15분', group: '모둠' }
                ]
            },
            {
                id: 9, title: '전이와 확장', menuLabel: '내일의 우리', desc: '학습한 공동체 가치를 일상생활의 관계로 확장합니다.', activities: [
                    { id: '3.9.1', title: '관계 실천 선언', desc: '학교와 가정에서 지킬 소통 약속 만들기', time: '10분', group: '개인' }
                ]
            }
        ]
    }
};

// --- UNIT 1 LESSON DATA ---
const unit1LessonData = {
    1: {
        title: "1차시: 여행에서 만난 나",
        desc: "우리는 왜 여행을 떠날까요? 여행의 첫걸음을 떼어봅니다.",
        steps: [
            { id: "1-1", icon: "🌍", title: "1. 나에게 여행이란?", content: `<h3>브레인스토밍: 여행의 정의</h3><p>친구들이 생각하는 '여행'은 어떤 단어로 표현될까요?</p>`, isWordCloud: true },
            { id: "1-2", icon: "📸", title: "2. 인생 여행지 공유", content: `<h3>인생 여행 사진 공유</h3><div class="file-zone" id="unit1-drop-zone-1-2" ondragover="allowDrop(event)" ondrop="handleDrop(event, '1-2')"><p>📸 드래그하거나 클릭하여 업로드</p><input type="file" id="unit1-photo-input-1-2" style="display:none" onchange="handleFileSelect(event, '1-2')"></div>`, hideBoardInput: true, isPhotoGallery: true },
            { id: "1-3", icon: "📄", title: "3. 활동지 다운로드", content: `<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_1차시_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, '1-3')" download>⬇️ 1차시 활동지 다운로드</a></div>`, hideBoard: true },
            { id: "1-4", icon: "🎒", title: "4. 나의 가방 속 물건", content: `<h3>가방 필수템</h3><p>물건을 적어주세요. 많이 나오면 커집니다!</p>`, isWordCloud: true },
            { id: "1-5", icon: "💬", title: "5. 여행 목적 설문", content: `<h3>여행의 이유</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey('1-5', '휴식')">휴식</button><button class="quiz-btn" onclick="submitUnit1Survey('1-5', '모험')">모험</button><button class="quiz-btn" onclick="submitUnit1Survey('1-5', '음식')">음식</button><button class="quiz-btn" onclick="submitUnit1Survey('1-5', '역사')">역사</button><button class="quiz-btn" onclick="showUnit1OtherInput()">기타</button></div><div id="unit1-other-input-area" style="display:none; margin-top:10px;" class="input-group"><input type="text" id="unit1-survey-other" placeholder="기타..."><button class="back-btn" style="margin:0" onclick="submitUnit1Survey('1-5', '기타')">확인</button></div>`, isGraphicOrganizer: true, hideBoardInput: true },
            { id: "1-6", icon: "🗺️", title: "6. 가보고 싶은 곳", content: `<h3>꿈꾸는 여행지</h3><p>지도를 보며 가고 싶은 곳의 링크를 공유해 주세요.</p><a href="https://maps.google.com" target="_blank" class="download-link" style="background:#4285F4">🌐 지도 열기</a>`, isMapLink: true },
            { id: "1-7", icon: "📤", title: "7. 과제 제출", content: `<h3>과제 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, '1-7')"><p>📂 드래그하여 업로드</p></div>`, isAssignmentList: true, hideBoardInput: true },
            { id: "1-8", icon: "💡", title: "8. 여행 상식 퀴즈", content: `<div id="unit1-quiz-init" class="input-group"><input type="text" id="unit1-student-quiz-name" placeholder="이름 입력"><button class="back-btn" style="margin:0" onclick="startUnit1QuizWithName()">시작</button></div><div id="unit1-quiz-area"></div>`, isQuiz: true, hideBoardInput: true },
            { id: "1-9", icon: "📅", title: "9. 1차시 마무리", content: `<h3>소감 나누기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="소감 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, '1-9')"></div>`, isLiveSync: true, hideBoardInput: true },
            { id: "1-10", icon: "📈", title: "10. 참여 통계", content: `<h3>우리 반 참여 현황</h3>`, isStats: true, hideBoard: true }
        ]
    },
    2: {
        title: "2차시: 여행과 나의 성장",
        desc: "여행은 우리를 어떻게 변화시킬까요? 성장의 시간을 기록합니다.",
        steps: [
            { id: "2-1", icon: "🧩", title: "1. 여행 테마 정하기", content: "<h3>나만의 여행 테마</h3><p>내가 계획하고 싶은 여행 테마는 무엇인가요?</p>", isWordCloud: true },
            {
                id: "2-2", icon: "🚶", title: "2. 걷기 여행의 토론", content: `<h3>느리게 걷기 토론</h3><p>도보 여행의 특징을 장점과 단점으로 구분하여 적어봅시다.</p>
                <div class="input-group" style="background:#fff; border:1px solid #ddd;">
                    <input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;">
                    <select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;">
                        <option value="장점">✅ 장점</option>
                        <option value="단점">❌ 단점</option>
                    </select>
                    <input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요...">
                    <button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons('2-2')">공유</button>
                </div>`, isProsCons: true, hideBoardInput: true
            },
            { id: "2-3", icon: "🚌", title: "3. 대중교통 이용", content: "<h3>현지 교통수단</h3><p>여행지에서 이용하고 싶은 교통수단을 적어주세요. 연결망으로 시각화됩니다.</p>", isNodeGraph: true },
            { id: "2-4", icon: "🍽️", title: "4. 현지 음식 문화", content: "<h3>맛의 모험</h3><p>가장 먹어보고 싶은 이색 음식은? 많이 나온 키워드가 크게 보입니다.</p>", isBubbleChart: true },
            { id: "2-5", icon: "📄", title: "5. 활동지 다운로드", content: `<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, '2-5')" download>⬇️ 2차시 활동지 다운로드</a></div>`, hideBoard: true },
            {
                id: "2-6", icon: "🎨", title: "6. 여행 일러스트", content: `<h3>그림으로 나누는 여행</h3><div class="canvas-wrapper"><canvas id="unit1-whiteboard" width="600" height="400"></canvas><div class="canvas-ctrl"><input type="color" id="unit1-get-pen-color" value="#4A90E2"><button class="back-btn" style="margin:0" onclick="clearUnit1Canvas()">지우기</button><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="postUnit1Canvas('2-6')">그림 공유</button></div></div>
                <div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, '2-6')"><p>🎨 그림 파일 업로드 (드래그)</p></div>`, isPhotoGallery: true, hideBoardInput: true
            },
            { id: "2-7", icon: "🎵", title: "7. 여행 플레이리스트", content: `<h3>유튜브 음악 공유</h3><p>추천하고 싶은 여행 음악의 유튜브 링크를 공유해 주세요.</p><a href="https://www.youtube.com" target="_blank" class="youtube-card">🎬 유튜브 바로가기</a>`, isPlaylist: true },
            { id: "2-8", icon: "📤", title: "8. 활동 결과 제출", content: `<h3>자료 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, '2-8')"><p>📁 파일을 드래그하여 제출</p></div>`, isAssignmentList: true, hideBoardInput: true },
            { id: "2-9", icon: "✨", title: "9. 성장의 한마디", content: `<h3>나의 다짐</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="나의 다짐 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, '2-9')"></div>`, isLiveSync: true, hideBoardInput: true },
            { id: "2-10", icon: "📈", title: "10. 참여 통계", content: `<h3>우리 반 참여 현황</h3>`, isStats: true, hideBoard: true }
        ]
    },
    3: {
        title: "3차시: 여행의 의미 발견",
        desc: "수업을 마무리하며 나만의 여행 의미를 정의합니다.",
        steps: [
            { id: "3-1", icon: "📕", title: "1. 발췌독 활동지", content: `<div class="content-block"><h3>최종 활동지</h3><a href="1단원/여행_발췌독_연계_활동지_3차시.pdf" class="download-link" onclick="handleTrackedDownload(event, '3-1')" download>⬇️ 3차시 활동지 다운로드</a></div>`, hideBoard: true },
            { id: "3-2", icon: "✍️", title: "2. 여행 에세이 쓰기", content: `<h3>나의 여행 이야기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="짧은 에세이 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, '3-2')"></div>`, isLiveSync: true, hideBoardInput: true },
            { id: "3-3", icon: "🤝", title: "3. 모둠 여행 계획", content: "<h3>우리 팀의 계획</h3><p>함께 가고 싶은 도시들을 적어보세요. 연결망으로 보여집니다.</p>", isNodeGraph: true },
            { id: "3-4", icon: "🏛️", title: "4. 보호해야 할 유산", content: "<h3>소중한 문화유산</h3><p>우리가 지켜야 할 장소는 어디일까요?</p>", isBubbleChart: true },
            {
                id: "3-5", icon: "🌿", title: "5. 에코 투어리즘", content: `<h3>환경을 위한 선택</h3><div class="input-group" style="background:#fff; border:1px solid #ddd;">
                    <input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;">
                    <select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;">
                        <option value="장점">✅ 찬성/장점</option>
                        <option value="단점">❌ 반대/단점</option>
                    </select>
                    <input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요...">
                    <button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons('3-5')">공유</button>
                </div>`, isProsCons: true, hideBoardInput: true
            },
            { id: "3-6", icon: "🔭", title: "6. 미래의 여행", content: "<h3>우주 여행 시대</h3><p>미래 여행하면 떠오르는 단어를 적어주세요.</p>", isWordCloud: true },
            { id: "3-7", icon: "📊", title: "7. 수업 만족도", content: `<h3>오늘 수업은?</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey('3-7', '최고예요')">최고예요! 👍</button><button class="quiz-btn" onclick="submitUnit1Survey('3-7', '좋아요')">좋아요 😊</button><button class="quiz-btn" onclick="submitUnit1Survey('3-7', '보통예요')">보통예요 😐</button><button class="quiz-btn" onclick="submitUnit1Survey('3-7', '아쉬워요')">아쉬워요 😢</button></div>`, isGraphicOrganizer: true, hideBoardInput: true },
            { id: "3-8", icon: "📤", title: "8. 최종 포트폴리오", content: `<h3>최종 결과물 제출</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, '3-8')"><p>📁 최종 파일을 드래그하여 제출</p></div>`, isAssignmentList: true, hideBoardInput: true },
            { id: "3-9", icon: "⭐", title: "9. 최종 마무리", content: `<h3>수업을 마치며</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="수업 총평을 적어주세요..." onkeypress="handleUnit1EnterSync(event, '3-9')"></div>`, isLiveSync: true, hideBoardInput: true },
            { id: "3-10", icon: "📈", title: "10. 참여 통계", content: `<h3>우리 반 참여 현황</h3>`, isStats: true, hideBoard: true }
        ]
    }
};

let currentUnit1Lesson = 1;
let currentUnit2Lesson = 1;
let currentUnit3Lesson = 1;
let currentUnit4Lesson = 1;

function renderUnit1Lessons() {
    const lessonsList = document.getElementById('unit1-lessons-list');
    if (!lessonsList) return;

    lessonsList.innerHTML = '';
    const lessons = [
        { id: 1, title: '1차시: 여행의 시작' },
        { id: 2, title: '2차시: 여행과 나' },
        { id: 3, title: '3차시: 여행의 의미' }
    ];

    lessons.forEach(lesson => {
        const i = lesson.id;
        const li = document.createElement('li');
        li.className = `step-item ${i === currentUnit1Lesson ? 'active' : ''}`;
        li.innerHTML = `
            <div class='step-circle'>${i}</div>
            <div class='step-label'>${lesson.title}</div>
        `;
        li.onclick = () => {
            if (currentUnit1Lesson === i) return;
            currentUnit1Lesson = i;
            renderUnit1Lessons();
            renderUnit1Steps();
        };
        lessonsList.appendChild(li);
    });
}

function renderUnit1Steps() {
    const lesson = unit1LessonData[currentUnit1Lesson];
    if (!lesson) return;

    const titleEl = document.getElementById('unit1-lesson-title');
    const descEl = document.getElementById('unit1-lesson-desc');
    const gridEl = document.getElementById('unit1-steps-grid');

    if (titleEl) titleEl.innerText = lesson.title;
    if (descEl) descEl.innerText = lesson.desc;

    if (gridEl) {
        gridEl.innerHTML = '';
        lesson.steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'step-card card'; // step-card style from 1단원
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.cursor = 'pointer';
            card.onclick = () => showUnit1Activity(step.id);

            card.innerHTML = `
                <span class='step-icon' style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">${step.icon}</span>
                <span class='step-title' style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${step.title}</span>
            `;
            gridEl.appendChild(card);

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }
}

function showUnit1Activity(stepId) {
    const gridEl = document.getElementById('unit1-steps-grid');
    const titleEl = document.getElementById('unit1-lesson-title');
    const descEl = document.getElementById('unit1-lesson-desc');
    const viewEl = document.getElementById('unit1-activity-view');
    const contentEl = document.getElementById('unit1-activity-content');

    // Find the lesson and step
    const lesson = unit1LessonData[currentUnit1Lesson];
    if (!lesson) {
        console.error('Lesson not found for ID:', currentUnit1Lesson);
        return;
    }
    const step = lesson.steps.find(s => s.id === stepId);
    if (!step) {
        console.error('Step not found for ID:', stepId);
        return;
    }

    // Hide the grid and header
    if (gridEl) gridEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    if (descEl) descEl.style.display = 'none';
    if (viewEl) viewEl.style.display = 'block';

    if (step && contentEl) {
        let boardArea = "";
        if (!step.hideBoard) {
            let inputHtml = step.hideBoardInput ? "" : `
                <div class="input-group">
                    <input type="text" id="unit1-student-name-input" placeholder="성명" style="width:100px; flex:none;">
                    <input type="text" id="unit1-student-text-input" placeholder="함께 나눌 내용 입력...">
                    <button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1Response('${step.id}')">공유</button>
                </div>`;
            boardArea = `<div class="response-board"><h3>👥 공유 공간</h3>${inputHtml}<div id="unit1-display-area"></div></div>`;
        }

        // Use content from the step data
        contentEl.innerHTML = `
            <h2 style="color:var(--primary); margin-bottom:2rem; font-family: 'Gamja Flower', cursive;">${step.icon} ${step.title}</h2>
            <div class="activity-body">
                ${step.content || '<p>활동 내용이 없습니다.</p>'}
            </div>
            ${boardArea}
        `;

        // Initialize specific activity types
        if (step.id === '2-6') initUnit1Whiteboard();
        updateUnit1Board(step.id);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


function hideUnit1Activity() {
    const gridEl = document.getElementById('unit1-steps-grid');
    const titleEl = document.getElementById('unit1-lesson-title');
    const descEl = document.getElementById('unit1-lesson-desc');
    const viewEl = document.getElementById('unit1-activity-view');

    if (gridEl) gridEl.style.display = 'grid';
    if (titleEl) titleEl.style.display = 'block';
    if (descEl) descEl.style.display = 'block';
    if (viewEl) viewEl.style.display = 'none';
}

// --- GENERIC UNIT RENDERING (UNIT 2 & 3) ---
const unitDataMap = {
    'unit2': {
        1: {
            title: '1단계. 주의 집중',
            desc: '영상을 통해 다른 문화에 대한 감정을 공유하고 편견을 점검합니다.',
            steps: [
                { id: 'A1', icon: '🎬', title: '감정 한 단어 선택', content: '<div class="activity-info"><p>영상이나 사진을 보고 떠오른 감정을 한 단어로 고르고 그 이유를 적어봅시다.</p><ul class="act-instructions"><li>1. 여행지 영상을 집중해서 시청하세요.</li><li>2. 느껴지는 직관적인 감정을 하나 고르세요. (설렘, 당황, 평화, 등)</li><li>3. 왜 그 감정을 느꼈는지 기록해주세요.</li></ul></div><div class="input-area"><textarea placeholder="선택한 감정:\n이유:"></textarea></div>' },
                { id: 'A2', icon: '🎲', title: '문화 요소 빙고', content: '<div class="activity-info"><p>음식, 언어, 음악 등 문화 키워드로 빙고를 만들고 궁금한 점을 공유합니다.</p><ul class="act-instructions"><li>1. 3x3 빙고판을 상상하며 칸을 채우세요.</li><li>2. 여행하면 떠오르는 문화 요소를 적으세요.</li><li>3. 가장 궁금한 요소 하나에 질문을 적어주세요.</li></ul></div><div class="input-area"><textarea placeholder="빙고 칸 내용:\n궁금한 점:"></textarea></div>' },
                { id: 'A8', icon: '🎤', title: '30초 마이크로 토론', content: '<div class="activity-info"><p>인사말 vs 금기 사항 중 무엇이 더 중요할까요?</p><ul class="act-instructions"><li>1. 자신의 입장을 정하고 30초 동안 설명하세요.</li><li>2. 핵심 근거를 정리하여 적어주세요.</li></ul></div><div class="input-area"><textarea placeholder="나의 입장:\n핵심 근거:"></textarea></div>' }
            ]
        },
        2: {
            title: '2단계. 목표 제시',
            desc: '이번 단원의 성공 기준과 탐구할 미션을 선택합니다.',
            steps: [
                { id: 'B2', icon: '🎯', title: '성공 기준 체크리스트', content: '<div class="activity-info"><p>조사, 비교, 공감, 존중, 표현 키워드로 나만의 성공 기준을 만듭니다.</p><ul class="act-instructions"><li>1. 각 키워드별로 "나는 ~할 수 있다" 문장을 만드세요.</li><li>2. 예: [조사] 나는 현지 문화의 숨은 의미를 2가지 이상 찾을 수 있다.</li></ul></div><div class="input-area"><textarea placeholder="나의 성공 기준들:"></textarea></div>' },
                { id: 'B3', icon: '🚀', title: '미션 선택 (트랙 정하기)', content: '<div class="activity-info"><p>관심 있는 문화 트랙을 선택하고 이유를 적습니다.</p><ul class="act-instructions"><li>1. 음식, 언어, 음악/예술, 생활습관 중 하나를 고르세요.</li><li>2. 선택한 이유를 간단히 적어주세요.</li></ul></div><div class="input-area"><select style="width:100%; padding:10px; border-radius:10px; margin-bottom:10px;"><option>음식 트랙</option><option>언어 트랙</option><option>음악/예술 트랙</option><option>생활습관 트랙</option></select><textarea placeholder="선택 이유:"></textarea></div>' }
            ]
        },
        3: {
            title: '3단계. 선수학습 회상',
            desc: '우리 문화의 특징과 나의 편견을 되돌아봅니다.',
            steps: [
                { id: 'C1', icon: '🏠', title: '나의 생활문화 스냅샷', content: '<div class="activity-info"><p>나의 습관을 되돌아보며 한국 문화의 특징을 찾아봅니다.</p><ul class="act-instructions"><li>1. 식사 예절, 인사, 대화 중 하나를 고르세요.</li><li>2. 나의 행동을 묘사하고 문화적 특징을 적으세요.</li></ul></div><div class="input-area"><textarea placeholder="상황:\n묘사:\n특징:"></textarea></div>' },
                { id: 'C6', icon: '🔍', title: '편견 체크 (Bias Check)', content: '<div class="activity-info"><p>자신도 모르게 가진 문화적 편견을 점검합니다.</p><ul class="act-instructions"><li>1. "나는 여행지에서 ___ 행동을 보면 이상하다고 느낀다." 문장을 완성하세요.</li><li>2. 왜 그렇게 느끼는지 생각해보세요.</li></ul></div><div class="input-area"><textarea placeholder="이상하게 느끼는 행동:\n이유:"></textarea></div>' }
            ]
        },
        4: {
            title: '4단계. 내용 제시',
            desc: '본격적으로 여행지의 환경과 문화를 탐구합니다.',
            steps: [
                { id: 'D1', icon: '🗺️', title: '인문·자연환경 스캔', content: '<div class="activity-info"><p>환경이 문화에 미친 영향을 추론합니다.</p><ul class="act-instructions"><li>1. 기후, 지형 등 단서를 3가지 찾으세요.</li><li>2. 의식주 문화에 미친 영향을 적으세요.</li></ul></div><div class="input-area"><textarea placeholder="환경 단서:\n문화적 영향 추론:"></textarea></div>' },
                { id: 'D2', icon: '🔑', title: '문화 요소 상징 해독', content: '<div class="activity-info"><p>문화 이면의 상징과 역사적 맥락을 파헤칩니다.</p><ul class="act-instructions"><li>1. 구체적인 문화 사례를 하나 고르세요.</li><li>2. 상징적 의미와 맥락을 정리하세요.</li></ul></div><div class="input-area"><textarea placeholder="사례:\n상징적 의미:"></textarea></div>' },
                { id: 'D7', icon: '📊', title: '인포포스터 초안 구성', content: '<div class="activity-info"><p>조사한 내용을 시각적으로 배치해봅니다.</p><ul class="act-instructions"><li>1. 핵심 사실 3가지를 뽑으세요.</li><li>2. 시각 자료 배치를 스케치하고 업로드하세요.</li></ul></div><div class="input-area"><input type="file" style="margin-bottom:10px;"><textarea placeholder="핵심 내용 3가지:"></textarea></div>' }
            ]
        },
        5: {
            title: '5단계. 학습 안내',
            desc: '문화 상대주의 관점에서 오해를 예방하는 법을 배웁니다.',
            steps: [
                { id: 'E1', icon: '🃏', title: '문화 상대주의 카드 적용', content: '<div class="activity-info"><p>"그들의 시선"에서 문화를 해석하는 연습을 합니다.</p><ul class="act-instructions"><li>1. 상대주의 관점을 하나 적용하세요.</li><li>2. 해석 문장을 만드세요.</li></ul></div><div class="input-area"><textarea placeholder="적용 관점:\n해석 문장:"></textarea></div>' },
                { id: 'E7', icon: '🤝', title: '갈등 예측과 예방', content: '<div class="activity-info"><p>문화 차이로 인한 실수를 예측하고 수습 멘트를 준비합니다.</p><ul class="act-instructions"><li>1. 예상되는 실수 2가지를 적으세요.</li><li>2. 상황 수습을 위한 사과/설명 멘트를 만드세요.</li></ul></div><div class="input-area"><textarea placeholder="예상 실수:\n수습 멘트:"></textarea></div>' }
            ]
        },
        6: {
            title: '6단계. 수행 유도',
            desc: '학습한 내용을 바탕으로 시뮬레이션하고 표현합니다.',
            steps: [
                { id: 'F2', icon: '🎭', title: '인터뷰 역할극', content: '<div class="activity-info"><p>현지인과 여행자가 되어 인터뷰를 진행합니다.</p><ul class="act-instructions"><li>1. 질문과 답변을 구성하세요.</li><li>2. 주요 문답 내용을 요약하세요.</li></ul></div><div class="input-area"><textarea placeholder="질문:\n답변 요약:"></textarea></div>' },
                { id: 'F4', icon: '✉️', title: '타문화 인물 시점 편지', content: '<div class="activity-info"><p>현지인이 되어 여행자에게 편지를 씁니다.</p><ul class="act-instructions"><li>1. 문화를 소개하고 환영하는 글을 쓰세요.</li><li>2. 오해에 대해 진심을 설명해주세요.</li></ul></div><div class="input-area"><textarea placeholder="편지 내용..." style="height:200px;"></textarea></div>' },
                { id: 'F6', icon: '🆚', title: '나 vs 타문화 비교 발표', content: '<div class="activity-info"><p>공통점과 차이점을 구조화하여 발표합니다.</p><ul class="act-instructions"><li>1. 공통점 2가지, 차이점 2가지를 정리하세요.</li><li>2. 이유를 포함해 발표 내용을 적으세요.</li></ul></div><div class="input-area"><textarea placeholder="공통점:\n차이점:\n이유:"></textarea></div>' }
            ]
        },
        7: {
            title: '7단계. 피드백 제공',
            desc: '동료들과 학업 성취를 공유하고 응원합니다.',
            steps: [
                { id: 'G1', icon: '⭐', title: 'Two Stars & A Wish', content: '<div class="activity-info"><p>동료의 결과물에 피드백을 남깁니다.</p><ul class="act-instructions"><li>1. 좋았던 점 2가지 (Stars)를 찾으세요.</li><li>2. 제안하고 싶은 점 1가지 (Wish)를 적으세요.</li></ul></div><div class="input-area"><textarea placeholder="Star 1:\nStar 2:\nWish:"></textarea></div>' },
                { id: 'G3', icon: '❤️', title: '공감 지수 피드백', content: '<div class="activity-info"><p>친구의 글에서 공감 능력을 찾아 피드백합니다.</p><ul class="act-instructions"><li>1. 친구의 글을 읽고 감동적인 문장을 찾으세요.</li><li>2. 공감 지수를 선택하세요.</li></ul></div><div class="input-area"><div style="font-size:1.5rem; margin-bottom:10px;">❤️❤️❤️❤️❤️</div><textarea placeholder="피드백 내용:"></textarea></div>' }
            ]
        },
        8: {
            title: '8단계. 평가',
            desc: '최종 결과물을 확인하고 성취 정도를 평가합니다.',
            steps: [
                { id: 'H2', icon: '📁', title: '포트폴리오 제출', content: '<div class="activity-info"><p>활동 결과물들을 모아 최종 제출합니다.</p><ul class="act-instructions"><li>1. 조사지, 포스터, 편지를 모으세요.</li><li>2. 지정된 파일명으로 업로드하세요.</li></ul></div><div class="input-area"><input type="file"><p style="font-size:0.8rem; color:red;">*학번_이름_여행과우리_포트폴리오</p></div>' },
                { id: 'H1', icon: '📢', title: '최종 비교 발표', content: '<div class="activity-info"><p>심도 있는 문화 비교 내용을 발표합니다.</p><ul class="act-instructions"><li>1. 모둠별 3분 발표입니다.</li><li>2. 새롭게 깨달은 점을 강조하세요.</li></ul></div><div class="input-area"><p>발표 준비 상태를 체크하세요.</p></div>' }
            ]
        },
        9: {
            title: '9단계. 전이와 확장',
            desc: '학습한 내용을 일상과 사회로 넓혀나갑니다.',
            steps: [
                { id: 'I1', icon: '✍️', title: '성찰 에세이', content: '<div class="activity-info"><p>수업 후 달라진 나의 생각을 기록합니다.</p><ul class="act-instructions"><li>1. 수업 전후의 변화를 적으세요.</li><li>2. 세계 시민으로서의 다짐을 적으세요.</li></ul></div><div class="input-area"><textarea placeholder="생각의 변화:\n나의 다짐:" style="height:150px;"></textarea></div>' },
                { id: 'I3', icon: '🌍', title: '문화 다양성 캠페인 기획', content: '<div class="activity-info"><p>학교 내 인식 개선을 위한 캠페인을 계획합니다.</p><ul class="act-instructions"><li>1. 슬로건과 포스터 아이디어를 내보세요.</li><li>2. 실행 계획을 세우세요.</li></ul></div><div class="input-area"><textarea placeholder="캠페인 명:\n슬로건:\n실행 계획:"></textarea></div>' }
            ]
        }
    },
    'unit3': {
        1: {
            title: '1단계. 주의 집중',
            desc: '함께 여행할 때의 설렘과 예상되는 갈등을 공유합니다.',
            steps: [
                { id: 'Act1_1', icon: '🗳️', title: '여행 동행 유형 투표', content: '<div class="activity-info"><p>어떤 동행과 함께하는 여행을 선호하나요?</p></div><div class="input-area"><select style="width:100%; padding:10px; border-radius:10px;"><option>나홀로 여행</option><option>친구와 여행</option><option>가족 여행</option><option>패키지 단체 여행</option></select><textarea placeholder="이유:"></textarea></div>' },
                { id: 'Act1_2', icon: '🗨️', title: '갈등 한 줄 이야기', content: '<div class="activity-info"><p>여행 중 겪었던 갈등 사례를 짧게 공유합니다.</p></div><div class="input-area"><textarea placeholder="갈등 상황:\n그때의 기분:"></textarea></div>' }
            ]
        },
        2: {
            title: '2단계. 목표 제시',
            desc: '성공적인 공동체 여행을 위한 목표를 설정합니다.',
            steps: [
                { id: 'Act2_1', icon: '🔖', title: '오늘의 미션 카드', content: '<div class="activity-info"><p>미션: "우리는 다르지만, 함께 여행할 수 있다."</p></div><div class="input-area"><textarea placeholder="나에게 필요한 태도 다짐:"></textarea></div>' },
                { id: 'Act2_2', icon: '📋', title: '성취기준 미리보기', content: '<div class="activity-info"><p>갈등 조정과 협력의 문장을 만들어봅니다.</p></div><div class="input-area"><textarea placeholder="예: 나는 의견이 다를 때 갈등을 조정할 수 있다."></textarea></div>' }
            ]
        },
        3: {
            title: '3단계. 선수학습 회상',
            desc: '나의 인간관계와 과거의 갈등 해결 경험을 돌아봅니다.',
            steps: [
                { id: 'Act3_1', icon: '🕸️', title: '관계 맵 그리기', content: '<div class="activity-info"><p>과거 여행 경험을 사람 중심으로 정리합니다.</p></div><div class="input-area"><textarea placeholder="함께 간 사람:\n관계의 변화:"></textarea></div>' },
                { id: 'Act3_2', icon: '🫂', title: '갈등 해결 경험 나누기', content: '<div class="activity-info"><p>과거에 갈등을 잘 해결했거나 아쉬웠던 경험을 공유합니다.</p></div><div class="input-area"><textarea placeholder="해결 경험:\n잘한 점/아쉬운 점:"></textarea></div>' }
            ]
        },
        4: {
            title: '4단계. 내용 제시',
            desc: '에세이와 사례를 통해 갈등의 원인을 분석합니다.',
            steps: [
                { id: 'Act4_1', icon: '📖', title: '여행 에세이 읽기', content: '<div class="activity-info"><p>에세이 속 인물 간의 심리 변화와 갈등을 파악합니다.</p></div><div class="input-area"><textarea placeholder="갈등 원인:\n해결 과정:\n깨달음:"></textarea></div>' },
                { id: 'Act4_2', icon: '📊', title: '관계 유형 비교 분석', content: '<div class="activity-info"><p>동행 유형별 장단점을 표로 정리해봅니다.</p></div><div class="input-area"><textarea placeholder="혼자 vs 친구 vs 가족 장단점 정리:"></textarea></div>' }
            ]
        },
        5: {
            title: '5단계. 학습 안내',
            desc: '건강한 소통을 위한 갈등 해결 모델을 학습합니다.',
            steps: [
                { id: 'Act5_1', icon: '❓', title: '관계 분석 질문 가이드', content: '<div class="activity-info"><p>자신과 상대의 마음을 들여다보는 질문을 던집니다.</p></div><div class="input-area"><textarea placeholder="나는 동행에게 무엇을 기대하는가?\n상대의 불편함은 무엇일까?"></textarea></div>' },
                { id: 'Act5_2', icon: '🛠️', title: '갈등 해결 4단계 모델', content: '<div class="activity-info"><p>멈춤, 듣기, 표현, 조정 4단계를 연습합니다.</p></div><div class="input-area"><textarea placeholder="I-Message 연습 내용:"></textarea></div>' }
            ]
        },
        6: {
            title: '6단계. 수행 유도',
            desc: '모둠원들과 협력하여 실제 여행 코스를 설계합니다.',
            steps: [
                { id: 'Act6_1', icon: '📅', title: '조별 여행 코스 공동 설계', content: '<div class="activity-info"><p>모두의 취향을 반영한 1박 2일 일정을 완성합니다.</p></div><div class="input-area"><textarea placeholder="모둠 일정 및 역할 분담:"></textarea></div>' },
                { id: 'Act6_2', icon: '🎬', title: '갈등 상황 역할극', content: '<div class="activity-info"><p>의견 충돌 상황을 가정하고 역할극으로 해결합니다.</p></div><div class="input-area"><textarea placeholder="갈등 해결책 요약:"></textarea></div>' }
            ]
        },
        7: {
            title: '7단계. 피드백 제공',
            desc: '다른 모둠의 계획을 검토하고 현실적인 조언을 나눕니다.',
            steps: [
                { id: 'Act7_1', icon: '📝', title: '동료 피드백 라운드', content: '<div class="activity-info"><p>다른 모둠의 계획에 Star와 Wish를 남깁니다.</p></div><div class="input-area"><textarea placeholder="피드백 내용:"></textarea></div>' },
                { id: 'Act7_2', icon: '🏫', title: '교사 코멘트 확인', content: '<div class="activity-info"><p>선생님의 피드백을 읽고 계획을 수정/보완합니다.</p></div><div class="input-area"><p>피드백을 확인하고 보완 계획을 세우세요.</p></div>' }
            ]
        },
        8: {
            title: '8단계. 평가',
            desc: '협력 과정을 성찰하고 최종 가치를 발표합니다.',
            steps: [
                { id: 'Act8_1', icon: '📔', title: '협력 과정 성찰 일지', content: '<div class="activity-info"><p>프로젝트 진행 중 나의 태도를 스스로 평가합니다.</p></div><div class="input-area"><div style="font-size:1.5rem; margin-bottom:10px;">⭐️⭐️⭐️⭐️⭐️</div><textarea placeholder="소통 방식 성찰:"></textarea></div>' },
                { id: 'Act8_2', icon: '🖼️', title: '공동체 가치 포스터 발표', content: '<div class="activity-info"><p>"함께라서 가능한 것들" 포스터를 발표합니다.</p></div><div class="input-area"><input type="file"><textarea placeholder="발표 핵심 메시지:"></textarea></div>' }
            ]
        },
        9: {
            title: '9단계. 전이와 확장',
            desc: '배운 기술을 일상생활의 관계에 적용할 다짐을 합니다.',
            steps: [
                { id: 'Act9_1', icon: '🔊', title: '일상 속 관계 적용 선언문', content: '<div class="activity-info"><p>일상에서 소통 기술을 누구에게 써보고 싶은가요?</p></div><div class="input-area"><textarea placeholder="적용 대상:\n실천 약속:"></textarea></div>' },
                { id: 'Act9_2', icon: '🤝', title: '다음 여행 약속 설계', content: '<div class="activity-info"><p>여행 규칙 3가지를 미리 정해봅니다.</p></div><div class="input-area"><textarea placeholder="규칙 1:\n규칙 2:\n규칙 3:"></textarea></div>' }
            ]
        }
    },
    'unit4': {
        1: {
            title: '나만의 여행책 만들기',
            desc: '여행의 기억을 기록으로 남겨 책으로 완성합니다.',
            steps: [
                { id: 'U4_1', icon: '🎬', title: '1단계. 주의 집중', content: '<div class="activity-info"><p>여행 유튜버의 브이로그나 독립 출판 여행 서적을 보며 흥미를 느낍니다.</p><p><strong>"여러분의 소중한 기억이 휴대폰 갤러리 속에서 잊혀지고 있지는 않나요?"</strong></p></div><div class="input-area"><textarea placeholder="나의 여행 기록 상태는? (예: 사진만 가득하다)"></textarea></div>' },
                { id: 'U4_2', icon: '🎯', title: '2단계. 목표 제시', content: '<div class="activity-info"><p>오늘의 목표: 자신만의 여행 테마를 설정하고, 레이아웃 원리를 적용하여 4페이지 분량의 여행책 초안을 완성한다.</p></div><div class="input-area"><textarea placeholder="나의 여행책 테마(제목) 정하기:"></textarea></div>' },
                { id: 'U4_3', icon: '📸', title: '3단계. 선수 학습 회상', content: '<div class="activity-info"><p>지난 여행 사진을 확인하고 글쓰기 기법을 떠올립니다.</p></div><div class="input-area"><textarea placeholder="사용하고 싶은 여행 사진 3장은 무엇인가요?"></textarea></div>' },
                { id: 'U4_4', icon: '🎨', title: '4단계. 자극 제시', content: '<div class="activity-info"><p>여행책의 핵심 요소(표지, 목차, 본문, 에필로그)와 레이아웃 원리를 배웁니다.</p><ul class="act-instructions"><li>1. 폰트 선택: 가독성 좋은 폰트</li><li>2. 그리드: 사진과 텍스트의 조화</li></ul></div>' },
                { id: 'U4_5', icon: '🧭', title: '5단계. 학습 안내', content: '<div class="activity-info"><p>스토리텔링 구성을 선택합니다.</p></div><div class="input-area"><select style="width:100%; padding:10px; margin-bottom:10px;"><option>시간 순서 (Timeline)</option><option>장소별 (Spot)</option><option>테마별 (Theme)</option></select><textarea placeholder="구체적인 구성 계획:"></textarea></div>' },
                { id: 'U4_6', icon: '✍️', title: '6단계. 수행 유도', content: '<div class="activity-info"><p>종이나 디지털 도구를 이용해 첫 페이지 레이아웃을 디자인합니다.</p></div><div class="input-area"><input type="file"><p style="font-size:0.8rem;">*스케치 사진이나 작업 파일 업로드</p></div>' },
                { id: 'U4_7', icon: '🗣️', title: '7단계. 피드백 제공', content: '<div class="activity-info"><p>서로의 레이아웃에 대해 조언을 주고 받습니다.</p><p>"사진이 너무 커서 글자가 안 보여요", "여백을 활용해보세요"</p></div><div class="input-area"><textarea placeholder="친구에게 받은 피드백:"></textarea></div>' },
                { id: 'U4_8', icon: '✅', title: '8단계. 수행 평가', content: '<div class="activity-info"><p>완성된 초안을 점검합니다.</p><ul class="act-instructions"><li>테마가 선명한가?</li><li>가독성이 좋은가?</li></ul></div><div class="input-area"><div style="font-size:1.5rem;">⭐️⭐️⭐️⭐️⭐️</div><textarea placeholder="자기 평가 코멘트:"></textarea></div>' },
                { id: 'U4_9', icon: '🚀', title: '9단계. 파지와 전이', content: '<div class="activity-info"><p>인쇄 주문 방법을 익히고 다른 주제로의 확장을 고민합니다.</p></div><div class="input-area"><textarea placeholder="다음에는 어떤 책을 만들고 싶나요? (요리책, 성장일기 등)"></textarea></div>' }
            ]
        }
    }
};

function renderUnitLessons(unitId) {
    const listEl = document.getElementById(`${unitId}-lessons-list`);
    if (!listEl) return;
    listEl.innerHTML = '';



    let currentLesson;
    if (unitId === 'unit2') currentLesson = currentUnit2Lesson;
    else if (unitId === 'unit3') currentLesson = currentUnit3Lesson;
    else currentLesson = currentUnit4Lesson;

    const data = unitDataMap[unitId];

    Object.keys(data).forEach(i => {
        const li = document.createElement('li');
        li.className = `step-item ${parseInt(i) === currentLesson ? 'active' : ''}`;
        li.innerHTML = `
            <div class='step-circle'>${i}</div>
            <div class='step-label'>${data[i].title}</div>
        `;
        li.onclick = () => {
            if (unitId === 'unit2') currentUnit2Lesson = parseInt(i);
            else if (unitId === 'unit3') currentUnit3Lesson = parseInt(i);
            else currentUnit4Lesson = parseInt(i);
            renderUnitLessons(unitId);
            renderUnitSteps(unitId);
        };
        listEl.appendChild(li);
    });
}

function renderUnitSteps(unitId) {
    let lessonIdx;
    if (unitId === 'unit2') lessonIdx = currentUnit2Lesson;
    else if (unitId === 'unit3') lessonIdx = currentUnit3Lesson;
    else lessonIdx = currentUnit4Lesson;

    const lesson = unitDataMap[unitId][lessonIdx];
    if (!lesson) return;

    const titleEl = document.getElementById(`${unitId}-lesson-title`);
    const descEl = document.getElementById(`${unitId}-lesson-desc`);
    const gridEl = document.getElementById(`${unitId}-steps-grid`);

    if (titleEl) {
        titleEl.style.display = 'block';
        titleEl.innerText = lesson.title;
    }
    if (descEl) {
        descEl.style.display = 'block';
        descEl.innerText = lesson.desc;
    }

    if (gridEl) {
        gridEl.style.display = 'grid';
        gridEl.innerHTML = '';
        lesson.steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'step-card card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.cursor = 'pointer';
            card.onclick = () => showUnitActivity(unitId, step.id);

            card.innerHTML = `
                <span class='step-icon' style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">${step.icon}</span>
                <span class='step-title' style="font-size: 1.25rem; font-weight: 700; color: inherit;">${step.title}</span>
            `;
            gridEl.appendChild(card);

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }

    // Hide activity view if showing
    const viewEl = document.getElementById(`${unitId}-activity-view`);
    if (viewEl) viewEl.style.display = 'none';
}

// Enhanced Activity Display for Unit 2 & 3
function showUnitActivity(unitId, stepId) {
    let lessonIdx;
    if (unitId === 'unit2') lessonIdx = currentUnit2Lesson;
    else if (unitId === 'unit3') lessonIdx = currentUnit3Lesson;
    else lessonIdx = currentUnit4Lesson;

    const lesson = unitDataMap[unitId][lessonIdx];
    const step = lesson.steps.find(s => s.id === stepId);
    if (!step) return;

    const gridEl = document.getElementById(`${unitId}-steps-grid`);
    const titleEl = document.getElementById(`${unitId}-lesson-title`);
    const descEl = document.getElementById(`${unitId}-lesson-desc`);
    const viewEl = document.getElementById(`${unitId}-activity-view`);
    const contentEl = document.getElementById(`${unitId}-activity-content`);

    if (gridEl) gridEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    if (descEl) descEl.style.display = 'none';
    if (viewEl) viewEl.style.display = 'block';

    viewEl.classList.remove('hidden');

    if (contentEl) {
        // Render basic content
        contentEl.innerHTML = `
            <div class="activity-header" style="margin-bottom: 2rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 1rem;">
                <h2 style="color:var(--text-dark); font-family: 'Gamja Flower', cursive; font-size: 2rem;">
                    <span class="act-icon">${step.icon}</span> ${step.title}
                </h2>
            </div>
            <div class="activity-body" style="font-size: 1.1rem; line-height: 1.6;">
                ${step.content || '<p>상세 활동 준비 중입니다.</p>'}
                
                <div class="feedback-msg hidden" id="feedback-${stepId}" style="margin-top:10px; color: green; font-weight:bold;">
                    ✅ 내용이 저장되었습니다.
                </div>
            </div>
        `;

        // Initialize Inputs and Persistence
        const storageKey = `response_${unitId}_${stepId}`;

        // Handle Textareas
        const textarea = contentEl.querySelector('textarea');
        if (textarea) {
            textarea.id = `input-${stepId}`;
            textarea.value = localStorage.getItem(storageKey) || '';
            textarea.addEventListener('input', function () {
                localStorage.setItem(storageKey, this.value);
                showFeedback(stepId);
            });
        }

        // Handle Selects
        const select = contentEl.querySelector('select');
        if (select) {
            select.id = `select-${stepId}`;
            const savedVal = localStorage.getItem(storageKey);
            if (savedVal) select.value = savedVal;
            select.addEventListener('change', function () {
                localStorage.setItem(storageKey, this.value);
                showFeedback(stepId);
            });
        }

        // Handle File Inputs
        const fileInput = contentEl.querySelector('input[type="file"]');
        if (fileInput) {
            const fileKey = `${storageKey}_filename`;
            const savedFile = localStorage.getItem(fileKey);
            if (savedFile) {
                const label = document.createElement('p');
                label.style.marginTop = '5px';
                label.style.color = 'blue';
                label.innerHTML = `📂 제출된 파일: <b>${savedFile}</b>`;
                fileInput.parentNode.appendChild(label);
            }
            fileInput.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    localStorage.setItem(fileKey, this.files[0].name);
                    showFeedback(stepId);
                    const label = fileInput.parentNode.querySelector('p') || document.createElement('p');
                    label.style.marginTop = '5px';
                    label.style.color = 'blue';
                    label.innerHTML = `📂 제출된 파일: <b>${this.files[0].name}</b>`;
                    if (!fileInput.parentNode.querySelector('p')) fileInput.parentNode.appendChild(label);
                }
            });
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFeedback(stepId) {
    const fb = document.getElementById(`feedback-${stepId}`);
    if (fb) {
        fb.classList.remove('hidden');
        setTimeout(() => fb.classList.add('hidden'), 2000);
    }
}

function hideUnitActivity(unitId) {
    const gridEl = document.getElementById(`${unitId}-steps-grid`);
    const titleEl = document.getElementById(`${unitId}-lesson-title`);
    const descEl = document.getElementById(`${unitId}-lesson-desc`);
    const viewEl = document.getElementById(`${unitId}-activity-view`);

    if (gridEl) gridEl.style.display = 'grid';
    if (titleEl) titleEl.style.display = 'block';
    if (descEl) descEl.style.display = 'block';
    if (viewEl) viewEl.style.display = 'none';
}

// Initial Render Call
setTimeout(() => {
    // Unit 1
    if (typeof renderUnit1Lessons === 'function') {
        renderUnit1Lessons();
        renderUnit1Steps();
    }
    // Unit 2
    if (typeof renderUnitLessons === 'function') {
        renderUnitLessons('unit2');
        renderUnitSteps('unit2');
    }
    // Unit 3
    if (typeof renderUnitLessons === 'function') {
        renderUnitLessons('unit3');
        renderUnitSteps('unit3');
    }
    // Unit 4
    if (typeof renderUnitLessons === 'function') {
        renderUnitLessons('unit4');
        renderUnitSteps('unit4');
    }
}, 500);

/* --- UNIT 4 BOOKSTORE LOGIC --- */
let registeredBooks = [
    { title: '������ ����', author: '�迵��', publisher: '���е���', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }
];
let selectedCoverColor = 'linear-gradient(135deg, #6366f1, #a855f7)';
let recommendedBooks = [
    { t: '������ ����', a: '�迵��', p: '���е���', theme: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { t: '�ҳ��� �´�', a: '�Ѱ�', p: 'â��', theme: 'linear-gradient(135deg, #1e293b, #0f172a)' },
    { t: '������ ������', a: '��ȣ��', p: '����������', theme: 'linear-gradient(135deg, #fef3c7, #fde68a)', dark: true },
    { t: '�޷���Ʈ �� ��ȭ��', a: '�̹̿�', p: '���丮����', theme: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
    { t: '���̾�', a: '�츣�� �켼', p: '������', theme: 'linear-gradient(135deg, #064e3b, #065f46)' },
    { t: '� ����', a: '�������丮', p: '����å��', theme: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { t: '���ݼ���', a: '�Ŀ�� �ڿ���', p: '���е���', theme: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { t: '���� ���� �½�', a: '���ʿ�', p: '���̾�Ʈ�Ͻ�', theme: 'linear-gradient(135deg, #1e1b4b, #312e81)' }
];

function selectColor(el, color) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    selectedCoverColor = color;
}

function registerBook() {
    const title = document.getElementById('reg-title').value.trim();
    const author = document.getElementById('reg-author').value.trim();
    const publisher = document.getElementById('reg-publisher').value.trim();
    if (!title || !author || !publisher) { alert('��� ������ �Է��� �ּ���!'); return; }
    registeredBooks.push({ title, author, publisher, color: selectedCoverColor });
    renderBookshelf();
    document.getElementById('reg-title').value = '';
    document.getElementById('reg-author').value = '';
    document.getElementById('reg-publisher').value = '';
    
    // Confetti effect reused from Unit 4 original if available
    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

function renderBookshelf() {
    const container = document.getElementById('bookshelf-container');
    if (!container) return;
    
    if (registeredBooks.length > 0) {
        container.innerHTML = registeredBooks.map(book => \
        <div class='book-item' style='background: \;'>
            <div class='book-cover-title'>\</div>
            <div style='flex: 1; display: flex; align-items: center; justify-content: center; opacity: 0.2; font-size: 2.5rem;'>??</div>
            <div class='book-cover-author'>\ ��</div>
            <div class='book-cover-publisher'>\</div>
        </div>
    \).join('');
    } else {
        container.innerHTML = <div class='book-item empty-book'>�ۼ��� å ������ �Է��Ͽ� ����� �ּ���.</div>;
    }
}

function renderRecommendations() {
    const container = document.getElementById('recommendation-grid');
    if (!container) return;
    
    container.innerHTML = recommendedBooks.map(book => {
        const style = \ackground: \;\;
        const textColor = book.dark ? '#1e293b' : 'white';
        
        return \
            <a href='https://search.kyobobook.co.kr/search?keyword=\' 
               target='_blank' class='book-item' 
               style='\ position:relative; overflow:hidden; width:auto; height:180px;'>
                <div class='book-cover-content' style='position:relative; z-index:2; height:100%; display:flex; flex-direction:column; padding:15px;'>
                    <div class='book-cover-title' style='color: \;'>\</div>
                    <div class='book-cover-author' style='color: \; opacity: 0.9; border-top: 1px solid rgba(255,255,255,0.3); padding-top:10px;'>\</div>
                </div>
            </a>
        \;
    }).join('');
}

