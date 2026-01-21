// ===== UNIT 1 COMPLETE INTERACTIVE FUNCTIONS =====
// This file contains all interactive functionality from the 1단원 folder

// --- Data Persistence ---
let unit1SharedResponses = {
    "1-1": {}, "1-2": [], "1-4": {}, "1-5": { "휴식": 0, "모험": 0, "음식": 0, "역사": 0, "기타": 0 },
    "1-6": [], "1-7": [], "1-8": [], "1-9": [],
    "2-1": {}, "2-2": { "장점": [], "단점": [] }, "2-3": [], "2-4": {}, "2-6": [], "2-7": [], "2-8": [], "2-9": [],
    "3-2": [], "3-3": [], "3-4": {}, "3-5": { "장점": [], "단점": [] }, "3-6": {}, "3-7": { "최고예요": 0, "좋아요": 0, "보통예요": 0, "아쉬워요": 0 }, "3-8": [], "3-9": []
};

let unit1Participation = {};

function saveUnit1Data() {
    try {
        localStorage.setItem('unit1_sharedResponses', JSON.stringify(unit1SharedResponses));
        localStorage.setItem('unit1_participation', JSON.stringify(unit1Participation));
    } catch (e) {
        console.error("저장에 실패했습니다.", e);
    }
}

function loadUnit1Data() {
    try {
        const savedResponses = localStorage.getItem('unit1_sharedResponses');
        const savedParticipation = localStorage.getItem('unit1_participation');
        if (savedResponses) unit1SharedResponses = JSON.parse(savedResponses);
        if (savedParticipation) unit1Participation = JSON.parse(savedParticipation);
    } catch (e) {
        console.error("데이터 로드 중 오류 발생", e);
    }
}

function recordUnit1Participation(name, stepId) {
    if (!name) return;
    const cleanName = name.trim();
    if (!unit1Participation[cleanName]) unit1Participation[cleanName] = {};
    unit1Participation[cleanName][stepId] = true;
    saveUnit1Data();
}

// --- Quiz Questions ---
let unit1QuizQuestions = [
    { q: "세계에서 가장 작은 나라는?", a: ["바티칸 시국", "모나코", "나우루", "투발루"], c: 0 },
    { q: "프랑스의 수도는?", a: ["런던", "베를린", "파리", "마드리드"], c: 2 },
    { q: "에펠탑이 있는 도시는?", a: ["로마", "파리", "뉴욕", "도쿄"], c: 1 },
    { q: "자유의 여신상이 있는 나라는?", a: ["영국", "프랑스", "미국", "캐나다"], c: 2 },
    { q: "피라미드로 유명한 나라는?", a: ["그리스", "이탈리아", "이집트", "멕시코"], c: 2 },
    { q: "일본의 수도는?", a: ["오사카", "교토", "도쿄", "후쿠오카"], c: 2 },
    { q: "캥거루가 상징인 나라는?", a: ["뉴질랜드", "호주", "남아공", "브라질"], c: 1 },
    { q: "중국의 만리장성이 있는 나라는?", a: ["한국", "일본", "중국", "베트남"], c: 2 },
    { q: "이탈리아에서 피자로 유명한 도시는?", a: ["로마", "베네치아", "나폴리", "밀라노"], c: 2 },
    { q: "타지마할이 있는 나라는?", a: ["태국", "인도", "베트남", "인도네시아"], c: 1 }
];

let unit1QuizState = { currentIdx: 0, score: 0, studentName: "" };

// --- File Upload Functions ---
function allowDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDrop(e, stepId) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) processUpload(files[0], stepId);
}

function handleFileSelect(e, stepId) {
    const files = e.target.files;
    if (files.length > 0) processUpload(files[0], stepId);
}

function processUpload(file, stepId) {
    const reader = new FileReader();
    reader.onload = (e) => {
        let name = "";
        if (typeof currentUser !== 'undefined' && currentUser) {
            name = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
        } else {
            name = prompt("본인 성명을 입력하세요:");
        }

        if (!name) return;
        const fileContent = e.target.result;
        recordUnit1Participation(name, stepId);
        if (stepId.includes('1-2') || stepId.includes('2-6')) {
            unit1SharedResponses[stepId].push({ name: name.toString().trim(), img: fileContent, likes: 0 });
        } else {
            unit1SharedResponses[stepId].push({ name: name.toString().trim(), fileName: file.name, data: fileContent, type: file.type });
        }
        saveUnit1Data();
        updateUnit1Board(stepId);
    };
    reader.readAsDataURL(file);
}

function openFile(data, fileName) {
    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    link.click();
}

function handleTrackedDownload(e, stepId) {
    let name = "";
    if (typeof currentUser !== 'undefined' && currentUser) {
        name = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
    } else {
        name = prompt("본인 성명을 입력하세요 (참여 통계용):");
    }

    if (!name) { e.preventDefault(); return; }
    recordUnit1Participation(name, stepId);
    console.log(`${name} 참여 기록됨`);
}

