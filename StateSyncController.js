// 🏗️ StateSyncController.js

import { appStore } from './store.js';

export const syncManager = {
    // Start this immediately after a successful student login
    startMirroring(userId) {
        if (!window.firebaseDB || !window.firebaseOnValue || !window.firebaseRef) {
            console.error("Firebase bindings not found on window object.");
            return;
        }

        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);

        // Listen for ANY changes to this user's data in the database
        window.firebaseOnValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const remoteData = snapshot.val();
                
                // 1. Enforce appStore as the single source of truth
                appStore.set('me', remoteData);

                // 2. Reactively update the UIs with the fresh data
                this.triggerUIUpdates(remoteData);
            }
        });
    },

    triggerUIUpdates(data) {
        // Update Student Dashboard if the controller exists
        if (window.dashboardController) {
            window.dashboardController.renderDashboard();
        }

        // Update In-Game HUD (streak, coins, etc.) if the game is active
        if (window.uiManager && typeof window.uiManager.updateStudentHUD === 'function') {
            window.uiManager.updateStudentHUD();
        }

        // Update Gamified Shop coin balance if the modal is currently open
        const shopCoinsEl = document.getElementById('shop-coins');
        if (shopCoinsEl) {
            shopCoinsEl.innerText = data.coins || 0;
        }
        
        // Update Lifeline buttons dynamically if inventory counts hit 0
        if (window.lifelineManager) {
            window.lifelineManager.renderButtons(appStore.get('currentModule'));
        }
    }
};

// Bind to Global Service Layer
window.syncManager = syncManager;