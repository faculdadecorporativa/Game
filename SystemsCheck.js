// 🏗️ SystemsCheck.js
// Final diagnostic utility to verify the integrity of the application environment.

export const systemsCheck = {
    run() {
        console.log("%c🚀 Final System Health Check Initiated", "color: #4f46e5; font-size: 16px; font-weight: bold; padding: 4px;");
        
        // Defining the requirements for a healthy RPG & Sync Architecture
        const checks = [
            { name: "Firebase (Database)", condition: !!window.firebaseDB },
            { name: "Firebase (Auth)", condition: !!window.firebaseAuth },
            { name: "AppStore (State Vault)", condition: !!window.appStore },
            { name: "Admin Controller (Host UI)", condition: !!window.adminUI },
            { name: "Game Engine (Core Loops)", condition: !!window.game },
            { name: "UI Controller (Glassmorphism)", condition: !!window.uiManager },
            { name: "Dashboard Controller (RPG Stats)", condition: !!window.dashboardController },
            { name: "Shop Controller (Premium Store)", condition: !!window.shopController },
            { name: "Sync Manager (Realtime Mirrors)", condition: !!window.syncManager }
        ];

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