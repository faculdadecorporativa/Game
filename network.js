// 🏗️ network.js
// Multi-Tenancy Architecture using Firebase Rooms (Isolated Sessions)

import { appStore } from './store.js';

export const app = {
    
    exitToHome() {
        clearInterval(appStore.state.countdownInterval);
        if(window.timerManager) window.timerManager.stop();
        if(window.game && window.game.isRecordingReadAloud) window.game.toggleReadAloud(true); 
        window.location.reload(); 
    },
    
    // --- PROFESSOR COMMANDS ---
    async hostGame() {
        appStore.set('role', 'host');
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        appStore.set('roomCode', pin);
        
        try {
            // 1. Create the isolated room in Firebase
            const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}`);
            await window.firebaseSet(roomRef, {
                gameState: { status: 'waiting', currentModule: 0, currentIndex: 0, timestamp: Date.now() },
                students: {} 
            });

            this.listenToRoom(pin);

            // 2. Update UI to show Professor Dashboard (Bulletproof Error Catching)
            if(window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll(); 
            
            const adminMod = document.getElementById('module-admin');
            if(adminMod) adminMod.classList.remove('hidden');
            
            const adminPin = document.getElementById('admin-pin');
            if(adminPin) adminPin.innerText = pin; 
            
            const roomDisplay = document.getElementById('room-code-display');
            if(roomDisplay) {
                roomDisplay.innerText = `[PIN: ${pin}]`;
                roomDisplay.classList.remove('hidden');
            }
            
            if(window.uiManager && window.uiManager.updateProfHUD) window.uiManager.updateProfHUD();
            
            // Prevents UI freeze if AdminController isn't ready
            if(window.adminUI && typeof window.adminUI.init === 'function') {
                window.adminUI.init();
            }
            
            console.log(`🏠 Room ${pin} initialized successfully!`);
        } catch (error) {
            console.error("Error creating room:", error);
            if(window.toast) window.toast("Error creating Dashboard. Check console.", false);
        }
    },

    async hostStartGame() {
        if(window.adminUI && window.adminUI.saveContent) window.adminUI.saveContent();
        
        const pin = appStore.get('roomCode');
        const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);
        
        // 1. Broadcast "countdown" state
        await window.firebaseSet(gameStateRef, {
            status: 'countdown',
            timeLeft: 60,
            timestamp: Date.now()
        });

        // 2. Update Professor UI
        const tabLobby = document.getElementById('tab-lobby');
        if(tabLobby) tabLobby.classList.add('hidden');
        
        if(window.adminUI && window.adminUI.switchTab) window.adminUI.switchTab('analytics'); 
        
        const controls = document.getElementById('prof-game-controls');
        if(controls) controls.classList.remove('hidden');
        
        const profMod = document.getElementById('prof-current-module');
        if(profMod) profMod.innerText = `Ready to Start`;
        
        const btnNext = document.getElementById('btn-broadcast-next');
        if(btnNext) btnNext.classList.remove('hidden');
    },

    hostNextModule() {
        const state = appStore.state;
        let m = 0, idx = 0;
        let lessonData = window.lessonData;
        
        const processModule = () => {
            if (state.currentModule === 0) { state.currentModule = 1; m = 1; }
            else if (state.currentModule === 1) { state.currentModule = 2; m = 2; idx = state.queues.dnd++; if(idx >= lessonData.vocabulary.length) { this.advQ(); return false; } }
            else if (state.currentModule === 2) { m = 2; idx = state.queues.dnd++; if(idx >= lessonData.vocabulary.length) { this.advQ(); return false; } }
            else if (state.currentModule === 3) { m = 3; idx = state.queues.hotspot++; if(idx >= lessonData.hotspots.length) { this.advQ(); return false; } }
            else if (state.currentModule === 4) { state.currentModule = 5; m = 5; idx = state.queues.audio++; if(idx >= lessonData.audioGuess.length) { this.advQ(); return false; } }
            else if (state.currentModule === 5) { m = 5; idx = state.queues.audio++; if(idx >= lessonData.audioGuess.length) { this.advQ(); return false; } }
            else if (state.currentModule === 6) { m = 6; idx = state.queues.spell++; if(idx >= lessonData.spellingBee.length) { this.advQ(); return false; } }
            else if (state.currentModule === 7) { m = 7; idx = state.queues.hangman++; if(idx >= lessonData.hangman.length) { this.advQ(); return false; } }
            else if (state.currentModule === 8) { m = 8; idx = state.queues.wally++; if(idx >= lessonData.wally.length) { this.advQ(); return false; } }
            else if (state.currentModule === 9) { m = 9; idx = state.queues.read++; if(idx >= lessonData.readAloud.length) { this.advQ(); return false; } }
            else if (state.currentModule === 10) { m = 10; idx = state.queues.dict++; if(idx >= lessonData.dictation.length) { this.advQ(); return false; } }
            else if (state.currentModule === 11) { m = 11; idx = state.queues.quiz++; if(idx >= lessonData.quiz.length) { this.advQ(); return false; } }
            else { return 'END'; }
            return true;
        };

        const result = processModule();
        if (result === false) return; 
        
        const pin = appStore.get('roomCode');
        const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);

        if (result === 'END') {
            window.firebaseSet(gameStateRef, { status: 'finished', timestamp: Date.now() });
            const profMod = document.getElementById('prof-current-module');
            if(profMod) profMod.innerText = "Game Over.";
            return;
        }

        state.currentIndex = idx;
        appStore.set('currentModule', m);
        
        const profMod = document.getElementById('prof-current-module');
        if(profMod) profMod.innerText = `Active: Module ${m} (Item ${idx+1})`;

        window.firebaseSet(gameStateRef, {
            status: 'playing',
            currentModule: m,
            currentIndex: idx,
            timestamp: Date.now()
        });

        if(window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
        if(window.game && window.game.startModule) window.game.startModule(m, idx);
    },
    
    advQ() { 
        const state = appStore.state;
        state.currentModule++; 
        if (state.currentModule === 4) {
            const pin = appStore.get('roomCode');
            const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);
            
            window.firebaseSet(gameStateRef, { status: 'playing', currentModule: 4, currentIndex: 0, timestamp: Date.now() });
            
            const profMod = document.getElementById('prof-current-module');
            if(profMod) profMod.innerText = `Active: Module 4 (Memory Match)`;
            if(window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
            if(window.game && window.game.startModule) window.game.startModule(4, 0);
        } else {
            this.hostNextModule(); 
        }
    },

    // --- STUDENT COMMANDS ---
    showJoinPinScreen() {
        if(window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll(); 
        const pinMod = document.getElementById('module-join-pin');
        if(pinMod) pinMod.classList.remove('hidden');
        
        // MENTOR FIX: Target the correct UI element ID
        const joinInput = document.getElementById('join-pin-input');
        if(joinInput) joinInput.value = '';
        
        // MENTOR FIX: Target the correct Button ID
        const btn = document.getElementById('btn-join-lobby');
        if(btn) { btn.innerText = "Enter Lobby"; btn.disabled = false; btn.classList.replace('opacity-50', 'opacity-100'); }
    },
    
    // MENTOR FIX: Replaced connectToHost() with joinGame(pin) to match UI
    async joinGame(pin) {
        const btn = document.getElementById('btn-join-lobby');
        if(btn) { btn.innerText = "Connecting..."; btn.disabled = true; btn.classList.replace('opacity-100', 'opacity-50'); }

        const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);
        const snapshot = await window.firebaseGet(roomRef);
        
        if (!snapshot.exists()) {
            if(btn) { btn.innerText = "Enter Lobby"; btn.disabled = false; btn.classList.replace('opacity-50', 'opacity-100'); }
            return window.toast("The Room PIN is wrong or the Professor is not online.", false);
        }

        appStore.set('role', 'student');
        appStore.set('roomCode', pin);
        
        const me = appStore.get('me');
        const studentRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students/${me.phone}`);
        
        await window.firebaseSet(studentRef, {
            name: me.name, avatar: me.avatar, phone: me.phone, team: me.team, border: me.border, scores: me.scores
        });

        this.listenToRoom(pin);

        if(window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll(); 
        const waitMod = document.getElementById('module-waiting');
        if(waitMod) waitMod.classList.remove('hidden');
        
        const gStatus = document.getElementById('game-status');
        if(gStatus) gStatus.classList.remove('hidden');
        
        if(window.uiManager && window.uiManager.updateStudentHUD) window.uiManager.updateStudentHUD();
        
        const roomDisplay = document.getElementById('room-code-display');
        if(roomDisplay) { roomDisplay.innerText = `[PIN: ${pin}]`; roomDisplay.classList.remove('hidden'); }
    },

    // --- SHARED: REALTIME SYNC ENGINE ---
    listenToRoom(pin) {
        const studentsRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students`);
        const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);

        window.firebaseOnValue(studentsRef, (snapshot) => {
            const data = snapshot.val() || {};
            appStore.set('players', data);
            
            if (appStore.get('role') === 'host') {
                if(window.adminUI && window.adminUI.updateLobbyList) {
                    window.adminUI.updateLobbyList();
                    window.adminUI.updateTeamScores();
                    window.adminUI.updateAnalytics();
                }
            } else {
                if(window.uiManager && window.uiManager.updateScoreboard) window.uiManager.updateScoreboard();
            }
        });

        window.firebaseOnValue(gameStateRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            if (appStore.get('role') === 'student') {
                if (data.status === 'countdown') {
                    const waitSpinner = document.getElementById('wait-spinner');
                    if(waitSpinner) waitSpinner.classList.add('hidden');
                    
                    const waitTitle = document.getElementById('wait-title');
                    if(waitTitle) waitTitle.innerText = "Game Starting!";
                    
                    const waitSub = document.getElementById('wait-subtitle');
                    if(waitSub) waitSub.innerText = "Get ready...";
                    
                    const cdEl = document.getElementById('wait-countdown');
                    if(cdEl) {
                        cdEl.classList.remove('hidden');
                        let t = data.timeLeft || 60; 
                        cdEl.innerText = t;
                        clearInterval(appStore.state.countdownInterval);
                        appStore.state.countdownInterval = setInterval(()=>{
                            t--; if(t>=0) cdEl.innerText = t;
                            if(t<=0) clearInterval(appStore.state.countdownInterval);
                        }, 1000);
                    }
                } 
                else if (data.status === 'playing') {
                    clearInterval(appStore.state.countdownInterval);
                    if(window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
                    if(window.game && window.game.startModule) window.game.startModule(data.currentModule, data.currentIndex);
                    appStore.set('currentModule', data.currentModule);
                }
                else if (data.status === 'finished') {
                    if(window.uiManager && window.uiManager.showFinalResults) window.uiManager.showFinalResults(appStore.get('players'));
                }
            }
        });
    },

    async updateStudentScore(points, skillArea) {
        const pin = appStore.get('roomCode');
        const me = appStore.get('me');
        if (!pin || !me || !me.phone) return;

        me.scores.total += points;
        me.scores[skillArea] += points;
        appStore.set('me', me);

        const studentScoreRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students/${me.phone}/scores`);
        await window.firebaseSet(studentScoreRef, me.scores);
    }
};