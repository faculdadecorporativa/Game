// 🏗️ ShopController.js
// Manages the completely overhauled RPG-Style Tabbed Item Store.

import { appStore } from './store.js';

export const shopController = {
    currentTab: 'consumables', // Default active tab
    
    // 🛒 Comprehensive Categorized Premium Catalog
    catalog: {
        consumables: [
            { id: 'extraLife', name: "Extra Life", cost: 100, icon: "🛡️", desc: "Saves you from losing your streak on a wrong answer.", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'freezeTime', name: "Time Freeze", cost: 75, icon: "❄️", desc: "Gives you 15 extra seconds on a difficult question.", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" },
            { id: 'doubleCoins', name: "Double Coins", cost: 150, icon: "🪙", desc: "Doubles all coin earnings for your next game.", glow: "shadow-[0_0_15px_rgba(250,204,21,0.3)]" }
        ],
        cosmetics: [
            { id: 'borderNeon', name: "Neon Cyber Ring", cost: 200, icon: "🟢", desc: "Equip a glowing cyan border to your avatar profile.", equipType: 'border', equipValue: 'ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]', glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
            { id: 'borderGold', name: "Champion Gold", cost: 500, icon: "👑", desc: "Show off your wealth with a radiant gold border.", equipType: 'border', equipValue: 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]', glow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
            { id: 'borderFire', name: "Inferno Ring", cost: 300, icon: "🔥", desc: "A blazing red border to strike fear into your opponents.", equipType: 'border', equipValue: 'ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]', glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]" }
        ],
        titles: [
            { id: 'titleSpeed', name: "The Speed Demon", cost: 300, icon: "⚡", desc: "Equip this title to show off your lightning fast reflexes.", equipType: 'title', equipValue: 'The Speed Demon', glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'titleMaster', name: "Grammar Master", cost: 300, icon: "📚", desc: "Equip this title for achieving flawless academic accuracy.", equipType: 'title', equipValue: 'Grammar Master', glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
            { id: 'titleUnstoppable', name: "Unstoppable", cost: 500, icon: "☄️", desc: "Exclusive, legendary title reserved for streak masters.", equipType: 'title', equipValue: 'Unstoppable', glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]" }
        ]
    },

    openShop() {
        const me = appStore.get('me');
        const shopCoinsEl = document.getElementById('shop-coins');
        if(me && shopCoinsEl) shopCoinsEl.innerText = me.coins || 0;
        
        if (window.uiManager) window.uiManager.hideAll();
        if (window.sfx) window.sfx.play('alert'); 
        
        const shopMod = document.getElementById('module-shop');
        if (shopMod) shopMod.classList.remove('hidden');

        // Always default to the Consumables tab upon opening
        this.switchTab('consumables'); 
    },

    // Handles the dynamic Tab switching logic
    switchTab(tabId) {
        this.currentTab = tabId;
        
        // Visually update the tab buttons
        ['consumables', 'cosmetics', 'titles'].forEach(id => {
            const btn = document.getElementById(`tab-btn-${id}`);
            if (!btn) return;
            
            if (id === tabId) {
                // Active State
                btn.className = `shop-tab-btn flex-1 min-w-[150px] bg-indigo-600 text-white font-black py-4 px-6 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-1`;
            } else {
                // Inactive State
                btn.className = `shop-tab-btn flex-1 min-w-[150px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1`;
            }
        });

        // Trigger the renderer for the selected category
        this.renderItems();
    },

    // Dynamically builds the HTML for the shop items based on the active tab
    renderItems() {
        const container = document.getElementById('shop-items-container');
        if (!container) return;

        const me = appStore.get('me') || {};
        me.inventory = me.inventory || {};
        me.equipped = me.equipped || { title: 'Novice Learner', border: 'border-slate-300' };

        const items = this.catalog[this.currentTab];
        let html = '';

        items.forEach(item => {
            const isConsumable = this.currentTab === 'consumables';
            
            // Checks if the user permanently unlocked a cosmetic/title
            const hasPurchased = me.inventory[item.id] > 0 || me.inventory[item.id] === true;
            
            // Checks if the user is currently wearing this exact cosmetic/title
            const isEquipped = me.equipped[item.equipType] === item.equipValue;

            let actionButton = '';
            
            // Render logic based on item type
            if (isConsumable) {
                const count = me.inventory[item.id] || 0;
                actionButton = `
                    <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                        <span>Buy for ${item.cost}</span> <span class="text-lg">🪙</span>
                    </button>
                    <p class="text-[10px] text-indigo-400 dark:text-indigo-300 mt-3 font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-900 py-1.5 rounded-lg border border-slate-300 dark:border-white/10">In Locker: ${count}</p>
                `;
            } else {
                // Cosmetics & Titles Logic
                if (isEquipped) {
                    actionButton = `<button disabled class="w-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed">✅ EQUIPPED</button>`;
                } else if (hasPurchased) {
                    actionButton = `<button onclick="window.shopController.equipItem('${this.currentTab}', '${item.id}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]">✨ EQUIP NOW</button>`;
                } else {
                    actionButton = `
                        <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                            <span>Unlock ${item.cost}</span> <span class="text-lg">🪙</span>
                        </button>
                    `;
                }
            }

            // Inject the beautiful card into the layout
            html += `
                <div class="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col justify-between transition-all hover:border-indigo-400 dark:hover:border-indigo-400 ${item.glow}">
                    <div>
                        <div class="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-300 dark:border-white/5 shadow-inner">
                            ${item.icon}
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-xl mb-2">${item.name}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">${item.desc}</p>
                    </div>
                    <div>
                        ${actionButton}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Universal purchase logic for all tabs
    async buyItem(category, itemId) {
        const me = appStore.get('me');
        const item = this.catalog[category].find(i => i.id === itemId);

        if (!me || !item) return;

        // Balance Check
        if (me.coins < item.cost) {
            if (window.toast) window.toast(`Not enough coins! You need ${item.cost - me.coins} more.`, false);
            if (window.sfx) window.sfx.play('wrong'); 
            return;
        }

        try {
            // Deduct funds
            me.coins -= item.cost;
            me.inventory = me.inventory || {};
            
            // Consumables stack, cosmetics are a boolean 'true' unlock
            if (category === 'consumables') {
                me.inventory[itemId] = (me.inventory[itemId] || 0) + 1;
            } else {
                me.inventory[itemId] = true; 
            }
            
            // Sync securely to Firebase Database
            if (window.firebaseRef && window.firebaseSet && window.firebaseDB) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}`);
                await window.firebaseSet(userRef, me);
            }

            // Sync Local Storage
            appStore.set('me', me);

            // UX Feedback
            if (window.toast) window.toast(`${item.icon} Successfully purchased ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');

            // Update UI Coin Header Live
            const shopCoinsEl = document.getElementById('shop-coins');
            if (shopCoinsEl) shopCoinsEl.innerText = me.coins;
            
            // Re-render the shop buttons dynamically
            this.renderItems(); 
            
            // Render dashboard quietly in the background so it's ready when they go back
            if (window.dashboardController) window.dashboardController.renderDashboard();

        } catch (error) {
            console.error("Purchase failed: ", error);
            if (window.toast) window.toast("Transaction error. Connection lost.", false);
        }
    },

    // Permanent cosmetic equipment logic
    async equipItem(category, itemId) {
        const me = appStore.get('me');
        const item = this.catalog[category].find(i => i.id === itemId);

        // Security check
        if (!me || !item || !me.inventory[itemId]) return;

        try {
            me.equipped = me.equipped || {};
            me.equipped[item.equipType] = item.equipValue;
            
            // For borders, also apply it directly to the root `me.border` property so the HUD naturally picks it up
            if(item.equipType === 'border') {
                me.border = item.equipValue;
            }

            // Sync to database
            if (window.firebaseRef && window.firebaseSet && window.firebaseDB) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}`);
                await window.firebaseSet(userRef, me);
            }

            // Save state
            appStore.set('me', me);

            // UX Feedback
            if (window.toast) window.toast(`${item.icon} Equipped ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            
            // Refresh systems
            this.renderItems(); 
            if (window.dashboardController) window.dashboardController.renderDashboard();
            if (window.uiManager) window.uiManager.updateStudentHUD();

        } catch (error) {
            console.error("Equip failed: ", error);
        }
    }
};

// Bind to Global Service Layer
window.shopController = shopController;