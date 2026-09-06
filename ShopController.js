// ShopController.js
// Manages the completely overhauled RPG-Style Tabbed Item Store.

import { appStore } from './store.js';

// 🔥 DUPLICATION NOTE: same helper as in LifelineController.js and
// GameController.js — see the comment there recommending this be
// extracted into one shared module. Kept local so this file stays
// self-contained for this review batch.
async function persistPlayerFields(me, fields) {
    if (!window.pb) {
        console.error("PocketBase client (window.pb) not found — purchase/equip not persisted.");
        return;
    }
    if (!me?.playerId) {
        console.warn("No playerId on `me` — skipping remote sync (host test session?).");
        return;
    }
    await window.pb.collection('players').update(me.playerId, fields); // caller handles try/catch — see buyItem/equipItem for rollback logic
}

export const shopController = {
    currentTab: 'consumables', 
    _busy: false, // 🔥 see buyItem()/equipItem() — guards against double-submit races

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
        // 🔥 IMPORTANT: `equipValue` for these is a full inline SVG data URI,
        // NOT a filename. See equipItem() below for why these must never
        // be written to `me.avatar` directly.
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

        // (Already correct — this builds a plain local string with `+=`
        // in a loop, then assigns to `container.innerHTML` ONCE at the
        // end. That's different from the `element.innerHTML += ...`
        // anti-pattern fixed elsewhere in this codebase — that pattern
        // re-parses live DOM on every iteration; a local string variable
        // does not. No change needed here.)
        let html = '';

        items.forEach(item => {
            const isConsumable = this.currentTab === 'consumables';
            const hasPurchased = me.inventory[item.id] > 0 || me.inventory[item.id] === true;
            
            // 🔥 FIX: was `me.avatar === item.equipValue` — now checks
            // `me.equipped?.avatar`, matching equipItem()'s corrected
            // storage location (see the comment there for why `me.avatar`
            // itself can't hold this value).
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
                        <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                            <span>Unlock ${item.cost}</span> <span class="text-lg">&#129689;</span>
                        </button>
                    `;
                }
            }

            html += `
                <div class="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col justify-between transition-all hover:border-indigo-400 dark:hover:border-indigo-400 hover:-translate-y-1 shadow-sm ${item.glow}">
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

    async buyItem(category, itemId) {
        // 🔥 FIX: no guard existed against a rapid double-click. The old
        // code mutated the local `me` clone and only called
        // `appStore.set('me', me)` AFTER an awaited network call — so a
        // second click firing before that await resolved would read the
        // STILL-STALE pre-purchase coin balance from appStore, letting a
        // student double-spend (buy two items whose combined cost exceeds
        // their actual balance). This flag closes that window regardless
        // of timing.
        if (this._busy) return;

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item) return;

        if (me.coins < item.cost) {
            if (window.toast) window.toast(`Not enough coins! You need ${item.cost - me.coins} more.`, false);
            if (window.sfx) window.sfx.play('wrong'); 
            
            // 🔥 UX Feedback: Shake the coin counter to show they are broke!
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

        // 🔥 FIX: apply the local/optimistic update FIRST (this is what
        // actually closes the double-click race described above), then
        // persist. If the persist fails, roll the optimistic update back
        // below instead of leaving local and remote state disagreeing.
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
        if (this._busy) return; // same double-submit guard as buyItem()

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item || !me.inventory[itemId]) return;

        this._busy = true;
        const previousEquipped = { ...me.equipped };
        const previousAvatar = me.avatar;
        const previousBorder = me.border;

        me.equipped = me.equipped || {};

        // 🔥 FIX (the most important bug in this file): the old code did
        // `me.avatar = item.equipValue` for shop avatars — but
        // `item.equipValue` here is a full inline SVG DATA URI, while
        // `me.avatar` is contractually a bare filename everywhere else in
        // this app (getAvatarUrl() in store.js builds
        // `/public/avatars/${me.avatar}` from it). Writing a data URI into
        // that field would produce a nonsense broken path
        // (`/public/avatars/data:image/svg+xml,...`) the instant a
        // student equips ANY shop avatar, breaking their avatar on the
        // HUD, scoreboard, and leaderboard everywhere it's rendered.
        // Storing it under `me.equipped.avatar` instead — the same
        // pattern already used for border/title — keeps the two avatar
        // systems (uploaded-photo filename vs. shop cosmetic overlay)
        // separate. IMPORTANT FOLLOW-UP: UIController.js's avatar
        // rendering (HUD/scoreboard/leaderboard) needs a matching
        // read-side change to check `me.equipped?.avatar` first and fall
        // back to `getAvatarUrl(me.avatar)` — otherwise a purchased
        // avatar will now save correctly but still not be visible
        // anywhere. Flagging for whenever that file comes back around.
        if (item.equipType === 'avatar') {
            me.equipped.avatar = item.equipValue;
        } else {
            me.equipped[item.equipType] = item.equipValue;
            // Keep border synced at root level too — confirmed necessary:
            // UIController.js's HUD/scoreboard read `me.border`/`p.border`
            // directly (root field), not `me.equipped.border`, so this
            // sync is correct and needed, unlike the avatar case above
            // where the root field has an incompatible, unrelated meaning.
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
            
            if (window.dashboardController) window.dashboardController.renderDashboard();
            if (window.uiManager) window.uiManager.updateStudentHUD();

        } catch (error) {
            // 🔥 FIX: the old catch block only logged to console — a
            // failed equip silently desynced local vs. remote state with
            // zero feedback to the student. Now rolls back and tells them.
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

window.shopController = shopController;