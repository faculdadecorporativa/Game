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
        const progressPercent = Math.min(100, Math.max(0, ((me.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100));

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

        // 🔥 RENDER BOUNTIES (QUESTS) - Tailwind Purge Bug Fixed! 🔥
        const questContainer = document.getElementById('quest-container');
        if (questContainer) {
            questContainer.innerHTML = this.quests.map(q => {
                const progress = Math.min(q.current(me), q.target);
                const pct = (progress / q.target) * 100;
                const isDone = progress >= q.target;
                
                // Explicit string assignment to prevent Tailwind Purge
                const barColorClass = isDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]';
                const borderClass = isDone ? 'border-emerald-400 dark:border-emerald-500/50' : 'border-slate-200 dark:border-white/5';

                return `
                    <div class="bg-white dark:bg-slate-800/50 p-4 rounded-xl border ${borderClass} relative overflow-hidden transition-colors shadow-sm">
                        ${isDone ? '<div class="absolute inset-0 bg-emerald-500/10 z-0"></div>' : ''}
                        <div class="relative z-10 flex justify-between items-center mb-2">
                            <span class="font-bold text-sm text-slate-800 dark:text-slate-200">${q.name}</span>
                            <span class="text-xs font-black ${isDone ? 'text-emerald-500' : 'text-indigo-500 dark:text-indigo-400'}">${isDone ? '&#10004; DONE' : q.reward}</span>
                        </div>
                        <div class="relative z-10 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                            <div class="${barColorClass} h-2 rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 🔥 RENDER TROPHY CASE (BADGES) - Added Silhouette Lock State 🔥
        const badgeContainer = document.getElementById('badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = this.badges.map(b => {
                const unlocked = b.req(me);
                if (unlocked) {
                    return `
                        <div title="${b.desc}" class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 p-3 rounded-xl border border-amber-400 dark:border-amber-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)] text-center flex flex-col items-center justify-center transition-all hover:scale-105 hover:-translate-y-1 cursor-help h-24 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors pointer-events-none"></div>
                            <span class="text-3xl mb-1 drop-shadow-md relative z-10">${b.icon}</span>
                            <span class="text-[9px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest mt-1 relative z-10">${b.name}</span>
                        </div>
                    `;
                } else {
                    return `
                        <div title="${b.desc}" class="bg-slate-100 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-300 dark:border-white/5 opacity-60 text-center flex flex-col items-center justify-center transition-all cursor-not-allowed h-24 relative overflow-hidden">
                            <span class="absolute top-2 right-2 text-xs opacity-50">&#128274;</span>
                            <span class="text-3xl mb-1 filter grayscale brightness-50">${b.icon}</span>
                            <span class="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Locked</span>
                        </div>
                    `;
                }
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