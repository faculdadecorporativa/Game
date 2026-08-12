// AdminController.js
// Tenant-Isolated Business Logic

import { tailwindColors, animalThemes } from './data.js';
import { authManager } from './auth.js';
import { appStore } from './store.js';

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
        
        // 🔥 FIX: The drawing board will now successfully initialize!
        this.setupDrawingBoard('mod3-draw-container'); 
        // 🔥 FIX: Purged legacy mod8-draw-container initialization that caused background errors!
        this.renderTeams(); 
        this.renderStudentManagement(); 
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
        
        const pin = appStore.get('roomCode');
        if (pin && window.firebaseRef && window.firebaseSet) {
            const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students`);
            await window.firebaseSet(roomRef, null);
        }
        
        const currentModText = document.getElementById('prof-current-module');
        if(currentModText) currentModText.innerText = "Ready to Start";
        
        this.updateLobbyList();
        this.updateTeamScores();
        this.exitToLobby();
        
        window.toast("Session wiped. Ready for a new class!", true);
    },
    
    switchTab(tab) {
        ['admin-tab-lobby', 'admin-tab-analytics', 'admin-tab-settings'].forEach(id => document.getElementById(id).classList.add('hidden'));
        ['tab-lobby', 'tab-analytics', 'tab-settings'].forEach(id => { 
            document.getElementById(id).classList.replace('border-b-2', 'hover:text-indigo-600'); 
            document.getElementById(id).classList.replace('border-indigo-600', 'border-transparent'); 
            document.getElementById(id).classList.replace('text-indigo-600', 'text-slate-500'); 
        });
        
        document.getElementById(`admin-tab-${tab}`).classList.remove('hidden'); 
        document.getElementById(`tab-${tab}`).classList.remove('text-slate-500', 'hover:text-indigo-600'); 
        document.getElementById(`tab-${tab}`).classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
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

    compressBackgroundImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; 
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
                callback(canvas.toDataURL('image/jpeg', 0.8)); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

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

        try {
            const user = window.firebaseAuth.currentUser;
            if (!user) throw new Error("No professor is currently logged in.");

            import("https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js").then(async ({ EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword }) => {
                
                try {
                    const credential = EmailAuthProvider.credential(currEmail, currPass);
                    await reauthenticateWithCredential(user, credential);
                } catch(e) {
                    throw new Error("Invalid current email or password.");
                }

                if (newAvatar) localStorage.setItem('profAvatar', newAvatar);
                
                if (newEmail) await updateEmail(user, newEmail);
                if (newPass) {
                    if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");
                    await updatePassword(user, newPass);
                }
                
                const finalEmail = newEmail || currEmail;
                const uid = appStore.get('currentProfId') || user.uid;
                const finalName = newUsernameInput || appStore.get('profName') || finalEmail.split('@')[0];
                
                await window.firebaseSet(window.firebaseRef(window.firebaseDB, `professorsList/${uid}`), { 
                    email: finalEmail, 
                    name: finalName,
                    status: 'approved' 
                });

                appStore.set('profName', finalName);
                if (window.uiManager) window.uiManager.updateProfHUD();

                window.toast("Credentials updated successfully!", true);
                
                document.getElementById('current-prof-email').value = '';
                document.getElementById('current-prof-pass').value = '';
                document.getElementById('new-prof-user').value = '';
                document.getElementById('new-prof-email').value = '';
                document.getElementById('new-prof-pass').value = '';

            }).catch(err => {
                window.toast(`Update failed: ${err.message}`, false);
            });
        } catch (error) {
            window.toast(`Update failed: ${error.message}`, false);
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

    async manualRegisterStudent() {
        const name = document.getElementById('manual-student-name').value.trim();
        const cc = document.getElementById('manual-student-cc').value;
        const rawPhone = document.getElementById('manual-student-phone').value;
        const cleanPhone = String(rawPhone).replace(/\D/g, '');
        const pass = document.getElementById('manual-student-pass').value.trim();
        const selectedTeam = document.getElementById('manual-student-team').value;
        const avatarEl = document.getElementById('manual-student-avatar-preview');
        let avatar = avatarEl ? avatarEl.dataset.newavatar : null;

        if (!name || !cleanPhone || !pass) return window.toast("Name, Phone, and Password are required.", false);
        if (!/^\d{8,15}$/.test(cleanPhone)) return window.toast("Please enter a valid numeric phone number.", false);
        
        const phone = cc + cleanPhone;
        const shadowEmail = `${phone}_${Date.now()}@student.app.com`;
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        const finalTeam = selectedTeam === 'random' ? teams[0].id : selectedTeam;
        if (!avatar) avatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        
        try {
            import("https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js").then(async ({ initializeApp }) => {
                import("https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js").then(async ({ getAuth, createUserWithEmailAndPassword, signOut }) => {
                    const adminApp = initializeApp(window.firebaseDB.app.options, "AdminAppInstance");
                    const adminAuth = getAuth(adminApp);
                    
                    const userCredential = await createUserWithEmailAndPassword(adminAuth, shadowEmail, pass);
                    await signOut(adminAuth);

                    const studentData = { uid: userCredential.user.uid, name: name, avatar, team: finalTeam, shadowEmail, status: 'approved' }; 
                    await authManager.saveDB(studentData, `students/${phone}`);

                    window.toast(`Successfully registered ${name}!`, true);
                    
                    document.getElementById('manual-student-name').value = '';
                    document.getElementById('manual-student-phone').value = '';
                    document.getElementById('manual-student-pass').value = '';
                    
                    if(avatarEl) {
                        avatarEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                        delete avatarEl.dataset.newavatar;
                    }
                    
                    this.renderStudentManagement();
                });
            });
        } catch (error) { window.toast(`Registration failed: ${error.message}`, false); }
    },

    async giftItem(phone) {
        const giftSelect = document.getElementById(`gift-item-${phone}`);
        const item = giftSelect.value;
        if (!item) return window.toast("Please select an item to gift first.", false);
        
        const db = await authManager.getDB('students');
        const student = db[phone];
        
        if (!student) return window.toast("Student not found in database.", false);

        if (student.uid && window.firebaseRef && window.firebaseSet && window.firebaseDB && window.firebaseGet) {
            try {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${student.uid}`);
                const snapshot = await window.firebaseGet(userRef);
                
                if (snapshot.exists()) {
                    let globalData = snapshot.val();
                    if (item === 'coins_50') {
                        globalData.coins = (globalData.coins || 0) + 50;
                    } else {
                        globalData.inventory = globalData.inventory || {};
                        globalData.inventory[item] = (globalData.inventory[item] || 0) + 1;
                    }
                    await window.firebaseSet(userRef, globalData);
                    window.toast(`Gift sent directly to ${student.name}'s live account!`, true);
                    giftSelect.selectedIndex = 0; 
                } else {
                    window.toast("Student profile not fully generated. Have them log in first.", false);
                }
            } catch(e) {
                console.error("Gifting sync failed", e);
                window.toast("Failed to connect to Firebase for live gifting.", false);
            }
        } else {
            window.toast("Missing student UID for live gifting.", false);
        }
    },

    renderStudentManagement() {
        const dbPromise = authManager.getDB('students'); 
        const pendingContainer = document.getElementById('pending-approvals-list');
        const container = document.getElementById('student-management-list'); 
        
        dbPromise.then(database => {
            if(pendingContainer) pendingContainer.innerHTML = '';
            if(container) container.innerHTML = '';
            
            const teams = appStore.get('teams') || [];
            let pendingCount = 0;

            for(let phone in database) {
                const s = database[phone];
                
                if (s.status === 'pending') {
                    pendingCount++;
                    if(pendingContainer) {
                        pendingContainer.innerHTML += `
                        <div class="flex flex-col sm:flex-row items-center gap-4 p-4 border border-amber-200 dark:border-amber-500/30 rounded-xl bg-amber-50 dark:bg-amber-900/20 shadow-sm mb-3 transition-all">
                            <img src="${s.avatar}" class="w-12 h-12 rounded-full object-cover border border-amber-300">
                            <div class="flex-1">
                                <p class="font-bold text-slate-800 dark:text-slate-200">${s.name}</p>
                                <span class="text-xs font-mono text-slate-500">${phone}</span>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="adminUI.approveStudent('${phone}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Approve</button>
                                <button onclick="adminUI.deleteStudent('${phone}', true)" class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Deny</button>
                            </div>
                        </div>`;
                    }
                } else {
                    if(container) {
                        container.innerHTML += `
                        <div class="flex flex-col sm:flex-row items-start gap-4 p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-800/80 shadow-sm mb-3 transition-all">
                            
                            <div class="relative w-16 h-16 shrink-0 transition-transform hover:scale-105">
                                <img src="${s.avatar}" id="edit-img-${phone}" class="w-full h-full rounded-full object-cover border border-slate-300">
                                <input type="file" accept="image/*" onchange="adminUI.updateStudentAvatar(event, '${phone}')" class="absolute inset-0 opacity-0 cursor-pointer" title="Update Profile Photo">
                            </div>
                            
                            <div class="flex-1 w-full flex flex-col gap-1">
                                <div class="flex justify-between items-start">
                                    <p class="font-bold text-slate-800 dark:text-white text-lg">${s.name}</p>
                                    <span class="phone-badge text-xs font-mono px-2 py-1 rounded-md">${phone}</span>
                                </div>
                                
                                <div class="flex gap-4 mt-2">
                                    <div class="flex-1">
                                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">New Password</label>
                                        <input type="text" id="edit-pass-${phone}" placeholder="Reset Password..." class="border border-slate-300 dark:border-white/20 p-2 text-sm rounded-lg w-full bg-white dark:bg-black/30 text-slate-900 dark:text-white transition-colors">
                                    </div>
                                    <div class="flex-1">
                                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Assign Team</label>
                                        <select id="edit-team-${phone}" class="border border-slate-300 dark:border-white/20 p-2 text-sm rounded-lg w-full bg-white dark:bg-black/30 text-slate-900 dark:text-white transition-colors">
                                            ${teams.map(t => `<option value="${t.id}" ${s.team === t.id ? 'selected' : ''}>${this.getTeamDetails(t.id).name}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>

                                <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/10 w-full">
                                    <select id="gift-item-${phone}" class="flex-1 p-2 text-sm rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-200 focus:outline-none transition-colors">
                                        <option value="" disabled selected>Select a Gift...</option>
                                        <option value="extraLife">&#128305; Extra Life</option>
                                        <option value="freezeTime">&#10052; Time Freeze</option>
                                        <option value="timeBurn">&#128293; Time Burn</option>
                                        <option value="doubleCoins">&#129689; Double Coins</option>
                                        <option value="coins_50">&#128176; +50 Coins immediately</option>
                                    </select>
                                    <button onclick="adminUI.giftItem('${phone}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors w-full sm:w-auto">&#127873; Send Gift</button>
                                </div>
                            </div>
                            
                            <div class="flex flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                <button onclick="adminUI.saveStudentEdit('${phone}')" class="w-full bg-slate-800 hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">Save Edits</button>
                                <button onclick="adminUI.deleteStudent('${phone}', false)" class="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">Delete</button>
                            </div>
                        </div>`;
                    }
                }
            }
            
            const pWrap = document.getElementById('pending-approvals-wrapper');
            if(pWrap) pWrap.classList.toggle('hidden', pendingCount === 0);
        }).catch(e => console.warn("No student DB yet", e));
    },

    async approveStudent(phone) {
        const db = await authManager.getDB('students');
        if (db[phone]) {
            db[phone].status = 'approved';
            await authManager.saveDB(db, 'students');
            window.toast("Student approved!", true);
            this.renderStudentManagement();
        }
    },
    
    async deleteStudent(phone, isDenial = false) {
        if(!confirm(`Are you sure you want to ${isDenial ? 'deny' : 'completely delete'} this student?`)) return;
        
        try {
            const profId = appStore.get('currentProfId');
            if (window.firebaseRef && window.firebaseSet) {
                const dbRef = window.firebaseRef(window.firebaseDB, `professors/${profId}/students/${phone}`);
                await window.firebaseSet(dbRef, null);
            }
            
            const players = appStore.get('players') || {};
            const peerId = Object.keys(players).find(id => players[id].phone === phone);
            
            if (peerId) {
                delete players[peerId];
                appStore.set('players', players);
                this.updateLobbyList();
                this.updateTeamScores();
                
                const pin = appStore.get('roomCode');
                if (pin && window.firebaseRef && window.firebaseSet) {
                    const studentRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students/${phone}`);
                    await window.firebaseSet(studentRef, null);
                }
            }
            
            window.toast(`Student ${isDenial ? 'denied' : 'deleted'}.`, true);
            this.renderStudentManagement(); 
        } catch (err) { window.toast("Error modifying student.", false); }
    },
    
    async saveStudentEdit(oldPhone) {
        const db = await authManager.getDB('students'); 
        const newPass = document.getElementById(`edit-pass-${oldPhone}`).value.trim(); 
        const newTeam = document.getElementById(`edit-team-${oldPhone}`).value;
        const newAvatar = document.getElementById(`edit-img-${oldPhone}`).dataset.newavatar;
        
        const studentData = db[oldPhone];
        studentData.team = newTeam;
        if (newAvatar) studentData.avatar = newAvatar;
        if (newPass) studentData.pass = newPass;

        db[oldPhone] = studentData;
        authManager.saveDB(db, 'students'); 
        window.toast("Student account updated!", true);
        
        const players = appStore.get('players') || {};
        const peerId = Object.keys(players).find(id => players[id].phone === oldPhone);
        
        if (peerId) {
            players[peerId].team = newTeam;
            appStore.set('players', players);
            this.updateLobbyList();
            this.updateTeamScores();
            
            const pin = appStore.get('roomCode');
            if (pin) {
                const studentRef = window.firebaseRef(window.firebaseDB, `rooms/${pin}/students/${oldPhone}`);
                await window.firebaseSet(studentRef, players[peerId]);
            }
        }

        this.renderStudentManagement(); 
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

        sortedPlayers.forEach(p => { 
            const theme = this.getTeamDetails(p.team);
            const badgeColor = tailwindColors[theme.color]?.bg || 'bg-indigo-500';
            const score = p.scores?.total || 0;
            
            list.innerHTML += `
                <li class="flex items-center justify-between p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-white/10 mb-2 shadow-sm transition-all text-slate-800 dark:text-slate-100">
                    <div class="flex items-center gap-3">
                        <img src="${p.avatar}" class="w-10 h-10 rounded-full border-2 ${p.border || 'border-slate-300'} bg-white dark:bg-slate-700 object-cover">
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
        });
    },
    
    updateTeamScores() {
        const sb = document.getElementById('dynamic-team-scoreboard');
        if(!sb) return;
        let html = '';
        const teams = appStore.get('teams');
        const players = appStore.get('players');

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
    
    updateAnalytics() { if(!document.getElementById('admin-tab-analytics').classList.contains('hidden')) this.renderChart(); },
    
    renderChart() {
        const players = Object.values(appStore.get('players') || {}); 
        const l = document.getElementById('analytics-player-list'); 
        if(!l) return;
        l.innerHTML = '';
        
        players.sort((a,b)=>(b.scores?.total || 0) - (a.scores?.total || 0)).forEach(p => { 
            const theme = this.getTeamDetails(p.team);
            const bgClass = tailwindColors[theme.color]?.bg || 'bg-indigo-500';
            
            l.innerHTML += `
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
        });
        
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
            this.demoChartInstance = new window.Chart(dCtx, { type: 'doughnut', data: { labels: labels, datasets: [{ data: data, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'] }] }, options: { responsive: true } });
        }
    },
    
    handleBgUpload(e, imgId, destId) { 
        const f = e.target.files[0]; 
        if(f) { 
            const r = new FileReader(); 
            r.onload = ev => { 
                document.getElementById(imgId).src = ev.target.result; 
                if(destId) document.getElementById(destId).src = ev.target.result; 
            }; 
            r.readAsDataURL(f); 
        } 
    },
    
    setupDrawingBoard(cId) {
        const c = document.getElementById(cId); let isDraw=false, sX, sY, box;
        if(!c) return;
        c.onmousedown = (e) => { 
            isDraw=true; const r = c.getBoundingClientRect(); sX = e.clientX - r.left; sY = e.clientY - r.top; 
            if(box) box.remove(); box = document.createElement('div'); box.className='draw-box'; box.style.left=sX+'px'; box.style.top=sY+'px'; c.querySelector('div').appendChild(box); 
        };
    },
    
    addDrawnHotspot(modNum) {
        const cId = 'mod3-draw-container'; 
        const iId = 'mod3-prompt-input';
        const c = document.getElementById(cId); const i = document.getElementById(iId); if(!c || !c.dataset.box || !i.value) return;
        const target = JSON.parse(c.dataset.box); 
        if(modNum === 3) window.lessonData.hotspots.push({ prompt: i.value, target }); 
        if(modNum === 8) window.lessonData.wally.push({ prompt: i.value, target });
        i.value = ''; c.dataset.box = ''; const b = c.querySelector('.draw-box'); if(b) b.remove(); this.renderContentEditors();
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
        localStorage.setItem('profLessonData', JSON.stringify(window.lessonData));
        window.toast("Lesson data saved globally!", true);
    }
};