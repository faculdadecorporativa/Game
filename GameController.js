// GameController.js
// This file handles the core game loop, scoring, and module logic using the appStore Vault.

import { appStore } from './store.js';

// 🔥 FIX: consolidates every PocketBase write submitScore() needs to make.
// The old code fired up to THREE separate Firebase writes per scoring
// event (extraLife decrement, doubleCoins decrement, then a full-record
// overwrite) with no error handling on any of them. This does exactly one
// `players` update with only the fields that actually changed — cheaper,
// and it can't clobber a concurrent update to fields it doesn't touch
// (e.g. an avatar change from handleCharacterSelection landing mid-game).
async function persistPlayerFields(me, fields) {
    if (!window.pb) {
        console.error("PocketBase client (window.pb) not found — score not persisted.");
        return;
    }
    // 🔥 IMPORTANT: `me.playerId` is the `players` collection record id
    // (set in auth.js's loginStudent). `me.uid` is the AUTH user id and is
    // NOT the right id to update here — see the note left in this
    // conversation's auth.js/authController.js review.
    if (!me?.playerId) {
        console.warn("No playerId on `me` — skipping remote score sync (host test session?).");
        return;
    }
    try {
        await window.pb.collection('players').update(me.playerId, fields);
    } catch (err) {
        // Fire-and-forget callers (handleQuizAns, handleAudioAns, etc.)
        // don't await submitScore(), so an unhandled rejection here would
        // vanish silently. Catch it, log it, and let the player know their
        // score might not have saved — much better than a silent data loss.
        console.error("Failed to persist score update:", err);
        if (window.toast) window.toast("⚠️ Score may not have saved — check your connection.", false);
    }
}

// 🏗️ ENTERPRISE CONFIG: This defines the order of your game modules.
const GameConfig = [
    { type: 'study', getTarget: () => null }, // Module 1
    { type: 'puzzle', getTarget: () => window.lessonData.puzzleMatch }, // Module 2 (NEW PVP PUZZLE)
    { type: 'hotspot', getTarget: (idx) => window.lessonData.hotspots[idx] }, // Module 3
    { type: 'tictactoe', getTarget: () => window.lessonData.ticTacToe }, // Module 4
    { type: 'audio', getTarget: (idx) => window.lessonData.audioGuess[idx] }, // Module 5
    { type: 'spelling', getTarget: (idx) => window.lessonData.spellingBee[idx] }, // Module 6
    { type: 'hangman', getTarget: (idx) => window.lessonData.hangman[idx] }, // Module 7
    { type: 'memory', getTarget: () => window.lessonData.memoryMatch }, // Module 8
    { type: 'readAloud', getTarget: (idx) => window.lessonData.readAloud[idx] }, // Module 9
    { type: 'dictation', getTarget: (idx) => window.lessonData.dictation[idx] }, // Module 10
    { type: 'quiz', getTarget: (idx) => window.lessonData.quiz[idx] } // Module 11
];

const cleanString = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

