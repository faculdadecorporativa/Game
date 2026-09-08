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
    { id: 'deacons', label: 'Deacons', icon: '🙏', badgeColor: 'bg-blue-500/20 text-blue-300' },
    { id: 'legends', label: 'Legends & Patriarchs', icon: '✨', badgeColor: 'bg-teal-500/20 text-teal-300' }
];

export const avatarShop = [
    // Base/Legends/Prophets/Villains (Free 0 Cost originally, leaving mapped here for completeness)
    { id: 'abraham', name: 'Abraham', category: 'legends', image: './public/avatars/abraham.png', price: 0 },
    { id: 'aquilla', name: 'Aquilla', category: 'legends', image: './public/avatars/aquilla.png', price: 0 },
    { id: 'archangel-michael', name: 'Archangel Michael', category: 'legends', image: './public/avatars/archangel-michael.png', price: 0 },
    { id: 'barnabas', name: 'Barnabas', category: 'legends', image: './public/avatars/barnabas.png', price: 0 },
    { id: 'bathsheba', name: 'Bathsheba', category: 'kings', image: './public/avatars/bathsheba.png', price: 0 },
    { id: 'cain', name: 'Cain', category: 'villains', image: './public/avatars/cain.png', price: 0 },
    { id: 'daniel', name: 'Daniel', category: 'prophets', image: './public/avatars/daniel.png', price: 0 },
    { id: 'delilah', name: 'Delilah', category: 'villains', image: './public/avatars/delilah.png', price: 0 },
    { id: 'elijah', name: 'Elijah', category: 'prophets', image: './public/avatars/elijah.png', price: 0 },
    { id: 'gabriel', name: 'Gabriel', category: 'legends', image: './public/avatars/gabriel.png', price: 0 },
    { id: 'goliath', name: 'Goliath', category: 'villains', image: './public/avatars/goliath.png', price: 0 },
    { id: 'gomer', name: 'Gomer', category: 'legends', image: './public/avatars/gomer.png', price: 0 },
    { id: 'jesus', name: 'Jesus', category: 'legends', image: './public/avatars/jesus.png', price: 0 },
    { id: 'job', name: 'Job', category: 'legends', image: './public/avatars/job.png', price: 0 },
    { id: 'jonathan', name: 'Jonathan', category: 'valiants', image: './public/avatars/jonathan.png', price: 0 },
    { id: 'joseph-barsabbas', name: 'Joseph Barsabbas', category: 'legends', image: './public/avatars/joseph-barsabbas.png', price: 0 },
    { id: 'joseph', name: 'Joseph', category: 'legends', image: './public/avatars/joseph.png', price: 0 },
    { id: 'josuah', name: 'Josuah', category: 'legends', image: './public/avatars/josuah.png', price: 0 },
    { id: 'judas-iscariot', name: 'Judas Iscariot', category: 'villains', image: './public/avatars/judas-iscariot.png', price: 0 },
    { id: 'legion', name: 'Legion', category: 'villains', image: './public/avatars/legion.png', price: 0 },
    { id: 'lucifer', name: 'Lucifer', category: 'villains', image: './public/avatars/lucifer.png', price: 0 },
    { id: 'mary-magdalene', name: 'Mary Magdalene', category: 'legends', image: './public/avatars/mary-magdalene.png', price: 0 },
    { id: 'mary', name: 'Mary', category: 'legends', image: './public/avatars/mary.png', price: 0 },
    { id: 'moses', name: 'Moses', category: 'prophets', image: './public/avatars/moses.png', price: 0 },
    { id: 'nicolas-of-antioch', name: 'Nicolas of Antioch', category: 'legends', image: './public/avatars/nicolas-of-antioch.png', price: 0 },
    { id: 'nimrod', name: 'Nimrod', category: 'villains', image: './public/avatars/nimrod.png', price: 0 },
    { id: 'noah', name: 'Noah', category: 'legends', image: './public/avatars/noah.png', price: 0 },
    { id: 'pharaoh', name: 'Pharaoh', category: 'villains', image: './public/avatars/pharaoh.png', price: 0 },
    { id: 'phoebe-of-cenchreae', name: 'Phoebe of Cenchreae', category: 'legends', image: './public/avatars/phoebe-of-cenchreae.png', price: 0 },
    { id: 'pontius-pilate', name: 'Pontius Pilate', category: 'villains', image: './public/avatars/pontius-pilate.png', price: 0 },
    { id: 'priscilla', name: 'Priscilla', category: 'legends', image: './public/avatars/priscilla.png', price: 0 },
    { id: 'rahab', name: 'Rahab', category: 'legends', image: './public/avatars/rahab.png', price: 0 },
    { id: 'ruth', name: 'Ruth', category: 'legends', image: './public/avatars/ruth.png', price: 0 },
    { id: 'silas', name: 'Silas', category: 'legends', image: './public/avatars/silas.png', price: 0 },
    { id: 'simon-magus', name: 'Simon Magus', category: 'villains', image: './public/avatars/simon-magus.png', price: 0 },
    { id: 'tamar', name: 'Tamar', category: 'legends', image: './public/avatars/tamar.png', price: 0 },

    // Judges
    { id: 'judge-abdon', name: 'Judge Abdon', category: 'judges', image: './public/avatars/judge-abdon.png', price: 300 },
    { id: 'judge-deborah', name: 'Judge Deborah', category: 'judges', image: './public/avatars/judge-deborah.png', price: 300 },
    { id: 'judge-ehud', name: 'Judge Ehud', category: 'judges', image: './public/avatars/judge-ehud.png', price: 300 },
    { id: 'judge-elon', name: 'Judge Elon', category: 'judges', image: './public/avatars/judge-elon.png', price: 300 },
    { id: 'judge-gideon', name: 'Judge Gideon', category: 'judges', image: './public/avatars/judge-gideon.png', price: 300 },
    { id: 'judge-ibzan', name: 'Judge Ibzan', category: 'judges', image: './public/avatars/judge-ibzan.png', price: 300 },
    { id: 'judge-jair', name: 'Judge Jair', category: 'judges', image: './public/avatars/judge-jair.png', price: 300 },
    { id: 'judge-jephthah', name: 'Judge Jephthah', category: 'judges', image: './public/avatars/judge-jephthah.png', price: 300 },
    { id: 'judge-othniel', name: 'Judge Othniel', category: 'judges', image: './public/avatars/judge-othniel.png', price: 300 },
    { id: 'judge-samson', name: 'Judge Samson', category: 'judges', image: './public/avatars/judge-samson.png', price: 300 },
    { id: 'judge-shamgar', name: 'Judge Shamgar', category: 'judges', image: './public/avatars/judge-shamgar.png', price: 300 },
    { id: 'judge-tola', name: 'Judge Tola', category: 'judges', image: './public/avatars/judge-tola.png', price: 300 },

    // Deacons
    { id: 'deacon-nicanor', name: 'Deacon Nicanor', category: 'deacons', image: './public/avatars/deacon-nicanor.png', price: 200 },
    { id: 'deacon-nicolas', name: 'Deacon Nicolas', category: 'deacons', image: './public/avatars/deacon-nicolas.png', price: 200 },
    { id: 'deacon-parmenas', name: 'Deacon Parmenas', category: 'deacons', image: './public/avatars/deacon-parmenas.png', price: 200 },
    { id: 'deacon-philip', name: 'Deacon Philip', category: 'deacons', image: './public/avatars/deacon-philip.png', price: 200 },
    { id: 'deacon-prochorus', name: 'Deacon Prochorus', category: 'deacons', image: './public/avatars/deacon-prochorus.png', price: 200 },
    { id: 'deacon-stephen', name: 'Deacon Stephen', category: 'deacons', image: './public/avatars/deacon-stephen.png', price: 200 },
    { id: 'deacon-timon', name: 'Deacon Timon', category: 'deacons', image: './public/avatars/deacon-timon.png', price: 200 },

    // Apostles
    { id: 'apollos-of-alexandria', name: 'Apollos', category: 'apostles', image: './public/avatars/apollos-of-alexandria.png', price: 400 },
    { id: 'apostle-andrew', name: 'Apostle Andrew', category: 'apostles', image: './public/avatars/apostle-andrew.png', price: 400 },
    { id: 'apostle-bartholomew', name: 'Apostle Bartholomew', category: 'apostles', image: './public/avatars/apostle-bartholomew.png', price: 400 },
    { id: 'apostle-james-the-greater', name: 'Apostle James the Greater', category: 'apostles', image: './public/avatars/apostle-james-the-greater.png', price: 400 },
    { id: 'apostle-james', name: 'Apostle James', category: 'apostles', image: './public/avatars/apostle-james.png', price: 400 },
    { id: 'apostle-john', name: 'Apostle John', category: 'apostles', image: './public/avatars/apostle-john.png', price: 400 },
    { id: 'apostle-matthew', name: 'Apostle Matthew', category: 'apostles', image: './public/avatars/apostle-matthew.png', price: 400 },
    { id: 'apostle-matthias', name: 'Apostle Matthias', category: 'apostles', image: './public/avatars/apostle-matthias.png', price: 400 },
    { id: 'apostle-paul', name: 'Apostle Paul', category: 'apostles', image: './public/avatars/apostle-paul.png', price: 400 },
    { id: 'apostle-peter', name: 'Apostle Peter', category: 'apostles', image: './public/avatars/apostle-peter.png', price: 400 },
    { id: 'apostle-philip', name: 'Apostle Philip', category: 'apostles', image: './public/avatars/apostle-philip.png', price: 400 },
    { id: 'apostle-simon-the-zealot', name: 'Apostle Simon', category: 'apostles', image: './public/avatars/apostle-simon-the-zealot.png', price: 400 },
    { id: 'apostle-thaddaeus', name: 'Apostle Thaddaeus', category: 'apostles', image: './public/avatars/apostle-thaddaeus.png', price: 400 },
    { id: 'apostle-thomas', name: 'Apostle Thomas', category: 'apostles', image: './public/avatars/apostle-thomas.png', price: 400 },
    { id: 'apostle-timothy', name: 'Apostle Timothy', category: 'apostles', image: './public/avatars/apostle-timothy.png', price: 400 },

    // Kings & Queens
    { id: 'king-ahab', name: 'King Ahab', category: 'kings', image: './public/avatars/king-ahab.png', price: 800 },
    { id: 'king-asa', name: 'King Asa', category: 'kings', image: './public/avatars/king-asa.png', price: 800 },
    { id: 'king-belshazzar', name: 'King Belshazzar', category: 'kings', image: './public/avatars/king-belshazzar.png', price: 800 },
    { id: 'king-david', name: 'King David', category: 'kings', image: './public/avatars/king-david.png', price: 800 },
    { id: 'king-herod', name: 'King Herod', category: 'kings', image: './public/avatars/king-herod.png', price: 800 },
    { id: 'king-hezekiah', name: 'King Hezekiah', category: 'kings', image: './public/avatars/king-hezekiah.png', price: 800 },
    { id: 'king-jehu', name: 'King Jehu', category: 'kings', image: './public/avatars/king-jehu.png', price: 800 },
    { id: 'king-jeroboam', name: 'King Jeroboam', category: 'kings', image: './public/avatars/king-jeroboam.png', price: 800 },
    { id: 'king-jeroboam-the-second', name: 'King Jeroboam II', category: 'kings', image: './public/avatars/king-jeroboam-the-second.png', price: 800 },
    { id: 'king-joash', name: 'King Joash', category: 'kings', image: './public/avatars/king-joash.png', price: 800 },
    { id: 'king-johoshaphat', name: 'King Jehoshaphat', category: 'kings', image: './public/avatars/king-johoshaphat.png', price: 800 },
    { id: 'king-josiah', name: 'King Josiah', category: 'kings', image: './public/avatars/king-josiah.png', price: 800 },
    { id: 'king-manasseh', name: 'King Manasseh', category: 'kings', image: './public/avatars/king-manasseh.png', price: 800 },
    { id: 'king-nebuchadnezzar', name: 'King Nebuchadnezzar', category: 'kings', image: './public/avatars/king-nebuchadnezzar.png', price: 800 },
    { id: 'king-rehoboam', name: 'King Rehoboam', category: 'kings', image: './public/avatars/king-rehoboam.png', price: 800 },
    { id: 'king-saul', name: 'King Saul', category: 'kings', image: './public/avatars/king-saul.png', price: 800 },
    { id: 'king-solomon', name: 'King Solomon', category: 'kings', image: './public/avatars/king-solomon.png', price: 800 },
    { id: 'king-uzziah', name: 'King Uzziah', category: 'kings', image: './public/avatars/king-uzziah.png', price: 800 },
    { id: 'queen-athaliah', name: 'Queen Athaliah', category: 'kings', image: './public/avatars/queen-athaliah.png', price: 800 },
    { id: 'queen-esther', name: 'Queen Esther', category: 'kings', image: './public/avatars/queen-esther.png', price: 800 },
    { id: 'queen-jezebel', name: 'Queen Jezebel', category: 'kings', image: './public/avatars/queen-jezebel.png', price: 800 },

    // Valiant Warriors
    { id: 'valiant-abiezar', name: 'Valiant Abiezar', category: 'valiants', image: './public/avatars/valiant-abiezar.png', price: 500 },
    { id: 'valiant-abishai', name: 'Valiant Abishai', category: 'valiants', image: './public/avatars/valiant-abishai.png', price: 500 },
    { id: 'valiant-benaiah', name: 'Valiant Benaiah', category: 'valiants', image: './public/avatars/valiant-benaiah.png', price: 500 },
    { id: 'valiant-eleazar', name: 'Valiant Eleazar', category: 'valiants', image: './public/avatars/valiant-eleazar.png', price: 500 },
    { id: 'valiant-elhanan', name: 'Valiant Elhanan', category: 'valiants', image: './public/avatars/valiant-elhanan.png', price: 500 },
    { id: 'valiant-helez', name: 'Valiant Helez', category: 'valiants', image: './public/avatars/valiant-helez.png', price: 500 },
    { id: 'valiant-ira', name: 'Valiant Ira', category: 'valiants', image: './public/avatars/valiant-ira.png', price: 500 },
    { id: 'valiant-ittai', name: 'Valiant Ittai', category: 'valiants', image: './public/avatars/valiant-ittai.png', price: 500 },
    { id: 'valiant-jashobeam', name: 'Valiant Jashobeam', category: 'valiants', image: './public/avatars/valiant-jashobeam.png', price: 500 },
    { id: 'valiant-jonathan', name: 'Valiant Jonathan', category: 'valiants', image: './public/avatars/valiant-jonathan.png', price: 500 },
    { id: 'valiant-maharai', name: 'Valiant Maharai', category: 'valiants', image: './public/avatars/valiant-maharai.png', price: 500 },
    { id: 'valiant-shammah', name: 'Valiant Shammah', category: 'valiants', image: './public/avatars/valiant-shammah.png', price: 500 },
    { id: 'valiant-sibbecai', name: 'Valiant Sibbecai', category: 'valiants', image: './public/avatars/valiant-sibbecai.png', price: 500 },
    { id: 'valiant-uriah', name: 'Valiant Uriah', category: 'valiants', image: './public/avatars/valiant-uriah.png', price: 500 },
    { id: 'valient-asahel', name: 'Valiant Asahel', category: 'valiants', image: './public/avatars/valient-asahel.png', price: 500 }
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

export const DEFAULT_AVATAR = './public/avatars/abraham.png';

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
        inventory: { 'abraham': true, 'mary': true, 'king-david': true, 'ruth': true },
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

// ==========================================
// 📡 NETWORK QUEUE UTILITIES
// ==========================================

export function createEmptyQueues() {
    return {
        outgoing: [],
        incoming: []
    };
}