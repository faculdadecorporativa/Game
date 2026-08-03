// 🏗️ GameController.js
// This file handles the core game loop, scoring, and module logic using the appStore Vault.

import { appStore } from './store.js';
// 🏗️ ENTERPRISE CONFIG: This defines the order of your game modules.
// To make a new game later, you just change this list!
const GameConfig = [
    { type: 'study', getTarget: () => null }, // Module 1
    { type: 'dnd', getTarget: (idx) => window.lessonData.vocabulary[idx] }, // Module 2
    { type: 'hotspot', getTarget: (idx) => window.lessonData.hotspots[idx] }, // Module 3
    { type: 'memory', getTarget: () => null }, // Module 4
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

        // 🚀 ENTERPRISE FACTORY: Automatically load based on the Config
        const moduleConfig = GameConfig[modNum - 1]; // Arrays start at 0, so Module 1 is index 0
        
        if (moduleConfig) {
            const targetData = moduleConfig.getTarget(idx);
            
            // Map the config type to the correct UI rendering function
            const componentActions = {
                'study': () => { window.timerManager.stop(); window.uiManager.renderStudy(); },
                'dnd': () => window.uiManager.renderDnD(targetData),
                'hotspot': () => window.uiManager.renderHotspot(targetData),
                'memory': () => this.initMemory(),
                'audio': () => window.uiManager.renderAudio(targetData),
                'spelling': () => window.uiManager.renderSpelling(targetData),
                'hangman': () => this.initHangman(targetData),
                'wally': () => window.uiManager.renderWally(targetData),
                'readAloud': () => window.uiManager.renderReadAloud(targetData),
                'dictation': () => window.uiManager.renderDictation(targetData),
                'quiz': () => window.uiManager.renderQuiz(targetData)
            };

            // Execute the action if it exists
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
        
        if(points > 0) {
            window.sfx.play('correct');
            me.streak++; 
            if(window.timerManager.timeLeft >= 50) window.toast("Lightning Fast!", true);
            if(me.streak === 2) window.toast("Two in a row!", true);
            if(me.streak >= 3) window.toast("Unstoppable!", true);
            window.uiManager.showProfChat();
        } else {
            window.sfx.play('wrong');
            me.streak = 0;
        }
        
        me.scores.total += points; 
        me.scores[skill] += points; 
        appStore.set('me', me);
        window.uiManager.updateStudentHUD();

        const hostConn = appStore.get('hostConn');
        if(hostConn) hostConn.send({ type: 'SCORE_UPDATE', id: appStore.get('peer').id, points, skill });
        window.toast(msg + ` (${points > 0 ? '+'+points : points} pts)`, points > 0); window.uiManager.lockModule();
        // NEW: Auto-advance to the next module after 2 seconds
        setTimeout(() => {
            let currentMod = appStore.get('currentModule');
            if (currentMod < 11) {
                window.game.startModule(currentMod + 1, 0);
            }
        }, 2000);
    },

    // Action Handlers
    handleDnDMatch(isMatch) { if(isMatch) this.submitScore(3, "General", "Matched!"); else this.submitScore(-1, "General", "Missed!"); },
    handleHotspot(isHit) { if(isHit) this.submitScore(3, "General", "Found it!"); else this.submitScore(-1, "General", "Missed!"); },
    
    initMemory() {
        let cards = []; window.lessonData.vocabulary.forEach((v) => { cards.push({ id: v.term, type: 'term', content: v.term }); cards.push({ id: v.term, type: 'pair', content: v.matchImg || v.def, isImg: !!v.matchImg }); });
        
        let localGameData = appStore.get('localGameData');
        localGameData.memCards = shuffleArray(cards); 
        localGameData.memFlipped = []; 
        localGameData.memMatched = 0; 
        localGameData.memTotal = window.lessonData.vocabulary.length;
        
        appStore.set('localGameData', localGameData);
        window.uiManager.renderMemoryGrid(localGameData.memCards); 
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
                    let me = appStore.get('me');
                    me.scores.total += 3; me.scores.General += 3; appStore.set('me', me);
                    window.uiManager.updateStudentHUD(); window.sfx.play('correct');
                    
                    const hostConn = appStore.get('hostConn');
                    if(hostConn) hostConn.send({ type: 'SCORE_UPDATE', id: appStore.get('peer').id, points: 3, skill: "General" });
                    window.uiManager.showProfChat();
                }
                window.uiManager.markMemoryMatched(idx1, idx2); d.memFlipped = []; 
                appStore.set('localGameData', d);
                
                if (d.memMatched === d.memTotal) { 
                    if(appStore.get('role') !== 'host') { 
                        window.uiManager.lockModule(); 
                        window.timerManager.stop(); 
                        window.toast("Memory Cleared!", true); 
                        
                        // NEW: Auto-advance from Module 4 to Module 5
                        setTimeout(() => {
                            window.game.startModule(5, 0);
                        }, 2000);
                    }
                    else { window.toast("Host test: Memory Cleared!", true); }
                }
                else if (appStore.get('role') !== 'host') window.toast("Match! +3 Pts.", true);
            } else {
                if(appStore.get('role') !== 'host') {
                    window.timerManager.pause(); window.toast("Missed! -1 Pt.", false); window.sfx.play('wrong');
                    let me = appStore.get('me');
                    me.scores.total -= 1; me.scores.General -= 1; appStore.set('me', me);
                    window.uiManager.updateStudentHUD();
                    const hostConn = appStore.get('hostConn');
                    if(hostConn) hostConn.send({ type: 'SCORE_UPDATE', id: appStore.get('peer').id, points: -1, skill: "General" });
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