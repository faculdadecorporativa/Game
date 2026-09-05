// 🏗️ LifelineController.js
// This file manages the game's lifeline logic (50/50, Ask Prof, Google, Call a Friend, Freeze Time, Time Burn)

import { appStore } from './store.js';

// 🔥 DUPLICATION NOTE: this is the third copy of essentially the same
// "persist specific `players` fields to PocketBase, using me.playerId,
// with error handling" helper — GameController.js and ShopController.js
// each need their own version too. Worth extracting into one shared
// module (e.g. a `playerSync.js`) that all three import, rather than
// maintaining three near-identical copies. Kept local here so this file
// stays self-contained for this review batch.
async function persistPlayerFields(me, fields) {
    if (!window.pb) {
        console.error("PocketBase client (window.pb) not found — lifeline/inventory change not persisted.");
        return;
    }
    if (!me?.playerId) {
        console.warn("No playerId on `me` — skipping remote sync (host test session?).");
        return;
    }
    try {
        await window.pb.collection('players').update(me.playerId, fields);
    } catch (err) {
        console.error("Failed to persist lifeline/inventory change:", err);
        if (window.toast) window.toast("⚠️ That may not have saved — check your connection.", false);
    }
}

// 🔥 FIX: `execute5050()` called `window.shuffleArray(...)` in three
// places, but no file reviewed so far in this series ever assigns
// `window.shuffleArray` — GameController.js defines its own `shuffleArray`
// as a plain, non-exported, module-local const. If nothing else binds it
// to `window` (worth double-checking your bootstrap file), 50/50 on
// Audio, Quiz, Spelling, and Hangman would throw `TypeError:
// window.shuffleArray is not a function` every time it's used — silently
// breaking the entire lifeline for all 4 module types it supports.
// Self-contained local copy removes the dependency either way, and uses
// a proper Fisher–Yates instead of the biased `sort(() => Math.random() -
// 0.5)` pattern fixed elsewhere in this codebase.
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export const lifelineManager = {
    modalTimerInterval: null,
    
    renderButtons(mod) {
        const p = appStore.get('me');
        if (!p || !p.lifelines) return;

        // 🔥 COMMENT FIX: the old comment ("Disabled 50/50 for Module 2...")
        // undersold what this line actually does — it disables 50/50 on
        // every module where execute5050() below has no applicable effect
        // (flashcards, drag-puzzle, hotspot, tic-tac-toe, memory, read
        // aloud, dictation), leaving it enabled only where it does
        // something (Audio, Spelling, Hangman, Quiz — 5/6/7/11). The logic
        // itself was already correct; only the comment was stale/misleading.
        const fiftyFiftyBtn = document.getElementById('ll-fiftyFifty');
        if (fiftyFiftyBtn) fiftyFiftyBtn.disabled = !p.lifelines.fiftyFifty || [1, 2, 3, 4, 8, 9, 10].includes(mod);
        
        const askProfBtn = document.getElementById('ll-askProf');
        if (askProfBtn) askProfBtn.disabled = !p.lifelines.askProf;
        
        const googleBtn = document.getElementById('ll-google');
        if (googleBtn) googleBtn.disabled = !p.lifelines.google;
        
        const callFriendBtn = document.getElementById('ll-callFriend');
        if (callFriendBtn) callFriendBtn.disabled = !p.lifelines.callFriend;
    },
    
    async use(type) {
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

            // 🔥 FIX: was a Firebase partial-path write
            // (`users/${uid}/inventory/${type}`) with no error handling at
            // all — a network failure would silently decrement the local
            // copy while the item secretly never left inventory server-side.
            // PocketBase JSON fields need the whole field, not a nested
            // path, so this sends the full `inventory` object.
            await persistPlayerFields(p, { inventory: p.inventory });

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
                // 🔥 FIX (dead code + false advertising): `appStore.get('hostConn')`
                // is the exact same leftover peer-to-peer (WebRTC/PeerJS)
                // reference removed from GameController.js in an earlier
                // batch — `hostConn` is never set anywhere in store.js, so
                // this send() call has ALWAYS been a silent no-op. Worse,
                // the toast/sfx below fired unconditionally regardless,
                // telling the player their consumable worked when it did
                // nothing. This item's actual multiplayer effect (hitting
                // an opponent's timer) isn't implemented anywhere in the
                // files reviewed so far — it needs real design: most likely
                // a field on the target's `players` record or the room's
                // `gameState` that the target's client watches via the
                // existing PocketBase realtime subscription (see
                // network.js's listenToRoom). Flagging this clearly rather
                // than persisting the illusion that it works — players can
                // currently spend 120 coins on an item with zero effect.
                console.warn("Time Burn consumed, but no real multiplayer effect is wired up yet — see the code comment here.");
                if(window.toast) window.toast("🔥 Time Burn used! (Note: opponent-timer effect isn't implemented yet.)", true);
                if(window.sfx) window.sfx.play('correct');
            }
            
            return; 
        }

        // --- Original Classic Lifeline Logic ---
        if(!p.lifelines[type]) return; 
        
        // Mark as used
        p.lifelines[type] = false; 
        appStore.set('me', p);

        // 🔥 FIX: classic lifeline usage (50/50, Ask Prof, Google, Call a
        // Friend) was NEVER persisted anywhere — not even via the old
        // Firebase calls. It only ever updated local appStore state. That
        // meant a page refresh silently restored every "used" lifeline
        // back to available, letting a student re-use them indefinitely
        // just by reloading. Persisting this closes that gap.
        await persistPlayerFields(p, { lifelines: p.lifelines });
        
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
            
            const wrongOptions = shuffleArray(options.filter((_, idx) => idx != ans));
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
            
            let reveal = shuffleArray([...nonSpace]).slice(0, Math.floor(nonSpace.length / 2)); 
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
            const disable = shuffleArray(wrongLetters).slice(0, Math.floor(wrongLetters.length / 2));
            
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
        
        // 🔥 FIX: none of these three lookups were null-checked — a
        // missing modal element would throw and, worse, would leave the
        // timer paused above with no matching resume() ever firing.
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.innerText = title;
        const descEl = document.getElementById('modal-desc');
        if (descEl) descEl.innerText = desc;
        const timerEl = document.getElementById('modal-timer');
        
        if (timerEl) {
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