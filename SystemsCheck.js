// 🏗️ SystemsCheck.js
// Final diagnostic utility to verify the integrity of the application environment.

export const systemsCheck = {
    run() {
        console.group("🚀 Final System Health Check");
        
        // Defining the requirements for a healthy app
        const checks = [
            { name: "Firebase (Database)", condition: !!window.firebaseDB },
            { name: "Firebase (Auth)", condition: !!window.firebaseAuth },
            { name: "EmailJS SDK", condition: typeof emailjs !== 'undefined' },
            { name: "AppStore (Vault)", condition: !!window.appStore },
            { name: "Admin Controller", condition: !!window.adminUI },
            { name: "Web Components (Header)", condition: !!document.querySelector('app-header') },
            { name: "Game Engine", condition: !!window.game }
        ];

        let allPassed = true;

        checks.forEach(check => {
            if (check.condition) {
                console.log(`✅ [OK] ${check.name} verified.`);
            } else {
                console.error(`❌ [ERROR] ${check.name} missing or undefined.`);
                allPassed = false;
            }
        });
        
        if (allPassed) {
            console.log("🏁 Systems Check Complete: Architecture is valid.");
        } else {
            console.warn("⚠️ Systems Check Complete: One or more modules are missing.");
        }
        
        console.groupEnd();
    }
};