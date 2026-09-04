// 🏗️ SystemsCheck.js
// Final diagnostic utility to verify the integrity of the application environment.

import { appStore } from './store.js';

export const systemsCheck = {
    run() {
        console.log("%c🚀 Final System Health Check Initiated", "color: #4f46e5; font-size: 16px; font-weight: bold; padding: 4px;");

        // Defining the requirements for a healthy RPG & Sync Architecture
        const checks = [
            // 🔥 FIX: was checking `window.firebaseDB` / `window.firebaseAuth`
            // — globals that no longer exist anywhere in this codebase since
            // the migration to PocketBase. This meant these two checks
            // FAILED ON EVERY SINGLE RUN, even on a perfectly healthy app,
            // which in turn meant `allPassed` could never be true and the
            // "Systems Check Complete" success banner could never print.
            // A health check that can never pass is worse than no health
            // check — it trains you to ignore its output. PocketBase bundles
            // both database and auth behind one client, so this now checks
            // the client itself plus its authStore.
            { name: "PocketBase Client (Database)", condition: !!window.pb },
            { name: "PocketBase Auth Store", condition: !!window.pb?.authStore },

            // 🔥 FIX: was `!!window.appStore` — store.js never assigns
            // `window.appStore = appStore` anywhere (unlike syncManager,
            // app, and pb, which all bind themselves to window). This check
            // was ALSO guaranteed to fail every run for the same reason as
            // the Firebase ones above. Importing the module directly here
            // sidesteps the missing global entirely and is a more accurate
            // test — checking for the get/set methods (rather than just
            // truthiness of the import, which would always be true) at
            // least confirms the Store instance is shaped as expected.
            // RECOMMENDATION: also add `window.appStore = appStore;` to the
            // bottom of store.js so it's inspectable from the browser
            // console like `pb`, `app`, and `syncManager` already are.
            { name: "AppStore (State Vault)", condition: !!appStore && typeof appStore.get === 'function' && typeof appStore.set === 'function' },

            { name: "Admin Controller (Host UI)", condition: !!window.adminUI },
            { name: "Game Engine (Core Loops)", condition: !!window.game },
            { name: "UI Controller (Glassmorphism)", condition: !!window.uiManager },
            { name: "Dashboard Controller (RPG Stats)", condition: !!window.dashboardController },
            { name: "Shop Controller (Premium Store)", condition: !!window.shopController },
            { name: "Sync Manager (Realtime Mirrors)", condition: !!window.syncManager },

            // 🔥 ADDED: network.js's `app` object (room hosting/joining,
            // real-time PocketBase subscriptions) is the most complex piece
            // of the whole multiplayer layer, and it wasn't being checked
            // at all. It's confirmed bound as `window.app` (see the bottom
            // of network.js), so this is a meaningful, low-risk addition.
            { name: "Network Controller (Rooms & Realtime Sync)", condition: !!window.app }
        ];

        // NOTE: "Admin Controller", "Game Engine", "UI Controller",
        // "Dashboard Controller", and "Shop Controller" all check
        // `window.X` globals that were NOT found being assigned in any of
        // the files reviewed so far in this series (GameController.js
        // exports `game` but never does `window.game = game`; same for
        // uiManager in UIController.js). They're left as-is since your
        // main bootstrap/entry file — which wasn't part of this review
        // batch — may well set them. Worth double-checking that file
        // assigns each of these to `window` the same way network.js does
        // for `window.app`, or these checks will silently false-negative
        // just like the Firebase/appStore ones did.

        let allPassed = true;

        checks.forEach(check => {
            if (check.condition) {
                console.log(`%c✅ [OK] %c${check.name}`, "color: #10b981; font-weight: bold;", "color: inherit;");
            } else {
                console.log(`%c❌ [ERROR] %c${check.name} missing or undefined.`, "color: #f43f5e; font-weight: bold;", "color: inherit;");
                allPassed = false;
            }
        });

        if (allPassed) {
            console.log("%c🏁 Systems Check Complete: Phase 6 Architecture is completely valid and ready for launch.", "color: #4f46e5; font-weight: bold; background: #e0e7ff; padding: 4px; border-radius: 4px;");
        } else {
            console.warn("%c⚠️ Systems Check Failed: One or more critical modules did not load.", "color: #f59e0b; font-weight: bold; background: #fef3c7; padding: 4px; border-radius: 4px;");
        }
    }
};