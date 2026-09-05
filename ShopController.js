// ShopController.js
// Manages the completely overhauled RPG-Style Tabbed Item Store.

import { appStore } from './store.js';

export const shopController = {
    currentTab: 'consumables', 
    
    // Comprehensive Categorized Premium Catalog (Safe HTML Entities)
    catalog: {
        consumables: [
            { id: 'extraLife', name: "Extra Life", cost: 100, icon: "&#128305;", desc: "Saves you from losing your streak on a wrong answer.", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'freezeTime', name: "Time Freeze", cost: 75, icon: "&#10052;", desc: "Gives you 15 extra seconds on a difficult question.", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" },
            { id: 'timeBurn', name: "Time Burn", cost: 120, icon: "&#128293;", desc: "Speed up the opponent's timer by 5 seconds in live mode.", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
            { id: 'hint', name: "Smart Hint", cost: 50, icon: "&#128161;", desc: "Removes 2 wrong options or reveals a letter in Hangman.", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'coinMagnet', name: "Coin Magnet", cost: 200, icon: "&#129484;", desc: "Triples the coins earned on your next correct answer.", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" }
        ],
        cosmetics: [
            { id: 'borderNeon', name: "Neon Cyber Ring", cost: 200, icon: "&#128994;", desc: "Equip a glowing cyan border to your avatar profile.", equipType: 'border', equipValue: 'ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]', glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
            { id: 'borderGold', name: "Champion Gold", cost: 500, icon: "&#128081;", desc: "Show off your wealth with a radiant gold border.", equipType: 'border', equipValue: 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]', glow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
            { id: 'borderFire', name: "Inferno Ring", cost: 300, icon: "&#128293;", desc: "A blazing red border to strike fear into your opponents.", equipType: 'border', equipValue: 'ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]', glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]" }
        ],
        titles: [
            { id: 'titleSpeed', name: "Speed Demon", cost: 300, icon: "&#9889;", desc: "Equip this title to show off your lightning fast reflexes.", equipType: 'title', equipValue: 'The Speed Demon', glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'titleMaster', name: "Grammar Master", cost: 300, icon: "&#128218;", desc: "Equip this title for achieving flawless academic accuracy.", equipType: 'title', equipValue: 'Grammar Master', glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
            { id: 'titleUnstoppable', name: "Unstoppable", cost: 500, icon: "&#9732;", desc: "Exclusive, legendary title reserved for streak masters.", equipType: 'title', equipValue: 'Unstoppable', glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]" }
        ],
        avatars: [
            { id: 'avatarAbraham', name: "Abraham", cost: 300, icon: "<img src='/avatars/abraham.png' class='w-full h-full object-cover rounded-full' />", desc: "Father of nations. A beacon of unwavering faith.", equipType: 'avatar', equipValue: "/avatars/abraham.png", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'avatarPaul', name: "Apostle Paul", cost: 400, icon: "<img src='/avatars/apostle-paul.png' class='w-full h-full object-cover rounded-full' />", desc: "Bold messenger and author of many epistles.", equipType: 'avatar', equipValue: "/avatars/apostle-paul.png", glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
            { id: 'avatarPeter', name: "Apostle Peter", cost: 400, icon: "<img src='/avatars/apostle-peter.png' class='w-full h-full object-cover rounded-full' />", desc: "The rock upon which the foundation was built.", equipType: 'avatar', equipValue: "/avatars/apostle-peter.png", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
            { id: 'avatarMichael', name: "Archangel Michael", cost: 800, icon: "<img src='/avatars/archangel-michael.png' class='w-full h-full object-cover rounded-full' />", desc: "Mighty defender and leader of the heavenly host.", equipType: 'avatar', equipValue: "/avatars/archangel-michael.png", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'avatarDaniel', name: "Daniel", cost: 500, icon: "<img src='/avatars/daniel.png' class='w-full h-full object-cover rounded-full' />", desc: "Unshakable integrity, even in the lions' den.", equipType: 'avatar', equipValue: "/avatars/daniel.png", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'avatarElijah', name: "Elijah", cost: 600, icon: "<img src='/avatars/elijah.png' class='w-full h-full object-cover rounded-full' />", desc: "A powerful prophet who called down fire from heaven.", equipType: 'avatar', equipValue: "/avatars/elijah.png", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
            { id: 'avatarJoseph', name: "Joseph", cost: 500, icon: "<img src='/avatars/joseph.png' class='w-full h-full object-cover rounded-full' />", desc: "Dream interpreter who rose from the pit to the palace.", equipType: 'avatar', equipValue: "/avatars/joseph.png", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" },
            { id: 'avatarJosuah', name: "Josuah", cost: 600, icon: "<img src='/avatars/josuah.png' class='w-full h-full object-cover rounded-full' />", desc: "Courageous commander who led the people forward.", equipType: 'avatar', equipValue: "/avatars/josuah.png", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
            { id: 'avatarDeborah', name: "Judge Deborah", cost: 600, icon: "<img src='/avatars/judge-deborah.png' class='w-full h-full object-cover rounded-full' />", desc: "Wise prophetess and fearless leader in battle.", equipType: 'avatar', equipValue: "/avatars/judge-deborah.png", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'avatarSamson', name: "Judge Samson", cost: 700, icon: "<img src='/avatars/judge-samson.png' class='w-full h-full object-cover rounded-full' />", desc: "Blessed with supernatural strength to defeat enemies.", equipType: 'avatar', equipValue: "/avatars/judge-samson.png", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
            { id: 'avatarDavid', name: "King David", cost: 800, icon: "<img src='/avatars/king-david.png' class='w-full h-full object-cover rounded-full' />", desc: "A courageous warrior, psalmist, and king.", equipType: 'avatar', equipValue: "/avatars/king-david.png", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'avatarSolomon', name: "King Solomon", cost: 800, icon: "<img src='/avatars/king-solomon.png' class='w-full h-full object-cover rounded-full' />", desc: "Renowned for his unprecedented wisdom and wealth.", equipType: 'avatar', equipValue: "/avatars/king-solomon.png", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'avatarMary', name: "Mary", cost: 500, icon: "<img src='/avatars/mary.png' class='w-full h-full object-cover rounded-full' />", desc: "Favored and blessed, a model of humble obedience.", equipType: 'avatar', equipValue: "/avatars/mary.png", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" },
            { id: 'avatarMoses', name: "Moses", cost: 700, icon: "<img src='/avatars/moses.png' class='w-full h-full object-cover rounded-full' />", desc: "Led his people through the waters into freedom.", equipType: 'avatar', equipValue: "/avatars/moses.png", glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
            { id: 'avatarNoah', name: "Noah", cost: 400, icon: "<img src='/avatars/noah.png' class='w-full h-full object-cover rounded-full' />", desc: "Faithful builder who preserved life through the flood.", equipType: 'avatar', equipValue: "/avatars/noah.png", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
            { id: 'avatarEsther', name: "Queen Esther", cost: 700, icon: "<img src='/avatars/queen-esther.png' class='w-full h-full object-cover rounded-full' />", desc: "Brave and wise advocate who saved her people.", equipType: 'avatar', equipValue: "/avatars/queen-esther.png", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'avatarRahab', name: "Rahab", cost: 400, icon: "<img src='/avatars/rahab.png' class='w-full h-full object-cover rounded-full' />", desc: "Showed great courage and faith to protect the spies.", equipType: 'avatar', equipValue: "/avatars/rahab.png", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
            { id: 'avatarRuth', name: "Ruth", cost: 400, icon: "<img src='/avatars/ruth.png' class='w-full h-full object-cover rounded-full' />", desc: "A symbol of loyalty, devotion, and redemption.", equipType: 'avatar', equipValue: "/avatars/ruth.png", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" }
        ]
    },

    openShop() {
        const shopMod = document.getElementById('module-shop');
        if (!shopMod) {
            console.error("Shop module not found in the DOM.");
            return;
        }

        // 1. Manually hide all other active modules to prevent overlap
        const activeModules = document.querySelectorAll('main > *:not(.hidden)');
        activeModules.forEach(mod => {
            if (mod.id !== 'module-shop' && mod.id !== 'lifelines-panel') {
                mod.classList.add('hidden');
                mod.classList.remove('fade-in');
            }
        });

        // 2. Unhide the Shop Module and apply the animation
        shopMod.classList.remove('hidden');
        shopMod.classList.add('fade-in');

        // 3. Update the coins display safely
        const me = appStore.get('me');
        const shopCoinsEl = document.getElementById('shop-coins');
        if (me && shopCoinsEl) {
            shopCoinsEl.innerText = me.coins || 0;
        }
        
        if (window.sfx && window.sfx.play) window.sfx.play('alert'); 
        
        this.switchTab('consumables'); 
    },

    closeShop() {
        const shopMod = document.getElementById('module-shop');
        if (shopMod) {
            shopMod.classList.add('hidden');
            shopMod.classList.remove('fade-in');
        }
        
        // Return the user safely back to their dashboard
        const dashboard = document.getElementById('module-dashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
            dashboard.classList.add('fade-in');
        }
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        
        ['consumables', 'cosmetics', 'titles', 'avatars'].forEach(id => {
            const btn = document.getElementById(`tab-btn-${id}`);
            if (!btn) return;
            
            if (id === tabId) {
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-indigo-600 text-white font-black py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-1`;
            } else {
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl transition-all transform hover:-translate-y-1`;
            }
        });

        this.renderItems();
    },

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
            const hasPurchased = me.inventory[item.id] > 0 || me.inventory[item.id] === true;
            
            // Check if equipped (Special handling for avatars vs standard equips)
            const isEquipped = item.equipType === 'avatar' 
                ? me.avatar === item.equipValue 
                : me.equipped[item.equipType] === item.equipValue;

            let actionButton = '';
            
            if (isConsumable) {
                const count = me.inventory[item.id] || 0;
                actionButton = `
                    <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                        <span>Buy for ${item.cost}</span> <span class="text-lg">&#129689;</span>
                    </button>
                    <p class="text-[10px] text-indigo-500 dark:text-indigo-300 mt-3 font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-900 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 shadow-inner">In Locker: ${count}</p>
                `;
            } else {
                if (isEquipped) {
                    actionButton = `<button disabled class="w-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]">&#10004; EQUIPPED</button>`;
                } else if (hasPurchased) {
                    actionButton = `<button onclick="window.shopController.equipItem('${this.currentTab}', '${item.id}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]">&#10024; EQUIP NOW</button>`;
                } else {
                    actionButton = `
                        <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                            <span>Unlock ${item.cost}</span> <span class="text-lg">&#129689;</span>
                        </button>
                    `;
                }
            }

            // Updated image rendering container to ensure proper masking of the new profile pictures
            html += `
                <div class="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col justify-between transition-all hover:border-indigo-400 dark:hover:border-indigo-400 hover:-translate-y-1 shadow-sm ${item.glow}">
                    <div>
                        <div class="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-300 dark:border-white/5 shadow-inner overflow-hidden">
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

    async buyItem(category, itemId) {
        const me = appStore.get('me');
        const item = this.catalog[category].find(i => i.id === itemId);

        if (!me || !item) return;

        if (me.coins < item.cost) {
            if (window.toast) window.toast(`Not enough coins! You need ${item.cost - me.coins} more.`, false);
            if (window.sfx) window.sfx.play('wrong'); 
            
            // UX Feedback: Shake the coin counter to show they are broke!
            const coinEl = document.getElementById('shop-coins');
            if (coinEl) {
                coinEl.classList.add('text-rose-500', 'animate-pulse');
                setTimeout(() => coinEl.classList.remove('text-rose-500', 'animate-pulse'), 1000);
            }
            return;
        }

        try {
            me.coins -= item.cost;
            me.inventory = me.inventory || {};
            
            if (category === 'consumables') {
                me.inventory[itemId] = (me.inventory[itemId] || 0) + 1;
            } else {
                me.inventory[itemId] = true; 
            }
            
            if (window.firebaseRef && window.firebaseSet && window.firebaseDB) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}`);
                await window.firebaseSet(userRef, me);
            }

            appStore.set('me', me);

            if (window.toast) window.toast(`Successfully purchased ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');

            const shopCoinsEl = document.getElementById('shop-coins');
            if (shopCoinsEl) shopCoinsEl.innerText = me.coins;
            
            this.renderItems(); 
            
            if (window.dashboardController) window.dashboardController.renderDashboard();

        } catch (error) {
            console.error("Purchase failed: ", error);
            if (window.toast) window.toast("Transaction error. Connection lost.", false);
        }
    },

    async equipItem(category, itemId) {
        const me = appStore.get('me');
        const item = this.catalog[category].find(i => i.id === itemId);

        if (!me || !item || !me.inventory[itemId]) return;

        try {
            me.equipped = me.equipped || {};
            
            // Handle Avatars directly modifying the root profile picture
            if (item.equipType === 'avatar') {
                me.avatar = item.equipValue;
            } else {
                me.equipped[item.equipType] = item.equipValue;
                // Keep border synced at root level for Scoreboard backwards compatibility
                if(item.equipType === 'border') {
                    me.border = item.equipValue;
                }
            }

            if (window.firebaseRef && window.firebaseSet && window.firebaseDB) {
                const userRef = window.firebaseRef(window.firebaseDB, `users/${me.uid}`);
                await window.firebaseSet(userRef, me);
            }

            appStore.set('me', me);

            if (window.toast) window.toast(`Equipped ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            
            this.renderItems(); 
            if (window.dashboardController) window.dashboardController.renderDashboard();
            if (window.uiManager) window.uiManager.updateStudentHUD();

        } catch (error) {
            console.error("Equip failed: ", error);
        }
    }
};

window.shopController = shopController;