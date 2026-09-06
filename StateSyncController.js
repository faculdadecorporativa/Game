// 🏗️ StateSyncController.js
// Handles real-time listening to PocketBase and ensuring the local appStore is always accurate.
//
// ASSUMPTIONS (adjust to match your actual PocketBase schema):
//   - A PocketBase client instance is available globally as `window.pb`
//     (mirrors how the old code expected `window.firebaseDB` etc.)
//   - Collection: `users`, with the student's profile fields living
//     directly on the record (name, avatar, coins, xp, scores, lifelines,
//     inventory, equipped, streak, maxStreak — same shape as `me` in store.js)

import { appStore, DEFAULT_AVATAR } from './store.js';

// PocketBase record objects carry metadata fields (id, collectionId,
// collectionName, created, updated, expand) that do NOT belong in the
// app's `me` shape. Merging the raw record straight into `me` — like the
// old Firebase code did with `remoteData` — would silently pollute local
// state with those fields. Strip them out before merging.
function sanitizeUserRecord(record) {
    const { id, collectionId, collectionName, created, updated, expand, ...profileFields } = record;
    return profileFields;
}

export const syncManager = {
    _unsubscribe: null,

    // Should be called immediately after a successful student login
    async startMirroring(userId) {
        if (!window.pb) {
            console.error("PocketBase client (window.pb) not found.");
            return;
        }

        // Clean up any previous subscription before starting a new one —
        // otherwise re-logging in (or hot-reloading) stacks up duplicate
        // listeners that each fire on every future update.
        this.stopMirroring();

        try {
            // 🔥 FIX: `pb.collection(...).subscribe()` only pushes events on
            // FUTURE changes — unlike Firebase's onValue, it does NOT emit
            // the current value immediately. The old code relied on onValue
            // firing once with the existing snapshot; without an initial
            // fetch here, the UI would show stale/default data until the
            // very first remote write happened.
            const initialRecord = await window.pb.collection('users').getOne(userId);
            this._applyRemoteUser(initialRecord);

            this._unsubscribe = await window.pb.collection('users').subscribe(userId, (e) => {
                if (e.record) this._applyRemoteUser(e.record);
            });
        } catch (err) {
            console.error("Failed to start PocketBase mirroring for user:", userId, err);
        }
    },

    // Call this on logout / room exit so the subscription doesn't keep
    // firing (and holding a closure over stale UI) after the user leaves.
    stopMirroring() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    },

    _applyRemoteUser(record) {
        const remoteData = sanitizeUserRecord(record);

        // 🔥 FIX: fall back to a default avatar filename instead of storing
        // undefined/null/'' — every screen that renders `me.avatar` used to
        // need its own fallback check.
        if (!remoteData.avatar || !remoteData.avatar.trim()) {
            remoteData.avatar = DEFAULT_AVATAR;
        }

        // 1. Enforce appStore as the single source of truth
        appStore.set('me', remoteData);

        // 2. Reactively update the UIs with the fresh data
        this.triggerUIUpdates(remoteData);
    },

    triggerUIUpdates(data) {
        try {
            // Update Student Dashboard if the controller exists
            if (window.dashboardController && typeof window.dashboardController.renderDashboard === 'function') {
                window.dashboardController.renderDashboard();
            }

            // Update In-Game HUD (streak, coins, etc.) if the game is active
            // NOTE: if updateStudentHUD() already writes #shop-coins, the
            // direct DOM write below is redundant — see the audit summary.
            if (window.uiManager && typeof window.uiManager.updateStudentHUD === 'function') {
                window.uiManager.updateStudentHUD();
            }

            // Update Gamified Shop coin balance if the modal is currently open
            const shopCoinsEl = document.getElementById('shop-coins');
            if (shopCoinsEl) {
                shopCoinsEl.innerText = data.coins || 0;
            }

            // Update Lifeline buttons dynamically if inventory counts hit 0
            if (window.lifelineManager && typeof window.lifelineManager.renderButtons === 'function') {
                const currentMod = appStore.get('currentModule');
                if (currentMod) {
                    window.lifelineManager.renderButtons(currentMod);
                }
            }
        } catch (err) {
            console.warn("Non-critical error during reactive UI synchronization:", err);
        }
    }
};

// Bind to Global Service Layer
window.syncManager = syncManager;