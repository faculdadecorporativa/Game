// 🏗️ network.js
// Multi-Tenancy Architecture using PocketBase Rooms (Isolated Sessions)

import { appStore, createEmptyQueues, getAvatarUrl, DEFAULT_AVATAR } from './store.js';

export const app = {

    // Internal subscription handles so listenToRoom() can tear down
    // previous subscriptions before creating new ones, and exitToHome()
    // can clean up on the way out. The original code never unsubscribed
    // anything — every re-host or re-join stacked another live listener
    // on top of the last one.
    _unsubscribeRoom: null,
    _unsubscribeStudents: null,

    exitToHome() {
        // 🔥 FIX: was `clearInterval(appStore.state.countdownInterval)` —
        // reaching into `.state` directly bypasses the Store entirely and
        // never resets the stored value, so a stale interval id could
        // linger in state after being cleared.
        const interval = appStore.get('countdownInterval');
        if (interval) clearInterval(interval);
        appStore.set('countdownInterval', null);

        if (this._unsubscribeRoom) { this._unsubscribeRoom(); this._unsubscribeRoom = null; }
        if (this._unsubscribeStudents) { this._unsubscribeStudents(); this._unsubscribeStudents = null; }

        if (window.timerManager) window.timerManager.stop();
        if (window.game && window.game.isRecordingReadAloud) window.game.toggleReadAloud(true);
        window.location.reload();
    },

    // --- PROFESSOR COMMANDS ---
    async hostGame() {
        appStore.set('role', 'host');
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        appStore.set('roomCode', pin);

        try {
            // 1. Create the isolated room
            const room = await window.pb.collection('rooms').create({
                pin,
                gameState: { status: 'waiting', currentModule: 0, currentIndex: 0, timestamp: Date.now() },
                lessonData: {}
            });
            appStore.set('roomRecordId', room.id);

            this.listenToRoom(pin, room.id);

            // 2. Update UI to show Professor Dashboard
            if (window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll();

            const adminMod = document.getElementById('module-admin');
            if (adminMod) adminMod.classList.remove('hidden');

            const adminPin = document.getElementById('admin-pin');
            if (adminPin) adminPin.innerText = pin;

            const roomDisplay = document.getElementById('room-code-display');
            if (roomDisplay) {
                roomDisplay.innerText = `[PIN: ${pin}]`;
                roomDisplay.classList.remove('hidden');
            }

            if (window.uiManager && window.uiManager.updateProfHUD) window.uiManager.updateProfHUD();

            if (window.adminUI && typeof window.adminUI.init === 'function') {
                window.adminUI.init();
            }

            console.log(`🏠 Room ${pin} initialized successfully!`);
        } catch (error) {
            console.error("Error creating room:", error);
            if (window.toast) window.toast("Error creating Dashboard. Check console.", false);
        }
    },

    async hostStartGame() {
        try {
            // 1. Force a final local save of the lesson data
            if (window.adminUI && window.adminUI.saveContent) window.adminUI.saveContent();

            const roomId = appStore.get('roomRecordId');
            if (!roomId) {
                console.error("hostStartGame called with no active room.");
                if (window.toast) window.toast("No active room found — try hosting again.", false);
                return;
            }

            // Strip out any 'undefined' array holes before sending to PocketBase
            const cleanLessonData = JSON.parse(JSON.stringify(window.lessonData || {}));

            // 2. Broadcast the pristine lesson data to the live room
            if (cleanLessonData && Object.keys(cleanLessonData).length > 0) {
                await window.pb.collection('rooms').update(roomId, { lessonData: cleanLessonData });
                console.log("📡 Broadcasted sanitized custom lesson data to room!");
            }

            // 3. Initialize dynamic routing state
            // 🔥 FIX: was `appStore.state.activeModules = ...` and
            // `appStore.state.currentModuleIndex = ...` — direct mutation
            // of the raw state object, bypassing the Store's clone-on-write
            // protection and never notifying subscribers. Routed through
            // set() like everywhere else.
            const activeModules = cleanLessonData.activeModules || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            appStore.set('activeModules', activeModules);

            if (activeModules.length === 0) {
                return window.toast("Please check at least one active module!", false);
            }

            appStore.set('currentModuleIndex', 0);
            appStore.set('queues', createEmptyQueues());

            // Update Professor UI immediately so it doesn't look frozen
            const tabLobby = document.getElementById('tab-lobby');
            if (tabLobby) tabLobby.classList.add('hidden');

            if (window.adminUI && window.adminUI.switchTab) window.adminUI.switchTab('analytics');

            // Auto-Open Live Game View
            appStore.set('isLiveViewOpen', true);
            const toggleBtn = document.getElementById('btn-toggle-live');
            if (toggleBtn) toggleBtn.innerText = "Close Live View";

            const controls = document.getElementById('prof-game-controls');
            if (controls) controls.classList.remove('hidden');

            const btnNext = document.getElementById('btn-broadcast-next');
            if (btnNext) btnNext.classList.remove('hidden');

            // 4. Trigger the Router!
            await this.hostNextModule();

        } catch (error) {
            console.error("Crash during hostStartGame:", error);
            if (window.toast) window.toast("Error launching session! Check console logs.", false);
        }
    },

    // 🔥 DYNAMIC BULLETPROOF ROUTING ENGINE 🔥
    // 🔥 FIX: was `const state = appStore.state` — a direct reference to
    // the Store's INTERNAL mutable object, then mutated in place
    // (`state.queues.study++`, `state.currentModuleIndex++`,
    // `state.currentIndex = idx`). That defeats the Store's clone-on-write
    // safety entirely and never notifies subscribers. Rewritten to go
    // through get()/set() consistently.
    async hostNextModule() {
        const lessonData = window.lessonData || {};
        const activeMods = appStore.get('activeModules') || lessonData.activeModules || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const queues = appStore.get('queues') || createEmptyQueues();
        const currentModuleIndex = appStore.get('currentModuleIndex') ?? 0;

        const m = activeMods[currentModuleIndex];
        const roomId = appStore.get('roomRecordId');

        // If we ran out of modules, end the game smoothly
        if (!m) {
            try {
                await window.pb.collection('rooms').update(roomId, {
                    gameState: { status: 'finished', timestamp: Date.now() }
                });
            } catch (err) {
                console.error("Error finishing game:", err);
            }

            const profMod = document.getElementById('prof-current-module');
            if (profMod) profMod.innerText = "Game Over. Check Leaderboard!";

            appStore.set('currentModule', 12);
            if (window.uiManager && window.uiManager.showFinalResults) window.uiManager.showFinalResults(appStore.get('players'));
            return;
        }

        let idx = 0;
        let moveNext = false;

        // Verify Queues: Only increment and play if there are items left!
        if (m === 1) { idx = queues.study++; if (idx >= 1) moveNext = true; }
        else if (m === 2) { idx = queues.puzzle++; if (idx >= 1) moveNext = true; }
        else if (m === 3) { idx = queues.hotspot++; if (idx >= (lessonData.hotspots?.length || 1)) moveNext = true; }
        else if (m === 4) { idx = queues.tictactoe++; if (idx >= 1) moveNext = true; }
        else if (m === 5) { idx = queues.audio++; if (idx >= (lessonData.audioGuess?.length || 1)) moveNext = true; }
        else if (m === 6) { idx = queues.spell++; if (idx >= (lessonData.spellingBee?.length || 1)) moveNext = true; }
        else if (m === 7) { idx = queues.hangman++; if (idx >= (lessonData.hangman?.length || 1)) moveNext = true; }
        else if (m === 8) { idx = queues.memory++; if (idx >= 1) moveNext = true; }
        else if (m === 9) { idx = queues.read++; if (idx >= (lessonData.readAloud?.length || 1)) moveNext = true; }
        else if (m === 10) { idx = queues.dict++; if (idx >= (lessonData.dictation?.length || 1)) moveNext = true; }
        else if (m === 11) { idx = queues.quiz++; if (idx >= (lessonData.quiz?.length || 1)) moveNext = true; }

        appStore.set('queues', queues);

        // If we ran out of questions for THIS module, jump to the NEXT module
        if (moveNext) {
            appStore.set('currentModuleIndex', currentModuleIndex + 1);
            return this.hostNextModule(); // Recursively loop to next
        }

        // --- SUCCESS! BROADCAST MODULE ---
        appStore.set('currentIndex', idx);
        appStore.set('currentModule', m);

        if (window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll();

        // Show module to Professor if Live View is Open
        if (appStore.get('isLiveViewOpen')) {
            const mEl = document.getElementById(`module-${m}`);
            if (mEl) mEl.classList.remove('hidden');
        }

        const profMod = document.getElementById('prof-current-module');
        if (profMod) profMod.innerText = `Active: Module ${m} (Item ${idx + 1})`;

        try {
            await window.pb.collection('rooms').update(roomId, {
                gameState: {
                    status: 'playing',
                    currentModule: m,
                    currentIndex: idx,
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            console.error("Error broadcasting module state:", err);
            if (window.toast) window.toast("Connection issue broadcasting the next module.", false);
        }

        if (window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
        if (window.game && window.game.startModule) window.game.startModule(m, idx);
    },

    // --- STUDENT COMMANDS ---
    showJoinPinScreen() {
        if (window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll();
        const pinMod = document.getElementById('module-join-pin');
        if (pinMod) pinMod.classList.remove('hidden');

        const joinInput = document.getElementById('join-pin-input');
        if (joinInput) joinInput.value = '';

        const btn = document.getElementById('btn-join-lobby');
        if (btn) { btn.innerText = "Enter Lobby"; btn.disabled = false; btn.classList.replace('opacity-50', 'opacity-100'); }
    },

    async joinGame(pin) {
        const btn = document.getElementById('btn-join-lobby');
        if (btn) { btn.innerText = "Connecting..."; btn.disabled = true; btn.classList.replace('opacity-100', 'opacity-50'); }

        // 🔥 FIX: the original `await window.firebaseGet(...)` had NO
        // try/catch. Any network failure left an unhandled rejection and
        // the button stuck on "Connecting..." forever.
        try {
            const room = await window.pb.collection('rooms').getFirstListItem(`pin="${pin}"`);

            appStore.set('role', 'student');
            appStore.set('roomCode', pin);
            appStore.set('roomRecordId', room.id);

            const me = appStore.get('me');
            // 🔥 FIX: was `avatar: me.avatar` with no fallback — pushes a
            // real filename or the shared default instead of a
            // possibly-empty value into the room roster.
            const avatar = me.avatar && me.avatar.trim() ? me.avatar : DEFAULT_AVATAR;

            // Upsert: a student rejoining an existing room (refresh,
            // dropped connection) should update their row, not create a
            // duplicate.
            let studentRecord;
            try {
                const existing = await window.pb.collection('students').getFirstListItem(
                    `room="${room.id}" && phone="${me.phone}"`
                );
                studentRecord = await window.pb.collection('students').update(existing.id, {
                    name: me.name, avatar, phone: me.phone, team: me.team, border: me.border, scores: me.scores
                });
            } catch (notFound) {
                studentRecord = await window.pb.collection('students').create({
                    room: room.id, name: me.name, avatar, phone: me.phone, team: me.team, border: me.border, scores: me.scores
                });
            }
            appStore.set('studentRecordId', studentRecord.id);

            this.listenToRoom(pin, room.id);

            if (window.uiManager && window.uiManager.hideAll) window.uiManager.hideAll();
            const waitMod = document.getElementById('module-waiting');
            if (waitMod) waitMod.classList.remove('hidden');

            const gStatus = document.getElementById('game-status');
            if (gStatus) gStatus.classList.remove('hidden');

            if (window.uiManager && window.uiManager.updateStudentHUD) window.uiManager.updateStudentHUD();

            const roomDisplay = document.getElementById('room-code-display');
            if (roomDisplay) { roomDisplay.innerText = `[PIN: ${pin}]`; roomDisplay.classList.remove('hidden'); }

        } catch (error) {
            console.error("Error joining room:", error);
            if (window.toast) window.toast("The Room PIN is wrong or the Professor is not online.", false);
        } finally {
            if (btn) { btn.innerText = "Enter Lobby"; btn.disabled = false; btn.classList.replace('opacity-50', 'opacity-100'); }
        }
    },

    // --- SHARED: REALTIME SYNC ENGINE ---
    async listenToRoom(pin, roomId) {
        // Tear down any previous subscriptions first — re-hosting or
        // re-joining used to silently stack listeners on top of each other.
        if (this._unsubscribeRoom) { this._unsubscribeRoom(); this._unsubscribeRoom = null; }
        if (this._unsubscribeStudents) { this._unsubscribeStudents(); this._unsubscribeStudents = null; }

        if (appStore.get('role') === 'student') {
            try {
                const room = await window.pb.collection('rooms').getOne(roomId);
                if (room.lessonData && Object.keys(room.lessonData).length > 0) {
                    window.lessonData = room.lessonData;
                    console.log("📥 Custom lesson data downloaded from host!");
                }
            } catch (err) {
                console.warn("Could not fetch initial lesson data:", err);
            }
        }

        // Watch the students in this room. PocketBase's realtime API pushes
        // create/update/delete events one at a time rather than a full
        // snapshot, so on any event we just re-fetch the current roster.
        this._unsubscribeStudents = await window.pb.collection('students').subscribe('*', () => {
            this._refreshPlayers(roomId);
        }, { filter: `room="${roomId}"` });

        // Prime the roster immediately rather than waiting for the first event.
        this._refreshPlayers(roomId);

        this._unsubscribeRoom = await window.pb.collection('rooms').subscribe(roomId, async (e) => {
            const room = e.record;
            if (!room) return;

            if (room.lessonData) window.lessonData = room.lessonData;

            const data = room.gameState;
            if (!data) return;

            if (appStore.get('role') === 'student') {
                if (data.status === 'playing') {
                    const interval = appStore.get('countdownInterval');
                    if (interval) clearInterval(interval);
                    appStore.set('countdownInterval', null);

                    const waitSpinner = document.getElementById('wait-spinner');
                    if (waitSpinner) waitSpinner.classList.add('hidden');

                    // STRICT SYNC: Force download if lessonData hasn't arrived yet!
                    if (!window.lessonData || Object.keys(window.lessonData).length === 0) {
                        try {
                            const freshRoom = await window.pb.collection('rooms').getOne(roomId);
                            if (freshRoom.lessonData) window.lessonData = freshRoom.lessonData;
                        } catch (err) {
                            console.warn("Could not force-fetch lesson data:", err);
                        }
                    }

                    if (window.uiManager && window.uiManager.unlockModule) window.uiManager.unlockModule();
                    if (window.game && window.game.startModule) window.game.startModule(data.currentModule, data.currentIndex);
                    appStore.set('currentModule', data.currentModule);
                }
                else if (data.status === 'finished') {
                    if (window.uiManager && window.uiManager.showFinalResults) window.uiManager.showFinalResults(appStore.get('players'));
                }
            }
        });
    },

    async _refreshPlayers(roomId) {
        try {
            const records = await window.pb.collection('students').getFullList({ filter: `room="${roomId}"` });
            const data = {};
            records.forEach(r => { data[r.phone] = r; });
            appStore.set('players', data);

            if (appStore.get('role') === 'host') {
                if (window.adminUI && window.adminUI.updateLobbyList) window.adminUI.updateLobbyList();
                if (window.adminUI && window.adminUI.updateTeamScores) window.adminUI.updateTeamScores();
                if (window.adminUI && window.adminUI.updateAnalytics) window.adminUI.updateAnalytics();
            } else {
                if (window.uiManager && window.uiManager.updateScoreboard) window.uiManager.updateScoreboard();
            }
        } catch (err) {
            console.error("Error refreshing player roster:", err);
        }
    },

    // 🔥🔥🔥 MAJOR FINDING — read before using this function 🔥🔥🔥
    // The version of this function submitted for review used a
    // completely different, INCOMPATIBLE data model from the rest of the
    // app: it stored skill breakdowns under `me.skills` (lowercase keys:
    // reading/writing/speaking/interpretation/participation/influence)
    // instead of the real `me.scores` (Speaking/Writing/Listening/
    // General/total, established in store.js and used everywhere —
    // GameController.js, UIController.js, ShopController.js,
    // StudentDashboardController.js); it stored a persistent `me.level`
    // field that gets incremented every 1000 xp, when the REAL leveling
    // system (StudentDashboardController.js's calculateLevel()) computes
    // level from xp on the fly and never stores it anywhere; and it wrote
    // to PocketBase using `me.id`, a field that is never actually set
    // anywhere in this app's `me` object (auth.js's loginStudent() sets
    // `uid` and `playerId`, never a bare `id`) — meaning the "Global User
    // DB" sync block was ALREADY silently dead code even before
    // considering the Firebase migration, since `if (me.id && ...)` was
    // always false.
    //
    // GameController.js's submitScore() (reviewed and fixed in an earlier
    // batch) is the function every module's answer-handling code actually
    // calls, and it already correctly persists scores/xp/coins/streak to
    // the real `players` collection via `me.playerId`. Reimplementing
    // scoring a second time here, with different field names, is exactly
    // the kind of two-competing-sources-of-truth setup that causes silent
    // data loss and "why doesn't this show up anywhere" bugs.
    //
    // Rather than porting the incompatible schema over to PocketBase
    // as-is (which would just create a second, working-but-wrong scoring
    // path), this now delegates to the real implementation if it's
    // available, and only falls back to a minimal, SCHEMA-CONSISTENT
    // local update (using `scores`/`playerId`, matching the rest of the
    // app) if it isn't. If nothing in your codebase actually calls
    // `app.updateStudentScore()` — worth confirming — this function can
    // likely just be deleted entirely in favor of always calling
    // `window.game.submitScore()` directly.
    async updateStudentScore(points, skillArea) {
        if (window.game && typeof window.game.submitScore === 'function') {
            return window.game.submitScore(points, skillArea, skillArea ? `${skillArea} update` : "Score update");
        }

        console.warn("window.game.submitScore() unavailable — falling back to a minimal local score update in network.js.");
        const me = appStore.get('me');
        if (!me || !me.phone) return;

        me.scores = me.scores || { total: 0, Speaking: 0, Writing: 0, Listening: 0, General: 0 };
        me.scores.total += points;
        me.scores[skillArea] = (me.scores[skillArea] || 0) + points;
        appStore.set('me', me);

        if (!me.playerId || !window.pb) return;
        try {
            await window.pb.collection('players').update(me.playerId, { scores: me.scores });
        } catch (err) {
            console.error("Fallback score persist failed:", err);
        }
    }
};

// 🔥 FIX: this binding was missing. Every other controller in this
// codebase that's invoked from outside its own module either self-binds
// this way (shopController, dashboardController, syncManager) or is
// expected to via a central bootstrap (see the note in Utilities.js).
// Added for consistency — harmless if a bootstrap file already does this.
window.app = app;