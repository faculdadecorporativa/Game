// ShopController.js
// Manages the completely overhauled RPG-Style Tabbed Item Store.

import { appStore } from './store.js';

// 🔥 DUPLICATION NOTE: same helper as in LifelineController.js and
// GameController.js — see the comment there recommending this be
// extracted into one shared module.
async function persistPlayerFields(me, fields) {
    if (!window.pb) {
        console.error("PocketBase client (window.pb) not found — purchase/equip not persisted.");
        return;
    }
    if (!me?.playerId) {
        console.warn("No playerId on `me` — skipping remote sync (host test session?).");
        return;
    }
    await window.pb.collection('players').update(me.playerId, fields); 
}

export const shopController = {
    currentTab: 'consumables', 
    _busy: false, 

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
            { id: 'avatarNinja', name: "Shadow Ninja", cost: 300, icon: "&#129399;", desc: "A silent but deadly learner. Perfect for stealthy points.", equipType: 'avatar', equipValue: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A5%B7%3C/text%3E%3C/svg%3E", glow: "shadow-[0_0_15px_rgba(71,85,105,0.3)]" },
            { id: 'avatarRobot', name: "Cyber Bot", cost: 400, icon: "&#129302;", desc: "Automate your success with this high-tech robot avatar.", equipType: 'avatar', equipValue: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A4%96%3C/text%3E%3C/svg%3E", glow: "shadow-[0_0_15px_rgba(14,165,233,0.3)]" },
            { id: 'avatarWizard', name: "Grand Wizard", cost: 600, icon: "&#129497;", desc: "Master the arcane arts of grammar and vocabulary.", equipType: 'avatar', equipValue: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A7%99%3C/text%3E%3C/svg%3E", glow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]" },
            { id: 'avatarAstro', name: "Deep Space", cost: 800, icon: "&#128640;", desc: "Take your learning journey to the absolute stars.", equipType: 'avatar', equipValue: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%91%A8%E2%80%8D%F0%9F%9A%80%3C/text%3E%3C/svg%3E", glow: "shadow-[0_0_15px_rgba(244,114,182,0.3)]" }
        ]
    },

    openShop() {
        const shopMod = document.getElementById('module-shop');
        if (!shopMod) {
            console.error("Shop module not found in the DOM.");
            return;
        }

        const activeModules = document.querySelectorAll('main > *:not(.hidden)');
        activeModules.forEach(mod => {
            if (mod.id !== 'module-shop' && mod.id !== 'lifelines-panel') {
                mod.classList.add('hidden');
                mod.classList.remove('fade-in');
            }
        });

        shopMod.classList.remove('hidden');
        shopMod.classList.add('fade-in');

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
                // Integrated Amber gold style for active tabs
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400 transition-all transform hover:-translate-y-1`;
            } else {
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl transition-all transform hover:-translate-y-1 border border-transparent`;
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
            
            const isEquipped = item.equipType === 'avatar' 
                ? me.equipped?.avatar === item.equipValue 
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
                        <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border border-amber-700 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                            <span>Unlock ${item.cost}</span> <span class="text-lg">&#129689;</span>
                        </button>
                    `;
                }
            }

            // Integrated enlarged avatars, gold hover styles, and preview triggers
            html += `
                <div class="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col justify-between transition-all hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:-translate-y-1 shadow-sm ${item.glow}">
                    <div>
                        <div class="w-28 h-28 mx-auto bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-5xl mb-4 border border-slate-300 dark:border-white/5 shadow-inner overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 avatar-preview-trigger">
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
        if (this._busy) return; 

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item) return;

        if (me.coins < item.cost) {
            if (window.toast) window.toast(`Not enough coins! You need ${item.cost - me.coins} more.`, false);
            if (window.sfx) window.sfx.play('wrong'); 
            
            const coinEl = document.getElementById('shop-coins');
            if (coinEl) {
                coinEl.classList.add('text-rose-500', 'animate-pulse');
                setTimeout(() => coinEl.classList.remove('text-rose-500', 'animate-pulse'), 1000);
            }
            return;
        }

        this._busy = true;
        const previousCoins = me.coins;
        const previousInventory = { ...me.inventory };

        me.coins -= item.cost;
        me.inventory = me.inventory || {};
        if (category === 'consumables') {
            me.inventory[itemId] = (me.inventory[itemId] || 0) + 1;
        } else {
            me.inventory[itemId] = true; 
        }

        appStore.set('me', me);
        this.renderItems();
        const shopCoinsEl = document.getElementById('shop-coins');
        if (shopCoinsEl) shopCoinsEl.innerText = me.coins;

        try {
            await persistPlayerFields(me, { coins: me.coins, inventory: me.inventory });

            if (window.toast) window.toast(`Successfully purchased ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            if (window.dashboardController) window.dashboardController.renderDashboard();

        } catch (error) {
            console.error("Purchase failed, rolling back local state: ", error);
            const rolledBack = appStore.get('me');
            rolledBack.coins = previousCoins;
            rolledBack.inventory = previousInventory;
            appStore.set('me', rolledBack);
            this.renderItems();
            if (shopCoinsEl) shopCoinsEl.innerText = rolledBack.coins;
            if (window.toast) window.toast("Purchase failed — your coins were not spent. Check your connection.", false);
        } finally {
            this._busy = false;
        }
    },

    async equipItem(category, itemId) {
        if (this._busy) return; 

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item || !me.inventory[itemId]) return;

        this._busy = true;
        const previousEquipped = { ...me.equipped };
        const previousAvatar = me.avatar;
        const previousBorder = me.border;

        me.equipped = me.equipped || {};

        if (item.equipType === 'avatar') {
            me.equipped.avatar = item.equipValue;
        } else {
            me.equipped[item.equipType] = item.equipValue;
            if(item.equipType === 'border') {
                me.border = item.equipValue;
            }
        }

        appStore.set('me', me);
        this.renderItems();

        try {
            const fieldsToSync = { equipped: me.equipped };
            if (item.equipType === 'border') fieldsToSync.border = me.border;
            await persistPlayerFields(me, fieldsToSync);

            if (window.toast) window.toast(`Equipped ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            
            // Integrated Confetti Check
            if (window.startConfetti) window.startConfetti();
            
            if (window.dashboardController) window.dashboardController.renderDashboard();
            if (window.uiManager) window.uiManager.updateStudentHUD();

        } catch (error) {
            console.error("Equip failed, rolling back local state: ", error);
            const rolledBack = appStore.get('me');
            rolledBack.equipped = previousEquipped;
            rolledBack.avatar = previousAvatar;
            rolledBack.border = previousBorder;
            appStore.set('me', rolledBack);
            this.renderItems();
            if (window.toast) window.toast("Couldn't equip that — check your connection and try again.", false);
        } finally {
            this._busy = false;
        }
    }
};

// Global Event Listener for Lightbox Modal
document.addEventListener('click', (event) => {
    const previewTrigger = event.target.closest('.avatar-preview-trigger');
    
    // Open Modal
    if (previewTrigger) {
        const card = previewTrigger.closest('.bg-white, .dark\\:bg-slate-800\\/80');
        const modal = document.getElementById('avatar-preview-modal');
        if (!modal || !card) return;
        
        const name = card.querySelector('h4')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        const btnText = card.querySelector('button')?.textContent.trim() || '';

        // Safely extract the inner content (works for images, SVGs, or emoji text)
        const iconContainerHTML = previewTrigger.innerHTML;
        const modalImg = document.getElementById('preview-modal-img');
        
        if (modalImg) {
            // Because the catalog mixes SVGs/Emojis natively in the HTML, we inject it dynamically above the title
            modalImg.style.display = 'none'; // Hide default image tag
            let dynamicIcon = document.getElementById('dynamic-modal-icon');
            
            if (!dynamicIcon) {
                dynamicIcon = document.createElement('div');
                dynamicIcon.id = 'dynamic-modal-icon';
                dynamicIcon.className = "w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-slate-900 flex items-center justify-center text-7xl sm:text-8xl rounded-full border-4 border-amber-500 shadow-[0_0_25px_rgba(217,119,6,0.3)] mb-4 overflow-hidden";
                modalImg.parentNode.insertBefore(dynamicIcon, modalImg);
            }
            dynamicIcon.innerHTML = iconContainerHTML;
        }
        
        document.getElementById('preview-modal-name').textContent = name;
        document.getElementById('preview-modal-desc').textContent = desc;
        document.getElementById('preview-modal-cost').textContent = btnText.includes('EQUIP') ? 'Already Owned' : btnText;

        modal.classList.remove('hidden');
        setTimeout(() => {
            const modalCard = document.getElementById('modal-card');
            if(modalCard) {
                modalCard.classList.remove('scale-95');
                modalCard.classList.add('scale-100');
            }
        }, 10);
    }

    // Close Modal
    if (event.target.id === 'avatar-preview-modal' || event.target.id === 'close-modal-btn') {
        const modal = document.getElementById('avatar-preview-modal');
        const modalCard = document.getElementById('modal-card');
        if(modalCard) modalCard.classList.replace('scale-100', 'scale-95');
        setTimeout(() => modal?.classList.add('hidden'), 150);
    }
});

window.shopController = shopController;