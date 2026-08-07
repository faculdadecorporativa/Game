// StudentDashboardController.js
// Handles rendering of the student profile, Quests, Badges, and leveling.

import { appStore } from './store.js';

export const dashboardController = {
    calculateLevel(xp) {
        return Math.floor(0.1 * Math.sqrt(xp || 0)) + 1;
    },

    // 🔥 RPG BADGES & ACHIEVEMENTS 🔥
    badges: [
        { id: 'first_blood', name: 'First Blood', icon: '&#129351;', desc: 'Earn your first points', req: (me) => (me.scores?.total || 0) > 0 },
        { id: 'streak_master', name: 'On Fire', icon: '&#128293;', desc: 'Reach a 3-answer streak', req: (me) => (me.maxStreak || me.streak || 0) >= 3 },
        { id: 'treasured', name: 'Treasured', icon: '&#128142;', desc: 'Hold 100+ coins at once', req: (me) => (me.coins || 0) >= 100 },
        { id: 'shopper', name: 'Big Spender', icon: '&#128722;', desc: 'Buy an item from the Shop', req: (me) => Object.keys(me.inventory || {}).length > 0 }
    ],

    // 🔥 RPG DAILY BOUNTIES / QUESTS 🔥
    quests: [
        { id: 'q_points', name: 'Earn 10 Points', target: 10, current: (me) => me.scores?.total || 0, reward: '50 XP' },
        { id: 'q_listen', name: 'Master Listener', target: 6, current: (me) => me.scores?.Listening || 0, reward: '20 Coins' }
    ],

    renderDashboard() {
        const me = appStore.get('me');
        if (!me) return;

        // Auto-track their highest streak ever achieved for Badges
        if ((me.streak || 0) > (me.maxStreak || 0)) me.maxStreak = me.streak;

        const currentLevel = this.calculateLevel(me.xp);
        const nextLevelXp = Math.pow((currentLevel) / 0.1, 2);
        const currentLevelBaseXp = Math.pow((currentLevel - 1) / 0.1, 2);
        const progressPercent = ((me.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100;

        const previousLevel = appStore.get('localGameData')?.lastKnownLevel || 1;
        if (currentLevel > previousLevel) {
            if (window.startConfetti) window.startConfetti();
            if (window.sfx) window.sfx.play('correct');
            if (window.toast) window.toast(`&#127881; Level Up! You are now Level ${currentLevel}!`, true);
            
            let d = appStore.get('localGameData') || {};
            d.lastKnownLevel = currentLevel;
            appStore.set('localGameData', d);
        }

        const nameEl = document.getElementById('dash-name');
        if(nameEl) nameEl.innerText = me.displayName || me.name || "Student";
        
        const titleEl = document.getElementById('dash-title');
        if(titleEl) titleEl.innerText = me.equipped?.title || "Novice Learner";
        
        const levelEl = document.getElementById('dash-level');
        if(levelEl) levelEl.innerText = `Level ${currentLevel}`;
        
        const xpEl = document.getElementById('dash-xp');
        if(xpEl) xpEl.innerText = `${me.xp || 0} / ${nextLevelXp} XP`;
        
        const coinsEl = document.getElementById('dash-coins');
        if(coinsEl) coinsEl.innerText = me.coins || 0;
        
        const streakEl = document.getElementById('dash-streak');
        if(streakEl) streakEl.innerText = me.streak || 0;
        
        const barEl = document.getElementById('dash-progress-bar');
        if(barEl) barEl.style.width = `${progressPercent}%`;

        // Stats
        const statTotal = document.getElementById('stat-total');
        if(statTotal) statTotal.innerText = me.scores?.total || 0;
        
        const statGen = document.getElementById('stat-general');
        if(statGen) statGen.innerText = me.scores?.General || 0;
        
        const statList = document.getElementById('stat-listening');
        if(statList) statList.innerText = me.scores?.Listening || 0;

        // Inventory
        const inv = me.inventory || {};
        const invEl1 = document.getElementById('inv-extraLife');
        if(invEl1) invEl1.innerText = inv.extraLife || 0;
        const invEl2 = document.getElementById('inv-freezeTime');
        if(invEl2) invEl2.innerText = inv.freezeTime || 0;
        const invEl3 = document.getElementById('inv-timeBurn');
        if(invEl3) invEl3.innerText = inv.timeBurn || 0;

        // 🔥 RENDER BOUNTIES (QUESTS) 🔥
        const questContainer = document.getElementById('quest-container');
        if (questContainer) {
            questContainer.innerHTML = this.quests.map(q => {
                const progress = Math.min(q.current(me), q.target);
                const pct = (progress / q.target) * 100;
                const isDone = progress >= q.target;
                
                return `
                    <div class="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden ${isDone ? 'border-green-400 dark:border-green-500/50' : ''} transition-colors">
                        ${isDone ? '<div class="absolute inset-0 bg-green-500/10 z-0"></div>' : ''}
                        <div class="relative z-10 flex justify-between items-center mb-2">
                            <span class="font-bold text-sm text-slate-800 dark:text-slate-200">${q.name}</span>
                            <span class="text-xs font-black text-indigo-500 dark:text-indigo-400">${isDone ? '&#10004; DONE' : q.reward}</span>
                        </div>
                        <div class="relative z-10 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-${isDone ? 'green' : 'indigo'}-500 h-2 rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 🔥 RENDER TROPHY CASE (BADGES) 🔥
        const badgeContainer = document.getElementById('badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = this.badges.map(b => {
                const unlocked = b.req(me);
                return `
                    <div title="${b.desc}" class="bg-white dark:bg-slate-800/50 p-3 rounded-xl border ${unlocked ? 'border-amber-400 dark:border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-slate-200 dark:border-white/5 opacity-40 grayscale'} text-center flex flex-col items-center justify-center transition-all hover:scale-105 cursor-help h-24">
                        <span class="text-3xl mb-1 drop-shadow-md">${b.icon}</span>
                        <span class="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest mt-1">${b.name}</span>
                    </div>
                `;
            }).join('');
        }
    },

    openDashboard() {
        if (window.uiManager) window.uiManager.hideAll(); 
        if (window.sfx) window.sfx.play('alert'); 
        this.renderDashboard();
        
        const dashMod = document.getElementById('module-dashboard');
        if (dashMod) dashMod.classList.remove('hidden');
    }
};

window.dashboardController = dashboardController;