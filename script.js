
// --- LOGIN & USER STATE LOGIC ---
let currentUser = null;

function showLogin() {
    const loginScreen = document.getElementById('login-screen');
    const app = document.getElementById('app');
    loginScreen.classList.remove('hidden');
    loginScreen.style.display = 'flex';
    app.classList.add('hidden');
}

function checkLogin() {
    const idInput = document.getElementById('login-id');
    const pwInput = document.getElementById('login-pw');
    const id = idInput.value.trim().toLowerCase();
    const pw = pwInput.value;
    const loginScreen = document.getElementById('login-screen');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const topLoginBtn = document.getElementById('top-login-btn');

    const isStudent = /^student\d+$/.test(id);

    if (id === '1111' && pw === '1111') {
        currentUser = 'admin';
        loginScreen.style.display = 'none';
        const app = document.getElementById('app');
        if (app) app.classList.remove('hidden');
        userName.innerText = '관리자님';
        userRole.innerText = '선생님 모드';
        if (topLoginBtn) topLoginBtn.style.display = 'none';
        switchTab('home');
    } else if ((isStudent || id === 'student') && pw === '1111') {
        currentUser = id;
        loginScreen.style.display = 'none';
        const app = document.getElementById('app');
        if (app) app.classList.remove('hidden');
        userName.innerText = id + ' 학생';
        userRole.innerText = '수강생';
        if (topLoginBtn) topLoginBtn.style.display = 'none';
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
        const topLoginBtn = document.getElementById('top-login-btn');
        if (topLoginBtn) {
            topLoginBtn.style.display = 'block';
            topLoginBtn.innerHTML = '<i class="fa-solid fa-key"></i> 로그인';
            topLoginBtn.onclick = showLogin;
        }
        alert('로그아웃 되었습니다.');
        location.reload();
    }
}

function saveCheckState() {
    if (!currentUser) return;
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    checks.forEach(chk => { state[chk.id] = chk.checked; });
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
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    }
}

// --- WORKSHEET MODAL LOGIC ---
const worksheets = {
    'kwl': { title: 'K-W-L 표', desc: '주제에 대해 이미 아는 것(K), 알고 싶은 것(W), 배운 것(L)을 정리해봅니다.', html: `<div class="ws-grid-3"><div class="ws-col"><h4>K (What I Know)</h4><textarea placeholder="이미 알고 있는 내용을 적어보세요."></textarea></div><div class="ws-col"><h4>W (What I Want to know)</h4><textarea placeholder="더 알고 싶은 내용을 질문으로 만들어보세요."></textarea></div><div class="ws-col"><h4>L (What I Learned)</h4><textarea placeholder="수업 후 배운 내용을 정리해보세요."></textarea></div></div>` },
    'mindmap': { title: '마인드맵 (Mind Map)', desc: '중심 주제를 가운데 두고 가지를 뻗어 나가며 생각을 확장해봅니다.', html: `<div style="text-align:center; height:100%; display:flex; flex-direction:column; gap:10px;"><input type="text" class="ws-list-input" placeholder="중심 주제 입력 (예: 나의 여행)" style="font-size:1.5rem; text-align:center;"><div style="flex:1; border:2px dashed #ddd; border-radius:10px; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;"><textarea placeholder="가지 1: 생각나는 단어들..."></textarea><textarea placeholder="가지 2: 연관된 이미지..."></textarea><textarea placeholder="가지 3: 구체적인 계획..."></textarea><textarea placeholder="가지 4: 자유로운 아이디어..."></textarea></div></div>` },
    'venn': { title: '비교/대조 (Venn Diagram)', desc: '두 대상의 공통점과 차이점을 찾아 정리해봅니다.', html: `<div class="ws-grid-3"><div class="ws-col"><h4>A 만의 특징</h4><textarea placeholder="예: 우리나라의 인사법"></textarea></div><div class="ws-col"><h4>공통점 (교집합)</h4><textarea placeholder="두 문화의 비슷한 점"></textarea></div><div class="ws-col"><h4>B 만의 특징</h4><textarea placeholder="예: 태국의 인사법"></textarea></div></div>` },
    'char': { title: '인물 분석표', desc: '인물의 내면과 외면을 깊이 있게 탐구해봅니다.', html: `<div style="display:flex; gap:10px; height:100%;"><div class="ws-col" style="flex:1"><h4>외적 특징</h4><textarea placeholder="생김새, 옷차림, 행동 말투 등"></textarea></div><div class="ws-col" style="flex:1"><h4>내적 특징</h4><textarea placeholder="성격, 가치관, 고민, 꿈 등"></textarea></div><div class="ws-col" style="flex:1"><h4>내가 느낀 점</h4><textarea placeholder="이 사람을 보며 나는 어떤 생각이 들었나요?"></textarea></div></div>` },
    'cause': { title: '원인과 결과 (Fishbone)', desc: '문제의 근본적인 원인을 찾아 해결책을 모색합니다.', html: `<div style="display:flex; flex-direction:column; height:100%; gap:10px;"><input type="text" class="ws-list-input" placeholder="문제 상황 (Result) 입력"><div class="ws-grid-3" style="flex:1;"><div class="ws-col"><h4>원인 1 (환경)</h4><textarea></textarea></div><div class="ws-col"><h4>원인 2 (사람)</h4><textarea></textarea></div><div class="ws-col"><h4>원인 3 (소통)</h4><textarea></textarea></div></div></div>` },
    'flow': { title: '사건 흐름도 (Flow Chart)', desc: '시간의 흐름이나 사건의 순서대로 내용을 정리합니다.', html: `<div style="display:flex; flex-direction:column; gap:10px; height:100%; overflow-y:auto;"><input type="text" class="ws-list-input" placeholder="1단계 (처음): "><input type="text" class="ws-list-input" placeholder="2단계 (전개): "><input type="text" class="ws-list-input" placeholder="3단계 (위기): "><input type="text" class="ws-list-input" placeholder="4단계 (절정): "><input type="text" class="ws-list-input" placeholder="5단계 (결말): "></div>` },
    'tree': { title: '개념 구조도 (Structure Tree)', desc: '핵심 개념을 중심으로 하위 내용을 체계적으로 분류합니다.', html: `<div style="height:100%; display:flex; flex-direction:column; gap:10px;"><input type="text" class="ws-list-input" placeholder="대주제 (책 제목)" style="text-align:center; font-weight:bold;"><div style="display:flex; gap:10px; flex:1;"><div class="ws-col" style="flex:1"><h4>Chapter 1</h4><textarea></textarea></div><div class="ws-col" style="flex:1"><h4>Chapter 2</h4><textarea></textarea></div><div class="ws-col" style="flex:1"><h4>Chapter 3</h4><textarea></textarea></div></div></div>` },
    'predict': { title: '표지 및 제목 추리', desc: '단서를 통해 내용을 예측하며 상상력을 발휘해봅니다.', html: `<div class="ws-grid-3"><div class="ws-col"><h4>단서 찾기</h4><textarea placeholder="표지의 그림, 제목의 글자체 등에서 힌트를 찾아보세요."></textarea></div><div class="ws-col"><h4>내용 상상하기</h4><textarea placeholder="어떤 이야기가 펼쳐질까요?"></textarea></div><div class="ws-col"><h4>질문 만들기</h4><textarea placeholder="작가에게 궁금한 점은?"></textarea></div></div>` }
};