// --- Update Board Display ---
function updateUnit1Board(stepId) {
    const area = document.getElementById('unit1-display-area');
    if (!area) return;

    const data = unit1SharedResponses[stepId];
    const lesson = unit1LessonData[currentUnit1Lesson];
    const step = lesson.steps.find(s => s.id === stepId);

    if (step?.isStats) {
        renderUnit1Stats(area);
        return;
    }

    if (step?.isPhotoGallery) {
        area.setAttribute('class', 'photo-grid');
        area.innerHTML = data.map((r, i) => `<div class="photo-card"><img src="${r.img}"><span class="student-name">${r.name}</span><button class="like-btn" onclick="addUnit1Like('${stepId}', ${i})">❤️ ${r.likes}</button></div>`).reverse().join('');
    } else if (step?.isWordCloud) {
        area.setAttribute('class', 'word-cloud');
        area.innerHTML = Object.entries(data).map(([word, count]) => `<span class="cloud-item" style="font-size: ${1 + count * 0.4}rem;">${word}</span>`).join('');
    } else if (step?.isProsCons) {
        area.setAttribute('class', 'pros-cons-grid');
        area.innerHTML = `
            <div class="pc-box pc-pros"><h4>✅ 찬성/장점</h4>${data['장점'].map(r => `<div class="response-item"><span class="student-name">${r.name}</span>${r.text}</div>`).reverse().join('')}</div>
            <div class="pc-box pc-cons"><h4>❌ 반대/단점</h4>${data['단점'].map(r => `<div class="response-item"><span class="student-name">${r.name}</span>${r.text}</div>`).reverse().join('')}</div>`;
    } else if (step?.isNodeGraph) {
        area.setAttribute('class', 'node-container');
        area.innerHTML = `<div class="hub">${step.icon}</div>` +
            data.map((r, i) => {
                const angle = (i / data.length) * 2 * Math.PI;
                return `<div class="node" style="transform: translate(${Math.cos(angle) * 120}px, ${Math.sin(angle) * 120}px)">${r.text}</div>`;
            }).join('');
    } else if (step?.isBubbleChart) {
        area.setAttribute('class', 'bubble-container');
        area.innerHTML = Object.entries(data).map(([label, count]) => `<div class="bubble" style="width:${70 + count * 20}px; height:${70 + count * 20}px; font-size:${0.8 + count * 0.1}rem;">${label}<br>${count}</div>`).join('');
    } else if (step?.isGraphicOrganizer) {
        area.setAttribute('class', 'org-chart');
        area.innerHTML = Object.entries(data).map(([label, count]) => `<div class="org-node"><span class="count">${count}</span><span class="label">${label}</span></div>`).join('');
    } else if (step?.isAssignmentList) {
        area.setAttribute('class', '');
        area.innerHTML = data.map(r => `<div class="assign-item"><span><b>${r.name}</b>: ${r.fileName}</span><button class="back-btn" style="margin:0" onclick="openFile('${r.data}', '${r.fileName}')">📥 다운로드</button></div>`).reverse().join('');
    } else if (step?.isPlaylist || step?.isMapLink) {
        area.setAttribute('class', 'response-grid');
        area.innerHTML = data.map(r => {
            const isLink = r.text && r.text.includes('http');
            const content = isLink ? `<a href="${r.text}" target="_blank" class="map-link-shared">🔗 링크 열기</a>` : r.text;
            return `<div class="response-item"><span class="student-name">${r.name}</span>${content}</div>`;
        }).reverse().join('');
    } else {
        area.setAttribute('class', 'response-grid');
        area.innerHTML = (Array.isArray(data) ? data : []).map(r => `<div class="response-item"><span class="student-name">${r.name}</span>${r.text}</div>`).reverse().join('');
    }
}

