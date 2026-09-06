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

// ==========================================
// 🛒 SHOP METADATA & HELPER CONFIGURATION
// ==========================================

export const SHOP_CATEGORIES = [
    { id: 'prophets', label: 'Prophets', icon: '📜', badgeColor: 'bg-purple-500/20 text-purple-300' },
    { id: 'kings', label: 'Kings', icon: '👑', badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'valiants', label: "David's Valiants", icon: '⚔️', badgeColor: 'bg-slate-500/20 text-slate-300' },
    { id: 'judges', label: 'Judges', icon: '⚖️', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'villains', label: 'Villains', icon: '🐍', badgeColor: 'bg-red-500/20 text-red-400' },
    { id: 'apostles', label: 'Apostles', icon: '🕊️', badgeColor: 'bg-sky-500/20 text-sky-300' },
    { id: 'legends', label: 'Legends & Patriarchs', icon: '✨', badgeColor: 'bg-teal-500/20 text-teal-300' }
];

export const avatarShop = [
    { id: 'king-david', name: 'King David', category: 'kings', image: './public/avatars/king-david.png', price: 0 },
    { id: 'ruth', name: 'Ruth', category: 'legends', image: './public/avatars/ruth.png', price: 0 },
    { id: 'mary', name: 'Mary', category: 'legends', image: './public/avatars/mary.png', price: 50 },
    { id: 'joseph', name: 'Joseph', category: 'legends', image: './public/avatars/joseph.png', price: 50 },
    { id: 'noah', name: 'Noah', category: 'legends', image: './public/avatars/noah.png', price: 50 },
    { id: 'abraham', name: 'Abraham', category: 'legends', image: './public/avatars/abraham.png', price: 100 },
    { id: 'elijah', name: 'Elijah', category: 'prophets', image: './public/avatars/elijah.png', price: 100 },
    { id: 'daniel', name: 'Daniel', category: 'prophets', image: './public/avatars/daniel.png', price: 100 },
    { id: 'rahab', name: 'Rahab', category: 'legends', image: './public/avatars/rahab.png', price: 100 },
    { id: 'moses', name: 'Moses', category: 'prophets', image: './public/avatars/moses.png', price: 100 },
    { id: 'josuah', name: 'Joshua', category: 'legends', image: './public/avatars/josuah.png', price: 100 },
    { id: 'apostle-peter', name: 'Apostle Peter', category: 'apostles', image: './public/avatars/apostle-peter.png', price: 150 },
    { id: 'apostle-paul', name: 'Apostle Paul', category: 'apostles', image: './public/avatars/apostle-paul.png', price: 150 },
    { id: 'queen-esther', name: 'Queen Esther', category: 'legends', image: './public/avatars/queen-esther.png', price: 150 },
    { id: 'judge-deborah', name: 'Judge Deborah', category: 'judges', image: './public/avatars/judge-deborah.png', price: 150 },
    { id: 'judge-samson', name: 'Judge Samson', category: 'judges', image: './public/avatars/judge-samson.png', price: 150 },
    { id: 'king-solomon', name: 'King Solomon', category: 'kings', image: './public/avatars/king-solomon.png', price: 300 },
    { id: 'archangel-michael', name: 'Archangel Michael', category: 'legends', image: './public/avatars/archangel-michael.png', price: 300 }
];

// ==========================================
// 🛒 SHOP HELPER FUNCTIONS
// ==========================================

export function getItemsByCategory(category) {
    return avatarShop.filter(item => item.category === category);
}

export function searchItemsByName(query) {
    if (!query) return avatarShop;
    const lowerQuery = query.toLowerCase();
    return avatarShop.filter(item => item.name.toLowerCase().includes(lowerQuery));
}

export function getFeaturedItems() {
    // Arbitrary logic: Featured items are the most expensive ones (e.g., price >= 150)
    return avatarShop.filter(item => item.price >= 150);
}

// ==========================================
// 🖼️ AVATAR UTILITIES
// ==========================================

export const DEFAULT_AVATAR = './public/avatars/king-david.png';

/**
 * Builds a valid image URL for avatars, supporting PocketBase records,
 * absolute paths, data URIs, or local static avatar filenames.
 */
export function getAvatarUrl(avatar, fileName = null) {
    if (!avatar) return DEFAULT_AVATAR;

    // Handle PocketBase record object
    if (typeof avatar === 'object') {
        if (avatar.collectionId && avatar.id && fileName) {
            return `https://pb.faculdadecorporativa.com.br/api/files/${avatar.collectionId}/${avatar.id}/${fileName}`;
        }
        if (avatar.avatar) {
            return getAvatarUrl(avatar.avatar);
        }
        return DEFAULT_AVATAR;
    }

    // Handle string inputs (paths, URLs, or filenames)
    if (typeof avatar === 'string') {
        if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:') || avatar.startsWith('./') || avatar.startsWith('/')) {
            return avatar;
        }
        return `./public/avatars/${avatar}`;
    }

    return DEFAULT_AVATAR;
}

// ==========================================
// 🎮 GLOBAL STORE INITIALIZATION
// ==========================================

// Initialize the global store with Multi-Tenancy Room support
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
        inventory: { 'king-david': true, 'ruth': true },
        equipped: { title: 'Novice Learner', border: 'border-slate-300' }
    },
    
    // Insert our extracted and categorized avatarShop here
    avatarShop: avatarShop,
    
    players: {},            
    currentModule: 0,       
    currentIndex: 0,
    
    queues: { study: 0, puzzle: 0, hotspot: 0, tictactoe: 0, audio: 0, spell: 0, hangman: 0, memory: 0, read: 0, dict: 0, quiz: 0 },
    countdownInterval: null,
    
    localGameData: { memMatched: 0, memFlipped: [], memTotal: 0, hmStrikes: 0, hmGuessed: [], hmPhrase: '' },
    
    countryCodes: JSON.parse(localStorage.getItem('countryCodes')) || [ {flag: '🇺🇸', code: '+1'}, {flag: '🇬🇧', code: '+44'}, {flag: '🇧🇷', code: '+55'}, {flag: '🇪🇸', code: '+34'}, {flag: '🇧🇴', code: '+591'} ],
    teams: JSON.parse(localStorage.getItem('gameTeams')) || [{id: 'dragon'}, {id: 'eagle'}]
});