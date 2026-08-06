// UIController.js
// Handles visual updates

import { tailwindColors, animalThemes } from './data.js';
import { appStore } from './store.js';

function getRankEmoji(score, allPlayers) {
    const uniqueScores = [...new Set(allPlayers.map(p => p.score || p.scores?.total || 0))].sort((a, b) => b - a);
    const rank = uniqueScores.indexOf(score);
    if (rank === 0) return '🥇'; if (rank === 1) return '🥈'; if (rank === 2) return '🥉'; return '';
}

const hangmanArtFrames = ["\n\n\n\n\n=======", "\n |\n |\n |\n |\n=======", " +---+\n |\n |\n |\n |\n=======", " +---+\n |   O\n |\n |\n |\n=======", " +---+\n |   O\n |   |\n |\n |\n=======", " +---+\n |   O\n |  /|\\\n |\n |\n=======", " +---+\n |   O\n |  /|\\\n |  / \\\n |\n======="];

export const uiManager = {
    
    hideAll() { 
        const allModules = [
            'module-0', 'module-join-pin', 'module-waiting', 'module-admin', 
            'module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 
            'module-7', 'module-8', 'module-9', 'module-10', 'module-11', 'module-12'
        ];
        
        allModules.forEach(id => { 
            const el = document.getElementById(id); 
            if (el) {
                if (appStore.get('role') === 'host' && id === 'module-admin') return; 
                if (appStore.get('role') === 'host' && appStore.get('isLiveViewOpen') && id === `module-${appStore.get('currentModule')}`) return;
                
                el.classList.add('hidden'); 
            }
        }); 
    },
    
    closeModals() { 
        ['modal-prof-login', 'modal-student-auth', 'modal-recovery', 'modal-lifeline'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        }); 
    },
    
    updateProfHUD() {
        const c = document.getElementById('player-hud-container');
        const status = document.getElementById('game-status');
        if (status) status.classList.remove('hidden');
        
        const profName = appStore.get('profName') || "Professor"; 
        const savedAvatar = localStorage.getItem('profAvatar') || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

        if (c) {
            c.innerHTML = `
                <div id="prof-hud-container" class="flex items-center bg-indigo-900 rounded-full pr-4 p-1 border border-indigo-600 shadow-inner">
                    <img src="${savedAvatar}" alt="Prof" class="w-10 h-10 rounded-full border-2 border-yellow-300 mr-3 object-cover bg-white">
                    <div class="flex flex-col leading-tight text-left">
                        <span class="text-xs text-indigo-300 uppercase tracking-widest font-bold">Host</span>
                        <span class="text-sm font-bold text-yellow-300" id="prof-hud-name">${profName}</span>
                    </div>
                </div>`;
        }
    },
    
    updateStudentHUD() {
        const c = document.getElementById('player-hud-container');
        const me = appStore.get('me');
        if (!c || !me) return;
        
        const myTheme = animalThemes[me.team] || animalThemes['eagle'];
        const tColorClass = tailwindColors[myTheme.color].light;

        c.innerHTML = `
        <div class="flex items-center bg-indigo-900 rounded-full pr-4 p-1 border border-indigo-600">
            <img src="${me.avatar}" class="w-10 h-10 rounded-full border-4 ${me.border || 'border-slate-300'} object-cover bg-white mr-3">
            <div class="flex flex-col leading-tight">
                <span class="text-xs text-indigo-300 font-bold">${me.name} <span class="${tColorClass} ml-1">[${myTheme.name}]</span></span>
                <span class="text-sm font-bold text-yellow-300">Score: ${me.scores?.total || 0}</span>
            </div>
        </div>`;
    },
    
    updateScoreboard() {
        if(appStore.get('role') === 'host') return;
        const c = document.getElementById('scoreboard-list'); 
        if (!c) return;
        
        c.innerHTML = '';
        const players = appStore.get('players') || {};
        
        Object.values(players).sort((a,b)=>(b.scores?.total || 0) - (a.scores?.total || 0)).forEach(p => {
            const theme = animalThemes[p.team] || animalThemes['eagle'];
            const tBorder = tailwindColors[theme.color].border;
            c.innerHTML += `<div class="flex items-center gap-2 px-3 py-1 rounded-full border bg-indigo-800 text-indigo-100 ${tBorder}"><img src="${p.avatar}" class="w-6 h-6 rounded-full border border-white ${p.border || 'border-slate-300'} object-cover bg-white"><span class="pl-1">${p.name}: ${p.scores?.total || 0}</span></div>`;
        });
    },
    
    lockModule() { 
        if(appStore.get('role') === 'host') return;
        document.querySelectorAll('button, input, textarea, .hotspot-area').forEach(e => { 
            if(e.id !== 'btn-audio-listen' && e.id !== 'btn-dict-listen' && !e.classList.contains('lifeline-btn') && e.id !== 'btn-exit-home') e.style.pointerEvents = 'none'; 
        }); 
        document.querySelectorAll('.lifeline-btn').forEach(b => b.disabled = true); 
        
        const overlay = document.getElementById('wait-overlay');
        if (overlay) overlay.classList.remove('hidden');
        
        const ptsDisplay = document.getElementById('shop-pts-display');
        const me = appStore.get('me');
        if (ptsDisplay && me) ptsDisplay.innerText = me.scores?.total || 0;
    },
    
    unlockModule() {
        document.querySelectorAll('button, input, textarea, .hotspot-area').forEach(e => { e.style.pointerEvents = 'auto'; }); 
        const overlay = document.getElementById('wait-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        const dictFeedback = document.getElementById('dict-feedback');
        if (dictFeedback) {
            dictFeedback.innerHTML = '';
            dictFeedback.classList.add('opacity-0');
        }
    },
    
    showProfChat() {
        const phrases = window.lessonData.chatPhrases || ["Good job!", "Not bad!", "Keep it up!"];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const container = document.getElementById('prof-cheer-container');
        if (container) {
            document.getElementById('prof-cheer-text').innerText = phrase;
            container.classList.replace('opacity-0', 'opacity-100');
            setTimeout(() => container.classList.replace('opacity-100', 'opacity-0'), 3000);
        }
    },

    renderStudy() {
        const c = document.getElementById('flashcards-container'); if(!c) return; c.innerHTML = '';
        window.lessonData.vocabulary.forEach(item => { c.innerHTML += `<div class="perspective-1000 h-48 w-full group"><div class="flip-card-inner transform-style-3d relative w-full h-full text-center shadow-md rounded-xl cursor-pointer" onclick="this.parentElement.classList.toggle('flipped')"><div class="backface-hidden absolute w-full h-full bg-white border border-slate-200 rounded-xl flex flex-col justify-center items-center p-4"><h3 class="text-xl font-bold text-indigo-800">${item.term}</h3><button onclick="event.stopPropagation(); window.speakText('${item.term}');" class="mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2 rounded-full transition-colors">Listen</button></div><div class="backface-hidden rotate-y-180 absolute w-full h-full bg-indigo-600 rounded-xl flex justify-center items-center p-4"><p class="text-white font-medium text-sm md:text-base">${item.def}</p></div></div></div>`; });
    },
    
    renderDnD(data) {
        document.getElementById('drop-definition-text').innerText = data.def;
        const dropzone = document.getElementById('dropzone'); dropzone.className = "dropzone w-full max-w-sm h-32 border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-medium bg-slate-50"; dropzone.innerText = "Drop term here"; dropzone.dataset.target = data.term;
        const container = document.getElementById('drag-terms-container'); container.innerHTML = '';
        window.shuffleArray([...window.lessonData.vocabulary]).forEach(item => {
            const div = document.createElement('div'); div.className = "draggable bg-white border-2 border-slate-200 p-3 rounded-lg text-center font-bold text-slate-700 shadow-sm hover:border-indigo-400"; div.draggable = true; div.innerText = item.term; div.dataset.id = item.term;
            div.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', item.term); div.classList.add('opacity-50'); }); div.addEventListener('dragend', () => div.classList.remove('opacity-50')); container.appendChild(div);
        });
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); }; dropzone.ondragleave = () => dropzone.classList.remove('drag-over');
        dropzone.ondrop = (e) => {
            e.preventDefault(); dropzone.classList.remove('drag-over'); const draggedId = e.dataTransfer.getData('text/plain'); const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
            if (draggedId === data.term) { dropzone.innerHTML = ''; dropzone.appendChild(draggedElement); draggedElement.classList.replace('border-slate-200', 'border-green-500'); draggedElement.classList.add('bg-green-50', 'text-green-800'); window.game.handleDnDMatch(true); } 
            else { draggedElement.classList.add('snap-back', 'border-red-500', 'bg-red-50', 'text-red-600'); setTimeout(() => draggedElement.classList.remove('snap-back', 'border-red-500', 'bg-red-50', 'text-red-600'), 400); window.game.handleDnDMatch(false); }
        };
    },
    
    renderHotspot(data) {
        document.getElementById('hotspot-prompt').innerText = data.prompt; const layer = document.getElementById('hotspots-layer'); layer.innerHTML = '';
        const target = document.createElement('div'); target.className = 'hotspot-area'; target.style.top = `${data.target.top}%`; target.style.left = `${data.target.left}%`; target.style.width = `${data.target.width}%`; target.style.height = `${data.target.height}%`;
        let clicked = false;
        target.onclick = (e) => { e.stopPropagation(); if(clicked) return; clicked = true; target.classList.add('hotspot-revealed-hit'); window.game.handleHotspot(true); };
        const bg = document.getElementById('image-container'); bg.onclick = () => { if(clicked) return; clicked=true; target.classList.add('hotspot-revealed-miss'); window.game.handleHotspot(false); };
        layer.appendChild(target); 
    },
    
    renderMemoryGrid(cards) {
        let container = document.getElementById('memory-grid'); 
        
        if (!container) {
            const mod4 = document.getElementById('module-4');
            if (mod4) {
                mod4.innerHTML = `
                    <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 4 of 11</span>
                    <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Memory Match</h2>
                    <div id="lifeline-mount-4"></div>
                    <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-4 md:p-6 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300 w-full mx-auto">
                        <div class="mb-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                            <span id="memory-progress" class="text-sm font-bold text-slate-500 dark:text-slate-300 transition-colors duration-300"></span>
                            <span class="text-sm font-bold text-indigo-600 dark:text-white transition-colors duration-300">+3 Pts / -1 Pt</span>
                        </div>
                        <div id="memory-grid" class="grid gap-2 sm:gap-3 md:gap-4 w-full transition-all duration-500 mx-auto"></div>
                        <div id="memory-feedback" class="mt-4 font-bold text-xl text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
                    </div>
                `;
                container = document.getElementById('memory-grid');
                
                const panel = document.getElementById('lifelines-panel');
                const mount = document.getElementById('lifeline-mount-4');
                if (panel && mount) {
                    panel.classList.remove('hidden');
                    mount.appendChild(panel);
                }
            } else {
                return;
            }
        }
        
        container.className = 'grid gap-2 sm:gap-3 md:gap-4 w-full mx-auto';
        
        let colsMobile = 3, colsTablet = 4, colsDesktop = 6;
        if (cards.length > 36) { colsMobile = 4; colsTablet = 8; colsDesktop = 12; }
        else if (cards.length > 24) { colsMobile = 4; colsTablet = 6; colsDesktop = 10; }
        else if (cards.length > 16) { colsMobile = 4; colsTablet = 6; colsDesktop = 8; }
        else if (cards.length > 8) { colsMobile = 3; colsTablet = 4; colsDesktop = 6; }
        else { colsMobile = 2; colsTablet = 3; colsDesktop = 4; }
        
        const styleId = 'dynamic-grid-style';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        
        styleEl.innerHTML = `
            #memory-grid { grid-template-columns: repeat(${colsMobile}, minmax(0, 1fr)); }
            @media (min-width: 640px) { #memory-grid { grid-template-columns: repeat(${colsTablet}, minmax(0, 1fr)); } }
            @media (min-width: 1024px) { #memory-grid { grid-template-columns: repeat(${colsDesktop}, minmax(0, 1fr)); } }
            
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .front-face, .back-face {
                border-radius: 1rem !important; overflow: hidden !important; 
                position: absolute !important; top: 0; left: 0; width: 100% !important; height: 100% !important;
                background-color: #ffffff !important; border: 1px solid #e2e8f0 !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .dark .front-face, .dark .back-face {
                background-color: rgba(30, 30, 40, 0.6) !important; border: 1px solid rgba(99, 102, 241, 0.4) !important; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important; backdrop-filter: blur(16px) !important;
            }
            #memory-grid .flipped .flip-card-inner, #memory-grid .matched .flip-card-inner { transform: rotateY(180deg) !important; }
            #memory-grid .matched .back-face { background-color: #22c55e !important; border-color: #16a34a !important; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4) !important; }
            .dark #memory-grid .matched .back-face { background-color: rgba(79, 70, 229, 0.8) !important; border-color: #ffffff !important; box-shadow: 0 0 20px rgba(79, 70, 229, 0.8) !important; }
            #memory-grid img { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 1rem !important; pointer-events: none !important; }
            #memory-grid * { color: #1e293b !important; }
            #memory-grid .matched .back-face * { color: #ffffff !important; }
            .dark #memory-grid * { color: #ffffff !important; }
        `;

        container.innerHTML = '';
        
        cards.forEach((card, idx) => {
            const cDiv = document.createElement('div'); 
            cDiv.className = "perspective-1000 w-full aspect-square";
            
            let backContent = '';
            const safeContent = String(card.content || "");
            
            if (safeContent.includes('<img') || safeContent.startsWith('data:image')) {
                if (safeContent.includes('<img')) {
                    backContent = safeContent.replace('<img ', '<img class="w-full h-full object-cover rounded-lg absolute inset-0 z-10" ');
                } else {
                    backContent = `<img src="${safeContent}" alt="Match Image" class="w-full h-full object-cover rounded-lg absolute inset-0 z-10">`;
                }
            } else {
                backContent = `<span class="font-bold text-base md:text-xl xl:text-2xl leading-tight px-1 break-words relative z-10 max-h-full overflow-hidden flex items-center justify-center">${safeContent}</span>`;
            }

            cDiv.innerHTML = `
                <div id="memory-card-${idx}" class="flip-card-inner transform-style-3d transition-transform duration-500 relative w-full h-full text-center cursor-pointer" onclick="window.game.handleMemoryClick(${idx})">
                    <div class="front-face backface-hidden absolute w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black rounded-xl border border-slate-200 dark:border-indigo-500/30">?</div>
                    <div class="back-face backface-hidden rotate-y-180 absolute w-full h-full flex items-center justify-center rounded-xl relative border border-slate-200 dark:border-indigo-500/30">
                        ${backContent}
                    </div>
                </div>`;
            container.appendChild(cDiv);
        });
    },

    flipMemoryCard(idx) { 
        const card = document.getElementById(`memory-card-${idx}`);
        if(card && card.parentElement) card.parentElement.classList.add('flipped'); 
    },
    unflipMemoryCard(idx) { 
        const card = document.getElementById(`memory-card-${idx}`);
        if(card && card.parentElement) card.parentElement.classList.remove('flipped'); 
    },
    markMemoryMatched(idx1, idx2) { 
        const card1 = document.getElementById(`memory-card-${idx1}`);
        const card2 = document.getElementById(`memory-card-${idx2}`);
        if(card1 && card1.parentElement) card1.parentElement.classList.add('matched'); 
        if(card2 && card2.parentElement) card2.parentElement.classList.add('matched'); 
    },
    
    renderAudio(data) {
        document.getElementById('btn-audio-listen').onclick = () => window.speakText(data.desc); const c = document.getElementById('audio-options-container'); c.innerHTML = ''; c.dataset.answer = data.answer;
        data.options.forEach((opt, idx) => { const btn = document.createElement('button'); btn.className = "w-full text-left p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-indigo-400 transition-colors shadow-sm"; btn.innerText = opt; btn.onclick = () => window.game.handleAudioAns(idx === data.answer, btn); c.appendChild(btn); });
    },
    
    renderSpelling(data) { document.getElementById('btn-spelling-listen').onclick = () => window.speakText(data.word); const inp = document.getElementById('spelling-input'); inp.value = ''; inp.dataset.target = data.word; },
    
    renderHangman(phrase) {
        this.updateHangmanArt(); this.updateHangmanWord(); const kbd = document.getElementById('hangman-keyboard'); kbd.innerHTML = '';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(char => { const btn = document.createElement('button'); btn.id = `hm-btn-${char}`; btn.className = "w-10 h-10 font-bold rounded-lg shadow-sm border border-slate-300 bg-white hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"; btn.innerText = char; btn.onclick = () => window.game.handleHangmanGuess(char); kbd.appendChild(btn); });
    },
    updateHangmanArt() { document.getElementById('hangman-art').innerText = hangmanArtFrames[appStore.get('localGameData').hmStrikes]; },
    updateHangmanWord() {
        const c = document.getElementById('hangman-word'); c.innerHTML = '';
        appStore.get('localGameData').hmPhrase.split('').forEach(char => { const span = document.createElement('span'); if (char === ' ') span.innerHTML = '&nbsp;&nbsp;'; else { span.className = "border-b-4 border-indigo-700 mx-1 w-6 inline-block text-center"; span.innerText = appStore.get('localGameData').hmGuessed.includes(char) ? char : '_'; } c.appendChild(span); });
    },
    
    renderWally(data) {
        document.getElementById('wally-prompt').innerText = data.prompt; const layer = document.getElementById('wally-layer'); layer.innerHTML = ''; document.getElementById('wally-container').scrollTop = 0; document.getElementById('wally-container').scrollLeft = 0;
        const target = document.createElement('div'); target.className = 'hotspot-area'; target.style.top = `${data.target.top}%`; target.style.left = `${data.target.left}%`; target.style.width = `${data.target.width}%`; target.style.height = `${data.target.height}%`;
        let clicked = false; target.onclick = (e) => { e.stopPropagation(); if(clicked) return; clicked = true; target.classList.add('hotspot-revealed-hit'); window.game.handleWallyClick(true); };
        const clickWrap = document.createElement('div'); clickWrap.className = "absolute inset-0 z-0"; clickWrap.onclick = () => { if(clicked) return; clicked = true; target.classList.add('hotspot-revealed-miss'); window.game.handleWallyClick(false); };
        layer.appendChild(clickWrap); layer.appendChild(target); 
    },
    
    renderReadAloud(data) { 
        const wrappedText = data.text.split(' ').map(word => { return `<span class="read-aloud-word transition-colors duration-200">${word}</span>`; }).join(' ');
        document.getElementById('read-aloud-target').innerHTML = wrappedText; 
        const btn = document.getElementById('btn-record-read'); 
        btn.style.pointerEvents = 'auto';
        btn.className = "bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg text-xl mx-auto flex items-center gap-3 transition-all duration-300"; 
        document.getElementById('record-icon').innerText = "Record"; document.getElementById('record-text').innerText = "Start Recording";
        const status = document.getElementById('read-status-feedback');
        if (status) { status.innerHTML = '<span class="text-slate-400">Ready to record</span>'; status.dataset.state = 'ready'; }
        if(window.game && window.game.isRecordingReadAloud) window.game.stopReadAloud(true);
    },
    
    renderDictation(data) { document.getElementById('btn-dict-listen').onclick = () => window.speakText(data.text); const inp = document.getElementById('dict-input'); inp.value = ''; inp.dataset.target = data.text; },
    
    renderQuiz(data) {
        document.getElementById('quiz-question-text').innerText = data.q; const c = document.getElementById('quiz-options-container'); c.innerHTML = ''; c.dataset.answer = data.answer;
        data.options.forEach((opt, index) => { const btn = document.createElement('button'); btn.className = "w-full text-left p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-indigo-400 shadow-sm"; btn.innerText = opt; btn.onclick = () => window.game.handleQuizAns(index === data.answer, btn); c.appendChild(btn); });
    },
    
    showFinalResults(playersObj) {
        this.hideAll(); document.getElementById('module-12').classList.remove('hidden'); document.getElementById('game-status').classList.add('hidden'); document.getElementById('scoreboard-container').classList.add('hidden'); document.getElementById('wait-overlay').classList.add('hidden');
        
        let teamScores = {};
        appStore.get('teams').forEach(t => teamScores[t.id] = 0);
        Object.values(playersObj).forEach(p => { if(teamScores[p.team] !== undefined) teamScores[p.team] += p.scores?.total || 0; });
        let maxScore = -1; let winningTeams = [];
        for(let t in teamScores) {
            if(teamScores[t] > maxScore) { maxScore = teamScores[t]; winningTeams = [t]; }
            else if (teamScores[t] === maxScore) { winningTeams.push(t); }
        }

        const tw = document.getElementById('final-team-winner'); const tw_text = document.getElementById('final-team-text');
        if(tw) {
            tw.classList.remove('hidden');
            if(winningTeams.length === 1) { 
                const theme = animalThemes[winningTeams[0]] || animalThemes['eagle'];
                const bgClass = tailwindColors[theme.color].heavy;
                tw.className = `mb-10 rounded-xl p-6 text-white border-2 shadow-xl ${bgClass}`;
                tw_text.innerHTML = `TEAM WINS! (${maxScore} pts)`; 
            }
            else { tw.className = `mb-10 rounded-xl p-6 text-white border-2 shadow-xl bg-slate-800`; tw_text.innerHTML = `IT'S A TIE! (${maxScore} pts)`; }
        }

        const sorted = Object.values(playersObj).sort((a,b) => (b.scores?.total || 0) - (a.scores?.total || 0)); 
        const list = document.getElementById('final-leaderboard-list'); 
        if(list) list.innerHTML = '';
        
        sorted.forEach((p, i) => {
            const medal = getRankEmoji(p.scores?.total || 0, Object.values(playersObj));
            const theme = animalThemes[p.team] || animalThemes['eagle'];
            const tColorClass = tailwindColors[theme.color].text;

            // 🔥 UPDATED: Added dark mode classes for leaderboard items 🔥
            if(list) list.innerHTML += `<li class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100"><div class="flex items-center gap-4"><span class="font-bold text-slate-400 text-xl w-6">${i+1}.</span><div class="relative"><img src="${p.avatar}" class="w-12 h-12 rounded-full object-cover border-4 ${p.border || 'border-slate-300'} bg-white">${medal ? `<span class="absolute -bottom-2 -right-2 text-2xl drop-shadow">${medal}</span>` : ''}</div><div class="flex flex-col"><span class="font-bold text-slate-800 dark:text-white text-2xl leading-none">${p.name}</span><span class="text-xs font-bold uppercase ${tColorClass}">${theme.name} Team</span></div></div><span class="font-black text-indigo-600 dark:text-indigo-400 text-3xl">${p.scores?.total || 0} pts</span></li>`; 
        });
        
        if(appStore.get('role') === 'student') {
            document.getElementById('student-personal-stats').classList.remove('hidden'); const bars = document.getElementById('student-skill-bars'); bars.innerHTML = '';
            const me = appStore.get('me');
            ['Speaking', 'Writing', 'Listening', 'General'].forEach(sk => { const pts = me.scores[sk] || 0; bars.innerHTML += `<div><div class="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-1"><span>${sk}</span><span>${pts} pts</span></div><div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3"><div class="bg-indigo-600 h-3 rounded-full" style="width: ${Math.min(100, Math.max(0, pts*10))}%"></div></div></div>`; });
        }
        
        const cv = document.getElementById('confetti-canvas'); 
        if(cv) {
            cv.style.display = 'block'; 
            const ctx = cv.getContext('2d'); cv.width = window.innerWidth; cv.height = window.innerHeight; const pcs = []; const colors = ['#fde047', '#3b82f6', '#ef4444', '#10b981']; 
            for(let i=0; i<100; i++) pcs.push({x:cv.width/2, y:cv.height/2, vx:(Math.random()-0.5)*20, vy:(Math.random()-1)*20-5, size:Math.random()*10+5, color:colors[Math.floor(Math.random()*colors.length)]}); 
            function ani() { ctx.clearRect(0,0,cv.width,cv.height); let act = false; pcs.forEach(p=>{p.x+=p.vx; p.y+=p.vy; p.vy+=0.5; if(p.y<cv.height) act=true; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size);}); if(act) requestAnimationFrame(ani); } 
            ani();
        }
    }
};