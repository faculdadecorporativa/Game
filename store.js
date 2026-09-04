// 🏗️ store.js
// The Single Source of Truth for your application's data.

class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = {}; 
    }

    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = []; 
        }
        this.listeners[key].push(callback);
    }

    get(key) {
        const val = this.state[key];
        return (val !== null && typeof val === 'object') ? structuredClone(val) : val;
    }

    set(key, newValue) {
        this.state[key] = (newValue !== null && typeof newValue === 'object') ? structuredClone(newValue) : newValue;
        
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                callback(this.get(key));
            });
        }
    }
}

// Export the ultimate fallback avatar for new users
export const DEFAULT_AVATAR = './public/avatars/king-david.png';

// 4. Initialize the global store with Multi-Tenancy Room support
export const appStore = new Store({
    role: null,             
    roomCode: '',           
    isLiveViewOpen: false,
    
    // The current user's profile
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
        // Grant the starter avatars by default
        inventory: { 'king-david': true, 'ruth': true },
        equipped: { title: 'Novice Learner', border: 'border-slate-300' }
    },
    
    // The Avatar Shop inventory and prices
    avatarShop: [
        { id: 'king-david', name: 'King David', image: './public/avatars/king-david.png', price: 0 },
        { id: 'ruth', name: 'Ruth', image: './public/avatars/ruth.png', price: 0 },
        { id: 'mary', name: 'Mary', image: './public/avatars/mary.png', price: 50 },
        { id: 'joseph', name: 'Joseph', image: './public/avatars/joseph.png', price: 50 },
        { id: 'noah', name: 'Noah', image: './public/avatars/noah.png', price: 50 },
        { id: 'abraham', name: 'Abraham', image: './public/avatars/abraham.png', price: 100 },
        { id: 'elijah', name: 'Elijah', image: './public/avatars/elijah.png', price: 100 },
        { id: 'daniel', name: 'Daniel', image: './public/avatars/daniel.png', price: 100 },
        { id: 'rahab', name: 'Rahab', image: './public/avatars/rahab.png', price: 100 },
        { id: 'moses', name: 'Moses', image: './public/avatars/moses.png', price: 100 },
        { id: 'josuah', name: 'Joshua', image: './public/avatars/josuah.png', price: 100 },
        { id: 'apostle-peter', name: 'Apostle Peter', image: './public/avatars/apostle-peter.png', price: 150 },
        { id: 'apostle-paul', name: 'Apostle Paul', image: './public/avatars/apostle-paul.png', price: 150 },
        { id: 'queen-esther', name: 'Queen Esther', image: './public/avatars/queen-esther.png', price: 150 },
        { id: 'judge-deborah', name: 'Judge Deborah', image: './public/avatars/judge-deborah.png', price: 150 },
        { id: 'judge-samson', name: 'Judge Samson', image: './public/avatars/judge-samson.png', price: 150 },
        { id: 'king-solomon', name: 'King Solomon', image: './public/avatars/king-solomon.png', price: 300 },
        { id: 'archangel-michael', name: 'Archangel Michael', image: './public/avatars/archangel-michael.png', price: 300 }
    ],
    
    players: {},            
    currentModule: 0,       
    currentIndex: 0,
    
    queues: { study: 0, puzzle: 0, hotspot: 0, tictactoe: 0, audio: 0, spell: 0, hangman: 0, memory: 0, read: 0, dict: 0, quiz: 0 },
    countdownInterval: null,
    
    localGameData: { memMatched: 0, memFlipped: [], memTotal: 0, hmStrikes: 0, hmGuessed: [], hmPhrase: '' },
    
    countryCodes: JSON.parse(localStorage.getItem('countryCodes')) || [ {flag: '🇺🇸', code: '+1'}, {flag: '🇬🇧', code: '+44'}, {flag: '🇧🇷', code: '+55'}, {flag: '🇪🇸', code: '+34'}, {flag: '🇧🇴', code: '+591'} ],
    teams: JSON.parse(localStorage.getItem('gameTeams')) || [{id: 'dragon'}, {id: 'eagle'}]
});