// 🏗️ LifelineController.js
// This file manages the game's lifeline logic (50/50, Ask Prof, Google, Call a Friend)

export const lifelineManager = {
    modalTimerInterval: null,
    
    renderButtons(mod) {
        const p = window.appState.me;
        document.getElementById('ll-fiftyFifty').disabled = !p.lifelines.fiftyFifty || [1,3,4,8,9,10].includes(mod);
        document.getElementById('ll-askProf').disabled = !p.lifelines.askProf;
        document.getElementById('ll-google').disabled = !p.lifelines.google;
        document.getElementById('ll-callFriend').disabled = !p.lifelines.callFriend;
    },
    
    use(type) {
        const p = window.appState.me; 
        if(!p.lifelines[type]) return; 
        p.lifelines[type] = false; 
        this.renderButtons(window.appState.currentModule);
        
        if(type === 'fiftyFifty') this.execute5050();
        if(type === 'askProf') this.showModal("Ask the Professor", "Ask your Professor for a hint!");
        if(type === 'google') this.showModal("30 Seconds on Google", "You have 30 seconds to search the web in another tab!", 30);
        if(type === 'callFriend') this.showModal("Call a Friend", "You have 1 minute to consult a friend!", 60);
    },
    
    execute5050() {
        const mod = window.appState.currentModule;
        if (mod === 2) {
            const allDrags = Array.from(document.querySelectorAll('.draggable')); 
            const targetId = document.getElementById('dropzone').dataset.target;
            const wrongDrags = window.shuffleArray(allDrags.filter(d => d.dataset.id !== targetId)); 
            for(let i=0; i<Math.ceil(wrongDrags.length/2); i++) wrongDrags[i].style.display = 'none';
        } else if (mod === 5 || mod === 11) {
            const cId = mod === 5 ? 'audio-options-container' : 'quiz-options-container'; 
            const options = Array.from(document.getElementById(cId).children);
            const ans = document.getElementById(cId).dataset.answer; 
            const wrongOptions = window.shuffleArray(options.filter((_, idx) => idx != ans));
            for(let i=0; i<Math.ceil(wrongOptions.length/2); i++) { 
                wrongOptions[i].disabled = true; 
                wrongOptions[i].classList.add('opacity-30'); 
            }
        } else if (mod === 6) {
            const word = document.getElementById('spelling-input').dataset.target; 
            let nonSpace = [];
            for(let i=0; i<word.length; i++) { if(word[i] !== ' ') nonSpace.push(i); }
            let reveal = window.shuffleArray([...nonSpace]).slice(0, Math.floor(nonSpace.length / 2)); 
            let result = "";
            for(let i=0; i<word.length; i++) { 
                if(word[i] === ' ') result += ' '; 
                else if(reveal.includes(i)) result += word[i]; 
                else result += '_'; 
            }
            document.getElementById('spelling-input').value = result;
        } else if (mod === 7) {
            const phrase = window.appState.localGameData.hmPhrase; 
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const wrongLetters = alphabet.filter(l => !phrase.includes(l) && !window.appState.localGameData.hmGuessed.includes(l));
            const disable = window.shuffleArray(wrongLetters).slice(0, Math.floor(wrongLetters.length / 2));
            disable.forEach(l => { 
                const btn = document.getElementById(`hm-btn-${l}`); 
                if(btn) { btn.disabled = true; btn.classList.add('opacity-30'); } 
            });
        }
    },
    
    showModal(title, desc, duration = 0) {
        window.timerManager.pause(); 
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
        
        // Target the actual lifeline modal ID
        document.getElementById('modal-lifeline').classList.remove('hidden');
    },
    
    closeModal() { 
        clearInterval(this.modalTimerInterval); 
        document.getElementById('modal-lifeline').classList.add('hidden'); 
        window.timerManager.resume(); 
    }
};