function openWorksheet(type) {
    const modal = document.getElementById('worksheet-modal');
    const body = document.getElementById('worksheet-body');
    const ws = worksheets[type];
    if (ws) {
        body.innerHTML = `<div class="ws-title">${ws.title}</div><p class="ws-desc">${ws.desc}</p>${ws.html}`;
        modal.classList.remove('hidden');
    }
}
function closeWorksheet() { document.getElementById('worksheet-modal').classList.add('hidden'); }

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

function openTestModal() { document.getElementById('test-modal').classList.remove('hidden'); restartTest(); }
function closeTestModal() { document.getElementById('test-modal').classList.add('hidden'); }
function restartTest() { currentQIndex = 0; score = 0; document.getElementById('test-question-container').classList.remove('hidden'); document.getElementById('test-result-container').classList.add('hidden'); showQuestion(); }
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
    if (currentQIndex < testQuestions.length) showQuestion(); else showResult();
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
function toggleChat() { document.getElementById('chat-window').classList.toggle('hidden'); }
function handleEnter(e) { if (e.key === 'Enter') sendMsg(); }
function sendMsg() {
    const input = document.getElementById('chat-input');
    const txt = input.value.trim();
    if (!txt) return;
    addMessage(txt, 'user-msg');
    input.value = '';
    setTimeout(() => { addMessage(getBotResponse(txt), 'bot-msg'); }, 600);
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
    const buttons = document.querySelectorAll('.sub-nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`.sub-nav-btn[data-target="${introId}"]`);
    if (targetBtn) targetBtn.classList.add('active');
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
    const map = { 'home': 0, 'unit1': 1, 'unit2': 2, 'unit3': 3, 'unit4': 4, 'unit5': 5 };
    if (map[tabId] !== undefined && document.querySelectorAll('.nav-links li')[map[tabId]]) {
        document.querySelectorAll('.nav-links li')[map[tabId]].classList.add('active');
    }
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        if (tabId === 'unit1') {
            renderUnit1Lessons(); renderUnit1Steps();
            if (subTarget === 'grid') setTimeout(() => { const grid = document.getElementById('unit1-steps-grid'); if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }
        if (tabId === 'unit2') {
            renderUnitLessons('unit2'); renderUnitSteps('unit2');
            if (subTarget === 'grid') setTimeout(() => { const grid = document.getElementById('unit2-steps-grid'); if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }
        if (tabId === 'unit3') {
            renderUnitLessons('unit3'); renderUnitSteps('unit3');
            if (subTarget === 'grid') setTimeout(() => { const grid = document.getElementById('unit3-steps-grid'); if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }
        if (tabId === 'unit4') {
            renderUnitLessons('unit4'); renderUnitSteps('unit4');
            if (subTarget === 'grid') setTimeout(() => { const grid = document.getElementById('unit4-steps-grid'); if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }
    }
}
function u1Answer(type) { const r = document.getElementById('u1-result'); r.classList.remove('hidden'); r.innerHTML = type === 'J' ? "나노 단위 계획러! 🔍" : "자유로운 영혼! 🌬️"; }
function u2Answer(isO) { const r = document.getElementById('u2-result'); r.classList.remove('hidden'); r.innerHTML = isO ? "땡! ❌ 태국에선 머리를 만지면 안돼요." : "정답! ⭕ 머리는 신성한 부위랍니다."; }
function u3Check() { const v = document.getElementById('u3-select').value; const f = document.getElementById('u3-feedback'); if (v == 'B') f.innerHTML = "현명한 타협입니다! 👍"; else if (v == '0') f.innerText = "선택해주세요."; else f.innerHTML = "조금 더 좋은 방법이 있을까요? 🤔"; }
function updateBook() { document.getElementById('preview-title').innerText = document.getElementById('input-title').value || "나의 여행"; document.getElementById('preview-author').innerText = "지은이: " + (document.getElementById('input-author').value || "나"); }
function changeColor(c) { document.getElementById('book-preview').style.background = c; }

// --- DATA: UNIT 1 ---
const unit1LessonData = { 1: { title: "1차시: 여행에서 만난 나", desc: "우리는 왜 여행을 떠날까요? 여행의 첫걸음을 떼어봅니다.", steps: [{ id: "1-1", icon: "🌍", title: "1. 나에게 여행이란?", content: '<h3>브레인스토밍: 여행의 정의</h3><p>친구들이 생각하는 \'여행\'은 어떤 단어로 표현될까요?</p>', isWordCloud: true }, { id: "1-2", icon: "📸", title: "2. 인생 여행지 공유", content: '<h3>인생 여행 사진 공유</h3><div class="file-zone" id="unit1-drop-zone-1-2" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-2\')"><p>📸 드래그하거나 클릭하여 업로드</p><input type="file" id="unit1-photo-input-1-2" style="display:none" onchange="handleFileSelect(event, \'1-2\')"></div>', hideBoardInput: true, isPhotoGallery: true }, { id: "1-3", icon: "📄", title: "3. 활동지 다운로드", content: '<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_1차시_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'1-3\')" download>⬇️ 1차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "1-4", icon: "🎒", title: "4. 나의 가방 속 물건", content: '<h3>가방 필수템</h3><p>물건을 적어주세요. 많이 나오면 커집니다!</p>', isWordCloud: true }, { id: "1-5", icon: "💬", title: "5. 여행 목적 설문", content: '<h3>여행의 이유</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'휴식\')">휴식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'모험\')">모험</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'음식\')">음식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'역사\')">역사</button><button class="quiz-btn" onclick="showUnit1OtherInput()">기타</button></div><div id="unit1-other-input-area" style="display:none; margin-top:10px;" class="input-group"><input type="text" id="unit1-survey-other" placeholder="기타..."><button class="back-btn" style="margin:0" onclick="submitUnit1Survey(\'1-5\', \'기타\')">확인</button></div>', isGraphicOrganizer: true, hideBoardInput: true }, { id: "1-6", icon: "🗺️", title: "6. 가보고 싶은 곳", content: '<h3>꿈꾸는 여행지</h3><p>지도를 보며 가고 싶은 곳의 링크를 공유해 주세요.</p><a href="https://maps.google.com" target="_blank" class="download-link" style="background:#4285F4">🌐 지도 열기</a>', isMapLink: true }, { id: "1-7", icon: "📤", title: "7. 과제 제출", content: '<h3>과제 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-7\')"><p>📂 드래그하여 업로드</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "1-8", icon: "💡", title: "8. 여행 상식 퀴즈", content: '<div id="unit1-quiz-init" class="input-group"><input type="text" id="unit1-student-quiz-name" placeholder="이름 입력"><button class="back-btn" style="margin:0" onclick="startUnit1QuizWithName()">시작</button></div><div id="unit1-quiz-area"></div>', isQuiz: true, hideBoardInput: true }, { id: "1-9", icon: "📅", title: "9. 1차시 마무리", content: '<h3>소감 나누기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="소감 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'1-9\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "1-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] }, 2: { title: "2차시: 여행과 나의 성장", desc: "여행은 우리를 어떻게 변화시킬까요? 성장의 시간을 기록합니다.", steps: [{ id: "2-1", icon: "🧩", title: "1. 여행 테마 정하기", content: "<h3>나만의 여행 테마</h3><p>내가 계획하고 싶은 여행 테마는 무엇인가요?</p>", isWordCloud: true }, { id: "2-2", icon: "🚶", title: "2. 걷기 여행의 토론", content: '<h3>느리게 걷기 토론</h3><p>도보 여행의 특징을 장점과 단점으로 구분하여 적어봅시다.</p><div class="worksheet-section" style="background:white; padding:20px; border-radius:15px; box-shadow:0 2px 4px rgba(0,0,0,0.05); border:1px solid #eee;"><div class="input-header" style="font-weight:bold; margin-bottom:10px; color:#555;">📝 토론 의견 작성</div><div class="input-group" style="display:flex; gap:10px; margin-bottom:10px;"><input type="text" id="unit1-pc-name" class="worksheet-text-input" placeholder="이름" style="width:100px;"><select id="unit1-pc-type" class="worksheet-text-input" style="width:120px;"><option value="장점">✅ 장점</option><option value="단점">❌ 단점</option></select></div><textarea id="unit1-pc-text" class="worksheet-input" placeholder="여기에 의견을 적어주세요..." style="width:100%; height:80px;"></textarea><div style="text-align:right; margin-top:10px;"><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'2-2\')">의견 공유하기</button> <button class="back-btn" style="margin:0; background:#6b7280; color:white;" onclick="saveMyWork(\'2-2\')">내용 저장</button></div></div>', isProsCons: true, hideBoardInput: true }, { id: "2-3", icon: "🚌", title: "3. 대중교통 이용", content: "<h3>현지 교통수단</h3><p>여행지에서 이용하고 싶은 교통수단을 적어주세요. 연결망으로 시각화됩니다.</p>", isNodeGraph: true }, { id: "2-4", icon: "🍽️", title: "4. 현지 음식 문화", content: "<h3>맛의 모험</h3><p>가장 먹어보고 싶은 이색 음식은? 많이 나온 키워드가 크게 보입니다.</p>", isBubbleChart: true }, { id: "2-5", icon: "📄", title: "5. 활동지 다운로드", content: '<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'2-5\')" download>⬇️ 2차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "2-6", icon: "🎨", title: "6. 여행 일러스트", content: '<h3>그림으로 나누는 여행</h3><div class="canvas-wrapper"><canvas id="unit1-whiteboard" width="600" height="400"></canvas><div class="canvas-ctrl"><input type="color" id="unit1-get-pen-color" value="#4A90E2"><button class="back-btn" style="margin:0" onclick="clearUnit1Canvas()">지우기</button><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="postUnit1Canvas(\'2-6\')">그림 공유</button></div></div><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-6\')"><p>🎨 그림 파일 업로드 (드래그)</p></div>', isPhotoGallery: true, hideBoardInput: true }, { id: "2-7", icon: "🎵", title: "7. 여행 플레이리스트", content: '<h3>유튜브 음악 공유</h3><p>추천하고 싶은 여행 음악의 유튜브 링크를 공유해 주세요.</p><a href="https://www.youtube.com" target="_blank" class="youtube-card">🎬 유튜브 바로가기</a>', isPlaylist: true }, { id: "2-8", icon: "📤", title: "8. 활동 결과 제출", content: '<h3>자료 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-8\')"><p>📁 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "2-9", icon: "✨", title: "9. 성장의 한마디", content: '<h3>나의 다짐</h3><div class="worksheet-section" style="background:white; padding:20px; border-radius:15px; border:1px solid #eee;"><div class="input-group"><input type="text" id="unit1-sync-name" class="worksheet-text-input" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" class="worksheet-text-input" placeholder="나의 다짐 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'2-9\')" style="flex:1;"></div><div style="text-align:right; margin-top:10px;"><button class="back-btn" style="background:#6b7280; color:white;" onclick="saveMyWork(\'2-9\')">저장하기</button></div></div>', isLiveSync: true, hideBoardInput: true }, { id: "2-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] }, 3: { title: "3차시: 여행의 의미 발견", desc: "수업을 마무리하며 나만의 여행 의미를 정의합니다.", steps: [{ id: "3-1", icon: "📕", title: "1. 발췌독 활동지", content: '<div class="content-block"><h3>최종 활동지</h3><a href="1단원/여행_발췌독_연계_활동지_3차시.pdf" class="download-link" onclick="handleTrackedDownload(event, \'3-1\')" download>⬇️ 3차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "3-2", icon: "✍️", title: "2. 여행 에세이 쓰기", content: '<h3>나의 여행 이야기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="짧은 에세이 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'3-2\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "3-3", icon: "🤝", title: "3. 모둠 여행 계획", content: "<h3>우리 팀의 계획</h3><p>함께 가고 싶은 도시들을 적어보세요. 연결망으로 보여집니다.</p>", isNodeGraph: true }, { id: "3-4", icon: "🏛️", title: "4. 보호해야 할 유산", content: "<h3>소중한 문화유산</h3><p>우리가 지켜야 할 장소는 어디일까요?</p>", isBubbleChart: true }, { id: "3-5", icon: "🌿", title: "5. 에코 투어리즘", content: '<h3>환경을 위한 선택</h3><div class="input-group" style="background:#fff; border:1px solid #ddd;"><input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;"><select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;"><option value="장점">✅ 찬성/장점</option><option value="단점">❌ 반대/단점</option></select><input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요..."><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'3-5\')">공유</button></div>', isProsCons: true, hideBoardInput: true }, { id: "3-6", icon: "🔭", title: "6. 미래의 여행", content: "<h3>우주 여행 시대</h3><p>미래 여행하면 떠오르는 단어를 적어주세요.</p>", isWordCloud: true }, { id: "3-7", icon: "📊", title: "7. 수업 만족도", content: '<h3>오늘 수업은?</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'최고예요\')">최고예요! 👍</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'좋아요\')">좋아요 😊</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'보통예요\')">보통예요 😐</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'아쉬워요\')">아쉬워요 😢</button></div>', isGraphicOrganizer: true, hideBoardInput: true }, { id: "3-8", icon: "📤", title: "8. 최종 포트폴리오", content: '<h3>최종 결과물 제출</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'3-8\')"><p>📁 최종 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "3-9", icon: "⭐", title: "9. 최종 마무리", content: '<h3>수업을 마치며</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="수업 총평을 적어주세요..." onkeypress="handleUnit1EnterSync(event, \'3-9\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "3-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] } };

// --- DATA: ACTIVITY DATA (Unit 2, 3) ---
const activityData = {
    "unit2": {
        "A1": { title: "감정 한 단어 선택", step: "Step 1. 주의 집중", type: "text_input", instruction: ["영상을 보고 떠오른 감정 하나와 이유를 적어주세요."] },
        "A2": { title: "문화 요소 빙고", step: "Step 1. 주의 집중", type: "worksheet" },
        "A8": { title: "30초 마이크로 토론", step: "Step 1. 주의 집중", type: "text_input" },
        "B2": { title: "성공 기준 체크리스트", step: "Step 2. 목표 제시", type: "checklist_maker" },
        "B3": { title: "미션 선택 (트랙 정하기)", step: "Step 2. 목표 제시", type: "selection", options: ["음식 트랙", "언어 트랙", "음악/예술 트랙", "생활습관 트랙"] },
        "C1": { title: "나의 생활문화 스냅샷", step: "Step 3. 선수학습 회상", type: "text_input" },
        "C6": { title: "편견 체크 (Bias Check)", step: "Step 3. 선수학습 회상", type: "text_input" },
        "D1": { title: "인문·자연환경 스캔", step: "Step 4. 내용 제시", type: "text_input" },
        "D2": { title: "문화 요소 상징 해독", step: "Step 4. 내용 제시", type: "worksheet" },
        "D7": { title: "인포포스터 초안 구성", step: "Step 4. 내용 제시", type: "file_upload" },
        "E1": { title: "문화 상대주의 카드 적용", step: "Step 5. 학습 안내", type: "text_input" },
        "E7": { title: "갈등 예측과 예방", step: "Step 5. 학습 안내", type: "text_input" },
        "F2": { title: "인터뷰 역할극", step: "Step 6. 수행 유도", type: "text_input" },
        "F4": { title: "타문화 인물 시점 편지", step: "Step 6. 수행 유도", type: "long_text" },
        "F6": { title: "나 vs 타문화 비교 발표", step: "Step 6. 수행 유도", type: "text_input" },
        "G1": { title: "Two Stars & A Wish", step: "Step 7. 피드백 제공", type: "text_input" },
        "G3": { title: "공감 지수 피드백", step: "Step 7. 피드백 제공", type: "star_rating" },
        "H2": { title: "포트폴리오 제출", step: "Step 8. 평가", type: "file_upload" },
        "H1": { title: "최종 비교 발표", step: "Step 8. 평가", type: "text_display" },
        "I1": { title: "'너를 통해 알게 된 나' 에세이", step: "Step 9. 전이와 확장", type: "long_text" },
        "I3": { title: "문화 다양성 캠페인 기획", step: "Step 9. 전이와 확장", type: "text_input" }
    },
    "unit3": {
        "Act1_1": { title: "여행 동행 유형 투표", step: "Step 1. 주의 집중", type: "selection", options: ["나홀로 여행", "친구와 여행", "가족 여행", "패키지 단체 여행"] },
        "Act1_2": { title: "여행 중 갈등 한 줄 이야기", step: "Step 1. 주의 집중", type: "text_input" },
        "Act2_1": { title: "오늘의 미션 카드", step: "Step 2. 목표 제시", type: "text_input" },
        "Act2_2": { title: "성취기준 미리보기", step: "Step 2. 목표 제시", type: "checklist_maker" },
        "Act3_1": { title: "이전 여행 관계 맵 그리기", step: "Step 3. 선수학습 회상", type: "text_input" },
        "Act3_2": { title: "갈등 해결 경험 나누기", step: "Step 3. 선수학습 회상", type: "text_input" },
        "Act4_1": { title: "여행 에세이 읽기", step: "Step 4. 내용 제시", type: "text_input" },
        "Act4_2": { title: "관계 유형 비교 분석", step: "Step 4. 내용 제시", type: "worksheet" },
        "Act5_1": { title: "관계 분석 질문 가이드", step: "Step 5. 학습 안내", type: "text_input" },
        "Act5_2": { title: "갈등 해결 4단계 모델", step: "Step 5. 학습 안내", type: "role_play_guide" },
        "Act6_1": { title: "조별 여행 코스 공동 설계", step: "Step 6. 수행 유도", type: "worksheet" },
        "Act6_2": { title: "갈등 상황 역할극", step: "Step 6. 수행 유도", type: "text_input" },
        "Act7_1": { title: "동료 피드백 라운드", step: "Step 7. 피드백 제공", type: "text_input" },
        "Act7_2": { title: "교사 코멘트 확인", step: "Step 7. 피드백 제공", type: "text_display" },
        "Act8_1": { title: "협력 과정 성찰 일지", step: "Step 8. 평가", type: "star_rating" },
        "Act8_2": { title: "공동체 가치 포스터 발표", step: "Step 8. 평가", type: "file_upload" },
        "Act9_1": { title: "일상 속 관계 적용 선언문", step: "Step 9. 전이와 확장", type: "text_input" },
        "Act9_2": { title: "다음 여행 약속 설계", step: "Step 9. 전이와 확장", type: "text_input" }
    }
};

// --- DATA PROCESSING & MAPPING ---
// Convert activityData to unitDataMap structure for Unit 2 & 3
const unitDataMap = { 'unit1': unit1LessonData };

// Function to process activityData into Lesson structure
function processUnitData(unitKey) {
    if (!activityData[unitKey]) return {};
    const unitObj = {};
    const stepsOrder = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "Step 8", "Step 9"];

    stepsOrder.forEach((stepName, idx) => {
        const lessonNum = idx + 1;
        const acts = Object.entries(activityData[unitKey]).filter(([k, v]) => v.step.startsWith(stepName));
        if (acts.length === 0) return;

        let title = acts[0][1].step; // Use full step name as title

        unitObj[lessonNum] = {
            title: `${lessonNum}단계: ${title.split('. ')[1] || title}`,
            desc: `${unitKey === 'unit2' ? '문화와 소통' : '관계와 협력'} - ${title}`,
            steps: acts.map(([id, val]) => ({
                id: id,
                icon: "📝", // Default icon
                title: val.title,
                content: `<div class="activity-info"><p>${val.instruction ? val.instruction.join('<br>') : (val.description || '활동 주제를 확인하고 자신의 생각을 정리해 보세요.')}</p></div>${getInputHtml(val, unitKey, id)}`
            }))
        };
    });
    return unitObj;
}

function getInputHtml(val, unitId, id) {
    let innerHtml = '';
    const saveId = id || `U${unitId}_${val.step}`;

    if (val.type === 'text_input' || val.type === 'long_text') {
        innerHtml = `<textarea id="input-${saveId}" class="worksheet-input" placeholder="${val.placeholder || '내용을 입력하세요...'}" style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; font-size:1rem; resize:vertical; background:#f8fafc;"></textarea>`;
    } else if (val.type === 'selection') {
        innerHtml = `<div class="quiz-options" style="display:flex; gap:10px; flex-wrap:wrap;">${val.options.map(o => `<button class="quiz-btn" style="padding:10px 20px; border:1px solid #cbd5e1; background:white; border-radius:20px; cursor:pointer; transition:all 0.2s;" onclick="this.style.background='var(--primary)'; this.style.color='white';">${o}</button>`).join('')}</div>`;
    } else if (val.type === 'file_upload') {
        innerHtml = `<div class="file-zone" style="border:2px dashed #cbd5e1; padding:30px; text-align:center; border-radius:12px; color:#64748b; background:#f1f5f9; cursor:pointer; transition:background 0.2s;" onclick="alert('파일 업로드 창이 열립니다.')"><div style="font-size:2rem; margin-bottom:10px;">📂</div><p>클릭하여 파일을 업로드하세요</p></div>`;
    } else if (val.type === 'star_rating') {
        innerHtml = `<div style="font-size:2rem; text-align:center; cursor:pointer;" onclick="this.innerHTML='⭐⭐⭐⭐⭐ (저장됨)'">⭐⭐⭐⭐⭐</div>`;
    } else if (val.type === 'checklist_maker') {
        innerHtml = `<div class="checklist-box">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><input type="checkbox"> <input type="text" class="worksheet-text-input" placeholder="수행 목표 1..." style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><input type="checkbox"> <input type="text" class="worksheet-text-input" placeholder="수행 목표 2..." style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><input type="checkbox"> <input type="text" class="worksheet-text-input" placeholder="수행 목표 3..." style="flex:1;"></div>
        </div>`;
    } else if (val.type === 'role_play_guide') {
        innerHtml = `<div class="role-play-box" style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-weight:bold; color:var(--primary); margin-bottom:15px; display:flex; align-items:center; gap:8px;">🎭 역할극 대본 작성 가이드</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div style="background:white; padding:15px; border-radius:10px; border:1px solid #e2e8f0;"><p style="font-weight:700; color:#475569; margin-bottom:8px; font-size:0.9rem;">역할 A (나)</p><textarea style="width:100%; height:80px; border:none; resize:none; font-family:inherit;" placeholder="대사를 입력하세요..."></textarea></div>
                <div style="background:white; padding:15px; border-radius:10px; border:1px solid #e2e8f0;"><p style="font-weight:700; color:#475569; margin-bottom:8px; font-size:0.9rem;">역할 B (너)</p><textarea style="width:100%; height:80px; border:none; resize:none; font-family:inherit;" placeholder="대사를 입력하세요..."></textarea></div>
            </div>
        </div>`;
    } else if (val.type === 'text_display') {
        innerHtml = `<div class="info-box" style="padding:20px; background:#eff6ff; border-radius:12px; border-left:5px solid #3b82f6; color:#1e40af;">
            <p style="margin:0; font-weight:500; line-height:1.6;">✨ 제시된 자료를 확인하고, 배운 내용을 바탕으로 모둠 친구들과 자유롭게 의견을 나누어 보세요.</p>
        </div>`;
    } else if (val.type === 'worksheet') {
        innerHtml = `<textarea id="input-${saveId}" class="worksheet-input" placeholder="제시된 양식에 맞춰 활동 내용을 상세히 기록해 보세요." style="width:100%; min-height:180px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; font-size:1rem; resize:vertical; background:#f8fafc;"></textarea>`;
    } else {
        innerHtml = `<div class="worksheet-placeholder" style="padding:20px; background:#f1f5f9; border-radius:10px; text-align:center; color:#64748b;">🎨 ${val.type} 형식의 활동입니다.</div>`;
    }

    return `<div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0; margin-top:20px;">
        <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
        ${innerHtml}
        <div style="text-align:right; margin-top:20px;">
            <button class="complete-btn" onclick="saveMyWork('${saveId}')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition:all 0.2s;">활동 저장하기</button>
        </div>
    </div>`;
}

unitDataMap['unit2'] = processUnitData('unit2');
unitDataMap['unit3'] = processUnitData('unit3');

// Manually add Unit 4 Data (Reconstructed)
unitDataMap['unit4'] = {
    1: {
        title: "프로젝트 1: 나만의 여행책",
        desc: "가네의 9단계 교수 설계 모델을 통해 만드는 나만의 여행책",
        steps: [
            {
                id: "U4_1", icon: "🎯", title: "1단계. 주의 집중", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">💡 나의 여행 테마를 정하기 위한 영감을 얻어보세요.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px; line-height:1.5;">📸 갤러리에서 가장 애착이 가는 사진 한 장을 고르고, 당시의 기분과 이 사진을 고른 이유를 적어주세요.</div>
                    <textarea id="input-U4_1" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; font-size:1rem; resize:vertical; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_1')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_2", icon: "🚩", title: "2단계. 학습 목표", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">🚩 여행 책의 방향성과 구체적 목표를 설정해 봅시다.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:15px;">이 책을 통해 독자에게 전달하고 싶은 핵심 메시지를 정해 보세요.</div>
                    <div class="worksheet-row" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                        <input type="text" id="input-U4_2_title" class="worksheet-text-input" placeholder="책 제목 (ex. 어느 여름날의 기록)" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                        <input type="text" id="input-U4_2_author" class="worksheet-text-input" placeholder="작가 명 (ex. 홍길동)" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <textarea id="input-U4_2_msg" class="worksheet-input" placeholder="핵심 메시지 입력..." style="width:100%; min-height:100px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_2')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_3", icon: "🧠", title: "3단계. 선수 학습", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">🧠 과거의 경험과 지식을 현재의 여행과 연결해 보세요.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px;">가장 좋았던 장소와 음식 리스트업! 여행지에서의 오감 중 가장 강렬했던 기억 하나를 서술해 주세요.</div>
                    <textarea id="input-U4_3" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_3')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_4", icon: "✨", title: "4단계. 자극 제시", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">✨ 레이아웃과 디자인 원칙을 이해하고 적용해 봅시다.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px;">마음에 드는 폰트 스타일(명조/고딕)과 나의 여행 분위기에 가장 잘 어울리는 색조를 선택해 보세요.</div>
                    <textarea id="input-U4_4" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_4')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_5", icon: "🗺️", title: "5단계. 학습 안내", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">🗺️ 시간 중심 또는 테마 중의 스토리텔링 전략을 세워보세요.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px;">시간 중심 vs 테마 중심 구성 방식을 결정하고, 4페이지 분량의 구성을 간단한 스토리보드 형식으로 설명해 주세요.</div>
                    <textarea id="input-U4_5" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_5')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_6", icon: "🎨", title: "6단계. 수행 유도", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">🎨 실제 여행책의 표지와 내지 초안을 디자인해 봅니다.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px;">첫 번째 페이지(표지) 레이아웃 잡기! 제목의 위치와 사진의 배치를 고려한 디자인 구상을 구체적으로 적어주세요.</div>
                    <textarea id="input-U4_6" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_6')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` },
            {
                id: "U4_9", icon: "🚀", title: "9단계. 파지와 전이", content: `<div class="activity-info" style="background:#f8fafc; padding:15px; border-radius:10px; border-left:5px solid var(--primary); margin-bottom:20px; width:100%;"><p style="margin:0; font-size:1.05rem;">🚀 경험을 확장하고 실제 인쇄물로의 제작 가능성을 탐색합니다.</p></div>
                <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                    <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 활동 일지 작성</div>
                    <div style="background:#e0f2fe; padding:12px; border-radius:8px; color:#0369a1; font-size:0.95rem; margin-bottom:12px;">수업을 마친 후 일상을 기록하는 방식에 어떤 변화가 생겼나요? 실제 인쇄물로 제작할 수 있는 창의적인 방법을 탐색해 보세요.</div>
                    <textarea id="input-U4_9" class="worksheet-input" placeholder="내용을 입력하세요..." style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                    <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_9')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">활동 저장하기</button></div>
                </div>` }
        ]
    },
    2: {
        title: "프로젝트 2: 독립서점",
        desc: "나만의 책을 출판하고 세상과 만나는 서점 운영하기",
        steps: [
            {
                id: "U4_BS_1",
                icon: "📝",
                title: "1단계. 서점 기획",
                content: `<div class="activity-info"><p>어떤 서점을 만들고 싶나요?</p></div>
                    <div class="worksheet-section" style="background:white; padding:25px; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                        <div class="input-header" style="font-weight:700; margin-bottom:15px; color:#334155; display:flex; align-items:center; gap:8px; font-size:1.1rem;">✏️ 서점 기획서 작성</div>
                        <div style="margin-bottom:15px;">
                            <label class="worksheet-label" style="display:block; font-weight:600; color:#475569; margin-bottom:5px;">서점 이름</label>
                            <input type="text" id="input-U4_BS_name" class="worksheet-text-input" placeholder="ex. 달빛 서점" style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label class="worksheet-label" style="display:block; font-weight:600; color:#475569; margin-bottom:5px;">서점의 주력 테마</label>
                            <textarea id="input-U4_BS_theme" class="worksheet-input" placeholder="어떤 종류의 책들을 주로 큐레이션하고 싶나요?" style="width:100%; min-height:100px; padding:15px; border:1px solid #cbd5e1; border-radius:10px; background:#f8fafc;"></textarea>
                        </div>
                        <div style="text-align:right; margin-top:20px;"><button class="complete-btn" onclick="saveMyWork('U4_BS_1')" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px rgba(0,0,0,0.1);">기획 저장하기</button></div>
                    </div>`
            },
            {
                id: "U4_BS_2",
                icon: "🏪",
                title: "2단계. 서점 운영 (책 등록)",
                isBookstore: true,
                content: `
                <div class="bookshelf-view">
                    <div style="background:var(--primary); color:white; padding:20px; border-radius:15px 15px 0 0; text-align:center;">
                        <h2 style="margin:0; font-size:1.5rem;">📚 작가의 책장</h2>
                        <p style="margin:5px 0 0; opacity:0.9;">여러분이 만든 책이 세상과 만나는 공간입니다.</p>
                    </div>
                    <!-- Book Registration Form -->
                    <div class="registration-form" style="background: white; padding: 25px; border-radius: 0 0 15px 15px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border:1px solid #e2e8f0; margin-bottom: 40px;">
                        <div style="font-weight:700; font-size:1.1rem; margin-bottom:20px; color:#1e293b; display:flex; align-items:center; gap:8px;">✨ 나의 책 등록하기</div>
                        <div class="worksheet-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div><label class="worksheet-label" style="font-size:0.9rem; color:#64748b;">책 제목</label><input type="text" id="reg-title" class="worksheet-text-input" placeholder="제목" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;"></div>
                            <div><label class="worksheet-label" style="font-size:0.9rem; color:#64748b;">저자</label><input type="text" id="reg-author" class="worksheet-text-input" placeholder="이름" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;"></div>
                            <div><label class="worksheet-label" style="font-size:0.9rem; color:#64748b;">출판사</label><input type="text" id="reg-publisher" class="worksheet-text-input" placeholder="출판사명" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;"></div>
                        </div>
                        <div style="margin-bottom: 25px;">
                            <label class="worksheet-label" style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:8px;">표지 테마 선택</label>
                            <div class="color-picker" style="display: flex; gap: 12px;">
                                <div class="color-swatch active" style="background: linear-gradient(135deg, #6366f1, #a855f7); width:35px; height:35px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 0 0 2px #6366f1;" onclick="selectColor(this, 'linear-gradient(135deg, #6366f1, #a855f7)')"></div>
                                <div class="color-swatch" style="background: linear-gradient(135deg, #f59e0b, #d97706); width:35px; height:35px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 0 0 1px #e2e8f0;" onclick="selectColor(this, 'linear-gradient(135deg, #f59e0b, #d97706)')"></div>
                                <div class="color-swatch" style="background: linear-gradient(135deg, #10b981, #059669); width:35px; height:35px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 0 0 1px #e2e8f0;" onclick="selectColor(this, 'linear-gradient(135deg, #10b981, #059669)')"></div>
                                <div class="color-swatch" style="background: linear-gradient(135deg, #ef4444, #b91c1c); width:35px; height:35px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 0 0 1px #e2e8f0;" onclick="selectColor(this, 'linear-gradient(135deg, #ef4444, #b91c1c)')"></div>
                                <div class="color-swatch" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); width:35px; height:35px; border-radius:50%; cursor:pointer; border:3px solid #fff; box-shadow:0 0 0 1px #e2e8f0;" onclick="selectColor(this, 'linear-gradient(135deg, #3b82f6, #1d4ed8)')"></div>
                            </div>
                        </div>
                        <button class="complete-btn" onclick="registerBook()" style="background: var(--primary); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight:700; width:100%; transition:all 0.2s;">책장에 등록하기</button>
                    </div>
                    <div class="shelf" style="background: #f1f5f9; padding: 40px 20px; border-radius: 15px; min-height: 250px; border:1px solid #e2e8f0; position:relative;">
                        <div style="position:absolute; top:10px; left:20px; font-size:0.8rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Class Bookshelf</div>
                        <div class="book-display" id="bookshelf-container" style="display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;"></div>
                    </div>
                </div>`
            },
            {
                id: "U4_BS_3",
                icon: "📢",
                title: "3단계. 홍보 및 큐레이션",
                content: `
                <div class="curation-section" style="text-align: center;">
                    <div style="display: inline-block; background: #e0e7ff; color: #4338ca; padding: 6px 18px; border-radius: 25px; font-weight: 800; margin-bottom: 15px; font-size:0.9rem; letter-spacing:0.5px;">TRAVEL CURATION</div>
                    <h2 style="margin-top: 5px; font-size: 2.2rem; font-weight: 800; color: #1e293b; letter-spacing:-1px;">함께 읽으면 좋은 추천 도서</h2>
                    <p class="subtitle" style="margin-bottom: 40px; color: #64748b; font-size:1.1rem;">여러분의 영감을 넓혀줄 엄선된 여행 도서들입니다.</p>
                    <div class="curation-grid" id="recommendation-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 30px; padding:20px;"></div>
                </div>
                `
            }
        ]
    }
};


// --- RENDER FUNCTIONS ---
let currentUnit1Lesson = 1;
let currentUnit2Lesson = 1;
let currentUnit3Lesson = 1;
let currentUnit4Lesson = 1;

function renderUnit1Lessons() {
    const listEl = document.getElementById('unit1-lessons-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    const lessons = [{ id: 1, title: '1차시: 여행의 시작' }, { id: 2, title: '2차시: 여행과 나' }, { id: 3, title: '3차시: 여행의 의미' }];
    lessons.forEach(lesson => {
        const i = lesson.id;
        const li = document.createElement('li');
        li.className = `step-item ${i === currentUnit1Lesson ? 'active' : ''}`;
        li.innerHTML = `<div class='step-circle'>${i}</div><div class='step-label'>${lesson.title}</div>`;
        li.onclick = () => {
            currentUnit1Lesson = i;
            renderUnit1Lessons();
            renderUnit1Steps();
            hideUnit1Activity();
        };
        listEl.appendChild(li);
    });
}
function renderUnit1Steps() {
    const lesson = unit1LessonData[currentUnit1Lesson];
    if (!lesson) return;
    const titleEl = document.getElementById('unit1-lesson-title');
    const descEl = document.getElementById('unit1-lesson-desc');
    const gridEl = document.getElementById('unit1-steps-grid');
    if (titleEl) {
        titleEl.innerText = lesson.title;
        titleEl.style.cursor = 'pointer';
        titleEl.title = "목록으로 돌아가기";
        titleEl.onclick = hideUnit1Activity;
    }
    if (descEl) descEl.innerText = lesson.desc;
    if (gridEl) {
        gridEl.innerHTML = '';
        lesson.steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'step-card card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.cursor = 'pointer';
            card.onclick = () => showUnit1Activity(step.id);
            card.innerHTML = `<span class='step-icon' style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">${step.icon}</span><span class='step-title' style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${step.title}</span>`;
            gridEl.appendChild(card);
            setTimeout(() => { card.style.transition = 'all 0.5s ease'; card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, i * 100);
        });
    }
}
function showUnit1Activity(stepId) {
    const gridEl = document.getElementById('unit1-steps-grid');
    const titleEl = document.getElementById('unit1-lesson-title');
    const descEl = document.getElementById('unit1-lesson-desc');
    const viewEl = document.getElementById('unit1-activity-view');
    const contentEl = document.getElementById('unit1-activity-content');
    const lesson = unit1LessonData[currentUnit1Lesson];
    if (!lesson) return;
    const step = lesson.steps.find(s => s.id === stepId);
    if (!step) return;

    if (gridEl) gridEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'block';
    if (descEl) descEl.style.display = 'none';
    if (viewEl) viewEl.style.display = 'block';

    if (step && contentEl) {
        let boardArea = "";
        // For stats steps, we want to show the results even if hideBoard is true
        if (!step.hideBoard || step.isStats) {
            let nameVal = currentUser ? (currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser) : "";
            let nameStyle = currentUser ? "display:none;" : "width:100px; flex:none;";
            let inputHtml = (step.hideBoardInput || step.isStats) ? "" : `<div class="input-group">
                <input type="text" id="unit1-student-name-input" placeholder="성명" value="${nameVal}" style="${nameStyle}">
                <input type="text" id="unit1-student-text-input" placeholder="함께 나눌 내용 입력...">
                <button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1Response('${step.id}')">공유</button>
            </div>`;
            boardArea = `<div class="response-board"><h3>${step.isStats ? "📊 참여 통계" : "👥 공유 공간"}</h3>${inputHtml}<div id="unit1-display-area"></div></div>`;
        }

        contentEl.innerHTML = `<h2 style="color:var(--primary); margin-bottom:2rem; font-family: 'Gamja Flower', cursive;">${step.icon} ${step.title}</h2><div class="activity-body">${step.content || '<p>활동 내용이 없습니다.</p>'}</div>${boardArea}`;

        // Auto-fill names in content if logged in
        if (currentUser) {
            const nameVal = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
            const subNameInputs = ['unit1-pc-name', 'unit1-sync-name', 'unit1-student-quiz-name'];
            subNameInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = nameVal;
                    el.style.display = 'none'; // Hide if already logged in
                }
            });
        }

        if (step.id === '2-6') initUnit1Whiteboard();

        // Use the real stats renderer from unit1_functions.js
        if (typeof renderUnit1Stats === 'function' && step.isStats) {
            const area = document.getElementById('unit1-display-area');
            if (area) renderUnit1Stats(area);
        }

        if (step.id === 'U4_BS' || step.id === 'U4_BS_2' || step.isBookstore) {
            setTimeout(() => { renderBookshelf(); }, 100);
        }
        if (step.id === 'U4_BS_3') {
            setTimeout(renderRecommendations, 100);
        }

        updateUnit1Board(step.id);

        // Navigation Buttons Logic (Prev/Next)
        const currentIndex = lesson.steps.findIndex(s => s.id === stepId);
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-buttons-container';
        navContainer.style.display = 'flex';
        navContainer.style.justifyContent = 'center';
        navContainer.style.gap = '20px';
        navContainer.style.marginTop = '40px';
        navContainer.style.marginBottom = '20px';

        // Previous Button
        if (currentIndex > 0) {
            const prevStep = lesson.steps[currentIndex - 1];
            const prevBtn = document.createElement('button');
            prevBtn.className = 'prev-step-btn';
            prevBtn.style.cssText = 'background:#f1f5f9; color:#475569; padding:12px 24px; border-radius:30px; border:1px solid #e2e8f0; cursor:pointer; font-weight:bold; font-size:1rem; transition: transform 0.2s;';
            prevBtn.innerHTML = `<i class="fas fa-arrow-left"></i> 이전 단계`;
            prevBtn.onclick = () => showUnit1Activity(prevStep.id);
            prevBtn.onmouseover = function () { this.style.transform = 'scale(1.05)'; this.style.background = '#e2e8f0'; };
            prevBtn.onmouseout = function () { this.style.transform = 'scale(1)'; this.style.background = '#f1f5f9'; };
            navContainer.appendChild(prevBtn);
        }

        // Next Button
        if (currentIndex < lesson.steps.length - 1) {
            const nextStep = lesson.steps[currentIndex + 1];
            const nextBtn = document.createElement('button');
            nextBtn.className = 'next-step-btn';
            nextBtn.style.cssText = 'background:var(--primary); color:white; padding:12px 24px; border-radius:30px; border:none; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-size:1rem; transition: transform 0.2s;';
            nextBtn.innerHTML = `다음 단계: ${nextStep.title.split('.')[1] || nextStep.title} <i class="fas fa-arrow-right"></i>`;
            nextBtn.onclick = () => showUnit1Activity(nextStep.id);
            nextBtn.onmouseover = function () { this.style.transform = 'scale(1.05)'; };
            nextBtn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            navContainer.appendChild(nextBtn);
        }

        if (navContainer.children.length > 0) {
            contentEl.appendChild(navContainer);
        }

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

// GENERIC RENDERER FOR UNIT 2, 3, 4
function renderUnitLessons(unitId) {
    const listEl = document.getElementById(`${unitId}-lessons-list`);
    if (!listEl) return;
    listEl.innerHTML = '';

    let currentLesson;
    if (unitId === 'unit2') currentLesson = currentUnit2Lesson;
    else if (unitId === 'unit3') currentLesson = currentUnit3Lesson;
    else currentLesson = currentUnit4Lesson;

    const data = unitDataMap[unitId];
    if (!data) return;

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
            hideUnitActivity(unitId);
        };
        listEl.appendChild(li);
    });
}
function renderUnitSteps(unitId) {
    let lessonIdx;
    if (unitId === 'unit2') lessonIdx = currentUnit2Lesson;
    else if (unitId === 'unit3') lessonIdx = currentUnit3Lesson;
    else lessonIdx = currentUnit4Lesson;

    const data = unitDataMap[unitId];
    if (!data) return;
    const lesson = data[lessonIdx];
    if (!lesson) return;

    const titleEl = document.getElementById(`${unitId}-lesson-title`);
    const descEl = document.getElementById(`${unitId}-lesson-desc`);
    const gridEl = document.getElementById(`${unitId}-steps-grid`);

    if (titleEl) {
        titleEl.style.display = 'block';
        titleEl.innerText = lesson.title;
        titleEl.style.cursor = 'pointer';
        titleEl.title = "목록으로 돌아가기";
        titleEl.onclick = () => hideUnitActivity(unitId);
    }
    if (descEl) { descEl.style.display = 'block'; descEl.innerText = lesson.desc; }

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
            setTimeout(() => { card.style.transition = 'all 0.5s ease'; card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, i * 100);
        });
    }
}
function showUnitActivity(unitId, stepId) {
    let lessonIdx;
    if (unitId === 'unit2') lessonIdx = currentUnit2Lesson;
    else if (unitId === 'unit3') lessonIdx = currentUnit3Lesson;
    else lessonIdx = currentUnit4Lesson;

    const lesson = unitDataMap[unitId][lessonIdx];
    const step = lesson.steps.find(s => s.id === stepId);

    const gridEl = document.getElementById(`${unitId}-steps-grid`);
    const titleEl = document.getElementById(`${unitId}-lesson-title`);
    const descEl = document.getElementById(`${unitId}-lesson-desc`);
    const viewEl = document.getElementById(`${unitId}-activity-view`);
    const contentEl = document.getElementById(`${unitId}-activity-content`);

    if (gridEl) gridEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'block'; // Keep clickable title visible
    if (descEl) descEl.style.display = 'none';
    if (viewEl) viewEl.classList.remove('hidden');
    if (viewEl) viewEl.style.display = 'block';


    if (contentEl) {
        contentEl.innerHTML = `
            <h2>${step.icon} ${step.title}</h2>
            <div class="activity-content">${step.content}</div>
        `;

        // Navigation Buttons Logic (Prev/Next)
        const currentIndex = lesson.steps.findIndex(s => s.id === stepId);
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-buttons-container';
        navContainer.style.display = 'flex';
        navContainer.style.justifyContent = 'center';
        navContainer.style.gap = '20px';
        navContainer.style.marginTop = '40px';
        navContainer.style.marginBottom = '20px';

        // Previous Button
        if (currentIndex > 0) {
            const prevStep = lesson.steps[currentIndex - 1];
            const prevBtn = document.createElement('button');
            prevBtn.className = 'prev-step-btn';
            const accentColor = unitId === 'unit2' ? '#74b9ff' : (unitId === 'unit3' ? '#55efc4' : '#a29bfe');
            prevBtn.style.cssText = `background:#f8fafc; color:#64748b; padding:12px 24px; border-radius:30px; border:1px solid #e2e8f0; cursor:pointer; font-weight:bold; font-size:1rem; transition: all 0.2s;`;
            prevBtn.innerHTML = `<i class="fas fa-arrow-left"></i> 이전 단계`;
            prevBtn.onclick = () => showUnitActivity(unitId, prevStep.id);
            prevBtn.onmouseover = function () { this.style.transform = 'scale(1.05)'; this.style.borderColor = accentColor; this.style.color = accentColor; };
            prevBtn.onmouseout = function () { this.style.transform = 'scale(1)'; this.style.borderColor = '#e2e8f0'; this.style.color = '#64748b'; };
            navContainer.appendChild(prevBtn);
        }

        // Next Button
        if (currentIndex < lesson.steps.length - 1) {
            const nextStep = lesson.steps[currentIndex + 1];
            const nextBtn = document.createElement('button');
            nextBtn.className = 'next-step-btn';
            const primaryColor = unitId === 'unit2' ? '#0984e3' : (unitId === 'unit3' ? '#00b894' : '#6c5ce7');
            nextBtn.style.cssText = `background:${primaryColor}; color:white; padding:12px 24px; border-radius:30px; border:none; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-size:1rem; transition: transform 0.2s;`;
            nextBtn.innerHTML = `다음 단계: ${nextStep.title.split('.')[1] || nextStep.title} <i class="fas fa-arrow-right"></i>`;
            nextBtn.onclick = () => showUnitActivity(unitId, nextStep.id);
            nextBtn.onmouseover = function () { this.style.transform = 'scale(1.05)'; };
            nextBtn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            navContainer.appendChild(nextBtn);
        }

        if (navContainer.children.length > 0) {
            contentEl.appendChild(navContainer);
        }

        // Handle specific logic for Unit 4 Bookstore
        if (unitId === 'unit4') {
            if (step.id === 'U4_BS_2' || step.isBookstore) {
                setTimeout(() => { renderBookshelf(); }, 100);
            }
            if (step.id === 'U4_BS_3') {
                setTimeout(renderRecommendations, 100);
            }
        }
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
    if (viewEl) viewEl.classList.add('hidden');
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
    { title: '여행의 이유', author: '김영하', publisher: '문학동네', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }
];
let selectedCoverColor = 'linear-gradient(135deg, #6366f1, #a855f7)';
let recommendedBooks = [
    { t: "여행의 이유", a: "김영하", p: "문학동네", theme: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
    { t: "소년이 온다", a: "한강", p: "창비", theme: "linear-gradient(135deg, #1e293b, #0f172a)" },
    { t: "불편한 편의점", a: "김호연", p: "나무옆의자", theme: "linear-gradient(135deg, #fef3c7, #fde68a)", dark: true },
    { t: "달러구트 꿈 백화점", a: "이미예", p: "팩토리나인", theme: "linear-gradient(135deg, #4c1d95, #7c3aed)" },
    { t: "데미안", a: "헤르만 헤세", p: "민음사", theme: "linear-gradient(135deg, #064e3b, #065f46)" },
    { t: "어린 왕자", a: "생텍쥐페리", p: "열린책들", theme: "linear-gradient(135deg, #fbbf24, #d97706)" },
    { t: "연금술사", a: "파울로 코엘료", p: "문학동네", theme: "linear-gradient(135deg, #f59e0b, #b45309)" },
    { t: "지구 끝의 온실", a: "김초엽", p: "자이언트북스", theme: "linear-gradient(135deg, #1e1b4b, #312e81)" }
];

function selectColor(el, color) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 0 0 2px var(--primary)";
    selectedCoverColor = color;
}

function registerBook() {
    const title = document.getElementById('reg-title').value.trim();
    const author = document.getElementById('reg-author').value.trim();
    const publisher = document.getElementById('reg-publisher').value.trim();
    if (!title || !author || !publisher) { alert('빈 칸을 입력해 주세요!'); return; }
    registeredBooks.push({ title, author, publisher, color: selectedCoverColor });
    renderBookshelf();
    document.getElementById('reg-title').value = '';
    document.getElementById('reg-author').value = '';
    document.getElementById('reg-publisher').value = '';

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
        alert('책이 등록되었습니다!');
    }
}

function renderBookshelf() {
    const container = document.getElementById('bookshelf-container');
    if (!container) return;
    if (registeredBooks.length > 0) {
        container.innerHTML = registeredBooks.map(book => `
        <div class='book-item' style='background: ${book.color}; width: 140px; height: 200px; border-radius: 10px; display: flex; flex-direction: column; padding: 15px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; transition: transform 0.2s;'>
            <div class='book-cover-title' style='font-size: 1rem; font-weight: 700; word-break: keep-all; line-height: 1.2; text-shadow: 0 1px 2px rgba(0,0,0,0.2);'>${book.title}</div>
            <div style='flex: 1; display: flex; align-items: center; justify-content: center; opacity: 0.3; font-size: 2.5rem;'>📖</div>
            <div class='book-cover-author' style='font-size: 0.8rem; opacity: 0.9; margin-bottom: 2px;'>${book.author}</div>
            <div class='book-cover-publisher' style='font-size: 0.7rem; opacity: 0.7;'>${book.publisher}</div>
        </div>`).join('');
    } else {
        container.innerHTML = "<div class='book-item empty-book' style='width:100%; text-align:center; color:#94a3b8; padding:20px;'>작성된 책이 없습니다.</div>";
    }
}

function renderRecommendations() {
    const container = document.getElementById('recommendation-grid');
    if (!container) return;
    container.innerHTML = recommendedBooks.map(book => {
        const style = `background: ${book.theme || 'linear-gradient(135deg, #f8fafc, #f1f5f9)'};`;
        const textColor = book.dark ? '#1e293b' : 'white';

        return `
            <a href="https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(book.t + ' ' + book.a)}" 
               target="_blank" class="book-item" 
               style="${style} width: 100%; height: 220px; border-radius: 12px; display: flex; flex-direction: column; padding: 15px; text-decoration: none; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div class="book-cover-content" style="height:100%; display:flex; flex-direction:column;">
                    <div class="book-cover-title" style="color: ${textColor}; font-weight:700; font-size:1.1rem; margin-bottom:10px;">${book.t}</div>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; opacity: 0.2; font-size: 3rem; color: ${textColor};">📖</div>
                    <div class="book-cover-author" style="color: ${textColor}; opacity: 0.9; font-size:0.9rem;">${book.a}</div>
                    <div class="book-cover-publisher" style="color: ${textColor}; opacity: 0.7; font-size:0.8rem;">${book.p}</div>
                </div>
            </a>
        `;
    }).join('');
}


function saveMyWork(id) {
    if (!currentUser) {
        alert('로그인이 필요한 기능입니다. 게스트 모드에서는 저장되지 않습니다.');
        return;
    }
    // Simple mock save
    alert('작성 내용이 저장되었습니다! (ID: ' + currentUser + ')');

    // In a real app, we would select the input value and save to localStorage or DB

}

// Mock statistics removed. Using real participation stats from unit1_functions.js
