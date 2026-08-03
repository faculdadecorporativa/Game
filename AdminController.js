// 🏗️ AdminController.js
// This file handles all the pure business logic for the Professor Dashboard.

import { tailwindColors, animalThemes } from './data.js';
import { authManager } from './auth.js';
import { appStore } from './store.js';

export const adminUI = {
    chartInstance: null, demoChartInstance: null,
    
    init() { 
        this.renderContentEditors(); 
        this.setupDrawingBoard('mod3-draw-container'); 
        this.setupDrawingBoard('mod8-draw-container'); 
        this.renderTeams(); 
        this.renderStudentManagement(); 
        this.updateLobbyList();
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

    // MENTOR FIX: Advanced Canvas Image Compressor (Square crop + JPEG shrink)
    compressImageToSquare(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 150; // Tiny size to save database load
                
                // Calculate square crop from center
                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                const ctx = canvas.getContext('2d');
                
                // Draw cropped image onto canvas
                ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
                
                // Compress to 80% JPEG
                callback(canvas.toDataURL('image/jpeg', 0.8));
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
        const newUsernameInput = document.getElementById('new-prof-user');
        const newPasswordInput = document.getElementById('new-prof-pass');
        
        const newEmail = newUsernameInput ? newUsernameInput.value.trim() : '';
        const newPass = newPasswordInput ? newPasswordInput.value.trim() : '';

        if (!newEmail && !newPass) {
            return window.toast("Please enter a new username or password.", false);
        }

        try {
            const user = window.firebaseAuth.currentUser;
            if (!user) throw new Error("No professor is currently logged in.");

            // Use modular Firebase Auth functions stored on window or imported
            if (newEmail && window.updateEmail) {
                await window.updateEmail(user, newEmail);
            }
            if (newPass && window.updatePassword) {
                if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");
                await window.updatePassword(user, newPass);
            }

            const nameEl = document.getElementById('prof-hud-name');
            if (nameEl && newEmail) nameEl.innerText = newEmail;

            window.toast("Professor profile updated successfully!", true);
            if (newUsernameInput) newUsernameInput.value = '';
            if (newPasswordInput) newPasswordInput.value = '';

        } catch (error) {
            console.error("Credential update error:", error);
            window.toast(`Update failed: ${error.message}`, false);
        }
    },

    renderTeams() {
        const list = document.getElementById('admin-team-list');
        const manualTeamSelect = document.getElementById('manual-student-team');
        const teams = appStore.get('teams');
        
        // Update the main team management list
        if(list) {
            list.innerHTML = teams.map((t, i) => {
                const theme = animalThemes[t.id];
                return `
                <div class="flex justify-between items-center bg-white p-2 border rounded">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full ${tailwindColors[theme.color].bg}"></div>
                        <span class="font-bold">${theme.icon} ${theme.name}</span>
                    </div>
                    <button onclick="adminUI.deleteTeam(${i})" class="text-red-500 hover:bg-red-50 px-2 rounded font-bold">✕</button>
                </div>`;
            }).join('');
        }

        // MENTOR FIX: Sync the Add Student Manually dropdown with active teams
        if(manualTeamSelect) {
            manualTeamSelect.innerHTML = `<option value="random">🎲 Random Team</option>` + 
                teams.map(t => `<option value="${t.id}">${animalThemes[t.id].icon} ${animalThemes[t.id].name}</option>`).join('');
        }

        this.updateTeamScores(); 
    },
    
    addTeam() {
        const animalId = document.getElementById('new-team-animal').value;
        const teams = appStore.get('teams');
        if(!teams.find(t => t.id === animalId)) {
            const updatedTeams = [...teams, {id: animalId}];
            appStore.set('teams', updatedTeams);
            localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
            this.renderTeams(); this.renderStudentManagement();
        } else {
            window.toast("Team already exists!", false);
        }
    },
    
    deleteTeam(index) {
        const teams = appStore.get('teams');
        if(teams.length <= 1) return window.toast("You must have at least one team.", false);
        const updatedTeams = teams.filter((_, i) => i !== index);
        appStore.set('teams', updatedTeams);
        localStorage.setItem('gameTeams', JSON.stringify(updatedTeams));
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
        if (!/^\d{8,15}$/.test(cleanPhone)) return window.toast("Please enter a valid numeric phone number (8-15 digits).", false);
        
        const phone = cc + cleanPhone;
        const shadowEmail = `${phone}@student.app.com`;
        const teams = appStore.get('teams');
        
        // Handle explicit team choice or random assignment
        const finalTeam = selectedTeam === 'random' 
            ? teams[Math.floor(Math.random() * teams.length)].id 
            : selectedTeam;
        
        if (!avatar) {
            avatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        }

        try {
            import("https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js").then(async ({ initializeApp }) => {
                import("https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js").then(async ({ getAuth, createUserWithEmailAndPassword, signOut }) => {
                    
                    const adminApp = initializeApp(window.firebaseDB.app.options, "AdminAppInstance");
                    const adminAuth = getAuth(adminApp);
                    
                    const userCredential = await createUserWithEmailAndPassword(adminAuth, shadowEmail, pass);
                    await signOut(adminAuth);

                    const studentData = { uid: userCredential.user.uid, name: name, avatar, team: finalTeam }; 
                    await authManager.saveDB(studentData, `feedbackStudentsDb/${phone}`);

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
            
        } catch (error) {
            window.toast(`Registration failed: ${error.message}`, false);
        }
    },

    renderStudentManagement() {
        const db = authManager.getDB('feedbackStudentsDb'); 
        const container = document.getElementById('student-management-list'); 
        container.innerHTML = '';
        
        db.then(database => {
            const teams = appStore.get('teams');
            for(let phone in database) {
                const s = database[phone];
                
                container.innerHTML += `
                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 rounded bg-white shadow-sm">
                    <div class="relative w-16 h-16 shrink-0 transition-transform hover:scale-105">
                        <img src="${s.avatar}" id="edit-img-${phone}" class="w-full h-full rounded-full object-cover border border-slate-300">
                        <input type="file" accept="image/*" onchange="adminUI.updateStudentAvatar(event, '${phone}')" class="absolute inset-0 opacity-0 cursor-pointer" title="Update Profile Photo">
                    </div>
                    <div class="flex-1 w-full flex flex-col gap-1">
                        <div class="flex justify-between items-start">
                            <p class="font-bold text-slate-800 text-lg">${s.name}</p>
                            <span class="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">${phone}</span>
                        </div>
                        
                        <div class="flex gap-4 mt-2">
                            <div class="flex-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">New Password</label>
                                <input type="text" id="edit-pass-${phone}" placeholder="Reset Password..." class="border border-slate-300 p-2 text-sm rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="flex-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Assign Team</label>
                                <select id="edit-team-${phone}" class="border border-slate-300 p-2 text-sm rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
                                    ${teams.map(t => `<option value="${t.id}" ${s.team === t.id ? 'selected' : ''}>${animalThemes[t.id].icon} ${animalThemes[t.id].name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button onclick="adminUI.saveStudentEdit('${phone}')" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-md text-sm font-bold transition-colors mt-2 sm:mt-0 self-end">Save</button>
                </div>`;
            }
        });
    },
    
    async saveStudentEdit(oldPhone) {
        const db = await authManager.getDB('feedbackStudentsDb'); 
        const newPass = document.getElementById(`edit-pass-${oldPhone}`).value.trim(); 
        const newTeam = document.getElementById(`edit-team-${oldPhone}`).value;
        const newAvatar = document.getElementById(`edit-img-${oldPhone}`).dataset.newavatar;
        
        const studentData = db[oldPhone];
        studentData.team = newTeam;
        if (newAvatar) studentData.avatar = newAvatar;
        
        if (newPass) {
            studentData.pass = newPass; 
        }

        db[oldPhone] = studentData;
        
        authManager.saveDB(db, 'feedbackStudentsDb'); 
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
            const theme = animalThemes[p.team] || animalThemes['eagle'];
            const badgeColor = tailwindColors[theme.color].bg;
            const score = p.scores?.total || 0;
            
            list.innerHTML += `
                <li class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 mb-2 shadow-sm transition-all">
                    <div class="flex items-center gap-3">
                        <img src="${p.avatar}" class="w-10 h-10 rounded-full border-2 ${p.border || 'border-slate-300'} bg-slate-100 object-cover">
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-800 text-sm leading-tight">${p.name}</span>
                            <span class="text-[10px] font-bold text-slate-500 uppercase">${p.phone || 'Student'}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <span class="text-xs font-bold text-white px-2 py-1 rounded-full ${badgeColor}">${theme.icon} ${theme.name}</span>
                        <span class="text-xs font-black text-indigo-600 text-right w-full">${score} pts</span>
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
            const theme = animalThemes[t.id];
            const bgClass = tailwindColors[theme.color].bg;
            const txtClass = tailwindColors[theme.color].light;
            
            html += `
            <div class="bg-slate-800 rounded-xl p-4 flex items-center gap-3 border-2 border-slate-700 shadow-md">
                <div class="w-3 h-12 rounded-full ${bgClass}"></div>
                <div>
                    <p class="${txtClass} font-bold text-[10px] tracking-widest uppercase">${theme.icon} ${theme.name}</p>
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
            const theme = animalThemes[p.team] || animalThemes['eagle'];
            const bgClass = tailwindColors[theme.color].bg;
            l.innerHTML += `<div class="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full ${bgClass}"></div><span class="font-bold">${p.name}</span></div><div class="flex gap-3 text-xs"><span class="text-green-600">Spk: ${p.scores?.Speaking||0}</span><span class="text-blue-600">Wrt: ${p.scores?.Writing||0}</span><span class="text-purple-600">Lst: ${p.scores?.Listening||0}</span><span class="font-black text-indigo-800">Tot: ${p.scores?.total||0}</span></div></div>`; 
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
        c.onmousemove = (e) => { 
            if(!isDraw) return; const r = c.getBoundingClientRect(); const cX = Math.min(Math.max(0, e.clientX-r.left), r.width); const cY = Math.min(Math.max(0, e.clientY-r.top), r.height); 
            box.style.width=Math.abs(cX-sX)+'px'; box.style.height=Math.abs(cY-sY)+'px'; box.style.left=Math.min(sX,cX)+'px'; box.style.top=Math.min(sY,cY)+'px'; 
        };
        c.onmouseup = () => { 
            isDraw=false; const r = c.getBoundingClientRect(); 
            if(box) c.dataset.box = JSON.stringify({top: (parseFloat(box.style.top)/r.height)*100, left: (parseFloat(box.style.left)/r.width)*100, width: (parseFloat(box.style.width)/r.width)*100, height: (parseFloat(box.style.height)/r.height)*100}); 
        };
    },
    
    addDrawnHotspot(modNum) {
        const cId = modNum === 3 ? 'mod3-draw-container' : 'mod8-draw-container'; const iId = modNum === 3 ? 'mod3-prompt-input' : 'mod8-prompt-input';
        const c = document.getElementById(cId); const i = document.getElementById(iId); if(!c || !c.dataset.box || !i.value) return;
        const target = JSON.parse(c.dataset.box); 
        if(modNum === 3) window.lessonData.hotspots.push({ prompt: i.value, target }); 
        if(modNum === 8) window.lessonData.wally.push({ prompt: i.value, target });
        i.value = ''; c.dataset.box = ''; const b = c.querySelector('.draw-box'); if(b) b.remove(); this.renderContentEditors();
    },
    
    addItem(type) {
        if(type==='vocab') window.lessonData.vocabulary.push({term: "Term", def: "Def"}); 
        if(type==='audioGuess') window.lessonData.audioGuess.push({ desc: "New", options: ["1", "2", "3", "4"], answer: 0, skill: "Listening" }); 
        if(type==='spellingBee') window.lessonData.spellingBee.push({ word: "New", skill: "Writing" }); 
        if(type==='hangman') window.lessonData.hangman.push({ phrase: "NEW", skill: "General" }); 
        if(type==='readAloud') window.lessonData.readAloud.push({text: "Text", skill: "Speaking"}); 
        if(type==='dictation') window.lessonData.dictation.push({text: "Dict", skill: "Writing"}); 
        if(type==='quiz') window.lessonData.quiz.push({ q: "Q", options: ["1", "2", "3", "4"], answer: 0, skill: "General" }); 
        if(type==='chatPhrase') window.lessonData.chatPhrases.push("New Phrase!");
        this.renderContentEditors();
    },
    
    renderContentEditors() {
        const _r = (id, arr, htmlFunc) => { const c = document.getElementById(id); if(c) { c.innerHTML=''; arr.forEach((d,i)=> c.innerHTML += htmlFunc(d,i)); } };
        _r('admin-chat-list', window.lessonData.chatPhrases || [], (d,i) => `<div class="flex gap-1 pb-1"><input class="chat-phr text-xs p-1 flex-1 border rounded" data-idx="${i}" value="${d}"></div>`);
        _r('admin-vocab-list', window.lessonData.vocabulary || [], (d,i) => `<div class="flex gap-1 pb-1"><input class="v-term text-xs p-1 w-1/3 border rounded" data-idx="${i}" value="${d.term}"><input class="v-def text-xs p-1 flex-1 border rounded" data-idx="${i}" value="${d.def}"></div>`);
        _r('admin-audio-list', window.lessonData.audioGuess || [], (a, i) => `<div class="flex flex-col gap-1 pb-2 border-b"><textarea class="audio-desc p-1 border rounded text-xs h-10" data-idx="${i}">${a.desc}</textarea><div class="grid grid-cols-2 gap-1">${a.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="audio-ans-${i}" value="${oIdx}" ${a.answer === oIdx ? 'checked' : ''}><input type="text" class="audio-opt text-[10px] p-1 border rounded w-full" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>`);
        _r('admin-spelling-list', window.lessonData.spellingBee || [], (s, i) => `<input type="text" class="spell-word w-full p-1 border rounded text-xs mb-1" value="${s.word}" data-idx="${i}">`);
        _r('admin-hangman-list', window.lessonData.hangman || [], (h, i) => `<input type="text" class="hangman-phrase w-full p-1 border rounded text-xs mb-1 uppercase" value="${h.phrase}" data-idx="${i}">`);
        _r('admin-read-list', window.lessonData.readAloud || [], (d,i) => `<textarea class="ra-text w-full text-xs p-1 border rounded mb-1" data-idx="${i}">${d.text}</textarea>`);
        _r('admin-dict-list', window.lessonData.dictation || [], (d,i) => `<textarea class="dict-text w-full text-xs p-1 border rounded mb-1" data-idx="${i}">${d.text}</textarea>`);
        _r('admin-quiz-list', window.lessonData.quiz || [], (q, i) => `<div class="flex flex-col gap-1 pb-2 border-b"><input type="text" class="quiz-q p-1 border rounded text-xs" value="${q.q}" data-idx="${i}"><div class="grid grid-cols-2 gap-1">${q.options.map((opt, oIdx) => `<div class="flex items-center gap-1"><input type="radio" name="quiz-ans-${i}" value="${oIdx}" ${q.answer === oIdx ? 'checked' : ''}><input type="text" class="quiz-opt text-[10px] p-1 border rounded w-full" value="${opt}" data-qidx="${i}" data-oidx="${oIdx}"></div>`).join('')}</div></div>`);
        _r('admin-mod3-list', window.lessonData.hotspots || [], (h, i) => `<div class="bg-white p-1 px-2 border rounded text-xs">Target: ${h.prompt}</div>`);
        _r('admin-mod8-list', window.lessonData.wally || [], (w, i) => `<div class="bg-white p-1 px-2 border rounded text-xs">Target: ${w.prompt}</div>`);
    },
    
    saveContent() {
        if(!window.lessonData.chatPhrases) window.lessonData.chatPhrases = []; document.querySelectorAll('.chat-phr').forEach(i => window.lessonData.chatPhrases[i.dataset.idx] = i.value);
        document.querySelectorAll('.v-term').forEach(e => window.lessonData.vocabulary[e.dataset.idx].term = e.value); document.querySelectorAll('.v-def').forEach(e => window.lessonData.vocabulary[e.dataset.idx].def = e.value);
        document.querySelectorAll('.audio-desc').forEach(i => window.lessonData.audioGuess[i.dataset.idx].desc = i.value); document.querySelectorAll('.audio-opt').forEach(i => window.lessonData.audioGuess[i.dataset.qidx].options[i.dataset.oidx] = i.value); window.lessonData.audioGuess.forEach((a, idx) => { const s = document.querySelector(`input[name="audio-ans-${idx}"]:checked`); if(s) a.answer = parseInt(s.value); });
        document.querySelectorAll('.spell-word').forEach(e => window.lessonData.spellingBee[e.dataset.idx].word = e.value); document.querySelectorAll('.hangman-phrase').forEach(e => window.lessonData.hangman[e.dataset.idx].phrase = e.value.toUpperCase());
        document.querySelectorAll('.ra-text').forEach(e => window.lessonData.readAloud[e.dataset.idx].text = e.value); document.querySelectorAll('.dict-text').forEach(e => window.lessonData.dictation[e.dataset.idx].text = e.value);
        document.querySelectorAll('.quiz-q').forEach(i => window.lessonData.quiz[i.dataset.idx].q = i.value); document.querySelectorAll('.quiz-opt').forEach(i => window.lessonData.quiz[i.dataset.qidx].options[i.dataset.oidx] = i.value); window.lessonData.quiz.forEach((q, idx) => { const s = document.querySelector(`input[name="quiz-ans-${idx}"]:checked`); if(s) q.answer = parseInt(s.value); });
    }
};