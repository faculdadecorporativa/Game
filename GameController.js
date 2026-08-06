// 🏗️ GameController.js
// This file handles the core game loop, scoring, and module logic using the appStore Vault.

import { appStore } from './store.js';

// 🏗️ ENTERPRISE CONFIG: This defines the order of your game modules.
const GameConfig = [
    { type: 'study', getTarget: () => null }, // Module 1
    { type: 'dnd', getTarget: (idx) => window.lessonData.vocabulary[idx] }, // Module 2
    { type: 'hotspot', getTarget: (idx) => window.lessonData.hotspots[idx] }, // Module 3
    // 🔥 FIX: Explicitly target the memoryMatch array directly from the synced lesson data!
    { type: 'memory', getTarget: () => window.lessonData.memoryMatch }, // Module 4
    { type: 'audio', getTarget: (idx) => window.lessonData.audioGuess[idx] }, // Module 5
    { type: 'spelling', getTarget: (idx) => window.lessonData.spellingBee[idx] }, // Module 6
    { type: 'hangman', getTarget: (idx) => window.lessonData.hangman[idx] }, // Module 7
    { type: 'wally', getTarget: (idx) => window.lessonData.wally[idx] }, // Module 8
    { type: 'readAloud', getTarget: (idx) => window.lessonData.readAloud[idx] }, // Module 9
    { type: 'dictation', getTarget: (idx) => window.lessonData.dictation[idx] }, // Module 10
    { type: 'quiz', getTarget: (idx) => window.lessonData.quiz[idx] } // Module 11
];

