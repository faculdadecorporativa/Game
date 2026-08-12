// 🏗️ store.js
// The Single Source of Truth for your application's data.

class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = {}; 
    }

    // 1. SUBSCRIBE: UI components call this to say "Tell me when X changes!"
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = []; 
        }
        this.listeners[key].push(callback);
    }

    // 2. GETTER: A safe way to read the current state
    get(key) {
        const val = this.state[key];
        // 🔥 FIX: Deep clone arrays/objects to prevent accidental mutation bugs across the app!
        return (val !== null && typeof val === 'object') ? structuredClone(val) : val;
    }

    // 3. SETTER (PUBLISHER): This changes the data AND shouts through the megaphone!
    set(key, newValue) {
        // 🔥 FIX: Store a pristine clone of the new data to prevent external corruption
        this.state[key] = (newValue !== null && typeof newValue === 'object') ? structuredClone(newValue) : newValue;
        
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                // Pass the pristine clone to the listeners
                callback(this.get(key));
            });
        }
    }
}

// 4. Initialize the global store with Multi-Tenancy Room support
export const appStore = new Store({
    role: null,             
    roomCode: '',           // The active 4-digit PIN
    isLiveViewOpen: false,
    
    // The current user's profile (Expanded for RPG integration)
    me: { 
        phone: '', 
        name: '', 
        avatar: '', 
        border: 'border-slate-300', 
        team: '', 
        scores: { total: 0, Speaking: 0, Writing: 0, Listening: 0, General: 0 }, 
        lifelines: { fiftyFifty: true, askProf: true, google: true, callFriend: true, freezeTime: true, timeBurn: true }, 
        streak: 0,
        maxStreak: 0,
        xp: 0,
        coins: 0,
        inventory: {},
        equipped: { title: 'Novice Learner', border: 'border-slate-300' }
    },
    
    players: {},            // Holds ONLY the students in the current PIN room
    currentModule: 0,       
    currentIndex: 0,
    
    // 🔥 FIX: Purged 'dnd' & 'wally'. Synced strictly to Phase 6 Module Architecture!
    queues: { study: 0, puzzle: 0, hotspot: 0, tictactoe: 0, audio: 0, spell: 0, hangman: 0, memory: 0, read: 0, dict: 0, quiz: 0 },
    countdownInterval: null,
    
    localGameData: { memMatched: 0, memFlipped: [], memTotal: 0, hmStrikes: 0, hmGuessed: [], hmPhrase: '' },
    
    countryCodes: JSON.parse(localStorage.getItem('countryCodes')) || [ {flag: '🇺🇸', code: '+1'}, {flag: '🇬🇧', code: '+44'}, {flag: '🇧🇷', code: '+55'}, {flag: '🇪🇸', code: '+34'}, {flag: '🇧🇴', code: '+591'} ],
    teams: JSON.parse(localStorage.getItem('gameTeams')) || [{id: 'dragon'}, {id: 'eagle'}]
});