// 🔥 FIX: `arr.sort(() => Math.random() - 0.5)` is a well-known biased
// "shuffle" — sort comparators are not meant to be random, and this
// pattern systematically favors certain permutations over others (some
// items end up statistically more likely to land near the start/end).
// For quiz/question ordering that's a real fairness bug, not just a style
// nit. Proper Fisher–Yates shuffle, in place, uniform distribution.
const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const game = {
    isRecordingReadAloud: false, readAloudRecognition: null, finalTranscript: "", audioContext: null, analyser: null, micStream: null, volumeRAF: null,

    startModule(modNum, idx) {
        window.uiManager.hideAll(); 
        const mEl = document.getElementById(`module-${modNum}`); 
        if (mEl) {
            if (appStore.get('role') === 'host' && !appStore.get('isLiveViewOpen')) {
                mEl.classList.add('hidden');
            } else {
                mEl.classList.remove('hidden');
            }
        }
        
        // 🔥 FIX: none of these were null-checked, including `panel` below
        // — this runs at the top of EVERY module transition, so a single
        // missing element here previously broke the entire game loop, not
        // just one module.
        document.getElementById('scoreboard-container')?.classList.remove('hidden');
        document.getElementById('wait-overlay')?.classList.add('hidden');
        window.uiManager.unlockModule();
        
        const panel = document.getElementById('lifelines-panel');
        if (!panel) { console.error("#lifelines-panel missing from DOM — lifelines unavailable this module."); }
        else panel.classList.remove('hidden');
        const mount = document.getElementById(`lifeline-mount-${modNum}`); 
        if (mount && panel) { 
            mount.appendChild(panel); 
            window.lifelineManager.renderButtons(modNum); 
        } else if (panel) { 
            panel.classList.add('hidden'); 
        }
        
        appStore.set('currentModule', modNum);
        this.startTimer(60);

        const moduleConfig = GameConfig[modNum - 1]; 
        
        if (moduleConfig) {
            const targetData = moduleConfig.getTarget(idx);
            
            const componentActions = {
                'study': () => { window.timerManager.stop(); window.uiManager.renderStudy(); },
                'puzzle': () => this.initPuzzle(targetData),
                'hotspot': () => window.uiManager.renderHotspot(targetData),
                'tictactoe': () => this.initTicTacToe(targetData),
                'audio': () => window.uiManager.renderAudio(targetData),
                'spelling': () => window.uiManager.renderSpelling(targetData),
                'hangman': () => this.initHangman(targetData),
                'memory': () => this.initMemory(targetData),
                'readAloud': () => window.uiManager.renderReadAloud(targetData),
                'dictation': () => window.uiManager.renderDictation(targetData),
                'quiz': () => window.uiManager.renderQuiz(targetData)
            };

            if (componentActions[moduleConfig.type]) {
                componentActions[moduleConfig.type]();
            }
        }
    },
    
    // 🔥 FIX: `sec` was accepted but never used — `startModule()` calls
    // `this.startTimer(60)` expecting a 60-second timer, but the value was
    // silently discarded and `timerManager.start()` ran with whatever
    // default it has internally. Passing it through now. If
    // `timerManager.start()` doesn't accept a duration argument, this is a
    // harmless no-op — but if it does, this fixes every module's timer
    // possibly running the wrong length.
    startTimer(sec) { window.timerManager.start(sec); },
    
    async submitScore(points, skill, msg) {
        // NOTE: `window.uiManager.lockModule()` here is a no-op for hosts —
        // lockModule() itself starts with `if (role === 'host') return;`.
        // Harmless, but pointless; left as-is unless you want it removed.
        if(appStore.get('role') === 'host') { window.toast("Host test: " + msg, points > 0); window.uiManager.lockModule(); return; }

        window.timerManager.stop();
        let me = appStore.get('me');
        
        me.xp = me.xp || 0;
        me.coins = me.coins || 0;
        me.streak = me.streak || 0;
        me.maxStreak = me.maxStreak || 0;
        if (!me.scores) me.scores = { total: 0, General: 0, Listening: 0, Speaking: 0, Writing: 0 };
        if (typeof me.scores[skill] === 'undefined') me.scores[skill] = 0;

        if (points < 0 && me.inventory && me.inventory.extraLife > 0) {
            me.inventory.extraLife -= 1;
            appStore.set('me', me);
            // 🔥 FIX: was a Firebase partial-path write
            // (`users/${uid}/inventory/extraLife`). PocketBase JSON fields
            // don't support partial/nested-path writes — you send the
            // whole field. Persistence for this change is now folded into
            // the single consolidated write at the end of this function
            // (`me.inventory` is included there), so no separate call is
            // needed here.

            points = 0;
            msg = "&#128305; Saved by Extra Life!";
            window.toast(msg, true);
            window.sfx.play('correct'); 
            
            if (window.dashboardController) window.dashboardController.renderDashboard();
        } 
        else if(points > 0) {
            window.sfx.play('correct');
            me.streak++; 
            if (me.streak > me.maxStreak) me.maxStreak = me.streak; 
            
            let earnedXP = points * 10;
            let earnedCoins = points * 5;

            if(window.timerManager.timeLeft >= 50) {
                window.toast("Lightning Fast! +15 XP", true);
                earnedXP += 15;
            }
            if(me.streak === 2) {
                window.toast("Two in a row! &#128293;", true);
                earnedXP += 20;
            }
            if(me.streak >= 3) {
                window.toast(`Unstoppable! ${me.streak} Streak! &#129689;`, true);
                earnedXP += 50;
                earnedCoins += 10; 
            }

            if (me.inventory && me.inventory.doubleCoins > 0) {
                earnedCoins *= 2;
                me.inventory.doubleCoins -= 1;
                window.toast("&#129689; Double Coins Active! Earnings Multiplied!", true);
                // 🔥 FIX: same as extraLife above — no separate Firebase
                // write needed; `me.inventory` goes out in the single
                // consolidated update below.
            }

            me.xp += earnedXP;
            me.coins += earnedCoins;
            window.uiManager.showProfChat();
        } else {
            window.sfx.play('wrong');
            me.streak = 0; 
        }
        
        me.scores.total += points; 
        me.scores[skill] += points; 
        appStore.set('me', me);

        // 🔥 FIX: was `window.firebaseSet(userRef, me)` — overwrote the
        // ENTIRE remote record with the local `me` object on every single
        // scoring event, including fields that hadn't changed (name,
        // avatar, team, border, phone). Besides being wasteful, a
        // full-record overwrite risks clobbering a concurrent update to a
        // field this function doesn't own (e.g. an avatar change from
        // handleCharacterSelection landing between this read and this
        // write). Only send what actually changed.
        await persistPlayerFields(me, { xp: me.xp, coins: me.coins, streak: me.streak, maxStreak: me.maxStreak, scores: me.scores, inventory: me.inventory });

        window.uiManager.updateStudentHUD();
        if (window.dashboardController) window.dashboardController.renderDashboard(); 

        // 🔥 FIX (dead code removed): `appStore.get('hostConn')` /
        // `appStore.get('peer')` are leftovers from an earlier
        // peer-to-peer (WebRTC/PeerJS) sync architecture. Neither
        // `hostConn` nor `peer` is ever set anywhere in store.js's
        // current state, or written by auth.js/network.js — this branch
        // was always a silent no-op. The room/professor now learns about
        // score changes via the real-time `players` subscription
        // (see network.js's listenToRoom), so this call isn't needed.
        window.toast(msg + ` (${points > 0 ? '+'+points : points} pts)`, points > 0 || msg.includes("Extra Life")); 
        
        // 🔥 MULTIPLAYER SYNC FIX: Purged local auto-advancing timeouts. 
        // Students MUST wait for the Host to broadcast the next module via PocketBase!
        if (appStore.get('currentModule') !== 2 && appStore.get('currentModule') !== 4 && appStore.get('currentModule') !== 8) {
            window.uiManager.lockModule();
        }
    },

    // --- DYNAMIC PVP PUZZLE RACE ENGINE (MOD 2) ---
    initPuzzle(targetData) {
        if(appStore.get('role') === 'host') return; 
        
        let d = appStore.get('localGameData') || {};
        let puzData = targetData || window.lessonData?.puzzleMatch || {};
        
        let questions = structuredClone(puzData.questions || []);
        if (!questions || questions.length === 0) {
            questions = [{ q: "Did the Professor forget to add questions?", options: ["Yes", "No", "Maybe", "I don't know"], answer: 0 }];
        }
        
        const count = questions.length;
        const gridSize = count >= 10 ? 4 : (count >= 5 ? 3 : 2);
        const totalTiles = gridSize * gridSize;

        d.puzGridSize = gridSize;
        d.puzBoard = new Array(totalTiles).fill(null);
        d.puzTurn = 'P1'; 
        d.puzQuestions = shuffleArray([...questions]);
        d.puzP1Count = 0;
        d.puzP2Count = 0;
        
        const players = appStore.get('players') || {};
        const me = appStore.get('me');
        let opponentName = "AI Bot"; 
        // 🔥 FIX: filtered on `p.uid`, but roster records fetched via
        // network.js's `players`/`students` query may not carry a `uid`
        // field at all (depends on which fields that collection query
        // selects) — if it's undefined on every entry, this filter can
        // silently include the player themselves as their own "opponent".
        // Fall back to `phone`, which is guaranteed present and unique.
        const myKey = me?.playerId ?? me?.phone;
        const others = Object.values(players).filter(p => (p.playerId ?? p.phone) !== myKey);
        if(others.length > 0) {
            opponentName = others[Math.floor(Math.random() * others.length)].name;
        }
        
        d.puzOpponent = opponentName;
        appStore.set('localGameData', d);

        setTimeout(() => {
            if(window.uiManager) window.uiManager.initPuzzleUI(opponentName, puzData.image, gridSize);
        }, 100);
        
        window.timerManager.start();
    },

    handlePuzzleClick(idx) {
        let d = appStore.get('localGameData');
        if(d.puzTurn !== 'P1') return window.toast("Wait! It's not your turn yet.", false);
        if(d.puzBoard[idx] !== null) return window.toast("That tile is already revealed!", false);
        
        let q = d.puzQuestions.pop();
        if(!q) {
            let rawData = window.lessonData?.puzzleMatch?.questions || [];
            if (rawData.length === 0) rawData = [{ q: "Recycling Questions...", options: ["A", "B", "C", "D"], answer: 0 }];
            d.puzQuestions = shuffleArray(structuredClone(rawData));
            q = d.puzQuestions.pop();
        }
        
        d.pendingPuzIdx = idx;
        appStore.set('localGameData', d);
        
        window.uiManager.showPuzzleQuestion(q);
    },

    handlePuzzleAnswer(isCorrect, btn) {
        let d = appStore.get('localGameData');
        const idx = d.pendingPuzIdx;
        
        window.uiManager.hidePuzzleQuestion();
        
        if(isCorrect) {
            window.sfx.play('correct');
            d.puzBoard[idx] = 'P1';
            d.puzP1Count++;
            window.toast("Correct! You claimed a tile.", true);
            this.submitScore(2, "General", "Tile Claimed!"); 
        } else {
            window.sfx.play('wrong');
            window.toast("Incorrect! You lost your turn.", false);
            this.submitScore(-1, "General", "Missed question!");
        }
        
        appStore.set('localGameData', d);
        window.uiManager.updatePuzzleBoard(d.puzBoard);
        
        if(this.checkPuzzleWin(d)) return; 
        
        d.puzTurn = 'P2';
        appStore.set('localGameData', d);
        window.uiManager.setPuzzleStatus(`${d.puzOpponent} is thinking...`, false);
        
        setTimeout(() => this.simulatePuzzleOpponent(), 3000 + Math.random() * 2000);
    },

    simulatePuzzleOpponent() {
        let d = appStore.get('localGameData');
        let emptySpots = d.puzBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
        
        if(emptySpots.length === 0) return; 
        
        const getsItRight = Math.random() < 0.8;
        if(getsItRight) {
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            d.puzBoard[spot] = 'P2';
            d.puzP2Count++;
            window.toast(`${d.puzOpponent} answered correctly and claimed a tile!`, false);
            window.sfx.play('alert');
        } else {
            window.toast(`${d.puzOpponent} got their question wrong! Your turn!`, true);
        }
        
        appStore.set('localGameData', d);
        window.uiManager.updatePuzzleBoard(d.puzBoard);
        
        if(this.checkPuzzleWin(d)) return;
        
        d.puzTurn = 'P1';
        appStore.set('localGameData', d);
        window.uiManager.setPuzzleStatus(`Your Turn! Select a tile to reveal.`, true);
        window.uiManager.unlockModule();
    },

    checkPuzzleWin(d) {
        const winTarget = d.puzGridSize === 4 ? 9 : (d.puzGridSize === 3 ? 5 : 3);
        
        if(d.puzP1Count >= winTarget) {
            this.submitScore(15, "General", "&#127942; You won the Puzzle Race!");
            this.endPuzzle();
            return true;
        } else if (d.puzP2Count >= winTarget) {
            this.submitScore(-5, "General", "&#128128; You lost the Puzzle Race.");
            this.endPuzzle();
            return true;
        } else if (d.puzBoard.filter(v => v === null).length === 0) {
            this.submitScore(5, "General", "&#129309; Puzzle Draw!");
            this.endPuzzle();
            return true;
        }
        return false;
    },

    endPuzzle() {
        window.uiManager.lockModule();
        window.timerManager.stop();
        // 🔥 MULTIPLAYER SYNC FIX: Removed local auto-advance. Wait for Professor.
    },

    handleHotspot(isHit) { if(isHit) this.submitScore(3, "General", "Found it!"); else this.submitScore(-1, "General", "Missed!"); },
    
    // --- DYNAMIC TIC-TAC-TOE ENGINE (MOD 4) ---
    initTicTacToe(targetData) {
        if(appStore.get('role') === 'host') return; 
        
        let d = appStore.get('localGameData') || {};
        
        let tttData = structuredClone(targetData || window.lessonData?.ticTacToe || []);
        if (!tttData || tttData.length === 0) {
            tttData = [{ q: "Did the Professor forget to add questions?", options: ["Yes", "No", "Maybe", "I don't know"], answer: 0 }];
        }
        
        const count = tttData.length;
        const gridSize = count >= 10 ? 4 : (count >= 5 ? 3 : 2);
        const totalTiles = gridSize * gridSize;

        d.tttGridSize = gridSize;
        d.tttBoard = new Array(totalTiles).fill(null);
        d.tttTurn = 'X'; 
        d.tttQuestions = shuffleArray([...tttData]);
        
        const players = appStore.get('players') || {};
        const me = appStore.get('me');
        let opponentName = "AI Bot"; 
        // 🔥 FIX: same `uid`-may-not-exist-on-roster-records issue as
        // initPuzzle() above — fall back to `phone` as the stable key.
        const myKey = me?.playerId ?? me?.phone;
        const others = Object.values(players).filter(p => (p.playerId ?? p.phone) !== myKey);
        if(others.length > 0) {
            opponentName = others[Math.floor(Math.random() * others.length)].name;
        }
        
        d.tttOpponent = opponentName;
        appStore.set('localGameData', d);

        setTimeout(() => {
            if(window.uiManager) window.uiManager.initTicTacToeUI(opponentName, gridSize);
        }, 100);
        
        window.timerManager.start();
    },

    handleTTTClick(idx) {
        let d = appStore.get('localGameData');
        if(d.tttTurn !== 'X') return window.toast("Wait! It's not your turn yet.", false);
        if(d.tttBoard[idx] !== null) return window.toast("That spot is already taken!", false);
        
        let q = d.tttQuestions.pop();
        if(!q) {
            let rawData = window.lessonData?.ticTacToe || [];
            if (rawData.length === 0) rawData = [{ q: "Recycling Questions...", options: ["A", "B", "C", "D"], answer: 0 }];
            d.tttQuestions = shuffleArray(structuredClone(rawData));
            q = d.tttQuestions.pop();
        }
        
        d.pendingTTTIdx = idx;
        appStore.set('localGameData', d);
        
        window.uiManager.showTTTQuestion(q);
    },

    handleTTTAnswer(isCorrect, btn) {
        let d = appStore.get('localGameData');
        const idx = d.pendingTTTIdx;
        
        window.uiManager.hideTTTQuestion();
        
        if(isCorrect) {
            window.sfx.play('correct');
            d.tttBoard[idx] = 'X';
            window.toast("Correct! Placed your X.", true);
            this.submitScore(2, "General", "Good answer!"); 
        } else {
            window.sfx.play('wrong');
            window.toast("Incorrect! You lost your turn.", false);
            this.submitScore(-1, "General", "Missed question!");
        }
        
        appStore.set('localGameData', d);
        window.uiManager.updateTTTBoard(d.tttBoard);
        
        if(this.checkTTTWin(d.tttBoard, 'X')) return; 
        
        d.tttTurn = 'O';
        appStore.set('localGameData', d);
        window.uiManager.setTTTStatus(`${d.tttOpponent} is thinking...`, false);
        
        setTimeout(() => this.simulateOpponentTurn(), 3000 + Math.random() * 2000);
    },

    simulateOpponentTurn() {
        let d = appStore.get('localGameData');
        let emptySpots = d.tttBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
        
        if(emptySpots.length === 0) return this.checkTTTWin(d.tttBoard, 'O'); 
        
        const getsItRight = Math.random() < 0.8;
        if(getsItRight) {
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            d.tttBoard[spot] = 'O';
            window.toast(`${d.tttOpponent} answered correctly and placed an O!`, false);
            window.sfx.play('alert');
        } else {
            window.toast(`${d.tttOpponent} got their question wrong! Your turn!`, true);
        }
        
        appStore.set('localGameData', d);
        window.uiManager.updateTTTBoard(d.tttBoard);
        
        if(this.checkTTTWin(d.tttBoard, 'O')) return;
        
        d.tttTurn = 'X';
        appStore.set('localGameData', d);
        window.uiManager.setTTTStatus(`Your Turn! Select a square.`, true);
        window.uiManager.unlockModule(); 
    },

    checkTTTWin(board, lastPlayer) {
        const gridSize = Math.sqrt(board.length);
        let winCombos = [];
        
        for (let r=0; r<gridSize; r++) {
            let row = [];
            for (let c=0; c<gridSize; c++) row.push(r*gridSize + c);
            winCombos.push(row);
        }
        for (let c=0; c<gridSize; c++) {
            let col = [];
            for (let r=0; r<gridSize; r++) col.push(r*gridSize + c);
            winCombos.push(col);
        }
        let diag1 = [], diag2 = [];
        for (let i=0; i<gridSize; i++) {
            diag1.push(i*gridSize + i);
            diag2.push(i*gridSize + (gridSize - 1 - i));
        }
        winCombos.push(diag1, diag2);
        
        let won = false;
        for(let combo of winCombos) {
            if (combo.every(idx => board[idx] === lastPlayer)) {
                won = true;
                break;
            }
        }
        
        let isDraw = !board.includes(null);
        
        if(won) {
            if(lastPlayer === 'X') {
                this.submitScore(15, "General", "&#127942; You won Tic-Tac-Toe!");
            } else {
                this.submitScore(-5, "General", "&#128128; You lost Tic-Tac-Toe.");
            }
            this.endTicTacToe();
            return true;
        } else if (isDraw) {
            this.submitScore(5, "General", "&#129309; Tic-Tac-Toe Draw!");
            this.endTicTacToe();
            return true;
        }
        return false;
    },

    endTicTacToe() {
        window.uiManager.lockModule();
        window.timerManager.stop();
        // 🔥 MULTIPLAYER SYNC FIX: Removed local auto-advance.
    },

    initMemory(targetData) {
        let cards = []; 
        let memData = targetData || window.lessonData?.memoryMatch || [];
        const memType = window.lessonData?.memoryMatchType || 'text-text';

        if (!memData || memData.length === 0) {
            console.warn("Memory Match data missing! Loading defaults.");
            memData = [
                { term: "Connection", match: "Link" },
                { term: "Database", match: "Storage" },
                { term: "Server", match: "Host" },
                { term: "Client", match: "User" }
            ];
        }

        memData.forEach((v, idx) => { 
            let termContent = v.term || "?";
            let matchContent = v.match || "?";

            if (memType === 'image-text') {
                termContent = v.termImg ? `<img src="${v.termImg}" alt="Card" class="w-full h-full object-cover rounded-lg">` : (v.term || "No Image");
                matchContent = v.match || "No Text";
            } else if (memType === 'image-image') {
                termContent = v.termImg ? `<img src="${v.termImg}" alt="Card 1" class="w-full h-full object-cover rounded-lg">` : (v.term || "No Image");
                matchContent = v.matchImg ? `<img src="${v.matchImg}" alt="Card 2" class="w-full h-full object-cover rounded-lg">` : (v.match || "No Image");
            }

            cards.push({ id: idx, type: 'term', content: termContent }); 
            cards.push({ id: idx, type: 'pair', content: matchContent }); 
        });
        
        let localGameData = appStore.get('localGameData') || {};
        localGameData.memCards = shuffleArray(cards); 
        localGameData.memFlipped = []; 
        localGameData.memMatched = 0; 
        localGameData.memTotal = memData.length;
        appStore.set('localGameData', localGameData);
        
        setTimeout(() => {
            if(window.uiManager && typeof window.uiManager.renderMemoryGrid === 'function') {
                window.uiManager.renderMemoryGrid(localGameData.memCards); 
            }
        }, 100);
        
        window.timerManager.start();
    },
    
    handleMemoryClick(idx) {
        let d = appStore.get('localGameData'); 
        if(d.memFlipped.length >= 2 || d.memFlipped.includes(idx)) return;
        
        window.uiManager.flipMemoryCard(idx); 
        d.memFlipped.push(idx);
        appStore.set('localGameData', d);
        
        if (d.memFlipped.length === 2) {
            const idx1 = d.memFlipped[0]; const idx2 = d.memFlipped[1];
            if (d.memCards[idx1].id === d.memCards[idx2].id) {
                d.memMatched++;
                if(appStore.get('role') !== 'host') {
                    this.submitScore(3, "General", "Memory Match!");
                    window.uiManager.markMemoryMatched(idx1, idx2);
                } else {
                    window.uiManager.markMemoryMatched(idx1, idx2);
                }
                
                d.memFlipped = []; 
                appStore.set('localGameData', d);
                
                if (d.memMatched === d.memTotal) { 
                    if(appStore.get('role') !== 'host') { 
                        window.uiManager.lockModule(); 
                        window.timerManager.stop(); 
                        window.toast("Memory Cleared!", true); 
                        // 🔥 MULTIPLAYER SYNC FIX: Removed local auto-advance.
                    }
                    else { window.toast("Host test: Memory Cleared!", true); }
                }
            } else {
                if(appStore.get('role') !== 'host') {
                    window.timerManager.pause(); 
                    this.submitScore(-1, "General", "Memory Miss!");
                }
                setTimeout(() => { 
                    window.uiManager.unflipMemoryCard(idx1); 
                    window.uiManager.unflipMemoryCard(idx2); 
                    let d2 = appStore.get('localGameData');
                    d2.memFlipped = []; appStore.set('localGameData', d2);
                    if(appStore.get('role') !== 'host') window.timerManager.resume(); 
                }, 1500);
            }
        }
    },

    handleAudioAns(isCorrect, btn) { if(isCorrect) { btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-600'); this.submitScore(3, "Listening", "Correct!"); } else { btn.classList.add('bg-rose-500', 'text-white', 'border-rose-600'); this.submitScore(-1, "Listening", "Missed!"); } },
    submitSpelling() { const val = document.getElementById('spelling-input').value.trim().toLowerCase(); const target = document.getElementById('spelling-input').dataset.target.trim().toLowerCase(); if(val === target) this.submitScore(3, "Writing", "Perfect!"); else this.submitScore(-1, "Writing", "Typo!"); },
    
    initHangman(data) { 
        let d = appStore.get('localGameData');
        d.hmPhrase = data.phrase.toUpperCase(); d.hmStrikes = 0; d.hmGuessed = []; 
        appStore.set('localGameData', d);
        window.uiManager.renderHangman(d.hmPhrase); 
    },
    
    handleHangmanGuess(letter) {
        let d = appStore.get('localGameData'); 
        if(d.hmGuessed.includes(letter)) return; 
        d.hmGuessed.push(letter);
        document.getElementById(`hm-btn-${letter}`).disabled = true;
        
        if (d.hmPhrase.includes(letter)) {
            document.getElementById(`hm-btn-${letter}`).classList.replace('bg-white/80', 'bg-emerald-500'); document.getElementById(`hm-btn-${letter}`).classList.add('text-white'); window.uiManager.updateHangmanWord();
            const isWin = d.hmPhrase.split('').every(char => char === ' ' || d.hmGuessed.includes(char));
            if (isWin) this.submitScore(3, "General", "Phrase Solved!");
        } else {
            document.getElementById(`hm-btn-${letter}`).classList.replace('bg-white/80', 'bg-rose-500'); document.getElementById(`hm-btn-${letter}`).classList.add('text-white'); d.hmStrikes++; window.uiManager.updateHangmanArt();
            if (d.hmStrikes >= 6) this.submitScore(-1, "General", `Hanged! Phrase: ${d.hmPhrase}`);
        }
        appStore.set('localGameData', d);
    },

    toggleReadAloud(forceCancel = false) {
        if (this.isRecordingReadAloud || forceCancel) {
            this.stopReadAloud(forceCancel);
        } else {
            this.startReadAloud();
        }
    },
    
    async startReadAloud() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if(!SpeechRecognition) return alert("Browser does not support Speech Recognition.");
        
        const btn = document.getElementById('btn-record-read');
        const icon = document.getElementById('record-icon');
        const text = document.getElementById('record-text');
        const status = document.getElementById('read-status-feedback');

        this.finalTranscript = "";
        this.isRecordingReadAloud = true;
        
        btn.classList.replace('bg-rose-500', 'bg-slate-800');
        btn.classList.replace('hover:bg-rose-600', 'hover:bg-slate-900');
        btn.classList.replace('rounded-full', 'rounded-xl');
        icon.innerText = "&#9209;"; 
        text.innerText = "Stop Recording";
        if(status) {
            status.innerHTML = '<span class="text-emerald-500 animate-pulse">&#128994; Listening...</span>';
            status.dataset.state = 'listening';
        }

        this.readAloudRecognition = new SpeechRecognition();
        this.readAloudRecognition.lang = 'en-US';
        this.readAloudRecognition.continuous = true; 
        this.readAloudRecognition.interimResults = true;

        this.readAloudRecognition.onresult = (e) => {
            let currentSpeech = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
            this.finalTranscript = currentSpeech; 
            
            const spokenWords = currentSpeech.split(' ');
            const wordSpans = document.querySelectorAll('.read-aloud-word');
            
            wordSpans.forEach(span => {
                let cleanWord = cleanString(span.innerText);
                if (spokenWords.includes(cleanWord)) {
                    span.classList.add('text-emerald-500', 'font-bold', 'drop-shadow-sm');
                }
            });
        };
        
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
                if(!this.isRecordingReadAloud) return;
                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) sum += dataArray[i];
                let avg = sum / bufferLength;

                let isLow = avg < 10;
                if (status) {
                    if (isLow && status.dataset.state !== 'low') {
                        status.innerHTML = '<span class="text-amber-500">&#9888;&#65039; Your voice is too low! Please speak up.</span>';
                        status.dataset.state = 'low';
                    } else if (!isLow && status.dataset.state !== 'listening') {
                        status.innerHTML = '<span class="text-emerald-500 animate-pulse">&#128994; Listening...</span>';
                        status.dataset.state = 'listening';
                    }
                }
                this.volumeRAF = requestAnimationFrame(checkVolume);
            };
            checkVolume();
            this.readAloudRecognition.start();
        } catch(err) {
            console.error(err); 
            this.stopReadAloud(true);
            if(status) {
                status.innerHTML = '<span class="text-rose-500 font-bold">&#10060; Microphone blocked. Please allow browser permissions!</span>';
                status.dataset.state = 'error';
            }
            window.toast("Microphone access denied. Please allow access.", false);
        }
    },
    
    stopReadAloud(cancel = false) {
        if (!this.isRecordingReadAloud) return;
        this.isRecordingReadAloud = false;
        
        const btn = document.getElementById('btn-record-read');
        const icon = document.getElementById('record-icon');
        const text = document.getElementById('record-text');
        const status = document.getElementById('read-status-feedback');

        if (this.readAloudRecognition) this.readAloudRecognition.stop();
        if (this.volumeRAF) cancelAnimationFrame(this.volumeRAF);
        if (this.micStream) this.micStream.getTracks().forEach(t => t.stop());
        if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close();

        btn.classList.replace('bg-slate-800', 'bg-rose-500');
        btn.classList.replace('hover:bg-slate-900', 'hover:bg-rose-600');
        btn.classList.replace('rounded-xl', 'rounded-full');
        icon.innerText = "\uD83C\uDF94"; 
        text.innerText = "Start Recording";
        
        if (cancel) return; 

        btn.style.pointerEvents = 'none'; 
        if(status) {
            status.innerHTML = '<span class="text-indigo-500 animate-pulse">&#9203; Processing audio...</span>';
            status.dataset.state = 'processing';
        }

        setTimeout(() => {
            this.evalReadAloud();
            if(status) {
                status.innerHTML = '<span class="text-slate-500 dark:text-slate-400">&#127904; Ready to record</span>';
                status.dataset.state = 'ready';
            }
        }, 1000);
    },
    
    evalReadAloud() {
        const wordSpans = document.querySelectorAll('.read-aloud-word');
        if (wordSpans.length === 0) return;
        
        let matches = 0;
        const total = wordSpans.length;

        wordSpans.forEach(span => {
            if (span.classList.contains('text-emerald-500')) {
                matches++;
            } else {
                span.classList.add('text-rose-500', 'line-through', 'font-bold');
            }
        });

        const accuracy = matches / total;
        if(accuracy >= 0.8) {
            this.submitScore(3, "Speaking", `Great! ${Math.round(accuracy*100)}% accuracy`);
        } else {
            this.submitScore(-1, "Speaking", `Needs work. ${Math.round(accuracy*100)}% accuracy`);
        }
    },

    submitDictation() { 
        const val = document.getElementById('dict-input').value.trim(); 
        const target = document.getElementById('dict-input').dataset.target.trim(); 
        
        const valWords = val.split(/\s+/).filter(w => w.length > 0);
        const targetWords = target.split(/\s+/).filter(w => w.length > 0);
        
        let isPerfect = val === target;
        let htmlOut = "";

        targetWords.forEach((tWord, i) => {
            let vWord = valWords[i] || "";
            if (vWord === tWord) {
                htmlOut += `<span class="text-emerald-500 font-bold mx-1">${vWord}</span>`;
            } else if (cleanString(vWord) === cleanString(tWord) && cleanString(vWord) !== "") {
                htmlOut += `<span class="text-amber-500 font-bold mx-1 underline" title="Target: ${tWord}">${vWord}</span>`;
            } else {
                htmlOut += `<span class="text-rose-500 font-bold mx-1 line-through" title="Target: ${tWord}">${vWord || '?'}</span>`;
            }
        });
        
        if (valWords.length > targetWords.length) {
            for(let i = targetWords.length; i < valWords.length; i++) {
                htmlOut += `<span class="text-rose-500 font-bold mx-1 line-through" title="Extra word">${valWords[i]}</span>`;
            }
        }

        const feedbackEl = document.getElementById('dict-feedback');
        feedbackEl.innerHTML = `
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-xl mt-4 text-left border border-slate-200 dark:border-white/10 shadow-inner">
                <p class="text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">Feedback Analysis:</p>
                <div class="text-xl leading-relaxed">${htmlOut}</div>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium">Target: <b class="text-slate-800 dark:text-white">${target}</b></p>
            </div>`;
        feedbackEl.classList.remove('opacity-0');

        if(isPerfect) this.submitScore(3, "Writing", "Perfect dictation!"); 
        else this.submitScore(-1, "Writing", "Errors detected in dictation."); 
    },

    handleQuizAns(isCorrect, btn) { if(isCorrect) { btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-600'); this.submitScore(3, "General", "Correct!"); } else { btn.classList.add('bg-rose-500', 'text-white', 'border-rose-600'); this.submitScore(-1, "General", "Missed!"); } }
};