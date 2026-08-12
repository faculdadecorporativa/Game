// 🏗️ LifelineController.js
// This file manages the game's lifeline logic (50/50, Ask Prof, Google, Call a Friend, Freeze Time, Time Burn)

import { appStore } from './store.js';

export const lifelineManager = {
    modalTimerInterval: null,
    
    renderButtons(mod) {
        const p = appStore.get('me');
        if (!p || !p.lifelines) return;

        // 🔥 FIX: Disabled 50/50 for Module 2 (PvP Puzzle) to prevent drag-and-drop legacy crash
        const fiftyFiftyBtn = document.getElementById('ll-fiftyFifty');
        if (fiftyFiftyBtn) fiftyFiftyBtn.disabled = !p.lifelines.fiftyFifty || [1, 2, 3, 4, 8, 9, 10].includes(mod);
        
        const askProfBtn = document.getElementById('ll-askProf');
        if (askProfBtn) askProfBtn.disabled = !p.lifelines.askProf;
        
        const googleBtn = document.getElementById('ll-google');
        if (googleBtn) googleBtn.disabled = !p.lifelines.google;
        
        const callFriendBtn = document.getElementById('ll-callFriend');
        if (callFriendBtn) callFriendBtn.disabled = !p.lifelines.callFriend;
    },
    
    use(type) {
        // 🔥 FIX: Use window.appStore to ensure safe data fetching and reactivity
        const p = appStore.get('me'); 
        if (!p) return;
        
        // --- Store Inventory Items (Consumables) ---
        if (['freezeTime', 'timeBurn'].includes(type)) {
            if (!p.inventory || !p.inventory[type] || p.inventory[type] <= 0) {
                if(window.toast) window.toast("You don't own this item! Visit the store.", false);
                if(window.sfx) window.sfx.play('wrong');
                return;
            }
            
            // Consume item locally
            p.inventory[type] -= 1;
            appStore.set('me', p);

            // Consume in Firebase
            if (window.firebaseRef && window.firebaseSet && window.firebaseDB && p.uid) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${p.uid}/inventory/${type}`);
                window.firebaseSet(userRef, p.inventory[type]);
            }

            // Update UI Locker immediately
            if (window.dashboardController) window.dashboardController.renderDashboard();

            // Execute Active Effects
            if (type === 'freezeTime') {
                if(window.timerManager) window.timerManager.pause();
                if(window.toast) window.toast("❄️ Time Frozen for 15 seconds!", true);
                if(window.sfx) window.sfx.play('correct');
                
                setTimeout(() => {
                    if(window.timerManager) window.timerManager.resume();
                    if(window.toast) window.toast("⏱️ Time is moving again!", false);
                }, 15000);
            }
            
            if (type === 'timeBurn') {
                const hostConn = appStore.get('hostConn');
                if(hostConn && hostConn.send) {
                    hostConn.send({ type: 'TIME_BURN', id: p.uid });
                }
                if(window.toast) window.toast("🔥 Burned opponents' time!", true);
                if(window.sfx) window.sfx.play('correct');
            }
            
            return; 
        }

        // --- Original Classic Lifeline Logic ---
        if(!p.lifelines[type]) return; 
        
        // Mark as used
        p.lifelines[type] = false; 
        appStore.set('me', p);
        
        this.renderButtons(appStore.get('currentModule'));
        
        if(type === 'fiftyFifty') this.execute5050();
        if(type === 'askProf') this.showModal("Ask the Professor", "Ask your Professor for a hint!");
        if(type === 'google') this.showModal("30 Seconds on Google", "You have 30 seconds to search the web in another tab!", 30);
        if(type === 'callFriend') this.showModal("Call a Friend", "You have 1 minute to consult a friend!", 60);
    },
    
    execute5050() {
        const mod = appStore.get('currentModule');
        
        if (mod === 5 || mod === 11) {
            // Audio (5) or Quiz (11)
            const cId = mod === 5 ? 'audio-options-container' : 'quiz-options-container'; 
            const container = document.getElementById(cId);
            if (!container) return;
            
            const options = Array.from(container.children);
            const ans = container.dataset.answer; 
            
            if (ans === undefined) return;
            
            const wrongOptions = window.shuffleArray(options.filter((_, idx) => idx != ans));
            for(let i=0; i<Math.ceil(wrongOptions.length/2); i++) { 
                wrongOptions[i].disabled = true; 
                // 🔥 UI Polish: Make dead buttons look completely disabled
                wrongOptions[i].classList.add('opacity-30', 'cursor-not-allowed', 'scale-95', 'grayscale'); 
                wrongOptions[i].classList.remove('hover:-translate-y-1', 'hover:border-indigo-500');
            }
            
        } else if (mod === 6) {
            // Spelling Bee (6)
            const input = document.getElementById('spelling-input');
            if (!input || !input.dataset.target) return;
            
            const word = input.dataset.target; 
            let nonSpace = [];
            for(let i=0; i<word.length; i++) { if(word[i] !== ' ') nonSpace.push(i); }
            
            let reveal = window.shuffleArray([...nonSpace]).slice(0, Math.floor(nonSpace.length / 2)); 
            let result = "";
            for(let i=0; i<word.length; i++) { 
                if(word[i] === ' ') result += ' '; 
                else if(reveal.includes(i)) result += word[i]; 
                else result += '_'; 
            }
            input.value = result;
            
        } else if (mod === 7) {
            // Hangman (7)
            const d = appStore.get('localGameData');
            if (!d || !d.hmPhrase) return;
            
            const phrase = d.hmPhrase; 
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const wrongLetters = alphabet.filter(l => !phrase.includes(l) && !d.hmGuessed.includes(l));
            const disable = window.shuffleArray(wrongLetters).slice(0, Math.floor(wrongLetters.length / 2));
            
            disable.forEach(l => { 
                const btn = document.getElementById(`hm-btn-${l}`); 
                if(btn) { 
                    btn.disabled = true; 
                    btn.classList.add('opacity-30', 'cursor-not-allowed', 'grayscale'); 
                    btn.classList.remove('hover:bg-indigo-500', 'hover:-translate-y-1');
                } 
            });
        }
    },
    
    showModal(title, desc, duration = 0) {
        if(window.timerManager) window.timerManager.pause(); 
        
        document.getElementById('modal-title').innerText = title; 
        document.getElementById('modal-desc').innerText = desc;
        const timerEl = document.getElementById('modal-timer');
        
        if(duration > 0) {
            timerEl.classList.remove('hidden'); 
            timerEl.innerText = duration; 
            clearInterval(this.modalTimerInterval);
            this.modalTimerInterval = setInterval(() => { 
                duration--; 
                timerEl.innerText = duration; 
                if(duration <= 0) { 
                    clearInterval(this.modalTimerInterval); 
                    timerEl.innerText = "Time's up!"; 
                } 
            }, 1000);
        } else { 
            timerEl.classList.add('hidden'); 
        }
        
        const modal = document.getElementById('modal-lifeline');
        if (modal) modal.classList.remove('hidden');
    },
    
    closeModal() { 
        clearInterval(this.modalTimerInterval); 
        const modal = document.getElementById('modal-lifeline');
        if (modal) modal.classList.add('hidden'); 
        if(window.timerManager) window.timerManager.resume(); 
    }
};