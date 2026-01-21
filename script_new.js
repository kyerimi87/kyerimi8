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

// --- UNIT 1 LESSON DATA --- (Re-adding just for completeness, omitted detailed data for brevity in thought but including in file)
const unit1LessonData = { 1: { title: "1차시: 여행에서 만난 나", desc: "우리는 왜 여행을 떠날까요? 여행의 첫걸음을 떼어봅니다.", steps: [{ id: "1-1", icon: "🌍", title: "1. 나에게 여행이란?", content: '<h3>브레인스토밍: 여행의 정의</h3><p>친구들이 생각하는 \'여행\'은 어떤 단어로 표현될까요?</p>', isWordCloud: true }, { id: "1-2", icon: "📸", title: "2. 인생 여행지 공유", content: '<h3>인생 여행 사진 공유</h3><div class="file-zone" id="unit1-drop-zone-1-2" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-2\')"><p>📸 드래그하거나 클릭하여 업로드</p><input type="file" id="unit1-photo-input-1-2" style="display:none" onchange="handleFileSelect(event, \'1-2\')"></div>', hideBoardInput: true, isPhotoGallery: true }, { id: "1-3", icon: "📄", title: "3. 활동지 다운로드", content: '<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_1차시_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'1-3\')" download>⬇️ 1차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "1-4", icon: "🎒", title: "4. 나의 가방 속 물건", content: '<h3>가방 필수템</h3><p>물건을 적어주세요. 많이 나오면 커집니다!</p>', isWordCloud: true }, { id: "1-5", icon: "💬", title: "5. 여행 목적 설문", content: '<h3>여행의 이유</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'휴식\')">휴식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'모험\')">모험</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'음식\')">음식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'역사\')">역사</button><button class="quiz-btn" onclick="showUnit1OtherInput()">기타</button></div><div id="unit1-other-input-area" style="display:none; margin-top:10px;" class="input-group"><input type="text" id="unit1-survey-other" placeholder="기타..."><button class="back-btn" style="margin:0" onclick="submitUnit1Survey(\'1-5\', \'기타\')">확인</button></div>', isGraphicOrganizer: true, hideBoardInput: true }, { id: "1-6", icon: "🗺️", title: "6. 가보고 싶은 곳", content: '<h3>꿈꾸는 여행지</h3><p>지도를 보며 가고 싶은 곳의 링크를 공유해 주세요.</p><a href="https://maps.google.com" target="_blank" class="download-link" style="background:#4285F4">🌐 지도 열기</a>', isMapLink: true }, { id: "1-7", icon: "📤", title: "7. 과제 제출", content: '<h3>과제 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-7\')"><p>📂 드래그하여 업로드</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "1-8", icon: "💡", title: "8. 여행 상식 퀴즈", content: '<div id="unit1-quiz-init" class="input-group"><input type="text" id="unit1-student-quiz-name" placeholder="이름 입력"><button class="back-btn" style="margin:0" onclick="startUnit1QuizWithName()">시작</button></div><div id="unit1-quiz-area"></div>', isQuiz: true, hideBoardInput: true }, { id: "1-9", icon: "📅", title: "9. 1차시 마무리", content: '<h3>소감 나누기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="소감 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'1-9\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "1-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] }, 2: { title: "2차시: 여행과 나의 성장", desc: "여행은 우리를 어떻게 변화시킬까요? 성장의 시간을 기록합니다.", steps: [{ id: "2-1", icon: "🧩", title: "1. 여행 테마 정하기", content: "<h3>나만의 여행 테마</h3><p>내가 계획하고 싶은 여행 테마는 무엇인가요?</p>", isWordCloud: true }, { id: "2-2", icon: "🚶", title: "2. 걷기 여행의 토론", content: '<h3>느리게 걷기 토론</h3><p>도보 여행의 특징을 장점과 단점으로 구분하여 적어봅시다.</p><div class="input-group" style="background:#fff; border:1px solid #ddd;"><input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;"><select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;"><option value="장점">✅ 장점</option><option value="단점">❌ 단점</option></select><input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요..."><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'2-2\')">공유</button></div>', isProsCons: true, hideBoardInput: true }, { id: "2-3", icon: "🚌", title: "3. 대중교통 이용", content: "<h3>현지 교통수단</h3><p>여행지에서 이용하고 싶은 교통수단을 적어주세요. 연결망으로 시각화됩니다.</p>", isNodeGraph: true }, { id: "2-4", icon: "🍽️", title: "4. 현지 음식 문화", content: "<h3>맛의 모험</h3><p>가장 먹어보고 싶은 이색 음식은? 많이 나온 키워드가 크게 보입니다.</p>", isBubbleChart: true }, { id: "2-5", icon: "📄", title: "5. 활동지 다운로드", content: '<div class="content-block"><h3>필수 활동지</h3><a href="1단원/여행에서_만난_나_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'2-5\')" download>⬇️ 2차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "2-6", icon: "🎨", title: "6. 여행 일러스트", content: '<h3>그림으로 나누는 여행</h3><div class="canvas-wrapper"><canvas id="unit1-whiteboard" width="600" height="400"></canvas><div class="canvas-ctrl"><input type="color" id="unit1-get-pen-color" value="#4A90E2"><button class="back-btn" style="margin:0" onclick="clearUnit1Canvas()">지우기</button><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="postUnit1Canvas(\'2-6\')">그림 공유</button></div></div><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-6\')"><p>🎨 그림 파일 업로드 (드래그)</p></div>', isPhotoGallery: true, hideBoardInput: true }, { id: "2-7", icon: "🎵", title: "7. 여행 플레이리스트", content: '<h3>유튜브 음악 공유</h3><p>추천하고 싶은 여행 음악의 유튜브 링크를 공유해 주세요.</p><a href="https://www.youtube.com" target="_blank" class="youtube-card">🎬 유튜브 바로가기</a>', isPlaylist: true }, { id: "2-8", icon: "📤", title: "8. 활동 결과 제출", content: '<h3>자료 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-8\')"><p>📁 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "2-9", icon: "✨", title: "9. 성장의 한마디", content: '<h3>나의 다짐</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="나의 다짐 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'2-9\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "2-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] }, 3: { title: "3차시: 여행의 의미 발견", desc: "수업을 마무리하며 나만의 여행 의미를 정의합니다.", steps: [{ id: "3-1", icon: "📕", title: "1. 발췌독 활동지", content: '<div class="content-block"><h3>최종 활동지</h3><a href="1단원/여행_발췌독_연계_활동지_3차시.pdf" class="download-link" onclick="handleTrackedDownload(event, \'3-1\')" download>⬇️ 3차시 활동지 다운로드</a></div>', hideBoard: true }, { id: "3-2", icon: "✍️", title: "2. 여행 에세이 쓰기", content: '<h3>나의 여행 이야기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="짧은 에세이 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'3-2\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "3-3", icon: "🤝", title: "3. 모둠 여행 계획", content: "<h3>우리 팀의 계획</h3><p>함께 가고 싶은 도시들을 적어보세요. 연결망으로 보여집니다.</p>", isNodeGraph: true }, { id: "3-4", icon: "🏛️", title: "4. 보호해야 할 유산", content: "<h3>소중한 문화유산</h3><p>우리가 지켜야 할 장소는 어디일까요?</p>", isBubbleChart: true }, { id: "3-5", icon: "🌿", title: "5. 에코 투어리즘", content: '<h3>환경을 위한 선택</h3><div class="input-group" style="background:#fff; border:1px solid #ddd;"><input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;"><select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;"><option value="장점">✅ 찬성/장점</option><option value="단점">❌ 반대/단점</option></select><input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요..."><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'3-5\')">공유</button></div>', isProsCons: true, hideBoardInput: true }, { id: "3-6", icon: "🔭", title: "6. 미래의 여행", content: "<h3>우주 여행 시대</h3><p>미래 여행하면 떠오르는 단어를 적어주세요.</p>", isWordCloud: true }, { id: "3-7", icon: "📊", title: "7. 수업 만족도", content: '<h3>오늘 수업은?</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'최고예요\')">최고예요! 👍</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'좋아요\')">좋아요 😊</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'보통예요\')">보통예요 😐</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'아쉬워요\')">아쉬워요 😢</button></div>', isGraphicOrganizer: true, hideBoardInput: true }, { id: "3-8", icon: "📤", title: "8. 최종 포트폴리오", content: '<h3>최종 결과물 제출</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'3-8\')"><p>📁 최종 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true }, { id: "3-9", icon: "⭐", title: "9. 최종 마무리", content: '<h3>수업을 마치며</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="수업 총평을 적어주세요..." onkeypress="handleUnit1EnterSync(event, \'3-9\')"></div>', isLiveSync: true, hideBoardInput: true }, { id: "3-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }] } };

let currentUnit1Lesson = 1;
let currentUnit2Lesson = 1;
let currentUnit3Lesson = 1;
let currentUnit4Lesson = 1;

function renderUnit1Lessons() {
    const lessonsList = document.getElementById('unit1-lessons-list');
    if (!lessonsList) return;
    lessonsList.innerHTML = '';
    const lessons = [{ id: 1, title: '1차시: 여행의 시작' }, { id: 2, title: '2차시: 여행과 나' }, { id: 3, title: '3차시: 여행의 의미' }];
    lessons.forEach(lesson => {
        const i = lesson.id;
        const li = document.createElement('li');
        li.className = `step-item ${i === currentUnit1Lesson ? 'active' : ''}`;
        li.innerHTML = `<div class='step-circle'>${i}</div><div class='step-label'>${lesson.title}</div>`;
        li.onclick = () => { if (currentUnit1Lesson === i) return; currentUnit1Lesson = i; renderUnit1Lessons(); renderUnit1Steps(); };
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
    if (titleEl) titleEl.style.display = 'none';
    if (descEl) descEl.style.display = 'none';
    if (viewEl) viewEl.style.display = 'block';
    if (step && contentEl) {
        let boardArea = "";
        if (!step.hideBoard) {
            let inputHtml = step.hideBoardInput ? "" : `<div class="input-group"><input type="text" id="unit1-student-name-input" placeholder="성명" style="width:100px; flex:none;"><input type="text" id="unit1-student-text-input" placeholder="함께 나눌 내용 입력..."><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1Response('${step.id}')">공유</button></div>`;
            boardArea = `<div class="response-board"><h3>👥 공유 공간</h3>${inputHtml}<div id="unit1-display-area"></div></div>`;
        }
        contentEl.innerHTML = `<h2 style="color:var(--primary); margin-bottom:2rem; font-family: 'Gamja Flower', cursive;">${step.icon} ${step.title}</h2><div class="activity-body">${step.content || '<p>활동 내용이 없습니다.</p>'}</div>${boardArea}`;
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
