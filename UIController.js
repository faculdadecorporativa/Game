// UIController.js
// Handles visual updates (Heavily Stylized with Glassmorphism)

import { tailwindColors, animalThemes } from './data.js';
import { appStore } from './store.js';

function getRankEmoji(score, allPlayers) {
    const uniqueScores = [...new Set(allPlayers.map(p => p.score || p.scores?.total || 0))].sort((a, b) => b - a);
    const rank = uniqueScores.indexOf(score);
    if (rank === 0) return '&#129351;'; if (rank === 1) return '&#129352;'; if (rank === 2) return '&#129353;'; return '';
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
                <div id="prof-hud-container" class="flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg rounded-full pr-5 p-1.5 transition-all">
                    <img src="${savedAvatar}" alt="Prof" class="w-10 h-10 rounded-full border-2 border-indigo-400 mr-3 object-cover bg-slate-100 dark:bg-slate-900 shadow-inner">
                    <div class="flex flex-col leading-tight text-left">
                        <span class="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black">Host</span>
                        <span class="text-sm font-bold text-slate-800 dark:text-white" id="prof-hud-name">${profName}</span>
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
        <div class="flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg rounded-full pr-5 p-1.5 transition-all">
            <img src="${me.avatar}" class="w-10 h-10 rounded-full border-2 ${me.border || 'border-slate-300'} object-cover bg-slate-100 dark:bg-slate-900 mr-3 shadow-inner">
            <div class="flex flex-col leading-tight">
                <span class="text-xs text-slate-800 dark:text-white font-black">${me.name} <span class="${tColorClass} ml-1 font-bold text-[10px] uppercase tracking-widest">[${myTheme.icon || ''} ${myTheme.name}]</span></span>
                <span class="text-sm font-black text-amber-500 drop-shadow-sm">Score: ${me.scores?.total || 0}</span>
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
            c.innerHTML += `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border-slate-200 dark:border-white/10 text-slate-800 dark:text-white transition-all hover:scale-105">
                <img src="${p.avatar}" class="w-6 h-6 rounded-full border ${p.border || 'border-slate-300'} object-cover bg-slate-100 dark:bg-slate-900">
                <span class="pl-1 font-bold text-sm leading-none">${p.name}: <span class="${tailwindColors[theme.color].text}">${p.scores?.total || 0}</span></span>
            </div>`;
        });
    },
    
    lockModule() { 
        if(appStore.get('role') === 'host') return;
        document.querySelectorAll('button, input, textarea, .hotspot-area, .ttt-cell, .puzzle-cell').forEach(e => { 
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
        document.querySelectorAll('button, input, textarea, .hotspot-area, .ttt-cell, .puzzle-cell').forEach(e => { e.style.pointerEvents = 'auto'; }); 
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
        window.lessonData.vocabulary.forEach(item => { 
            c.innerHTML += `
            <div class="perspective-1000 h-48 w-full group">
                <div class="flip-card-inner transform-style-3d relative w-full h-full text-center shadow-md hover:shadow-xl rounded-2xl cursor-pointer transition-all duration-500" onclick="this.parentElement.classList.toggle('flipped')">
                    <div class="backface-hidden absolute w-full h-full bg-white dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col justify-center items-center p-6">
                        <h3 class="text-2xl font-black text-indigo-700 dark:text-indigo-400 drop-shadow-sm">${item.term}</h3>
                        <button onclick="event.stopPropagation(); window.speakText('${item.term}');" class="mt-4 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/40 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full font-bold transition-colors shadow-sm active:scale-95">Listen</button>
                    </div>
                    <div class="backface-hidden rotate-y-180 absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex justify-center items-center p-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                        <p class="text-white font-medium text-base md:text-lg leading-relaxed drop-shadow-md">${item.def}</p>
                    </div>
                </div>
            </div>`; 
        });
    },
    
    initPuzzleUI(opponentName, bgImage, gridSize) {
        document.getElementById('puzzle-player-1').innerText = appStore.get('me')?.name || "You";
        document.getElementById('puzzle-player-2').innerText = opponentName;
        
        const bgEl = document.getElementById('puzzle-bg-img');
        if (bgEl && bgImage) {
            bgEl.style.backgroundImage = `url(${bgImage})`;
        }
        
        const boardEl = document.getElementById('puzzle-board');
        if (boardEl) {
            const gridCols = gridSize === 4 ? 'grid-cols-4' : (gridSize === 3 ? 'grid-cols-3' : 'grid-cols-2');
            const gridRows = gridSize === 4 ? 'grid-rows-4' : (gridSize === 3 ? 'grid-rows-3' : 'grid-rows-2');
            
            let html = '';
            const totalTiles = gridSize * gridSize;
            
            for (let i=0; i < totalTiles; i++) {
                html += `<div id="puzzle-cell-${i}" onclick="if(window.game && window.game.handlePuzzleClick) window.game.handlePuzzleClick(${i})" class="puzzle-cell bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-300 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] group">
                    <span class="text-slate-400 dark:text-slate-500 font-black ${gridSize === 4 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'} opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:text-indigo-500 transition-all">?</span>
                </div>`;
            }
            
            boardEl.innerHTML = html;
            boardEl.className = `absolute inset-0 z-10 grid gap-1 md:gap-2 transition-all duration-300 p-1 md:p-2 ${gridCols} ${gridRows}`;
        }
        this.setPuzzleStatus("Your Turn! Select a tile to reveal.", true);
    },

    updatePuzzleBoard(board) {
        for(let i=0; i<board.length; i++) {
            const cell = document.getElementById(`puzzle-cell-${i}`);
            if(cell && board[i]) {
                cell.classList.remove('bg-white/90', 'dark:bg-slate-900/90', 'backdrop-blur-xl', 'hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]');
                cell.classList.add('bg-transparent', 'backdrop-blur-none');
                cell.innerHTML = ''; 
                
                if(board[i] === 'P1') {
                    cell.classList.add('border-4', 'border-indigo-500', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.8)]');
                } else {
                    cell.classList.add('border-4', 'border-rose-500', 'shadow-[inset_0_0_20px_rgba(244,63,94,0.8)]');
                }
            }
        }
    },

    setPuzzleStatus(msg, isMyTurn) {
        const st = document.getElementById('puzzle-status');
        if(st) {
            st.innerText = msg;
            if(isMyTurn) {
                st.classList.replace('text-rose-500', 'text-indigo-500');
                st.classList.replace('dark:text-rose-400', 'dark:text-indigo-400');
            } else {
                st.classList.replace('text-indigo-500', 'text-rose-500');
                st.classList.replace('dark:text-indigo-400', 'dark:text-rose-400');
            }
        }
    },

    showPuzzleQuestion(qData) {
        const overlay = document.getElementById('puzzle-question-overlay');
        const qText = document.getElementById('puzzle-q-text');
        const optsContainer = document.getElementById('puzzle-options');
        
        if(!overlay || !qText || !optsContainer) return;
        
        qText.innerText = qData.q;
        optsContainer.innerHTML = '';
        
        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-800 dark:text-white hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300";
            btn.innerText = opt;
            btn.onclick = () => window.game.handlePuzzleAnswer(idx === qData.answer, btn);
            optsContainer.appendChild(btn);
        });
        
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    },

    hidePuzzleQuestion() {
        const overlay = document.getElementById('puzzle-question-overlay');
        if(overlay) {
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    },
    
    renderHotspot(data) {
        const promptEl = document.getElementById('hotspot-prompt');
        if (promptEl) promptEl.innerText = data.prompt;
        
        const bgImg = document.getElementById('hotspot-bg');
        if (bgImg && window.lessonData?.visualAssessment?.image) {
            bgImg.src = window.lessonData.visualAssessment.image;
            bgImg.classList.remove('opacity-50', 'dark:opacity-20');
        }
        
        const layer = document.getElementById('hotspots-layer'); 
        if (!layer) return;
        layer.innerHTML = '';
        
        const target = document.createElement('div'); 
        target.className = 'hotspot-area absolute z-20 cursor-crosshair transition-all duration-300'; 
        target.style.top = `${data.target.top}%`; 
        target.style.left = `${data.target.left}%`; 
        target.style.width = `${data.target.width}%`; 
        target.style.height = `${data.target.height}%`;
        
        let clicked = false;
        
        target.onclick = (e) => { 
            e.stopPropagation(); 
            if(clicked) return; 
            clicked = true; 
            
            target.classList.add('border-4', 'border-emerald-500', 'bg-emerald-500/40', 'shadow-[0_0_20px_rgba(16,185,129,0.8)]', 'rounded-lg'); 
            if(window.game && window.game.handleHotspot) window.game.handleHotspot(true); 
        };
        
        const bg = document.getElementById('image-container'); 
        if (bg) {
            bg.onclick = () => { 
                if(clicked) return; 
                clicked=true; 
                
                target.classList.add('border-4', 'border-rose-500', 'bg-rose-500/40', 'shadow-[0_0_20px_rgba(244,63,94,0.8)]', 'rounded-lg'); 
                if(window.game && window.game.handleHotspot) window.game.handleHotspot(false); 
            };
        }
        layer.appendChild(target); 
    },
    
    initTicTacToeUI(opponentName, gridSize) {
        document.getElementById('ttt-player-x').innerText = appStore.get('me')?.name || "You";
        document.getElementById('ttt-player-o').innerText = opponentName;
        
        const boardEl = document.getElementById('ttt-board');
        if(boardEl) {
            const gridCols = gridSize === 4 ? 'grid-cols-4' : (gridSize === 3 ? 'grid-cols-3' : 'grid-cols-2');
            const gridRows = gridSize === 4 ? 'grid-rows-4' : (gridSize === 3 ? 'grid-rows-3' : 'grid-rows-2');
            
            let html = '';
            const totalTiles = gridSize * gridSize;
            
            for (let i=0; i < totalTiles; i++) {
                html += `<div id="ttt-cell-${i}" onclick="if(window.game && window.game.handleTTTClick) window.game.handleTTTClick(${i})" class="ttt-cell bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl flex items-center justify-center ${gridSize === 4 ? 'text-4xl md:text-5xl' : 'text-6xl md:text-7xl'} font-black cursor-pointer shadow-sm border border-slate-200 dark:border-white/10 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] active:scale-95 aspect-square select-none"></div>`;
            }
            
            boardEl.innerHTML = html;
            boardEl.className = `grid gap-2 md:gap-3 aspect-square w-full relative z-10 transition-all duration-300 ${gridCols} ${gridRows}`;
        }
        this.setTTTStatus("Your Turn! Select a square.", true);
    },

    updateTTTBoard(board) {
        for(let i=0; i<board.length; i++) {
            const cell = document.getElementById(`ttt-cell-${i}`);
            if(cell && board[i]) {
                cell.innerText = board[i];
                if(board[i] === 'X') {
                    cell.classList.add('text-indigo-500', 'dark:text-indigo-400', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]');
                } else {
                    cell.classList.add('text-rose-500', 'dark:text-rose-400', 'shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]');
                }
            }
        }
    },

    setTTTStatus(msg, isMyTurn) {
        const st = document.getElementById('ttt-status');
        if(st) {
            st.innerText = msg;
            if(isMyTurn) {
                st.classList.replace('text-rose-500', 'text-indigo-500');
                st.classList.replace('dark:text-rose-400', 'dark:text-indigo-400');
            } else {
                st.classList.replace('text-indigo-500', 'text-rose-500');
                st.classList.replace('dark:text-indigo-400', 'dark:text-rose-400');
            }
        }
    },

    showTTTQuestion(qData) {
        const overlay = document.getElementById('ttt-question-overlay');
        const qText = document.getElementById('ttt-q-text');
        const optsContainer = document.getElementById('ttt-options');
        
        if(!overlay || !qText || !optsContainer) return;
        
        qText.innerText = qData.q;
        optsContainer.innerHTML = '';
        
        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-800 dark:text-white hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300";
            btn.innerText = opt;
            btn.onclick = () => window.game.handleTTTAnswer(idx === qData.answer, btn);
            optsContainer.appendChild(btn);
        });
        
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    },

    hideTTTQuestion() {
        const overlay = document.getElementById('ttt-question-overlay');
        if(overlay) {
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    },

    renderMemoryGrid(cards) {
        const grid = document.getElementById('memory-grid');
        if(!grid) return;
        grid.innerHTML = '';
        
        let cols = 'grid-cols-3 md:grid-cols-4';
        if (cards.length > 12) cols = 'grid-cols-4 md:grid-cols-5';
        else if (cards.length <= 6) cols = 'grid-cols-2 md:grid-cols-3';
        
        grid.className = `grid gap-2 md:gap-4 w-full transition-all duration-500 ${cols}`;
        
        cards.forEach((card, i) => {
            grid.innerHTML += `
            <div class="perspective-1000 aspect-[4/3] w-full group cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300" onclick="if(window.game && window.game.handleMemoryClick) window.game.handleMemoryClick(${i})">
                <div id="mem-card-${i}" class="flip-card-inner transform-style-3d relative w-full h-full text-center shadow-sm hover:shadow-lg rounded-xl transition-transform duration-500">
                    <div class="front-face flex flex-col justify-center items-center p-2 cursor-pointer z-20 absolute inset-0 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-white/10">
                        <span class="text-3xl md:text-4xl opacity-50 drop-shadow-sm">&#10068;</span>
                    </div>
                    <div class="back-face rotate-y-180 absolute inset-0 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-500/50 rounded-xl flex justify-center items-center p-2 cursor-pointer z-10 overflow-hidden shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]">
                        <div class="font-bold text-sm md:text-base break-words w-full dark:text-white drop-shadow-sm">${card.content}</div>
                    </div>
                </div>
            </div>`;
        });
        
        this.updateMemoryProgress();
    },
    
    flipMemoryCard(idx) {
        const card = document.getElementById(`mem-card-${idx}`);
        if(card) card.parentElement.classList.add('flipped');
    },
    
    unflipMemoryCard(idx) {
        const card = document.getElementById(`mem-card-${idx}`);
        if(card) card.parentElement.classList.remove('flipped');
    },
    
    markMemoryMatched(idx1, idx2) {
        const c1 = document.getElementById(`mem-card-${idx1}`);
        const c2 = document.getElementById(`mem-card-${idx2}`);
        if(c1) {
            c1.parentElement.classList.add('matched');
            c1.parentElement.classList.remove('cursor-pointer');
        }
        if(c2) {
            c2.parentElement.classList.add('matched');
            c2.parentElement.classList.remove('cursor-pointer');
        }
        this.updateMemoryProgress();
    },
    
    updateMemoryProgress() {
        const d = appStore.get('localGameData');
        const p = document.getElementById('memory-progress');
        if(p && d) p.innerText = `Matches: ${d.memMatched || 0} / ${d.memTotal || 0}`;
    },

    renderAudio(data) {
        document.getElementById('btn-audio-listen').onclick = () => window.speakText(data.desc); const c = document.getElementById('audio-options-container'); c.innerHTML = ''; c.dataset.answer = data.answer;
        data.options.forEach((opt, idx) => { 
            const btn = document.createElement('button'); 
            btn.className = "w-full text-left p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-800 dark:text-white hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300"; 
            btn.innerText = opt; 
            btn.onclick = () => window.game.handleAudioAns(idx === data.answer, btn); 
            c.appendChild(btn); 
        });
    },
    
    renderHangman(phrase) {
        this.updateHangmanArt(); this.updateHangmanWord(); const kbd = document.getElementById('hangman-keyboard'); kbd.innerHTML = '';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(char => { 
            const btn = document.createElement('button'); 
            btn.id = `hm-btn-${char}`; 
            btn.className = "w-10 h-10 font-bold rounded-xl shadow-sm border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-white hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"; 
            btn.innerText = char; 
            btn.onclick = () => window.game.handleHangmanGuess(char); 
            kbd.appendChild(btn); 
        });
    },
    updateHangmanArt() { document.getElementById('hangman-art').innerText = hangmanArtFrames[appStore.get('localGameData').hmStrikes]; },
    updateHangmanWord() {
        const c = document.getElementById('hangman-word'); c.innerHTML = '';
        appStore.get('localGameData').hmPhrase.split('').forEach(char => { const span = document.createElement('span'); if (char === ' ') span.innerHTML = '&nbsp;&nbsp;'; else { span.className = "border-b-4 border-indigo-700 dark:border-indigo-400 mx-1 w-6 inline-block text-center shadow-sm"; span.innerText = appStore.get('localGameData').hmGuessed.includes(char) ? char : '_'; } c.appendChild(span); });
    },
    
    renderReadAloud(data) { 
        const wrappedText = data.text.split(' ').map(word => { 
            return `<span class="read-aloud-word transition-colors duration-200">${word}</span>`; 
        }).join(' ');
        
        const targetEl = document.getElementById('read-aloud-target');
        if(targetEl) targetEl.innerHTML = wrappedText; 
        
        const btn = document.getElementById('btn-record-read'); 
        btn.style.pointerEvents = 'auto';
        btn.className = "bg-rose-500 hover:bg-rose-600 text-white font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)] text-xl mx-auto flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"; 
        document.getElementById('record-icon').innerText = "Record"; document.getElementById('record-text').innerText = "Start Recording";
        const status = document.getElementById('read-status-feedback');
        if (status) { 
            status.innerHTML = '<span class="text-slate-400">Ready to record</span>'; 
            status.dataset.state = 'ready'; 
        }
        
        if(window.game && window.game.isRecordingReadAloud) window.game.stopReadAloud(true);
    },
    
    renderDictation(data) { 
        const btn = document.getElementById('btn-dict-listen');
        if(btn) btn.onclick = () => window.speakText(data.text); 
        
        const inp = document.getElementById('dict-input'); 
        if(inp) {
            inp.value = ''; 
            inp.dataset.target = data.text; 
        }
    },
    
    renderQuiz(data) {
        document.getElementById('quiz-question-text').innerText = data.q; const c = document.getElementById('quiz-options-container'); c.innerHTML = ''; c.dataset.answer = data.answer;
        data.options.forEach((opt, index) => { 
            const btn = document.createElement('button'); 
            btn.className = "w-full text-left p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-800 dark:text-white hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300"; 
            btn.innerText = opt; 
            btn.onclick = () => window.game.handleQuizAns(index === data.answer, btn); 
            c.appendChild(btn); 
        });
    },
    
    showFinalResults(playersObj) {
        this.hideAll(); 
        document.getElementById('module-12').classList.remove('hidden'); 
        document.getElementById('game-status').classList.add('hidden'); 
        document.getElementById('scoreboard-container').classList.add('hidden'); 
        document.getElementById('wait-overlay').classList.add('hidden');
        
        let teamScores = {};
        appStore.get('teams').forEach(t => teamScores[t.id] = 0);
        Object.values(playersObj).forEach(p => { if(teamScores[p.team] !== undefined) teamScores[p.team] += p.scores?.total || 0; });
        let maxScore = -1; let winningTeams = [];
        for(let t in teamScores) {
            if(teamScores[t] > maxScore) { maxScore = teamScores[t]; winningTeams = [t]; }
            else if (teamScores[t] === maxScore) { winningTeams.push(t); }
        }

        const tw = document.getElementById('final-team-winner'); 
        const tw_text = document.getElementById('final-team-text');
        if(tw) {
            tw.classList.remove('hidden');
            if(winningTeams.length === 1) { 
                const theme = animalThemes[winningTeams[0]] || animalThemes['eagle'];
                const bgClass = tailwindColors[theme.color].heavy;
                tw.className = `mb-10 rounded-2xl p-8 text-white border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] ${bgClass} backdrop-blur-xl relative overflow-hidden transform hover:scale-105 transition-all`;
                tw_text.innerHTML = `TEAM WINS! (${maxScore} pts)`; 
            }
            else { tw.className = `mb-10 rounded-2xl p-8 text-white border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] bg-slate-800 backdrop-blur-xl relative overflow-hidden transform hover:scale-105 transition-all`; tw_text.innerHTML = `IT'S A TIE! (${maxScore} pts)`; }
        }

        const sorted = Object.values(playersObj).sort((a,b) => (b.scores?.total || 0) - (a.scores?.total || 0)); 
        const list = document.getElementById('final-leaderboard-list'); 
        if(list) list.innerHTML = '';
        
        sorted.forEach((p, i) => {
            const medal = getRankEmoji(p.scores?.total || 0, Object.values(playersObj));
            const theme = animalThemes[p.team] || animalThemes['eagle'];
            const tColorClass = tailwindColors[theme.color].text;

            if(list) list.innerHTML += `
            <li class="flex justify-between items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg mb-4 transform hover:-translate-y-1 transition-all">
                <div class="flex items-center gap-4">
                    <span class="font-black text-slate-400 dark:text-slate-500 text-2xl w-8 text-center drop-shadow-sm">${i+1}.</span>
                    <div class="relative">
                        <img src="${p.avatar}" class="w-14 h-14 rounded-full object-cover border-4 ${p.border || 'border-slate-300'} bg-slate-100 dark:bg-slate-700 shadow-inner">
                        ${medal ? `<span class="absolute -bottom-2 -right-2 text-3xl drop-shadow-lg filter hover:scale-110 transition-transform cursor-default">${medal}</span>` : ''}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black text-slate-800 dark:text-white text-2xl leading-none drop-shadow-sm">${p.name}</span>
                        <span class="text-xs font-black uppercase tracking-widest ${tColorClass} drop-shadow-sm mt-1">${theme.icon || ''} ${theme.name} Team</span>
                    </div>
                </div>
                <span class="font-black text-indigo-600 dark:text-indigo-400 text-4xl drop-shadow-md pr-4">${p.scores?.total || 0} pts</span>
            </li>`; 
        });
        
        if(appStore.get('role') === 'student') {
            document.getElementById('student-personal-stats').classList.remove('hidden'); const bars = document.getElementById('student-skill-bars'); bars.innerHTML = '';
            const me = appStore.get('me');
            ['Speaking', 'Writing', 'Listening', 'General'].forEach(sk => { const pts = me.scores[sk] || 0; bars.innerHTML += `<div><div class="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-1 tracking-wider uppercase"><span>${sk}</span><span class="text-indigo-600 dark:text-indigo-400">${pts} pts</span></div><div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 shadow-inner"><div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style="width: ${Math.min(100, Math.max(0, pts*10))}%"></div></div></div>`; });
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