function renderUnit1Stats(area) {
    area.setAttribute('class', 'stats-container');
    const lesson = unit1LessonData[currentUnit1Lesson];
    const steps = lesson.steps.filter(s => !s.isStats);
    const stepIds = steps.map(s => s.id);

    // Get all students who participated in ANY step of this lesson
    const studentNames = Object.keys(unit1Participation).filter(name =>
        stepIds.some(id => unit1Participation[name] && unit1Participation[name][id])
    ).sort();

    const totalStudents = 30; // Standard class enrollment
    const participantsCount = studentNames.length;

    // Calculate Phase-based Progress (Real Data)
    const getPhaseProgress = (startIdx, endIdx) => {
        let completions = 0;
        let possible = (endIdx - startIdx + 1) * totalStudents;
        for (let i = startIdx; i <= endIdx; i++) {
            const sid = stepIds[i];
            studentNames.forEach(name => {
                if (unit1Participation[name] && unit1Participation[name][sid]) completions++;
            });
        }
        return Math.round((completions / (possible || 1)) * 100);
    };

    const p1 = getPhaseProgress(0, 1); // Phase 1: Steps 1, 2
    const p2 = getPhaseProgress(2, 4); // Phase 2: Steps 3, 4, 5
    const p3 = getPhaseProgress(5, 7); // Phase 3: Steps 6, 7, 8
    const p4 = getPhaseProgress(8, 8); // Phase 4: Step 9

    const totalCompletions = studentNames.reduce((acc, name) => {
        return acc + stepIds.filter(sid => unit1Participation[name][sid]).length;
    }, 0);
    const activityAchievement = Math.round((totalCompletions / (totalStudents * steps.length || 1)) * 100);

    let html = `
    <div class="stats-header" style="text-align:center; margin-bottom:30px;">
        <h2 style="font-family:'Gamja Flower', cursive; font-size:2.5rem; color:var(--primary); margin-bottom:10px;">📊 ${currentUnit1Lesson}차시 학습 현황</h2>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:15px;">
            <button class="back-btn" onclick="clearCurrentUnit1LessonData()" style="margin:0; border-color:#3b82f6; color:#3b82f6; background:white; font-size:0.85rem; padding:8px 16px;"><i class="fas fa-eraser"></i> 이 차시만 초기화</button>
            <button class="back-btn" onclick="clearUnit1AllData()" style="margin:0; border-color:#ef4444; color:#ef4444; background:white; font-size:0.85rem; padding:8px 16px;"><i class="fas fa-trash-alt"></i> 전체 데이터 초기화</button>
            <button class="back-btn" onclick="downloadUnit1Excel()" style="margin:0; background: #2e7d32; color:white; border:none; font-size:0.85rem; padding:8px 16px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fas fa-file-excel"></i> 엑셀 다운로드</button>
        </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="stats-dashboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:20px; margin-bottom:40px;">
        <div class="stat-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); text-align:center; border:1px solid #f1f5f9;">
            <div style="font-size:2.5rem; margin-bottom:10px;">👥</div>
            <div style="font-size:1.8rem; font-weight:800; color:#1e293b;">${totalStudents}명</div>
            <div style="color:#64748b; font-size:0.9rem;">학급 정원</div>
        </div>
        <div class="stat-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); text-align:center; border:1px solid #f1f5f9; border-top: 5px solid #3b82f6;">
            <div style="font-size:2.5rem; margin-bottom:10px;">📝</div>
            <div style="font-size:1.8rem; font-weight:800; color:#3b82f6;">${participantsCount}명</div>
            <div style="color:#64748b; font-size:0.9rem;">실제 참여인원</div>
        </div>
        <div class="stat-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); text-align:center; border:1px solid #f1f5f9; border-top: 5px solid #ef4444;">
            <div style="font-size:2.5rem; margin-bottom:10px;">🎯</div>
            <div style="font-size:1.8rem; font-weight:800; color:#ef4444;">${activityAchievement}%</div>
            <div style="color:#64748b; font-size:0.9rem;">수업 달성도</div>
        </div>
    </div>

    <div style="background:white; padding:30px; border-radius:20px; border:1px solid #f1f5f9; margin-bottom:40px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
        <h4 style="margin-bottom:25px; font-weight:700; color:#334155; display:flex; align-items:center; gap:8px;">📈 실시간 단계별 진행률</h4>
        <div style="display:flex; align-items:flex-end; height:180px; gap:20px; padding-bottom:20px; border-bottom:2px solid #f8fafc;">
            <div style="flex:1; background:#e2e8f0; height:${p1}%; border-radius:8px 8px 0 0; position:relative; transition:height 0.5s;"><span style="position:absolute; bottom:-35px; left:0; right:0; text-align:center; font-size:0.75rem; color:#64748b;">도입<br>(${p1}%)</span></div>
            <div style="flex:1; background:#cbd5e1; height:${p2}%; border-radius:8px 8px 0 0; position:relative; transition:height 0.5s;"><span style="position:absolute; bottom:-35px; left:0; right:0; text-align:center; font-size:0.75rem; color:#64748b;">전개1<br>(${p2}%)</span></div>
            <div style="flex:1; background:#94a3b8; height:${p3}%; border-radius:8px 8px 0 0; position:relative; transition:height 0.5s;"><span style="position:absolute; bottom:-35px; left:0; right:0; text-align:center; font-size:0.75rem; color:#64748b;">전개2<br>(${p3}%)</span></div>
            <div style="flex:1; background:var(--primary); height:${p4}%; border-radius:8px 8px 0 0; position:relative; transition:height 0.5s; box-shadow:0 -4px 10px rgba(74, 144, 226, 0.2);"><span style="position:absolute; bottom:-35px; left:0; right:0; text-align:center; font-size:0.75rem; color:var(--primary); font-weight:bold;">정리<br>(${p4}%)</span></div>
        </div>
    </div>

    <div class="detailed-stats-table" style="background:white; border-radius:20px; border:1px solid #f1f5f9; overflow:hidden; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
        <div style="padding:15px 20px; background:#f8fafc; border-bottom:1px solid #f1f5f9; font-weight:700; color:#475569;">📋 실시간 개인별 참여 현황</div>
        <div style="overflow-x:auto;">
            <table class="stats-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#fff;">
                        <th class="student-col" style="padding:15px; text-align:left; border-bottom:2px solid #e2e8f0;">성명</th>
                        ${steps.map(s => `<th style="padding:15px; text-align:center; border-bottom:2px solid #e2e8f0; font-size:0.85rem;">${s.id.split('-')[1]}단계</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${studentNames.map(name => `
                        <tr style="border-bottom:1px solid #f8fafc;">
                            <td class="student-col" style="padding:12px 15px; font-weight:600; color:#334155;">${name}</td>
                            ${stepIds.map(sid => {
        const done = unit1Participation[name] && unit1Participation[name][sid];
        return `<td style="padding:12px 15px; text-align:center; color:${done ? '#10b981' : '#e2e8f0'}; font-weight:${done ? 'bold' : 'normal'};">
                                    ${done ? '<i class="fas fa-check-circle" style="font-size:1.2rem;"></i>' : '<i class="far fa-circle"></i>'}
                                </td>`;
    }).join('')}
                        </tr>
                    `).join('')}
                    ${studentNames.length === 0 ? `<tr><td colspan="${steps.length + 1}" style="padding:40px; text-align:center; color:#94a3b8;">아직 참여 중인 학생이 없습니다.</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    </div>`;
    area.innerHTML = html;
}

function downloadUnit1Excel() {
    const lesson = unit1LessonData[currentUnit1Lesson];
    const steps = lesson.steps.filter(s => !s.isStats);
    const stepIds = steps.map(s => s.id);

    const students = Object.keys(unit1Participation).filter(name =>
        stepIds.some(id => unit1Participation[name] && unit1Participation[name][id])
    ).sort();

    if (students.length === 0) return alert("다운로드할 데이터가 없습니다.");

    let csvContent = "\uFEFF성명," + steps.map(s => s.title.replace(/,/g, "")).join(",") + "\n";

    students.forEach(name => {
        const row = [name];
        steps.forEach(s => row.push(unit1Participation[name][s.id] ? "O" : "X"));
        csvContent += row.join(",") + "\n";
    });

    csvContent += "\n\n--- 상세 활동 내용 ---\n\n";

    steps.forEach(s => {
        csvContent += `[${s.title}]\n`;
        const data = unit1SharedResponses[s.id];
        if (!data) { csvContent += "(데이터 없음)\n\n"; return; }

        if (s.isWordCloud || s.isBubbleChart || s.isGraphicOrganizer) {
            Object.entries(data).forEach(([key, val]) => csvContent += `${key} (${val}회)\n`);
        } else if (s.isProsCons) {
            csvContent += "찬성/장점\n";
            (data['장점'] || []).forEach(r => csvContent += `${r.text.replace(/,/g, " ")}\n`);
            csvContent += "반대/단점\n";
            (data['단점'] || []).forEach(r => csvContent += `${r.text.replace(/,/g, " ")}\n`);
        } else if (Array.isArray(data)) {
            data.forEach(r => {
                const text = r.text || r.fileName || (r.img ? "(이미지/캔버스 게시)" : "");
                csvContent += `${text.replace(/,/g, " ")}\n`;
            });
        }
        csvContent += "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${lesson.title}_활동결과.csv`;
    link.click();
}

function clearUnit1AllData() {
    if (confirm("모든 차시의 활동 데이터를 삭제하시겠습니까? 전체 수업 기록이 모두 사라집니다.")) {
        localStorage.removeItem('unit1_sharedResponses');
        localStorage.removeItem('unit1_participation');
        unit1SharedResponses = {
            "1-1": {}, "1-2": [], "1-4": {}, "1-5": { "휴식": 0, "모험": 0, "음식": 0, "역사": 0, "기타": 0 },
            "1-6": [], "1-7": [], "1-8": [], "1-9": [],
            "2-1": {}, "2-2": { "장점": [], "단점": [] }, "2-3": [], "2-4": {}, "2-6": [], "2-7": [], "2-8": [], "2-9": [],
            "3-2": [], "3-3": [], "3-4": {}, "3-5": { "장점": [], "단점": [] }, "3-6": {}, "3-7": { "최고예요": 0, "좋아요": 0, "보통예요": 0, "아쉬워요": 0 }, "3-8": [], "3-9": []
        };
        unit1Participation = {};
        location.reload();
    }
}

function clearCurrentUnit1LessonData() {
    const lesson = unit1LessonData[currentUnit1Lesson];
    if (!lesson) return;
    if (confirm(`${currentUnit1Lesson}차시의 데이터만 삭제하시겠습니까?`)) {
        lesson.steps.forEach(step => {
            // Reset shared responses
            if (Array.isArray(unit1SharedResponses[step.id])) {
                unit1SharedResponses[step.id] = [];
            } else if (typeof unit1SharedResponses[step.id] === 'object') {
                if (step.id === "1-5") unit1SharedResponses[step.id] = { "휴식": 0, "모험": 0, "음식": 0, "역사": 0, "기타": 0 };
                else if (step.id === "2-2" || step.id === "3-5") unit1SharedResponses[step.id] = { "장점": [], "단점": [] };
                else if (step.id === "3-7") unit1SharedResponses[step.id] = { "최고예요": 0, "좋아요": 0, "보통예요": 0, "아쉬워요": 0 };
                else unit1SharedResponses[step.id] = {};
            }

            // Reset participation for this step across all students
            Object.keys(unit1Participation).forEach(student => {
                if (unit1Participation[student][step.id]) {
                    delete unit1Participation[student][step.id];
                }
            });
        });
        saveUnit1Data();
        location.reload();
    }
}

function submitUnit1Response(stepId) {
    const name = document.getElementById('unit1-student-name-input').value.trim();
    const text = document.getElementById('unit1-student-text-input').value.trim();
    if (!name || !text) return;
    recordUnit1Participation(name, stepId);
    const lesson = unit1LessonData[currentUnit1Lesson];
    const step = lesson.steps.find(s => s.id === stepId);
    if (step.isWordCloud || step.isBubbleChart) unit1SharedResponses[stepId][text] = (unit1SharedResponses[stepId][text] || 0) + 1;
    else unit1SharedResponses[stepId].push({ name, text });
    saveUnit1Data();
    updateUnit1Board(stepId);
    document.getElementById('unit1-student-text-input').value = "";
}

function submitUnit1ProsCons(stepId) {
    const name = document.getElementById('unit1-pc-name').value.trim();
    if (!name) return alert("이름!");
    const type = document.getElementById('unit1-pc-type').value;
    const text = document.getElementById('unit1-pc-text').value.trim();
    if (!text) return;
    recordUnit1Participation(name, stepId);
    unit1SharedResponses[stepId][type].push({ name, text });
    saveUnit1Data();
    updateUnit1Board(stepId);
    document.getElementById('unit1-pc-text').value = "";
}

function handleUnit1EnterSync(e, stepId) {
    if (e.key === 'Enter') {
        const nameInput = document.getElementById('unit1-sync-name');
        const textInput = document.getElementById('unit1-sync-thought');
        if (!nameInput?.value.trim() || !textInput?.value.trim()) return;
        const name = nameInput.value.trim();
        recordUnit1Participation(name, stepId);
        unit1SharedResponses[stepId].push({ name, text: textInput.value.trim() });
        saveUnit1Data();
        updateUnit1Board(stepId);
        textInput.value = "";
    }
}

function addUnit1Like(stepId, idx) {
    unit1SharedResponses[stepId][idx].likes++;
    saveUnit1Data();
    updateUnit1Board(stepId);
}

function showUnit1OtherInput() {
    document.getElementById('unit1-other-input-area').style.display = 'flex';
}

function submitUnit1Survey(stepId, option) {
    let name = "";
    if (typeof currentUser !== 'undefined' && currentUser) {
        name = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
    } else {
        name = prompt("본인 성명을 입력하세요:");
    }

    if (!name) return;
    recordUnit1Participation(name.toString().trim(), stepId);
    if (option === '기타') {
        const val = document.getElementById('unit1-survey-other').value.trim();
        if (!val) return;
        unit1SharedResponses[stepId][val] = (unit1SharedResponses[stepId][val] || 0) + 1;
    }
    else unit1SharedResponses[stepId][option] = (unit1SharedResponses[stepId][option] || 0) + 1;
    saveUnit1Data();
    updateUnit1Board(stepId);
}

function startUnit1QuizWithName() {
    let name = "";
    if (typeof currentUser !== 'undefined' && currentUser) {
        name = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
    } else {
        name = document.getElementById('unit1-student-quiz-name').value.trim();
    }

    if (!name) return alert("성명을 입력하세요!");
    unit1QuizState.studentName = name;
    const initArea = document.getElementById('unit1-quiz-init');
    if (initArea) initArea.style.display = 'none';
    unit1QuizState.currentIdx = 0;
    unit1QuizState.score = 0;
    renderUnit1Quiz();
}

function renderUnit1Quiz() {
    const area = document.getElementById('unit1-quiz-area');
    const stepId = `${currentUnit1Lesson}-8`;
    if (unit1QuizState.currentIdx >= unit1QuizQuestions.length) {
        recordUnit1Participation(unit1QuizState.studentName, stepId);
        area.innerHTML = `<h3>${unit1QuizState.studentName}님 점수: ${unit1QuizState.score}/10</h3><button class="back-btn" onclick="showUnit1QuizAnswers()">정답 확인</button>`;
        unit1SharedResponses[stepId].push({ name: unit1QuizState.studentName, text: `퀴즈 점수: ${unit1QuizState.score}점` });
        saveUnit1Data();
        updateUnit1Board(stepId);
        return;
    }
    const q = unit1QuizQuestions[unit1QuizState.currentIdx];
    area.innerHTML = `<div class="quiz-box"><p>${unit1QuizState.studentName}님 (${unit1QuizState.currentIdx + 1}/10)</p><div class="quiz-q-text">${q.q}</div><div class="quiz-options">${q.a.map((opt, i) => `<button class="quiz-btn" onclick="handleUnit1QuizAns(${i})">${opt}</button>`).join('')}</div></div>`;
}

function handleUnit1QuizAns(idx) {
    if (idx === unit1QuizQuestions[unit1QuizState.currentIdx].c) unit1QuizState.score++;
    unit1QuizState.currentIdx++;
    renderUnit1Quiz();
}

function showUnit1QuizAnswers() {
    document.getElementById('unit1-quiz-area').innerHTML = `<h3>정답 해설</h3><div style="text-align:left;">${unit1QuizQuestions.map((q, i) => `<p>${i + 1}. ${q.q} - <b>${q.a[q.c]}</b></p>`).join('')}</div>`;
}

// --- Whiteboard ---
let isUnit1Drawing = false;
let unit1Ctx = null;

function initUnit1Whiteboard() {
    const canvas = document.getElementById('unit1-whiteboard');
    if (!canvas) return;
    unit1Ctx = canvas.getContext('2d');
    unit1Ctx.strokeStyle = document.getElementById('unit1-get-pen-color').value;
    unit1Ctx.lineWidth = 3;
    unit1Ctx.lineCap = 'round';
    canvas.onmousedown = (e) => { isUnit1Drawing = true; unit1Ctx.beginPath(); unit1Ctx.moveTo(e.offsetX, e.offsetY); };
    canvas.onmousemove = (e) => { if (isUnit1Drawing) { unit1Ctx.lineTo(e.offsetX, e.offsetY); unit1Ctx.stroke(); } };
    window.onmouseup = () => { isUnit1Drawing = false; };
}

function clearUnit1Canvas() {
    const canvas = document.getElementById('unit1-whiteboard');
    if (canvas) unit1Ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function postUnit1Canvas(stepId) {
    const canvas = document.getElementById('unit1-whiteboard');
    if (!canvas) return;
    let name = "";
    if (typeof currentUser !== 'undefined' && currentUser) {
        name = currentUser.startsWith('student') ? currentUser.replace('student', '학생') : currentUser;
    } else {
        name = prompt("본인 성명을 입력하세요:");
    }

    if (!name) return;
    recordUnit1Participation(name.toString().trim(), stepId);
    unit1SharedResponses[stepId].push({ name: name.toString().trim(), img: canvas.toDataURL(), likes: 0 });
    saveUnit1Data();
    updateUnit1Board(stepId);
    alert("공유되었습니다!");
}

// Load data on initialization
loadUnit1Data();

// --- UNIT 1 LESSON DATA ---
// Moved from script.js and updated with embedded PDF viewers
const unit1LessonData = {
    1: {
        title: "1차시: 여행에서 만난 나",
        desc: "우리는 왜 여행을 떠날까요? 여행의 첫걸음을 떼어봅니다.",
        steps: [
            { id: "1-1", icon: "🌍", title: "1. 나에게 여행이란?", content: '<h3>브레인스토밍: 여행의 정의</h3><p>친구들이 생각하는 \'여행\'은 어떤 단어로 표현될까요?</p>', isWordCloud: true },
            { id: "1-2", icon: "📸", title: "2. 인생 여행지 공유", content: '<h3>인생 여행 사진 공유</h3><div class="file-zone" id="unit1-drop-zone-1-2" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-2\')"><p>📸 드래그하거나 클릭하여 업로드</p><input type="file" id="unit1-photo-input-1-2" style="display:none" onchange="handleFileSelect(event, \'1-2\')"></div>', hideBoardInput: true, isPhotoGallery: true },
            {
                id: "1-3", icon: "📄", title: "3. 활동지 보기 & 다운로드",
                content: `<div class="content-block">
                    <h3>필수 활동지</h3>
                    <div class="pdf-container" style="margin-bottom:20px; border-radius:15px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                        <iframe src="여행에서_만난_나_1차시_활동지.pdf" style="width:100%; height:600px; border:none;"></iframe>
                    </div>
                    <a href="여행에서_만난_나_1차시_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'1-3\')" download style="display:inline-block; background:var(--primary); color:white; padding:12px 24px; border-radius:30px; text-decoration:none; font-weight:bold;">⬇️ PDF로 소장하기</a>
                </div>`,
                hideBoard: true
            },
            { id: "1-4", icon: "🎒", title: "4. 나의 가방 속 물건", content: '<h3>가방 필수템</h3><p>물건을 적어주세요. 많이 나오면 커집니다!</p>', isWordCloud: true },
            { id: "1-5", icon: "💬", title: "5. 여행 목적 설문", content: '<h3>여행의 이유</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'휴식\')">휴식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'모험\')">모험</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'음식\')">음식</button><button class="quiz-btn" onclick="submitUnit1Survey(\'1-5\', \'역사\')">역사</button><button class="quiz-btn" onclick="showUnit1OtherInput()">기타</button></div><div id="unit1-other-input-area" style="display:none; margin-top:10px;" class="input-group"><input type="text" id="unit1-survey-other" placeholder="기타..."><button class="back-btn" style="margin:0" onclick="submitUnit1Survey(\'1-5\', \'기타\')">확인</button></div>', isGraphicOrganizer: true, hideBoardInput: true },
            { id: "1-6", icon: "🗺️", title: "6. 가보고 싶은 곳", content: '<h3>꿈꾸는 여행지</h3><p>지도를 보며 가고 싶은 곳의 링크를 공유해 주세요.</p><a href="https://maps.google.com" target="_blank" class="download-link" style="background:#4285F4">🌐 지도 열기</a>', isMapLink: true },
            { id: "1-7", icon: "📤", title: "7. 과제 제출", content: '<h3>과제 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'1-7\')"><p>📂 드래그하여 업로드</p></div>', isAssignmentList: true, hideBoardInput: true },
            { id: "1-8", icon: "💡", title: "8. 여행 상식 퀴즈", content: '<div id="unit1-quiz-init" class="input-group"><input type="text" id="unit1-student-quiz-name" placeholder="이름 입력"><button class="back-btn" style="margin:0" onclick="startUnit1QuizWithName()">시작</button></div><div id="unit1-quiz-area"></div>', isQuiz: true, hideBoardInput: true },
            { id: "1-9", icon: "📅", title: "9. 1차시 마무리", content: '<h3>소감 나누기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="소감 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'1-9\')"></div>', isLiveSync: true, hideBoardInput: true },
            { id: "1-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }
        ]
    },
    2: {
        title: "2차시: 여행과 나의 성장",
        desc: "여행은 우리를 어떻게 변화시킬까요? 성장의 시간을 기록합니다.",
        steps: [
            { id: "2-1", icon: "🧩", title: "1. 여행 테마 정하기", content: "<h3>나만의 여행 테마</h3><p>내가 계획하고 싶은 여행 테마는 무엇인가요?</p>", isWordCloud: true },
            { id: "2-2", icon: "🚶", title: "2. 걷기 여행의 토론", content: '<h3>느리게 걷기 토론</h3><p>도보 여행의 특징을 장점과 단점으로 구분하여 적어봅시다.</p><div class="worksheet-section" style="background:white; padding:20px; border-radius:15px; box-shadow:0 2px 4px rgba(0,0,0,0.05); border:1px solid #eee;"><div class="input-header" style="font-weight:bold; margin-bottom:10px; color:#555;">📝 토론 의견 작성</div><div class="input-group" style="display:flex; gap:10px; margin-bottom:10px;"><input type="text" id="unit1-pc-name" class="worksheet-text-input" placeholder="이름" style="width:100px;"><select id="unit1-pc-type" class="worksheet-text-input" style="width:120px;"><option value="장점">✅ 장점</option><option value="단점">❌ 단점</option></select></div><textarea id="unit1-pc-text" class="worksheet-input" placeholder="여기에 의견을 적어주세요..." style="width:100%; height:80px;"></textarea><div style="text-align:right; margin-top:10px;"><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'2-2\')">의견 공유하기</button> <button class="back-btn" style="margin:0; background:#6b7280; color:white;" onclick="saveMyWork(\'2-2\')">내용 저장</button></div></div>', isProsCons: true, hideBoardInput: true },
            { id: "2-3", icon: "🚌", title: "3. 대중교통 이용", content: "<h3>현지 교통수단</h3><p>여행지에서 이용하고 싶은 교통수단을 적어주세요. 연결망으로 시각화됩니다.</p>", isNodeGraph: true },
            { id: "2-4", icon: "🍽️", title: "4. 현지 음식 문화", content: "<h3>맛의 모험</h3><p>가장 먹어보고 싶은 이색 음식은? 많이 나온 키워드가 크게 보입니다.</p>", isBubbleChart: true },
            {
                id: "2-5", icon: "📄", title: "5. 활동지 보기 & 다운로드",
                content: `<div class="content-block">
                    <h3>필수 활동지</h3>
                    <div class="pdf-container" style="margin-bottom:20px; border-radius:15px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                        <iframe src="여행에서_만난_나_활동지.pdf" style="width:100%; height:600px; border:none;"></iframe>
                    </div>
                    <a href="여행에서_만난_나_활동지.pdf" class="download-link" onclick="handleTrackedDownload(event, \'2-5\')" download style="display:inline-block; background:var(--primary); color:white; padding:12px 24px; border-radius:30px; text-decoration:none; font-weight:bold;">⬇️ PDF로 소장하기</a>
                </div>`,
                hideBoard: true
            },
            { id: "2-6", icon: "🎨", title: "6. 여행 일러스트", content: '<h3>그림으로 나누는 여행</h3><div class="canvas-wrapper"><canvas id="unit1-whiteboard" width="600" height="400"></canvas><div class="canvas-ctrl"><input type="color" id="unit1-get-pen-color" value="#4A90E2"><button class="back-btn" style="margin:0" onclick="clearUnit1Canvas()">지우기</button><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="postUnit1Canvas(\'2-6\')">그림 공유</button></div></div><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-6\')"><p>🎨 그림 파일 업로드 (드래그)</p></div>', isPhotoGallery: true, hideBoardInput: true },
            { id: "2-7", icon: "🎵", title: "7. 여행 플레이리스트", content: '<h3>유튜브 음악 공유</h3><p>추천하고 싶은 여행 음악의 유튜브 링크를 공유해 주세요.</p><a href="https://www.youtube.com" target="_blank" class="youtube-card">🎬 유튜브 바로가기</a>', isPlaylist: true },
            { id: "2-8", icon: "📤", title: "8. 활동 결과 제출", content: '<h3>자료 업로드</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'2-8\')"><p>📁 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true },
            { id: "2-9", icon: "✨", title: "9. 성장의 한마디", content: '<h3>나의 다짐</h3><div class="worksheet-section" style="background:white; padding:20px; border-radius:15px; border:1px solid #eee;"><div class="input-group"><input type="text" id="unit1-sync-name" class="worksheet-text-input" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" class="worksheet-text-input" placeholder="나의 다짐 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'2-9\')" style="flex:1;"></div><div style="text-align:right; margin-top:10px;"><button class="back-btn" style="background:#6b7280; color:white;" onclick="saveMyWork(\'2-9\')">저장하기</button></div></div>', isLiveSync: true, hideBoardInput: true },
            { id: "2-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }
        ]
    },
    3: {
        title: "3차시: 여행의 의미 발견",
        desc: "수업을 마무리하며 나만의 여행 의미를 정의합니다.",
        steps: [
            {
                id: "3-1", icon: "📕", title: "1. 활동지 보기 & 다운로드",
                content: `<div class="content-block">
                    <h3>최종 활동지</h3>
                    <div class="pdf-container" style="margin-bottom:20px; border-radius:15px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                        <iframe src="여행_발췌독_연계_활동지_3차시.pdf" style="width:100%; height:600px; border:none;"></iframe>
                    </div>
                    <a href="여행_발췌독_연계_활동지_3차시.pdf" class="download-link" onclick="handleTrackedDownload(event, \'3-1\')" download style="display:inline-block; background:var(--primary); color:white; padding:12px 24px; border-radius:30px; text-decoration:none; font-weight:bold;">⬇️ PDF로 소장하기</a>
                </div>`,
                hideBoard: true
            },
            { id: "3-2", icon: "✍️", title: "2. 여행 에세이 쓰기", content: '<h3>나의 여행 이야기</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="짧은 에세이 입력 후 엔터" onkeypress="handleUnit1EnterSync(event, \'3-2\')"></div>', isLiveSync: true, hideBoardInput: true },
            { id: "3-3", icon: "🤝", title: "3. 모둠 여행 계획", content: "<h3>우리 팀의 계획</h3><p>함께 가고 싶은 도시들을 적어보세요. 연결망으로 보여집니다.</p>", isNodeGraph: true },
            { id: "3-4", icon: "🏛️", title: "4. 보호해야 할 유산", content: "<h3>소중한 문화유산</h3><p>우리가 지켜야 할 장소는 어디일까요?</p>", isBubbleChart: true },
            { id: "3-5", icon: "🌿", title: "5. 에코 투어리즘", content: '<h3>환경을 위한 선택</h3><div class="input-group" style="background:#fff; border:1px solid #ddd;"><input type="text" id="unit1-pc-name" placeholder="이름" style="width:80px; border:1px solid #ddd; padding:10px; border-radius:10px;"><select id="unit1-pc-type" style="padding:10px; border-radius:10px; border:1px solid #ddd;"><option value="장점">✅ 찬성/장점</option><option value="단점">❌ 반대/단점</option></select><input type="text" id="unit1-pc-text" placeholder="의견을 입력하세요..."><button class="back-btn" style="margin:0; background:var(--primary); color:white;" onclick="submitUnit1ProsCons(\'3-5\')">공유</button></div>', isProsCons: true, hideBoardInput: true },
            { id: "3-6", icon: "🔭", title: "6. 미래의 여행", content: "<h3>우주 여행 시대</h3><p>미래 여행하면 떠오르는 단어를 적어주세요.</p>", isWordCloud: true },
            { id: "3-7", icon: "📊", title: "7. 수업 만족도", content: '<h3>오늘 수업은?</h3><div class="quiz-options"><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'최고예요\')">최고예요! 👍</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'좋아요\')">좋아요 😊</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'보통예요\')">보통예요 😐</button><button class="quiz-btn" onclick="submitUnit1Survey(\'3-7\', \'아쉬워요\')">아쉬워요 😢</button></div>', isGraphicOrganizer: true, hideBoardInput: true },
            { id: "3-8", icon: "📤", title: "8. 최종 포트폴리오", content: '<h3>최종 결과물 제출</h3><div class="file-zone" ondragover="allowDrop(event)" ondrop="handleDrop(event, \'3-8\')"><p>📁 최종 파일을 드래그하여 제출</p></div>', isAssignmentList: true, hideBoardInput: true },
            { id: "3-9", icon: "⭐", title: "9. 최종 마무리", content: '<h3>수업을 마치며</h3><div class="input-group"><input type="text" id="unit1-sync-name" placeholder="이름" style="width:100px; flex:none;"><input type="text" id="unit1-sync-thought" placeholder="수업 총평을 적어주세요..." onkeypress="handleUnit1EnterSync(event, \'3-9\')"></div>', isLiveSync: true, hideBoardInput: true },
            { id: "3-10", icon: "📈", title: "10. 참여 통계", content: "<h3>우리 반 참여 현황</h3>", isStats: true, hideBoard: true }
        ]
    }
};
