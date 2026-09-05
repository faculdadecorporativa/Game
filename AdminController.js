// AdminController.js
// Tenant-Isolated Business Logic

import { tailwindColors, animalThemes } from './data.js';
import { authManager } from './auth.js';
import { appStore, getAvatarUrl, DEFAULT_AVATAR } from './store.js';

// See the fix note near renderStudentManagement()/manualRegisterStudent()
// below for the most important finding in this file: student roster
// management here was operating on a completely different data store than
// the one actually used for login/gameplay everywhere else in the app.
const AVATAR_ONERROR = `this.onerror=null;this.src='${getAvatarUrl(null)}';`;

export const adminUI = {
    chartInstance: null, demoChartInstance: null,
    
    async init() { 
        try {
            const dbLessonData = await authManager.getDB('lessonData');
            if (dbLessonData && Object.keys(dbLessonData).length > 0) {
                window.lessonData = dbLessonData;
            } else {
                const savedData = localStorage.getItem('profLessonData');
                if (savedData) window.lessonData = JSON.parse(savedData);
            }
        } catch (e) {
            console.error("Failed to load lesson data", e);
        }

        this.renderContentEditors(); 
        
        // 🛠️ FIX: The drawing board will now successfully initialize!
        this.setupDrawingBoard('mod3-draw-container'); 
        // 🛠️ FIX: Purged legacy mod8-draw-container initialization that caused background errors!
        this.renderTeams(); 
        this.renderStudentManagement(); 
        this.fetchPendingProfessors();
        this.updateLobbyList();
    },

    getTeamDetails(teamId) {
        const customTeams = appStore.get('teams') || [];
        const found = customTeams.find(t => t.id === teamId);
        if (found) return found;
        
        const legacy = animalThemes && animalThemes[teamId] ? animalThemes[teamId] : null;
        if (legacy) return { id: teamId, name: legacy.name, icon: legacy.icon || '&#128305;', color: legacy.color };
        
        return { id: teamId, name: teamId, icon: '&#128305;', color: 'blue' };
    },

    deleteItem(type, index) {
        if (!window.lessonData) return;
        
        if (type === 'ticTacToe' && window.lessonData.ticTacToe) window.lessonData.ticTacToe.splice(index, 1);
        if (type === 'memoryMatch' && window.lessonData.memoryMatch) window.lessonData.memoryMatch.splice(index, 1);
        if (type === 'puzzleMatch' && window.lessonData.puzzleMatch && window.lessonData.puzzleMatch.questions) window.lessonData.puzzleMatch.questions.splice(index, 1);
        if (type === 'chatPhrase' && window.lessonData.chatPhrases) window.lessonData.chatPhrases.splice(index, 1);
        if (type === 'vocab' && window.lessonData.vocabulary) window.lessonData.vocabulary.splice(index, 1);
        if (type === 'audioGuess' && window.lessonData.audioGuess) window.lessonData.audioGuess.splice(index, 1);
        if (type === 'spellingBee' && window.lessonData.spellingBee) window.lessonData.spellingBee.splice(index, 1);
        if (type === 'hangman' && window.lessonData.hangman) window.lessonData.hangman.splice(index, 1);
        if (type === 'readAloud' && window.lessonData.readAloud) window.lessonData.readAloud.splice(index, 1);
        if (type === 'dictation' && window.lessonData.dictation) window.lessonData.dictation.splice(index, 1);
        if (type === 'quiz' && window.lessonData.quiz) window.lessonData.quiz.splice(index, 1);
        if (type === 'hotspot' && window.lessonData.hotspots) window.lessonData.hotspots.splice(index, 1);
        
        this.renderContentEditors();
    },

    exitToLobby() {
        const gameContainer = document.getElementById('game-container'); 
        if (gameContainer) gameContainer.classList.add('hidden');
        
        for(let i = 1; i <= 11; i++) {
            const mod = document.getElementById(`module-${i}`);
            if(mod) mod.classList.add('hidden');
        }

        const profDashboard = document.querySelector('prof-dashboard');
        if (profDashboard) profDashboard.classList.remove('hidden');

        this.switchTab('lobby');
        appStore.set('isLiveViewOpen', false);
    },

    async restartSession() {
        if(!confirm("Are you sure you want to clear all student data and restart the session?")) return;
        
        appStore.set('players', {});
        appStore.set('currentModule', 0);
        
        // 🔥 FIX: was clearing a Firebase RTDB path (`rooms/${pin}/students`)
        // by setting it to null. Migrated to PocketBase: delete every
        // room-roster row (the `students` collection created in
        // network.js, related to `rooms` via a `room` field) for this
        // room. Uses `roomRecordId` (the actual PocketBase record id),
        // not the human-readable PIN, matching how network.js queries it.
        // NOTE: this clears the LIVE per-room roster only — it does not
        // touch the students' permanent `players` accounts/progress,
        // which is what "restart the session" should mean here.
        const roomId = appStore.get('roomRecordId');
        if (roomId && window.pb) {
            try {
                const roster = await window.pb.collection('students').getFullList({ filter: `room="${roomId}"` });
                await Promise.allSettled(roster.map(r => window.pb.collection('students').delete(r.id)));
            } catch (err) {
                console.error("Failed to clear room roster:", err);
            }
        }
        
        const currentModText = document.getElementById('prof-current-module');
        if(currentModText) currentModText.innerText = "Ready to Start";
        
        this.updateLobbyList();
        this.updateTeamScores();
        this.exitToLobby();
        
        window.toast("Session wiped. Ready for a new class!", true);
    },
    
    switchTab(tab) {
        // 🔥 FIX: none of these 8 getElementById calls were null-checked —
        // this is a high-traffic function (every nav click, plus called
        // internally from exitToLobby() and network.js's hostStartGame())
        // and a single missing element used to throw and abort the whole
        // tab switch.
        ['admin-tab-lobby', 'admin-tab-analytics', 'admin-tab-settings'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        ['tab-lobby', 'tab-analytics', 'tab-settings'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.replace('border-b-2', 'hover:text-indigo-600'); 
            el.classList.replace('border-indigo-600', 'border-transparent'); 
            el.classList.replace('text-indigo-600', 'text-slate-500'); 
        });
        
        const activePanel = document.getElementById(`admin-tab-${tab}`);
        if (activePanel) activePanel.classList.remove('hidden');

        const activeTabBtn = document.getElementById(`tab-${tab}`);
        if (activeTabBtn) {
            activeTabBtn.classList.remove('text-slate-500', 'hover:text-indigo-600'); 
            activeTabBtn.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
        }

        if(tab === 'analytics') this.renderChart();
    },
    
    toggleLiveView() {
        const isLive = !appStore.get('isLiveViewOpen');
        appStore.set('isLiveViewOpen', isLive);
        
        const mEl = document.getElementById(`module-${appStore.get('currentModule')}`);
        if (mEl) {
            if (isLive) mEl.classList.remove('hidden');
            else mEl.classList.add('hidden');
        }
    },

    // Standard small image compressor (Avatars, Memory Match Cards)
    compressImageToSquare(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 150; 
                
                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // 🔥 FIX (dead code): `compressBackgroundImage` was defined TWICE in
    // this object literal — the second definition silently overwrote the
    // first (a JS object literal keeps only the last key of a given
    // name). The first version (MAX_WIDTH 1200, quality 0.8) below was
    // 100% unreachable dead code; only the second one below it ("Aggressive
    // Background Compressor") ever actually ran. Removed the dead copy.
    // Aggressive Background Compressor to stop localStorage crashes
    compressBackgroundImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; 
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height = Math.round(height * (MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.4)); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    handleProfAvatar(e) {
        const f = e.target.files[0];
        if(f) {
            this.compressImageToSquare(f, (compressedData) => {
                const img = document.getElementById('new-prof-avatar-preview');
                if(img) {
                    img.src = compressedData;
                    img.dataset.newavatar = compressedData;
                }
            });
        }
    },

    handleManualStudentAvatar(e) {
        const f = e.target.files[0];
        if(f) {
            this.compressImageToSquare(f, (compressedData) => {
                const img = document.getElementById('manual-student-avatar-preview');
                if(img) {
                    img.src = compressedData;
                    img.dataset.newavatar = compressedData;
                }
            });
        }
    },

    handleMemUpload(e, imgId, idx, key) {
        const f = e.target.files[0];
        if(f) {
            this.compressImageToSquare(f, (compressedData) => {
                const img = document.getElementById(imgId);
                if(img) img.src = compressedData;
                if(!window.lessonData.memoryMatch) window.lessonData.memoryMatch = [];
                if(!window.lessonData.memoryMatch[idx]) window.lessonData.memoryMatch[idx] = {term:"", match:"", termImg:"", matchImg:""};
                window.lessonData.memoryMatch[idx][key] = compressedData;
            });
        }
    },

    handlePuzzleBgUpload(e) { 
        const f = e.target.files[0]; 
        if(f) { 
            this.compressBackgroundImage(f, (compressedData) => {
                if(!window.lessonData.puzzleMatch) window.lessonData.puzzleMatch = { questions: [] };
                window.lessonData.puzzleMatch.image = compressedData; 
                this.renderContentEditors();
            });
        } 
    },
    
    // 🛠️ FIX: Properly saves the Mod 3 Image to the Database Payload!
    handleBgUpload(e, imgId, destId) { 
        const f = e.target.files[0]; 
        if(f) { 
            this.compressBackgroundImage(f, (compressedData) => {
                const imgEl = document.getElementById(imgId);
                if (imgEl) imgEl.src = compressedData; 
                
                const destEl = document.getElementById(destId);
                if(destEl) destEl.src = compressedData; 
                
                if(!window.lessonData.visualAssessment) window.lessonData.visualAssessment = {};
                window.lessonData.visualAssessment.image = compressedData;
                
                this.renderContentEditors();
                window.toast("Image loaded and saved!", true);
            });
        } 
    },

    updateStudentAvatar(e, phone) { 
        const f = e.target.files[0]; 
        if(f) { 
            this.compressImageToSquare(f, (compressedData) => {
                const img = document.getElementById(`edit-img-${phone}`);
                if(img) {
                    img.src = compressedData; 
                    img.dataset.newavatar = compressedData; 
                }
            });
        } 
    },
    
    async changeProfCredentials() {
        const currEmail = document.getElementById('current-prof-email')?.value.trim();
        const currPass = document.getElementById('current-prof-pass')?.value.trim();
        const newUsernameInput = document.getElementById('new-prof-user')?.value.trim();
        const newEmail = document.getElementById('new-prof-email')?.value.trim();
        const newPass = document.getElementById('new-prof-pass')?.value.trim();
        const avatarEl = document.getElementById('new-prof-avatar-preview');
        const newAvatar = avatarEl ? avatarEl.dataset.newavatar : null;

        if (!currEmail || !currPass) return window.toast("Current Email and Password are required to make changes.", false);

        // 🔥 FIX: full migration from Firebase Auth's reauthenticate/
        // updateEmail/updatePassword dance to PocketBase.
        //
        // SIMPLIFICATION: Firebase requires a separate
        // reauthenticateWithCredential() step before sensitive changes.
        // PocketBase folds that into the update call itself — sending
        // `oldPassword` alongside a `password`/`passwordConfirm` change is
        // itself the re-authentication check, so no separate step is
        // needed here.
        try {
            const uid = window.pb?.authStore?.model?.id;
            if (!uid) throw new Error("No professor is currently logged in.");

            // Verify the current password is actually correct before
            // changing anything, by attempting a fresh login with it —
            // PocketBase has no standalone "verify password" call, so a
            // real auth attempt is the equivalent check.
            try {
                await window.pb.collection('users').authWithPassword(currEmail, currPass);
            } catch (e) {
                throw new Error("Invalid current email or password.");
            }

            if (newAvatar) localStorage.setItem('profAvatar', newAvatar);

            if (newPass) {
                if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");
                await window.pb.collection('users').update(uid, {
                    oldPassword: currPass,
                    password: newPass,
                    passwordConfirm: newPass
                });
            }

            // 🔥 NOTE: email changes go through PocketBase's
            // requestEmailChange() flow rather than a direct field update —
            // this sends a confirmation link to the NEW address, which
            // must be clicked to finalize the change. This is PocketBase's
            // standard secure flow (avoids silently handing account access
            // to an unverified address) and is a deliberate choice, not an
            // oversight — flag it to the professor via the toast below
            // rather than pretending the email changed immediately.
            let emailChangeRequested = false;
            if (newEmail && newEmail !== currEmail) {
                await window.pb.collection('users').requestEmailChange(newEmail);
                emailChangeRequested = true;
            }

            // 🔥 FIX: was writing to a Firebase RTDB path
            // (`professorsList/${uid}`). The real professor profile lives
            // in the `players` collection (see auth.js), keyed by its own
            // record id — not the auth user's id — so it needs to be
            // looked up via the `user` relation first.
            const finalName = newUsernameInput || appStore.get('profName') || currEmail.split('@')[0];
            try {
                const playerRecord = await window.pb.collection('players').getFirstListItem(`user="${uid}"`);
                await window.pb.collection('players').update(playerRecord.id, { nickname: finalName });
            } catch (profileErr) {
                console.error("Could not update professor profile record:", profileErr);
            }

            appStore.set('profName', finalName);
            if (window.uiManager) window.uiManager.updateProfHUD();

            window.toast(
                emailChangeRequested
                    ? "Credentials updated! Check your NEW email inbox to confirm the address change."
                    : "Credentials updated successfully!",
                true
            );

            const currEmailEl = document.getElementById('current-prof-email');
            if (currEmailEl) currEmailEl.value = '';
            const currPassEl = document.getElementById('current-prof-pass');
            if (currPassEl) currPassEl.value = '';
            const newUserEl = document.getElementById('new-prof-user');
            if (newUserEl) newUserEl.value = '';
            const newEmailEl = document.getElementById('new-prof-email');
            if (newEmailEl) newEmailEl.value = '';
            const newPassEl = document.getElementById('new-prof-pass');
            if (newPassEl) newPassEl.value = '';

        } catch (error) {
            window.toast(`Update failed: ${error.message}`, false);
        }
    },

    async fetchPendingProfessors() {
        const container = document.getElementById('pending-professors-list');
        const wrapper = document.getElementById('pending-professors-wrapper');
        
        try {
            // 🔥 FIX: was scanning a Firebase RTDB `professorsList` path.
            // Professor profiles live in the `players` collection (role:
            // 'professor') per auth.js — query that directly instead.
            if (window.pb) {
                const pending = await window.pb.collection('players').getFullList({
                    filter: 'role="professor" && status="pending"'
                });

                // 🔥 FIX: was `container.innerHTML += ...` inside the loop
                // — same rebuild-everything-every-iteration anti-pattern
                // fixed elsewhere in this codebase. Build once, assign once.
                if (container) {
                    container.innerHTML = pending.map(prof => `
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-amber-200 dark:border-amber-500/30 rounded-xl bg-amber-50 dark:bg-amber-900/20 shadow-sm mb-3 transition-all">
                            <div class="flex-1">
                                <p class="font-bold text-slate-800 dark:text-slate-200">${prof.nickname || 'Professor'}</p>
                                <span class="text-xs font-mono text-slate-500">${prof.id}</span>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="adminUI.approveProfessor('${prof.id}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Approve</button>
                                <button onclick="adminUI.denyProfessor('${prof.id}')" class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Deny</button>
                            </div>
                        </div>`).join('');
                }

                if (wrapper) wrapper.classList.toggle('hidden', pending.length === 0);
            }
        } catch (e) {
            console.error("Failed to fetch pending professors", e);
        }
    },

    async approveProfessor(profId) {
        // 🔥 FIX: `profId` here is the `players` collection record id
        // (see fetchPendingProfessors above) — was a Firebase RTDB status
        // write, now a direct PocketBase field update.
        try {
            if (window.pb) {
                await window.pb.collection('players').update(profId, { status: 'approved' });
                window.toast("Professor approved successfully!", true);
                this.fetchPendingProfessors();
            }
        } catch (err) {
            window.toast(`Failed to approve professor: ${err.message}`, false);
        }
    },

    async denyProfessor(profId) {
        if (!confirm("Are you sure you want to deny this professor account request?")) return;
        try {
            if (window.pb) {
                // 🔥 FIX: was a Firebase RTDB delete. Also deletes the
                // associated `users` auth record (fetched via the
                // player's `user` relation first) — a denied application
                // shouldn't leave behind a login-capable account. If your
                // intended policy is to keep the auth account around for
                // a possible future re-application, drop the `users`
                // delete call below and keep only the `players` delete.
                const profRecord = await window.pb.collection('players').getOne(profId);
                await window.pb.collection('players').delete(profId);
                if (profRecord.user) {
                    try { await window.pb.collection('users').delete(profRecord.user); } catch (e) {
                        console.warn("Could not delete associated auth user for denied professor:", e);
                    }
                }
                window.toast("Professor request denied and removed.", true);
                this.fetchPendingProfessors();
            }
        } catch (err) {
            window.toast(`Failed to deny professor: ${err.message}`, false);
        }
    },

    renderTeams() {
        const list = document.getElementById('admin-team-list');
        const manualTeamSelect = document.getElementById('manual-student-team');
        const teams = appStore.get('teams') || [];
        
        if(list) {
            list.innerHTML = teams.map((t, i) => {
                const themeInfo = this.getTeamDetails(t.id);
                return `
                <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-white/10 rounded">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${themeInfo.icon}</span>
                        <span class="font-bold text-slate-800 dark:text-white">${themeInfo.name}</span>
                    </div>
                    <button onclick="adminUI.deleteTeam(${i})" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 px-2 rounded font-bold">X</button>
                </div>`
            }).join('');
        }

        if(manualTeamSelect) {
            manualTeamSelect.innerHTML = `<option value="random">Random Team</option>` + 
                teams.map(t => `<option value="${t.id}">${this.getTeamDetails(t.id).name}</option>`).join('');
        }
        this.updateTeamScores(); 
    },
    
    addTeam() {
        const iconInput = document.getElementById('new-team-icon').value.trim() || '&#128305;';
        const nameInput = document.getElementById('new-team-name').value.trim();
        
        if(!nameInput) return window.toast("Please enter a team name.", false);

        const teamId = 'team_' + Date.now();
        const tailwindColorOptions = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'cyan', 'emerald', 'rose'];
        const randomColor = tailwindColorOptions[Math.floor(Math.random() * tailwindColorOptions.length)];

        const teams = appStore.get('teams') || [];
        const updatedTeams = [...teams, { id: teamId, icon: iconInput, name: nameInput, color: randomColor }];
        
        appStore.set('teams', updatedTeams);
        authManager.saveDB(updatedTeams, 'teams');
        
        document.getElementById('new-team-icon').value = '';
        document.getElementById('new-team-name').value = '';
        
        this.renderTeams(); 
        this.renderStudentManagement();
        window.toast(`Custom team created successfully!`, true);
    },
    
    deleteTeam(index) {
        const teams = appStore.get('teams') || [];
        if(teams.length <= 1) return window.toast("You must have at least one team.", false);
        const updatedTeams = teams.filter((_, i) => i !== index);
        appStore.set('teams', updatedTeams);
        authManager.saveDB(updatedTeams, 'teams');
        this.renderTeams(); this.renderStudentManagement();
    },

    // 🔥🔥🔥 CRITICAL FINDING — read this before anything else in this
    // section 🔥🔥🔥
    // Every function below (manualRegisterStudent, giftItem,
    // renderStudentManagement, approveStudent, deleteStudent,
    // saveStudentEdit) used to read and write student data via
    // `authManager.getDB('students')` / `saveDB(..., 'students')` — which
    // is a SINGLE JSON BLOB stored in the `gamedata` collection (see
    // auth.js), keyed by phone number inside that one blob.
    //
    // That is a COMPLETELY SEPARATE, DISCONNECTED data store from the
    // `players` collection that auth.js's real registerStudent()/
    // loginStudent(), network.js, GameController.js, ShopController.js,
    // and LifelineController.js all actually use for login and gameplay.
    // Concretely, this meant: a student who self-registered through the
    // normal login screen (a real `players` row) would NEVER show up
    // here. A student "approved" by a professor in this panel had their
    // STATUS FLIPPED ONLY IN THE GAMEDATA BLOB — their real `players`
    // row (the one loginStudent() actually checks) would still say
    // "pending" and they'd remain locked out, with the professor's UI
    // wrongly showing them as approved.
    //
    // Every function below has been migrated to read/write the REAL
    // `players` collection instead, scoped by `professorId` to preserve
    // the tenant isolation the gamedata-blob approach used to provide.
    // This is the single most impactful fix in this batch.

    async manualRegisterStudent() {
        const nameEl = document.getElementById('manual-student-name');
        const ccEl = document.getElementById('manual-student-cc');
        const phoneEl = document.getElementById('manual-student-phone');
        const passEl = document.getElementById('manual-student-pass');
        const teamEl = document.getElementById('manual-student-team');
        if (!nameEl || !ccEl || !phoneEl || !passEl || !teamEl) return;

        const name = nameEl.value.trim();
        const cc = ccEl.value;
        const cleanPhone = String(phoneEl.value).replace(/\D/g, '');
        const pass = passEl.value.trim();
        const selectedTeam = teamEl.value;
        const avatarEl = document.getElementById('manual-student-avatar-preview');
        let avatar = avatarEl ? avatarEl.dataset.newavatar : null;

        if (!name || !cleanPhone || !pass) return window.toast("Name, Phone, and Password are required.", false);
        if (!/^\d{8,15}$/.test(cleanPhone)) return window.toast("Please enter a valid numeric phone number.", false);

        const phone = cc + cleanPhone;
        const profId = appStore.get('currentProfId');
        const shadowEmail = `${phone}_${Date.now()}@student.app.com`;
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        const finalTeam = selectedTeam === 'random' ? teams[0].id : selectedTeam;
        if (!avatar) avatar = DEFAULT_AVATAR;

        // Same duplicate-registration guard added to auth.js's
        // registerStudent() in an earlier batch — prevents a professor
        // from accidentally creating two accounts for the same phone.
        try {
            await window.pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
            return window.toast("A student with this phone number already exists for your class.", false);
        } catch (err) {
            if (err?.status !== 404) return window.toast(`Registration failed: ${err.message}`, false);
        }

        // 🔥 SIMPLIFICATION: the old Firebase version had to spin up a
        // SEPARATE secondary Firebase app instance ("AdminAppInstance")
        // purely to create the student's auth account without kicking
        // the professor out of their own session — Firebase's client SDK
        // auto-signs-in as any user you create with it. PocketBase's
        // `.create()` does NOT touch `pb.authStore` at all — it's a plain
        // REST create — so that whole workaround is unnecessary here.
        let userRecord;
        try {
            userRecord = await window.pb.collection('users').create({
                email: shadowEmail, password: pass, passwordConfirm: pass, name
            });
        } catch (error) {
            return window.toast(`Registration failed: ${error.message}`, false);
        }

        try {
            await window.pb.collection('players').create({
                user: userRecord.id, nickname: name, avatar, team: finalTeam,
                shadowEmail, phone, professorId: profId, role: 'student',
                status: 'approved' // professor-added students don't need self-approval
            });
        } catch (profileErr) {
            console.error("Failed to create student profile, rolling back user record:", profileErr);
            try { await window.pb.collection('users').delete(userRecord.id); } catch (e) { /* best-effort */ }
            return window.toast(`Registration failed: ${profileErr.message}`, false);
        }

        window.toast(`Successfully registered ${name}!`, true);
        nameEl.value = ''; phoneEl.value = ''; passEl.value = '';

        if(avatarEl) {
            avatarEl.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
            delete avatarEl.dataset.newavatar;
        }

        this.renderStudentManagement();
    },

    async giftItem(phone) {
        const giftSelect = document.getElementById(`gift-item-${phone}`);
        if (!giftSelect) return;
        const item = giftSelect.value;
        if (!item) return window.toast("Please select an item to gift first.", false);

        try {
            // 🔥 FIX: was reading/writing a `users/${uid}` Firebase path
            // sourced from the disconnected gamedata-blob student record.
            // Looks up the REAL `players` row instead, scoped to this
            // professor.
            const profId = appStore.get('currentProfId');
            const student = await window.pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);

            const fields = {};
            if (item === 'coins_50') {
                fields.coins = (student.coins || 0) + 50;
            } else {
                const inventory = { ...(student.inventory || {}) };
                inventory[item] = (inventory[item] || 0) + 1;
                fields.inventory = inventory;
            }

            await window.pb.collection('players').update(student.id, fields);
            window.toast(`Gift sent directly to ${student.nickname}'s live account!`, true);
            giftSelect.selectedIndex = 0;
        } catch (e) {
            console.error("Gifting sync failed", e);
            window.toast(e?.status === 404 ? "Student not found." : "Failed to send gift — check your connection.", false);
        }
    },

    renderStudentManagement() {
        const pendingContainer = document.getElementById('pending-approvals-list');
        const container = document.getElementById('student-management-list'); 
        const profId = appStore.get('currentProfId');
        
        // 🔥 FIX: was `authManager.getDB('students')` (the disconnected
        // gamedata blob) — now queries the REAL `players` collection,
        // scoped to this professor via `professorId` to preserve the
        // same tenant isolation the old approach provided.
        window.pb.collection('players').getFullList({ filter: `professorId="${profId}" && role="student"` }).then(students => {
            const teams = appStore.get('teams') || [];
            const pending = students.filter(s => s.status === 'pending');
            const active = students.filter(s => s.status !== 'pending');

            // 🔥 FIX: both lists were built with `innerHTML += ...` inside
            // a loop — same anti-pattern fixed elsewhere. Build once,
            // assign once. Also fixes the avatar path bug: `s.avatar` is a
            // bare filename and needs getAvatarUrl() + an onerror fallback,
            // same as everywhere else this is rendered.
            if (pendingContainer) {
                pendingContainer.innerHTML = pending.map(s => `
                    <div class="flex flex-col sm:flex-row items-center gap-4 p-4 border border-amber-200 dark:border-amber-500/30 rounded-xl bg-amber-50 dark:bg-amber-900/20 shadow-sm mb-3 transition-all">
                        <img src="${getAvatarUrl(s.avatar)}" onerror="${AVATAR_ONERROR}" class="w-12 h-12 rounded-full object-cover border border-amber-300">
                        <div class="flex-1">
                            <p class="font-bold text-slate-800 dark:text-slate-200">${s.nickname}</p>
                            <span class="text-xs font-mono text-slate-500">${s.phone}</span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="adminUI.approveStudent('${s.phone}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Approve</button>
                            <button onclick="adminUI.deleteStudent('${s.phone}', true)" class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Deny</button>
                        </div>
                    </div>`).join('');
            }

            if (container) {
                container.innerHTML = active.map(s => `
                    <div class="flex flex-col sm:flex-row items-start gap-4 p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-800/80 shadow-sm mb-3 transition-all">
                        
                        <div class="relative w-16 h-16 shrink-0 transition-transform hover:scale-105">
                            <img src="${getAvatarUrl(s.avatar)}" onerror="${AVATAR_ONERROR}" id="edit-img-${s.phone}" class="w-full h-full rounded-full object-cover border border-slate-300">
                            <input type="file" accept="image/*" onchange="adminUI.updateStudentAvatar(event, '${s.phone}')" class="absolute inset-0 opacity-0 cursor-pointer" title="Update Profile Photo">
                        </div>
                        
                        <div class="flex-1 w-full flex flex-col gap-1">
                            <div class="flex justify-between items-start">
                                <p class="font-bold text-slate-800 dark:text-white text-lg">${s.nickname}</p>
                                <span class="phone-badge text-xs font-mono px-2 py-1 rounded-md">${s.phone}</span>
                            </div>
                            
                            <div class="flex gap-4 mt-2">
                                <div class="flex-1">
                                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">New Password</label>
                                    <input type="text" id="edit-pass-${s.phone}" placeholder="Reset Password..." class="border border-slate-300 dark:border-white/20 p-2 text-sm rounded-lg w-full bg-white dark:bg-black/30 text-slate-900 dark:text-white transition-colors">
                                </div>
                                <div class="flex-1">
                                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Assign Team</label>
                                    <select id="edit-team-${s.phone}" class="border border-slate-300 dark:border-white/20 p-2 text-sm rounded-lg w-full bg-white dark:bg-black/30 text-slate-900 dark:text-white transition-colors">
                                        ${teams.map(t => `<option value="${t.id}" ${s.team === t.id ? 'selected' : ''}>${this.getTeamDetails(t.id).name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10 w-full">
                                <select id="gift-item-${s.phone}" class="flex-1 p-2 text-sm rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-200 focus:outline-none transition-colors">
                                    <option value="" disabled selected>Select a Gift...</option>
                                    <option value="extraLife">&#128305; Extra Life</option>
                                    <option value="freezeTime">&#10052; Time Freeze</option>
                                    <option value="timeBurn">&#128293; Time Burn</option>
                                    <option value="doubleCoins">&#129689; Double Coins</option>
                                    <option value="coins_50">&#128176; +50 Coins immediately</option>
                                </select>
                                <button onclick="adminUI.giftItem('${s.phone}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors w-full sm:w-auto">&#127873; Send Gift</button>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                            <button onclick="adminUI.saveStudentEdit('${s.phone}')" class="w-full bg-slate-800 hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">Save Edits</button>
                            <button onclick="adminUI.deleteStudent('${s.phone}', false)" class="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">Delete</button>
                        </div>
                    </div>`).join('');
            }
            
            const pWrap = document.getElementById('pending-approvals-wrapper');
            if(pWrap) pWrap.classList.toggle('hidden', pending.length === 0);
        }).catch(e => console.warn("Failed to load student roster", e));
    },

    async approveStudent(phone) {
        try {
            const profId = appStore.get('currentProfId');
            const student = await window.pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
            await window.pb.collection('players').update(student.id, { status: 'approved' });
            window.toast("Student approved!", true);
            this.renderStudentManagement();
        } catch (err) {
            window.toast("Could not approve student — check your connection.", false);
        }
    },
    
    async deleteStudent(phone, isDenial = false) {
        if(!confirm(`Are you sure you want to ${isDenial ? 'deny' : 'completely delete'} this student?`)) return;
        
        try {
            const profId = appStore.get('currentProfId');
            // 🔥 FIX: was deleting a Firebase RTDB path built from a
            // profId/phone combo that never matched anything the rest of
            // the app reads. Deletes the real `players` row (and its
            // `users` auth record, so the student can't still log in
            // after being removed) instead.
            const student = await window.pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
            await window.pb.collection('players').delete(student.id);
            if (student.user) {
                try { await window.pb.collection('users').delete(student.user); } catch (e) {
                    console.warn("Could not delete associated auth user:", e);
                }
            }
            
            const players = appStore.get('players') || {};
            const peerId = Object.keys(players).find(id => players[id].phone === phone);
            
            if (peerId) {
                delete players[peerId];
                appStore.set('players', players);
                this.updateLobbyList();
                this.updateTeamScores();
                
                // Also remove them from the live room roster if a room is
                // currently active (network.js's `students` collection).
                const roomId = appStore.get('roomRecordId');
                if (roomId) {
                    try {
                        const roomEntry = await window.pb.collection('students').getFirstListItem(`room="${roomId}" && phone="${phone}"`);
                        await window.pb.collection('students').delete(roomEntry.id);
                    } catch (e) { /* not currently in an active room — fine */ }
                }
            }
            
            window.toast(`Student ${isDenial ? 'denied' : 'deleted'}.`, true);
            this.renderStudentManagement(); 
        } catch (err) { window.toast("Error modifying student.", false); }
    },
    
    async saveStudentEdit(oldPhone) {
        const passEl = document.getElementById(`edit-pass-${oldPhone}`);
        const teamEl = document.getElementById(`edit-team-${oldPhone}`);
        const imgEl = document.getElementById(`edit-img-${oldPhone}`);
        if (!passEl || !teamEl || !imgEl) return;

        const newPass = passEl.value.trim();
        const newTeam = teamEl.value;
        const newAvatar = imgEl.dataset.newavatar;

        try {
            const profId = appStore.get('currentProfId');
            const student = await window.pb.collection('players').getFirstListItem(`phone="${oldPhone}" && professorId="${profId}"`);

            const fields = { team: newTeam };
            if (newAvatar) fields.avatar = newAvatar;
            await window.pb.collection('players').update(student.id, fields);

            // 🔥 NOTE: password resets for OTHER users generally require
            // superuser/admin-level PocketBase access — the public client
            // SDK can't normally change another account's password
            // without their current one. If this call fails with a
            // permissions error, you likely need either a PocketBase
            // superuser token on the server side or a custom API route
            // for this action, rather than calling it from the browser
            // with the professor's own session.
            if (newPass) {
                if (newPass.length < 6) {
                    window.toast("Team/avatar saved, but password needs 6+ characters — not changed.", false);
                } else if (student.user) {
                    try {
                        await window.pb.collection('users').update(student.user, {
                            password: newPass, passwordConfirm: newPass
                        });
                    } catch (passErr) {
                        console.error("Password reset failed (likely needs superuser access):", passErr);
                        window.toast("Team/avatar saved, but password reset failed — see console.", false);
                    }
                }
            }

            window.toast("Student account updated!", true);
            
            const players = appStore.get('players') || {};
            const peerId = Object.keys(players).find(id => players[id].phone === oldPhone);
            
            if (peerId) {
                players[peerId].team = newTeam;
                appStore.set('players', players);
                this.updateLobbyList();
                this.updateTeamScores();

                const roomId = appStore.get('roomRecordId');
                if (roomId) {
                    try {
                        const roomEntry = await window.pb.collection('students').getFirstListItem(`room="${roomId}" && phone="${oldPhone}"`);
                        await window.pb.collection('students').update(roomEntry.id, { team: newTeam });
                    } catch (e) { /* not currently in an active room — fine */ }
                }
            }

            this.renderStudentManagement(); 
        } catch (err) {
            window.toast("Error saving student edits — check your connection.", false);
        }
    },

    updateLobbyList() {
        const list = document.getElementById('admin-students-list'); 
        const count = document.getElementById('connected-count');
        if (!list || !count) return;

        const players = appStore.get('players') || {};
        const playerIds = Object.keys(players); 
        
        count.innerText = playerIds.length;
        list.innerHTML = '';
        
        if (playerIds.length === 0) {
            list.innerHTML = '<li class="text-sm text-slate-400 italic py-2">Waiting for students to join...</li>';
            return;
        }

        const sortedPlayers = Object.values(players).sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

        // 🔥 FIX: was `list.innerHTML += ...` inside forEach — same
        // rebuild-every-iteration anti-pattern fixed elsewhere. Also
        // fixes the avatar path bug: `p.avatar` is a bare filename and
        // needs getAvatarUrl() + an onerror fallback.
        list.innerHTML = sortedPlayers.map(p => {
            const theme = this.getTeamDetails(p.team);
            const badgeColor = tailwindColors[theme.color]?.bg || 'bg-indigo-500';
            const score = p.scores?.total || 0;
            
            return `
                <li class="flex items-center justify-between p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-white/10 mb-2 shadow-sm transition-all text-slate-800 dark:text-slate-100">
                    <div class="flex items-center gap-3">
                        <img src="${getAvatarUrl(p.avatar)}" onerror="${AVATAR_ONERROR}" class="w-10 h-10 rounded-full border-2 ${p.border || 'border-slate-300'} bg-white dark:bg-slate-700 object-cover">
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-800 dark:text-white text-sm leading-tight">${p.name}</span>
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">${p.phone || 'Student'}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <span class="text-xs font-bold text-white px-2 py-1 rounded-full shadow-sm ${badgeColor}">${theme.icon} ${theme.name}</span>
                        <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 text-right w-full">${score} pts</span>
                    </div>
                </li>
            `;
        }).join('');
    },
    
    updateTeamScores() {
        const sb = document.getElementById('dynamic-team-scoreboard');
        if(!sb) return;
        let html = '';
        // 🔥 FIX: added `|| []`/`|| {}` fallbacks for consistency with
        // every other appStore.get('teams')/get('players') call in this
        // file — store.js always seeds both, so this wasn't a live crash
        // risk today, but it's the only place in the file missing the
        // defensive fallback used everywhere else.
        const teams = appStore.get('teams') || [];
        const players = appStore.get('players') || {};

        teams.forEach(t => {
            let score = 0;
            Object.values(players).forEach(p => { if(p.team === t.id) score += p.scores?.total || 0; });
            const theme = this.getTeamDetails(t.id);
            const bgClass = tailwindColors[theme.color]?.bg || 'bg-indigo-500';
            const txtClass = tailwindColors[theme.color]?.light || 'text-indigo-200';
            
            html += `
            <div class="bg-slate-800 rounded-xl p-4 flex items-center gap-3 border-2 border-slate-700 shadow-md transition-all">
                <div class="w-3 h-12 rounded-full ${bgClass}"></div>
                <div>
                    <p class="${txtClass} font-bold text-[10px] tracking-widest uppercase truncate max-w-[100px]">${theme.icon} ${theme.name}</p>
                    <p class="text-white font-black text-2xl leading-none">${score}</p>
                </div>
            </div>`;
        });
        sb.innerHTML = html;
    },
    
    // 🔥 FIX: was unguarded — `updateAnalytics()` is called from
    // network.js's real-time roster listener on every player update, so a
    // missing `#admin-tab-analytics` element would throw on every single
    // score change, not just once.
    updateAnalytics() {
        const analyticsTab = document.getElementById('admin-tab-analytics');
        if (analyticsTab && !analyticsTab.classList.contains('hidden')) this.renderChart();
    },
    
    renderChart() {
        const players = Object.values(appStore.get('players') || {}); 
        const l = document.getElementById('analytics-player-list'); 
        if(!l) return;
        
        // 🔥 FIX: same innerHTML += anti-pattern fixed elsewhere.
        l.innerHTML = players.sort((a,b)=>(b.scores?.total || 0) - (a.scores?.total || 0)).map(p => { 
            const theme = this.getTeamDetails(p.team);
            const bgClass = tailwindColors[theme.color]?.bg || 'bg-indigo-500';
            
            return `
            <div class="flex justify-between items-center bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 mb-2 shadow-sm transition-colors">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full ${bgClass} shadow-sm"></div>
                    <span class="font-bold text-slate-800 dark:text-white">${p.name}</span>
                </div>
                <div class="flex gap-3 text-xs font-semibold">
                    <span class="text-rose-600 dark:text-rose-400">Spk: ${p.scores?.Speaking||0}</span>
                    <span class="text-blue-600 dark:text-blue-400">Wrt: ${p.scores?.Writing||0}</span>
                    <span class="text-emerald-600 dark:text-emerald-400">Lst: ${p.scores?.Listening||0}</span>
                    <span class="font-black text-indigo-800 dark:text-indigo-300">Tot: ${p.scores?.total||0}</span>
                </div>
            </div>`; 
        }).join('');
        
        const ctxEl = document.getElementById('classRadarChart');
        if(ctxEl && window.Chart) {
            if(this.chartInstance) this.chartInstance.destroy(); 
            const ctx = ctxEl.getContext('2d');
            let avgSpk = 0, avgWrt = 0, avgLst = 0, avgGen = 0; 
            
            if(players.length > 0) { 
                avgSpk = players.reduce((sum, p) => sum + (p.scores?.Speaking||0), 0) / players.length; 
                avgWrt = players.reduce((sum, p) => sum + (p.scores?.Writing||0), 0) / players.length; 
                avgLst = players.reduce((sum, p) => sum + (p.scores?.Listening||0), 0) / players.length; 
                avgGen = players.reduce((sum, p) => sum + (p.scores?.General||0), 0) / players.length; 
            }
            
            this.chartInstance = new window.Chart(ctx, { type: 'bar', data: { labels: ['Speaking', 'Writing', 'Listening', 'General'], datasets: [{ label: 'Class Average Points', data: [avgSpk, avgWrt, avgLst, avgGen], backgroundColor: ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981'] }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
        }

        const ccCounts = {};
        appStore.get('countryCodes').forEach(c => ccCounts[`${c.flag} (${c.code})`] = 0);
        ccCounts['Other'] = 0;

        players.forEach(p => {
            if(!p.phone) return;
            let matched = false;
            for (let c of appStore.get('countryCodes')) {
                if (p.phone.startsWith(c.code)) {
                    ccCounts[`${c.flag} (${c.code})`]++;
                    matched = true;
                    break;
                }
            }
            if (!matched) ccCounts['Other']++;
        });
        
        const labels = []; const data = []; 
        for(let key in ccCounts) { if(ccCounts[key]>0) { labels.push(key); data.push(ccCounts[key]); } }
        
        const dCtxEl = document.getElementById('demographicsChart');
        if(dCtxEl && window.Chart) {
            if(this.demoChartInstance) this.demoChartInstance.destroy(); 
            const dCtx = dCtxEl.getContext('2d');
            this.demoChartInstance = new window.Chart(dCtx, { type: 'doughnut', data: { labels: labels, datasets: [{ data: data, backgroundColor: ['#3b82f6', '#10b981', '#D97706', '#ef4444', '#8b5cf6', '#64748b'] }] }, options: { responsive: true } });
        }
    },
    
    // 🛠️ NEW: Premium Drawing Board Logic for Visual Assessment 🛠️
    setupDrawingBoard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 🔥 FIX: `init()` (which calls this) re-runs every time a
        // professor hosts a new room (see network.js's hostGame()) — but
        // `#mod3-draw-container` is a persistent element inside the
        // always-mounted ProfDashboard component, not recreated per game.
        // Without this guard, each new hosted session stacked another set
        // of mousedown/mousemove/mouseup/mouseleave listeners on the same
        // element, so a single click could eventually fire N times.
        if (container.dataset.drawingBoardInitialized) return;
        container.dataset.drawingBoardInitialized = 'true';

        const layer = container.querySelector('#mod3-admin-layer');
        let isDrawing = false;
        let startX, startY, currentBox;

        container.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = container.getBoundingClientRect();
            startX = ((e.clientX - rect.left) / rect.width) * 100;
            startY = ((e.clientY - rect.top) / rect.height) * 100;

            if (currentBox) currentBox.remove();
            
            currentBox = document.createElement('div');
            // Premium glowing selection box
            currentBox.className = 'draw-box absolute border-4 border-rose-500 bg-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.6)] rounded-sm pointer-events-none';
            currentBox.style.left = `${startX}%`;
            currentBox.style.top = `${startY}%`;
            currentBox.style.width = '0%';
            currentBox.style.height = '0%';
            layer.appendChild(currentBox);
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = container.getBoundingClientRect();
            let currX = ((e.clientX - rect.left) / rect.width) * 100;
            let currY = ((e.clientY - rect.top) / rect.height) * 100;

            currX = Math.max(0, Math.min(100, currX));
            currY = Math.max(0, Math.min(100, currY));

            const left = Math.min(startX, currX);
            const top = Math.min(startY, currY);
            const width = Math.abs(currX - startX);
            const height = Math.abs(currY - startY);

            currentBox.style.left = `${left}%`;
            currentBox.style.top = `${top}%`;
            currentBox.style.width = `${width}%`;
            currentBox.style.height = `${height}%`;
            
            container.dataset.box = JSON.stringify({ left, top, width, height });
        });

        container.addEventListener('mouseup', () => { isDrawing = false; });
        container.addEventListener('mouseleave', () => { isDrawing = false; });
    },
    
    addDrawnHotspot(modNum) {
        const cId = 'mod3-draw-container'; 
        const iId = 'mod3-prompt-input';
        const c = document.getElementById(cId); const i = document.getElementById(iId); if(!c || !c.dataset.box || !i.value) return;
        const target = JSON.parse(c.dataset.box); 
        
        if(!window.lessonData.hotspots) window.lessonData.hotspots = [];
        window.lessonData.hotspots.push({ prompt: i.value, target }); 
        
        i.value = ''; c.dataset.box = ''; const b = c.querySelector('.draw-box'); if(b) b.remove(); 
        
        this.renderContentEditors();
        window.toast("Target added successfully!", true);
    },
    
    addItem(type) {
        if (!window.lessonData) window.lessonData = {};
        
        if(type==='puzzleMatch') {
            if(!window.lessonData.puzzleMatch) window.lessonData.puzzleMatch = { image: "", questions: [] };
            if(!window.lessonData.puzzleMatch.questions) window.lessonData.puzzleMatch.questions = [];
            window.lessonData.puzzleMatch.questions.push({ q: "New Question?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], answer: 0, skill: "General" });
        }
        if(type==='ticTacToe') {
            if(!window.lessonData.ticTacToe) window.lessonData.ticTacToe = [];
            window.lessonData.ticTacToe.push({ q: "New Question?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], answer: 0, skill: "General" });
        }
        if(type==='memoryMatch') {
            if(!window.lessonData.memoryMatch) window.lessonData.memoryMatch = [];
            window.lessonData.memoryMatch.push({term: "Term", match: "Match", termImg: "", matchImg: ""});
        }
        if(type==='vocab') {
            if(!window.lessonData.vocabulary) window.lessonData.vocabulary = [];
            window.lessonData.vocabulary.push({term: "Term", def: "Def"});
        }
        if(type==='audioGuess') {
            if(!window.lessonData.audioGuess) window.lessonData.audioGuess = [];
            window.lessonData.audioGuess.push({ desc: "New", options: ["1", "2", "3", "4"], answer: 0, skill: "Listening" }); 
        }
        if(type==='spellingBee') {
            if(!window.lessonData.spellingBee) window.lessonData.spellingBee = [];
            window.lessonData.spellingBee.push({ word: "New", skill: "Writing" }); 
        }
        if(type==='hangman') {
            if(!window.lessonData.hangman) window.lessonData.hangman = [];
            window.lessonData.hangman.push({ phrase: "NEW", skill: "General" }); 
        }
        if(type==='readAloud') {
            if(!window.lessonData.readAloud) window.lessonData.readAloud = [];
            window.lessonData.readAloud.push({text: "Text", skill: "Speaking"}); 
        }
        if(type==='dictation') {
            if(!window.lessonData.dictation) window.lessonData.dictation = [];
            window.lessonData.dictation.push({text: "Dict", skill: "Writing"}); 
        }
        if(type==='quiz') {
            if(!window.lessonData.quiz) window.lessonData.quiz = [];
            window.lessonData.quiz.push({ q: "Q", options: ["1", "2", "3", "4"], answer: 0, skill: "General" }); 
        }
        if(type==='chatPhrase') {
            if(!window.lessonData.chatPhrases) window.lessonData.chatPhrases = [];
            window.lessonData.chatPhrases.push("New Phrase!");
        }
        this.renderContentEditors();
    },
    
    renderContentEditors() {
        const _r = (id, arr, htmlFunc) => { const c = document.getElementById(id); if(c) { c.innerHTML=''; arr.forEach((d,i)=> c.innerHTML += htmlFunc(d,i)); } };
        
        const delBtn = (type, i) => `<button onclick="adminUI.deleteItem('${type}', ${i})" class="shrink-0 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ml-2" title="Delete Item">X</button>`;
        
        const memTypeSelect = document.getElementById('mod8-match-type');
        const memType = memTypeSelect ? memTypeSelect.value : (window.lessonData.memoryMatchType || 'text-text');
        if (memTypeSelect) memTypeSelect.value = memType;

        const puzzlePreview = document.getElementById('mod2-puzzle-preview');
        if(puzzlePreview) {
            if(window.lessonData.puzzleMatch && window.lessonData.puzzleMatch.image) {
                puzzlePreview.style.backgroundImage = `url(${window.lessonData.puzzleMatch.image})`;
                puzzlePreview.classList.remove('hidden');
            } else {
                puzzlePreview.classList.add('hidden');
            }
        }
        
        const mod3Preview = document.getElementById('mod3-admin-bg');
        if(mod3Preview && window.lessonData.visualAssessment && window.lessonData.visualAssessment.image) {
            mod3Preview.src = window.lessonData.visualAssessment.image;
        }
        
        _r('admin-puzzle-list', (window.lessonData.puzzleMatch && window.lessonData.puzzleMatch.questions) ? window.lessonData.puzzleMatch.questions : [], (t, i) => `<div class="flex items-start gap-2 pb-2 border-b border-slate-200 dark:border-white/10 w-full"><div class="flex-1 flex flex-col gap-1"><input type="text" class="puz-q p-2 border border-slate-300 dark:border-white/20 rounded text-xs bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${t.q}" data-idx="${i}"><div class="grid grid-cols-2 gap-1">${t.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="puz-ans-${i}" value="${oIdx}" ${t.answer === oIdx ? 'checked' : ''}><input type="text" class="puz-opt text-[10px] p-2 border border-slate-300 dark:border-white/20 rounded w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>${delBtn('puzzleMatch', i)}</div>`);
        
        _r('admin-memory-list', window.lessonData.memoryMatch || [], (m, i) => {
            let html = '<div class="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10 w-full"><div class="flex-1">';
            const defaultImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
            
            if (memType === 'text-text') {
                html += `<div class="flex gap-2"><input class="mem-term text-xs p-2 flex-1 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${m.term || ''}" placeholder="Term 1"><input class="mem-match text-xs p-2 flex-1 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${m.match || ''}" placeholder="Term 2"></div>`;
            } else if (memType === 'image-text') {
                html += `<div class="flex gap-2 items-center">
                    <div class="relative w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded border border-slate-300 dark:border-white/20 overflow-hidden">
                        <img src="${m.termImg || defaultImg}" id="mem-img1-${i}" class="w-full h-full object-cover p-1">
                        <input type="file" accept="image/*" onchange="adminUI.handleMemUpload(event, 'mem-img1-${i}', ${i}, 'termImg')" class="absolute inset-0 opacity-0 cursor-pointer">
                    </div>
                    <input class="mem-match text-xs p-2 flex-1 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${m.match || ''}" placeholder="Match Text">
                </div>`;
            } else {
                html += `<div class="flex gap-2 items-center">
                    <div class="relative w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded border border-slate-300 dark:border-white/20 overflow-hidden">
                        <img src="${m.termImg || defaultImg}" id="mem-img1-${i}" class="w-full h-full object-cover p-1">
                        <input type="file" accept="image/*" onchange="adminUI.handleMemUpload(event, 'mem-img1-${i}', ${i}, 'termImg')" class="absolute inset-0 opacity-0 cursor-pointer">
                    </div>
                    <div class="relative w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded border border-slate-300 dark:border-white/20 overflow-hidden">
                        <img src="${m.matchImg || defaultImg}" id="mem-img2-${i}" class="w-full h-full object-cover p-1">
                        <input type="file" accept="image/*" onchange="adminUI.handleMemUpload(event, 'mem-img2-${i}', ${i}, 'matchImg')" class="absolute inset-0 opacity-0 cursor-pointer">
                    </div>
                </div>`;
            }
            html += `</div>${delBtn('memoryMatch', i)}</div>`;
            return html;
        });

        _r('admin-tictactoe-list', window.lessonData.ticTacToe || [], (t, i) => `<div class="flex items-start gap-2 pb-2 border-b border-slate-200 dark:border-white/10 w-full"><div class="flex-1 flex flex-col gap-1"><input type="text" class="ttt-q p-2 border border-slate-300 dark:border-white/20 rounded text-xs bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${t.q}" data-idx="${i}"><div class="grid grid-cols-2 gap-1">${t.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="ttt-ans-${i}" value="${oIdx}" ${t.answer === oIdx ? 'checked' : ''}><input type="text" class="ttt-opt text-[10px] p-2 border border-slate-300 dark:border-white/20 rounded w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>${delBtn('ticTacToe', i)}</div>`);

        _r('admin-chat-list', window.lessonData.chatPhrases || [], (d,i) => `<div class="flex items-center gap-1 pb-1 w-full"><input class="chat-phr text-xs p-2 flex-1 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${d}">${delBtn('chatPhrase', i)}</div>`);
        _r('admin-vocab-list', window.lessonData.vocabulary || [], (d,i) => `<div class="flex items-center gap-1 pb-1 w-full"><input class="v-term text-xs p-2 w-1/3 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${d.term}"><input class="v-def text-xs p-2 flex-1 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}" value="${d.def}">${delBtn('vocab', i)}</div>`);
        _r('admin-audio-list', window.lessonData.audioGuess || [], (a, i) => `<div class="flex items-start gap-2 pb-2 border-b border-slate-200 dark:border-white/10 w-full"><div class="flex-1 flex flex-col gap-1"><textarea class="audio-desc p-2 border border-slate-300 dark:border-white/20 rounded text-xs h-10 bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}">${a.desc}</textarea><div class="grid grid-cols-2 gap-1">${a.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="audio-ans-${i}" value="${oIdx}" ${a.answer === oIdx ? 'checked' : ''}><input type="text" class="audio-opt text-[10px] p-2 border border-slate-300 dark:border-white/20 rounded w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>${delBtn('audioGuess', i)}</div>`);
        _r('admin-spelling-list', window.lessonData.spellingBee || [], (s, i) => `<div class="flex items-center gap-1 w-full mb-1"><input type="text" class="spell-word w-full p-2 border border-slate-300 dark:border-white/20 rounded text-xs bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${s.word}" data-idx="${i}">${delBtn('spellingBee', i)}</div>`);
        _r('admin-hangman-list', window.lessonData.hangman || [], (h, i) => `<div class="flex items-center gap-1 w-full mb-1"><input type="text" class="hangman-phrase w-full p-2 border border-slate-300 dark:border-white/20 rounded text-xs bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 uppercase" value="${h.phrase}" data-idx="${i}">${delBtn('hangman', i)}</div>`);
        _r('admin-read-list', window.lessonData.readAloud || [], (d,i) => `<div class="flex items-start gap-1 w-full mb-1"><textarea class="ra-text w-full text-xs p-2 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}">${d.text}</textarea>${delBtn('readAloud', i)}</div>`);
        _r('admin-dict-list', window.lessonData.dictation || [], (d,i) => `<div class="flex items-start gap-1 w-full mb-1"><textarea class="dict-text w-full text-xs p-2 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" data-idx="${i}">${d.text}</textarea>${delBtn('dictation', i)}</div>`);
        _r('admin-quiz-list', window.lessonData.quiz || [], (q, i) => `<div class="flex items-start gap-2 pb-2 border-b border-slate-200 dark:border-white/10 w-full"><div class="flex-1 flex flex-col gap-1"><input type="text" class="quiz-q p-2 border border-slate-300 dark:border-white/20 rounded text-xs bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${q.q}" data-idx="${i}"><div class="grid grid-cols-2 gap-1">${q.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="quiz-ans-${i}" value="${oIdx}" ${q.answer === oIdx ? 'checked' : ''}><input type="text" class="quiz-opt text-[10px] p-2 border border-slate-300 dark:border-white/20 rounded w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>${delBtn('quiz', i)}</div>`);
        _r('admin-mod3-list', window.lessonData.hotspots || [], (h, i) => `<div class="bg-white dark:bg-black/30 p-2 border border-slate-300 dark:border-white/20 rounded text-xs flex justify-between items-center text-slate-800 dark:text-slate-200 mb-1"><span>Target: ${h.prompt}</span>${delBtn('hotspot', i)}</div>`);
    },
    
    saveContent() {
        window.lessonData = window.lessonData || {};
        
        const toggles = document.querySelectorAll('.module-toggle');
        if(toggles.length > 0) {
            window.lessonData.activeModules = Array.from(toggles).filter(cb => cb.checked).map(cb => parseInt(cb.dataset.mod));
        }

        if(!window.lessonData.puzzleMatch) window.lessonData.puzzleMatch = { image: "", questions: [] };
        if(!window.lessonData.puzzleMatch.questions) window.lessonData.puzzleMatch.questions = [];
        document.querySelectorAll('.puz-q').forEach(i => {
            if(window.lessonData.puzzleMatch.questions[i.dataset.idx]) window.lessonData.puzzleMatch.questions[i.dataset.idx].q = i.value;
        }); 
        document.querySelectorAll('.puz-opt').forEach(i => {
            if(window.lessonData.puzzleMatch.questions[i.dataset.qidx]) window.lessonData.puzzleMatch.questions[i.dataset.qidx].options[i.dataset.oidx] = i.value;
        }); 
        window.lessonData.puzzleMatch.questions.forEach((t, idx) => { const s = document.querySelector(`input[name="puz-ans-${idx}"]:checked`); if(s) t.answer = parseInt(s.value); });

        if(!window.lessonData.memoryMatch) window.lessonData.memoryMatch = [];
        const memTypeSelect = document.getElementById('mod8-match-type');
        if(memTypeSelect) window.lessonData.memoryMatchType = memTypeSelect.value;
        
        document.querySelectorAll('.mem-term').forEach(e => {
            if(window.lessonData.memoryMatch[e.dataset.idx]) window.lessonData.memoryMatch[e.dataset.idx].term = e.value;
        });
        document.querySelectorAll('.mem-match').forEach(e => {
            if(window.lessonData.memoryMatch[e.dataset.idx]) window.lessonData.memoryMatch[e.dataset.idx].match = e.value;
        });

        if(!window.lessonData.ticTacToe) window.lessonData.ticTacToe = [];
        document.querySelectorAll('.ttt-q').forEach(i => {
            if(window.lessonData.ticTacToe[i.dataset.idx]) window.lessonData.ticTacToe[i.dataset.idx].q = i.value;
        }); 
        document.querySelectorAll('.ttt-opt').forEach(i => {
            if(window.lessonData.ticTacToe[i.dataset.qidx]) window.lessonData.ticTacToe[i.dataset.qidx].options[i.dataset.oidx] = i.value;
        }); 
        window.lessonData.ticTacToe.forEach((t, idx) => { const s = document.querySelector(`input[name="ttt-ans-${idx}"]:checked`); if(s) t.answer = parseInt(s.value); });

        if(!window.lessonData.chatPhrases) window.lessonData.chatPhrases = []; 
        document.querySelectorAll('.chat-phr').forEach(i => window.lessonData.chatPhrases[i.dataset.idx] = i.value);

        if(!window.lessonData.vocabulary) window.lessonData.vocabulary = [];
        document.querySelectorAll('.v-term').forEach(e => {
            if(window.lessonData.vocabulary[e.dataset.idx]) window.lessonData.vocabulary[e.dataset.idx].term = e.value;
        }); 
        document.querySelectorAll('.v-def').forEach(e => {
            if(window.lessonData.vocabulary[e.dataset.idx]) window.lessonData.vocabulary[e.dataset.idx].def = e.value;
        });

        if(!window.lessonData.audioGuess) window.lessonData.audioGuess = [];
        document.querySelectorAll('.audio-desc').forEach(i => {
            if(window.lessonData.audioGuess[i.dataset.idx]) window.lessonData.audioGuess[i.dataset.idx].desc = i.value;
        }); 
        document.querySelectorAll('.audio-opt').forEach(i => {
            if(window.lessonData.audioGuess[i.dataset.qidx]) window.lessonData.audioGuess[i.dataset.qidx].options[i.dataset.oidx] = i.value;
        }); 
        window.lessonData.audioGuess.forEach((a, idx) => { const s = document.querySelector(`input[name="audio-ans-${idx}"]:checked`); if(s) a.answer = parseInt(s.value); });

        if(!window.lessonData.spellingBee) window.lessonData.spellingBee = [];
        document.querySelectorAll('.spell-word').forEach(e => {
            if(window.lessonData.spellingBee[e.dataset.idx]) window.lessonData.spellingBee[e.dataset.idx].word = e.value;
        }); 

        if(!window.lessonData.hangman) window.lessonData.hangman = [];
        document.querySelectorAll('.hangman-phrase').forEach(e => {
            if(window.lessonData.hangman[e.dataset.idx]) window.lessonData.hangman[e.dataset.idx].phrase = e.value.toUpperCase();
        });

        if(!window.lessonData.readAloud) window.lessonData.readAloud = [];
        document.querySelectorAll('.ra-text').forEach(e => {
            if(window.lessonData.readAloud[e.dataset.idx]) window.lessonData.readAloud[e.dataset.idx].text = e.value;
        }); 

        if(!window.lessonData.dictation) window.lessonData.dictation = [];
        document.querySelectorAll('.dict-text').forEach(e => {
            if(window.lessonData.dictation[e.dataset.idx]) window.lessonData.dictation[e.dataset.idx].text = e.value;
        });

        if(!window.lessonData.quiz) window.lessonData.quiz = [];
        document.querySelectorAll('.quiz-q').forEach(i => {
            if(window.lessonData.quiz[i.dataset.idx]) window.lessonData.quiz[i.dataset.idx].q = i.value;
        }); 
        document.querySelectorAll('.quiz-opt').forEach(i => {
            if(window.lessonData.quiz[i.dataset.qidx]) window.lessonData.quiz[i.dataset.qidx].options[i.dataset.oidx] = i.value;
        }); 
        window.lessonData.quiz.forEach((q, idx) => { const s = document.querySelector(`input[name="quiz-ans-${idx}"]:checked`); if(s) q.answer = parseInt(s.value); });
        
        authManager.saveDB(window.lessonData, 'lessonData');
        
        try {
            localStorage.setItem('profLessonData', JSON.stringify(window.lessonData));
            window.toast("Lesson data saved globally!", true);
        } catch (err) {
            console.warn("Local storage full! Cloud save succeeded, but local cache skipped.", err);
            window.toast("Lesson saved to cloud! (File too large for local cache)", true);
        }
    }
};

// 🔥 FIX: this binding was missing entirely. Every button in
// ProfDashboard.js's template uses an inline `onclick="adminUI.xyz()"`
// handler, which resolves against the GLOBAL/window scope — without this
// line, every single one of those buttons would throw `ReferenceError:
// adminUI is not defined` the moment it's clicked, unless some other
// bootstrap file not seen in this review already does this binding.
// Every other controller reviewed so far in this series that gets called
// from inline HTML (shopController, dashboardController, syncManager,
// app) already self-binds this way — this makes adminUI consistent with
// that pattern. Safe either way: if a bootstrap file also does this,
// it's a harmless redundant assignment to the same object.
window.adminUI = adminUI;