const cleanString = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

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
        
        document.getElementById('scoreboard-container').classList.remove('hidden');
        document.getElementById('wait-overlay').classList.add('hidden'); 
        window.uiManager.unlockModule();
        
        const panel = document.getElementById('lifelines-panel'); panel.classList.remove('hidden');
        const mount = document.getElementById(`lifeline-mount-${modNum}`); 
        if (mount) { 
            mount.appendChild(panel); 
            window.lifelineManager.renderButtons(modNum); 
        } else { 
            panel.classList.add('hidden'); 
        }
        
        appStore.set('currentModule', modNum);
        this.startTimer(60);

        const moduleConfig = GameConfig[modNum - 1]; 
        
        if (moduleConfig) {
            const targetData = moduleConfig.getTarget(idx);
            
            const componentActions = {
                'study': () => { window.timerManager.stop(); window.uiManager.renderStudy(); },
                'dnd': () => window.uiManager.renderDnD(targetData),
                'hotspot': () => window.uiManager.renderHotspot(targetData),
                // 🔥 FIX: Pass the targeted data dynamically into the init engine
                'memory': () => this.initMemory(targetData),
                'audio': () => window.uiManager.renderAudio(targetData),
                'spelling': () => window.uiManager.renderSpelling(targetData),
                'hangman': () => this.initHangman(targetData),
                'wally': () => window.uiManager.renderWally(targetData),
                'readAloud': () => window.uiManager.renderReadAloud(targetData),
                'dictation': () => window.uiManager.renderDictation(targetData),
                'quiz': () => window.uiManager.renderQuiz(targetData)
            };

            if (componentActions[moduleConfig.type]) {
                componentActions[moduleConfig.type]();
            }
        }
    },
    
    startTimer(sec) { window.timerManager.start(); },
    
    submitScore(points, skill, msg) {
        if(appStore.get('role') === 'host') { window.toast("Host test: " + msg, points > 0); window.uiManager.lockModule(); return; }

        window.timerManager.stop();
        let me = appStore.get('me');
        
        // 🚀 GAMIFICATION ENGINE: Safely initialize schema properties if new
        me.xp = me.xp || 0;
        me.coins = me.coins || 0;
        me.streak = me.streak || 0;
        if (!me.scores) me.scores = { total: 0, General: 0, Listening: 0, Speaking: 0, Writing: 0 };
        if (typeof me.scores[skill] === 'undefined') me.scores[skill] = 0;

        // 🔥 EXTRA LIFE CHECK 🔥
        if (points < 0 && me.inventory && me.inventory.extraLife > 0) {
            // Consume Extra Life locally
            me.inventory.extraLife -= 1;
            appStore.set('me', me);
            
            // Sync to Firebase directly
            if (window.firebaseRef && window.firebaseSet && window.firebaseDB) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}/inventory/extraLife`);
                window.firebaseSet(userRef, me.inventory.extraLife);
            }

            // Prevent penalty
            points = 0;
            msg = "🛡️ Saved by Extra Life!";
            window.toast(msg, true);
            window.sfx.play('correct'); 
            
            // Re-render dashboard locker silently in background
            if (window.dashboardController) window.dashboardController.renderDashboard();
        } 
        // 🚀 GAMIFICATION ENGINE: Rewards & Economy Calculation
        else if(points > 0) {
            window.sfx.play('correct');
            me.streak++; 
            
            // Base Economy Math
            let earnedXP = points * 10;
            let earnedCoins = points * 5;

            // Engagement / Streak Multipliers
            if(window.timerManager.timeLeft >= 50) {
                window.toast("Lightning Fast! +15 XP", true);
                earnedXP += 15;
            }
            if(me.streak === 2) {
                window.toast("Two in a row! 🔥", true);
                earnedXP += 20;
            }
            if(me.streak >= 3) {
                window.toast(`Unstoppable! ${me.streak} Streak! 🪙`, true);
                earnedXP += 50;
                earnedCoins += 10; // Bonus economy for high engagement
            }

            // 🔥 DOUBLE COINS LOGIC 🔥
            if (me.inventory && me.inventory.doubleCoins > 0) {
                // Apply the multiplier and decrement the item
                earnedCoins *= 2;
                me.inventory.doubleCoins -= 1;
                window.toast("🪙 Double Coins Active! Earnings Multiplied!", true);
                
                // Sync doubleCoins inventory decrement directly to Firebase
                if (window.firebaseRef && window.firebaseSet && window.firebaseDB && me.uid) {
                    const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}/inventory/doubleCoins`);
                    window.firebaseSet(userRef, me.inventory.doubleCoins);
                }
                
                // Refresh dashboard to visually update the inventory locker count
                if (window.dashboardController) window.dashboardController.renderDashboard();
            }

            // Award to profile
            me.xp += earnedXP;
            me.coins += earnedCoins;
            window.uiManager.showProfChat();
        } else {
            window.sfx.play('wrong');
            me.streak = 0; // Break streak
        }
        
        // Granular Performance Tracking
        me.scores.total += points; 
        me.scores[skill] += points; 
        appStore.set('me', me);
        
        // 🚀 GAMIFICATION ENGINE: Persist Everything to Firebase
        if (window.firebaseRef && window.firebaseSet && window.firebaseDB && me.uid) {
            const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}`);
            // Pushing the whole 'me' object securely updates scores, streak, xp, and coins in one go!
            window.firebaseSet(userRef, me);
        }

        window.uiManager.updateStudentHUD();

        const hostConn = appStore.get('hostConn');
        if(hostConn) hostConn.send({ type: 'SCORE_UPDATE', id: appStore.get('peer').id, points, skill });
        window.toast(msg + ` (${points > 0 ? '+'+points : points} pts)`, points > 0 || msg.includes("Extra Life")); 
        window.uiManager.lockModule();
        
        setTimeout(() => {
            let currentMod = appStore.get('currentModule');
            if (currentMod < 11) {
                window.game.startModule(currentMod + 1, 0);
            }
        }, 2000);
    },

    handleDnDMatch(isMatch) { if(isMatch) this.submitScore(3, "General", "Matched!"); else this.submitScore(-1, "General", "Missed!"); },
    handleHotspot(isHit) { if(isHit) this.submitScore(3, "General", "Found it!"); else this.submitScore(-1, "General", "Missed!"); },
    
    // 🔥 ENGINE UPGRADE: Injects the synced data directly, bypassing local null states 🔥
    initMemory(targetData) {
        let cards = []; 
        let memData = targetData || window.lessonData?.memoryMatch || [];
        const memType = window.lessonData?.memoryMatchType || 'text-text';

        // 🔥 CRITICAL FIX: If Professor data didn't sync correctly to the student, force fallback data so the screen is never blank!
        if (!memData || memData.length === 0) {
            console.warn("Memory Match data missing or empty! Loading default fallbacks to prevent crash.");
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

            // Dynamically build image tags based on the selected mode with graceful fallbacks
            if (memType === 'image-text') {
                termContent = v.termImg ? `<img src="${v.termImg}" alt="Card Image" class="w-full h-full object-cover rounded-lg">` : (v.term || "No Image");
                matchContent = v.match || "No Text";
            } else if (memType === 'image-image') {
                termContent = v.termImg ? `<img src="${v.termImg}" alt="Card Image 1" class="w-full h-full object-cover rounded-lg">` : (v.term || "No Image");
                matchContent = v.matchImg ? `<img src="${v.matchImg}" alt="Card Image 2" class="w-full h-full object-cover rounded-lg">` : (v.match || "No Image");
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
        
        // Slight delay ensures the DOM is un-hidden before rendering the cards
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
                    // Force the score via submitScore to trigger economy logic
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
                        
                        setTimeout(() => {
                            window.game.startModule(5, 0);
                        }, 2000);
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
    
    handleAudioAns(isCorrect, btn) { if(isCorrect) { btn.classList.add('bg-green-200'); this.submitScore(3, "Listening", "Correct!"); } else { btn.classList.add('bg-red-200'); this.submitScore(-1, "Listening", "Missed!"); } },
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
            document.getElementById(`hm-btn-${letter}`).classList.replace('bg-white', 'bg-green-200'); window.uiManager.updateHangmanWord();
            const isWin = d.hmPhrase.split('').every(char => char === ' ' || d.hmGuessed.includes(char));
            if (isWin) this.submitScore(3, "General", "Phrase Solved!");
        } else {
            document.getElementById(`hm-btn-${letter}`).classList.replace('bg-white', 'bg-red-200'); d.hmStrikes++; window.uiManager.updateHangmanArt();
            if (d.hmStrikes >= 6) this.submitScore(-1, "General", `Hanged! Phrase: ${d.hmPhrase}`);
        }
        appStore.set('localGameData', d);
    },

    handleWallyClick(isHit) { if(isHit) this.submitScore(3, "General", "Found Wally!"); else this.submitScore(-1, "General", "Missed!"); },
    
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
        
        btn.classList.replace('bg-red-500', 'bg-slate-800');
        btn.classList.replace('hover:bg-red-600', 'hover:bg-slate-900');
        btn.classList.replace('rounded-full', 'rounded-xl');
        icon.innerText = "⏹️";
        text.innerText = "Stop Recording";
        if(status) {
            status.innerHTML = '<span class="text-green-500 animate-pulse">🟢 Listening...</span>';
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
                    span.classList.add('text-green-600', 'font-bold');
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
                        status.innerHTML = '<span class="text-orange-500">⚠️ Your voice is too low! Please speak up.</span>';
                        status.dataset.state = 'low';
                    } else if (!isLow && status.dataset.state !== 'listening') {
                        status.innerHTML = '<span class="text-green-500 animate-pulse">🟢 Listening...</span>';
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
                status.innerHTML = '<span class="text-red-600 font-bold">❌ Microphone blocked. Please allow browser permissions!</span>';
                status.dataset.state = 'error';
            }
            window.toast("Microphone access denied. Please click the mic icon in your URL bar to allow access.", false);
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

        btn.classList.replace('bg-slate-800', 'bg-red-500');
        btn.classList.replace('hover:bg-slate-900', 'hover:bg-red-600');
        btn.classList.replace('rounded-xl', 'rounded-full');
        icon.innerText = "🎙️";
        text.innerText = "Start Recording";
        
        if (cancel) return; 

        btn.style.pointerEvents = 'none'; 
        if(status) {
            status.innerHTML = '<span class="text-blue-500 animate-pulse">⏳ Processing audio...</span>';
            status.dataset.state = 'processing';
        }

        setTimeout(() => {
            this.evalReadAloud();
            if(status) {
                status.innerHTML = '<span class="text-slate-400">🎤 Ready to record</span>';
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
            if (span.classList.contains('text-green-600')) {
                matches++;
            } else {
                span.classList.add('text-red-600', 'line-through', 'font-bold');
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
                htmlOut += `<span class="text-green-600 font-bold mx-1">${vWord}</span>`;
            } else if (cleanString(vWord) === cleanString(tWord) && cleanString(vWord) !== "") {
                htmlOut += `<span class="text-yellow-500 font-bold mx-1 underline" title="Target: ${tWord}">${vWord}</span>`;
            } else {
                htmlOut += `<span class="text-red-600 font-bold mx-1 line-through" title="Target: ${tWord}">${vWord || '?'}</span>`;
            }
        });
        
        if (valWords.length > targetWords.length) {
            for(let i = targetWords.length; i < valWords.length; i++) {
                htmlOut += `<span class="text-red-600 font-bold mx-1 line-through" title="Extra word">${valWords[i]}</span>`;
            }
        }

        const feedbackEl = document.getElementById('dict-feedback');
        feedbackEl.innerHTML = `
            <div class="bg-slate-100 p-4 rounded-lg mt-4 text-left border border-slate-300">
                <p class="text-sm text-slate-500 mb-2 uppercase tracking-widest font-bold">Feedback Analysis:</p>
                <div class="text-xl leading-relaxed">${htmlOut}</div>
                <p class="text-sm text-slate-600 mt-3 font-medium">Target: <b>${target}</b></p>
            </div>`;
        feedbackEl.classList.remove('opacity-0');

        if(isPerfect) this.submitScore(3, "Writing", "Perfect dictation!"); 
        else this.submitScore(-1, "Writing", "Errors detected in dictation."); 
    },

    handleQuizAns(isCorrect, btn) { if(isCorrect) { btn.classList.add('bg-green-200'); this.submitScore(3, "General", "Correct!"); } else { btn.classList.add('bg-red-200'); this.submitScore(-1, "General", "Missed!"); } }
};