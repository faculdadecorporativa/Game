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

            // 2. Update UI to show Professor Dashboard
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
        try {
            // 1. Force a final local save of the lesson data
            if(window.adminUI && window.adminUI.saveContent) window.adminUI.saveContent();
            
            const pin = appStore.get('roomCode');
            
            // 🔥 CRITICAL FIREBASE CRASH FIX: Strip out all 'undefined' array holes!
            const cleanLessonData = JSON.parse(JSON.stringify(window.lessonData || {}));

            // 2. Broadcast the pristine lesson data to the live room
            if (cleanLessonData && Object.keys(cleanLessonData).length > 0) {
                const dataRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/lessonData`);
                await window.firebaseSet(dataRef, cleanLessonData);
                console.log("📡 Broadcasted sanitized custom lesson data to room!");
            }

            // 3. Initialize dynamic routing state
            appStore.state.activeModules = cleanLessonData.activeModules || [1,2,3,4,5,6,7,8,9,10,11];
            if (appStore.state.activeModules.length === 0) {
                return window.toast("Please check at least one active module!", false);
            }
            
            appStore.state.currentModuleIndex = 0;
            appStore.state.queues = { study: 0, puzzle: 0, hotspot: 0, tictactoe: 0, audio: 0, spell: 0, hangman: 0, memory: 0, read: 0, dict: 0, quiz: 0 };

            // Update Professor UI immediately so it doesn't look frozen
            const tabLobby = document.getElementById('tab-lobby');
            if(tabLobby) tabLobby.classList.add('hidden');
            
            if(window.adminUI && window.adminUI.switchTab) window.adminUI.switchTab('analytics'); 
            
            // Auto-Open Live Game View
            appStore.set('isLiveViewOpen', true);
            const toggleBtn = document.getElementById('btn-toggle-live');
            if(toggleBtn) toggleBtn.innerText = "Close Live View";
            
            const controls = document.getElementById('prof-game-controls');
            if(controls) controls.classList.remove('hidden');
            
            const btnNext = document.getElementById('btn-broadcast-next');
            if(btnNext) btnNext.classList.remove('hidden');

            // 4. Trigger the Router!
            this.hostNextModule();

        } catch (error) {
            console.error("Crash during hostStartGame:", error);
            if(window.toast) window.toast("Error launching session! Check console logs.", false);
        }
    },

    // 🔥 DYNAMIC BULLETPROOF ROUTING ENGINE 🔥
    hostNextModule() {
        const state = appStore.state;
        let activeMods = state.activeModules || window.lessonData.activeModules || [1,2,3,4,5,6,7,8,9,10,11];
        let lessonData = window.lessonData;
        
        if(!state.queues) state.queues = { study: 0, puzzle: 0, hotspot: 0, tictactoe: 0, audio: 0, spell: 0, hangman: 0, memory: 0, read: 0, dict: 0, quiz: 0 };
        if(state.currentModuleIndex === undefined) state.currentModuleIndex = 0;

        let m = activeMods[state.currentModuleIndex];
        
        // If we ran out of modules, end the game smoothly
        if (!m) {
            const pin = appStore.get('roomCode');
            const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);
            window.firebaseSet(gameStateRef, { status: 'finished', timestamp: Date.now() });
            
            const profMod = document.getElementById('prof-current-module');
            if(profMod) profMod.innerText = "Game Over. Check Leaderboard!";
            
            appStore.set('currentModule', 12);
            if(window.uiManager && window.uiManager.showFinalResults) window.uiManager.showFinalResults(appStore.get('players'));
            return;
        }
        
        let idx = 0;
        let moveNext = false;

        // Verify Queues: Only increment and play if there are items left!
        if (m === 1) { idx = state.queues.study++; if(idx >= 1) moveNext = true; } 
        else if (m === 2) { idx = state.queues.puzzle++; if(idx >= 1) moveNext = true; } 
        else if (m === 3) { idx = state.queues.hotspot++; if(idx >= (lessonData.hotspots?.length || 1)) moveNext = true; }
        else if (m === 4) { idx = state.queues.tictactoe++; if(idx >= 1) moveNext = true; } 
        else if (m === 5) { idx = state.queues.audio++; if(idx >= (lessonData.audioGuess?.length || 1)) moveNext = true; }
        else if (m === 6) { idx = state.queues.spell++; if(idx >= (lessonData.spellingBee?.length || 1)) moveNext = true; }
        else if (m === 7) { idx = state.queues.hangman++; if(idx >= (lessonData.hangman?.length || 1)) moveNext = true; }
        else if (m === 8) { idx = state.queues.memory++; if(idx >= 1) moveNext = true; } 
        else if (m === 9) { idx = state.queues.read++; if(idx >= (lessonData.readAloud?.length || 1)) moveNext = true; }
        else if (m === 10) { idx = state.queues.dict++; if(idx >= (lessonData.dictation?.length || 1)) moveNext = true; }
        else if (m === 11) { idx = state.queues.quiz++; if(idx >= (lessonData.quiz?.length || 1)) moveNext = true; }
        
        // If we ran out of questions for THIS module, jump to the NEXT module
        if (moveNext) {
            state.currentModuleIndex++;
            return this.hostNextModule(); // Recursively loop to next
        }

        // --- SUCCESS! BROADCAST MODULE ---
        state.currentIndex = idx;
        appStore.set('currentModule', m);
        
        if(window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll();
        
        // Show module to Professor if Live View is Open
        if(appStore.get('isLiveViewOpen')) {
            const mEl = document.getElementById(`module-${m}`);
            if(mEl) mEl.classList.remove('hidden');
        }

        const profMod = document.getElementById('prof-current-module');
        if(profMod) profMod.innerText = `Active: Module ${m} (Item ${idx+1})`;

        const pin = appStore.get('roomCode');
        const gameStateRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/gameState`);

        window.firebaseSet(gameStateRef, {
            status: 'playing',
            currentModule: m,
            currentIndex: idx,
            timestamp: Date.now()
        });

        if(window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
        if(window.game && window.game.startModule) window.game.startModule(m, idx);
    },

    // --- STUDENT COMMANDS ---
    showJoinPinScreen() {
        if(window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll(); 
        const pinMod = document.getElementById('module-join-pin');
        if(pinMod) pinMod.classList.remove('hidden');
        
        const joinInput = document.getElementById('join-pin-input');
        if(joinInput) joinInput.value = '';
        
        const btn = document.getElementById('btn-join-lobby');
        if(btn) { btn.innerText = "Enter Lobby"; btn.disabled = false; btn.classList.replace('opacity-50', 'opacity-100'); }
    },
    
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
        const dataRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/lessonData`); 

        if (appStore.get('role') === 'student') {
            window.firebaseOnValue(dataRef, (snapshot) => {
                if (snapshot.exists()) {
                    window.lessonData = snapshot.val();
                    console.log("📥 Custom lesson data downloaded from host!");
                }
            });
        }

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

        // 🔥 CRITICAL FIX: Asynchronous listener guarantees missing data is downloaded before rendering!
        window.firebaseOnValue(gameStateRef, async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            if (appStore.get('role') === 'student') {
                if (data.status === 'playing') {
                    clearInterval(appStore.state.countdownInterval);
                    const waitSpinner = document.getElementById('wait-spinner');
                    if(waitSpinner) waitSpinner.classList.add('hidden');
                    
                    // 🔥 STRICT SYNC: Force download if lessonData hasn't arrived yet!
                    if (!window.lessonData || Object.keys(window.lessonData).length === 0) {
                        const snap = await window.firebaseGet(dataRef);
                        if (snap.exists()) window.lessonData = snap.val();
                    }

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
        if (!me || !me.phone) return;

        // 1. Update Core Local Scoring Data
        me.scores.total += points;
        me.scores[skillArea] = (me.scores[skillArea] || 0) + points;
        
        // 2. Global Progression System (Gamification Integration)
        me.xp = (me.xp || 0) + points;
        me.coins = (me.coins || 0) + Math.max(1, Math.floor(points / 2)); // Dynamic coin scaling

        // 3. Analytics Dashboard Data Sync
        if (!me.skills) {
            me.skills = { reading: 0, writing: 0, speaking: 0, interpretation: 0, participation: 0, influence: 0 };
        }
        
        const lowerSkill = skillArea.toLowerCase();
        if (me.skills[lowerSkill] !== undefined) {
            // Cap skill percentages at 100 for the analytics UI matrix
            me.skills[lowerSkill] = Math.min(100, me.skills[lowerSkill] + points);
        }

        // 4. Level-Up Engine
        const nextLevelXp = (me.level || 1) * 1000;
        if (me.xp >= nextLevelXp) {
            me.level = (me.level || 1) + 1;
            if (window.toast) window.toast(`🎉 Level Up! You reached Level ${me.level}!`, true);
            if (me.id && window.firebaseRef && window.firebaseDB) {
                window.firebaseSet(window.firebaseRef(window.firebaseDB, `users/${me.id}/level`), me.level);
            }
        }

        // Lock state changes securely
        appStore.set('me', me);

        // 5. Save to the Active Session Room (Updates Professor HUD and Class Leaderboard)
        if (pin && window.firebaseRef && window.firebaseDB) {
            const studentScoreRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students/${me.phone}/scores`);
            await window.firebaseSet(studentScoreRef, me.scores);
        }

        // 6. Save directly to the Global User DB (Triggers real-time StateSyncController updates everywhere)
        if (me.id && window.firebaseRef && window.firebaseDB) {
            window.firebaseSet(window.firebaseRef(window.firebaseDB, `users/${me.id}/scores`), me.scores);
            window.firebaseSet(window.firebaseRef(window.firebaseDB, `users/${me.id}/xp`), me.xp);
            window.firebaseSet(window.firebaseRef(window.firebaseDB, `users/${me.id}/coins`), me.coins);
            window.firebaseSet(window.firebaseRef(window.firebaseDB, `users/${me.id}/skills`), me.skills);
        }
    }
};