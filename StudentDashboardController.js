// 🏗️ StudentDashboardController.js
// Handles the rendering of the student profile hub, level calculations, and progression UX.

import { appStore } from './store.js';

export const dashboardController = {
    // 🧮 RPG Math Curve for Leveling
    calculateLevel(xp) {
        return Math.floor(0.1 * Math.sqrt(xp || 0)) + 1;
    },

    renderDashboard() {
        const me = appStore.get('me');
        if (!me) return;

        // Calculate Level and Progress to next level
        const currentLevel = this.calculateLevel(me.xp);
        const nextLevelXp = Math.pow((currentLevel) / 0.1, 2);
        const currentLevelBaseXp = Math.pow((currentLevel - 1) / 0.1, 2);
        const progressPercent = ((me.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100;

        // 🔥 LEVEL UP UX CHECK 🔥
        // If this is the first time rendering or they just leveled up, we can trigger feedback
        const previousLevel = appStore.get('localGameData')?.lastKnownLevel || 1;
        if (currentLevel > previousLevel) {
            if (window.startConfetti) window.startConfetti();
            if (window.sfx) window.sfx.play('correct');
            if (window.toast) window.toast(`🎉 Level Up! You are now Level ${currentLevel}!`, true);
            
            let d = appStore.get('localGameData') || {};
            d.lastKnownLevel = currentLevel;
            appStore.set('localGameData', d);
        }

        // Inject User Header Data
        const nameEl = document.getElementById('dash-name');
        if(nameEl) nameEl.innerText = me.displayName || "Student";
        
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

        // Inject Stats Data
        const statTotal = document.getElementById('stat-total');
        if(statTotal) statTotal.innerText = me.scores?.total || 0;
        
        const statGen = document.getElementById('stat-general');
        if(statGen) statGen.innerText = me.scores?.General || 0;
        
        const statList = document.getElementById('stat-listening');
        if(statList) statList.innerText = me.scores?.Listening || 0;

        // Inject Inventory Quantities
        const inv = me.inventory || {};
        const invEl1 = document.getElementById('inv-extraLife');
        if(invEl1) invEl1.innerText = inv.extraLife || 0;
        
        const invEl2 = document.getElementById('inv-freezeTime');
        if(invEl2) invEl2.innerText = inv.freezeTime || 0;
        
        const invEl3 = document.getElementById('inv-timeBurn');
        if(invEl3) invEl3.innerText = inv.timeBurn || 0;
    },

    openDashboard() {
        if (window.uiManager) window.uiManager.hideAll(); 
        
        if (window.sfx) window.sfx.play('alert'); // UX feedback on open
        
        this.renderDashboard();
        
        const dashMod = document.getElementById('module-dashboard');
        if (dashMod) dashMod.classList.remove('hidden');
    }
};

// Bind to Global Service Layer for cross-module communication
window.dashboardController = dashboardController;