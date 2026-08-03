// ModuleTwelve.js
// 🏗️ Web Component for the Final Results / Leaderboard Module

export class ModuleTwelve extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="max-w-4xl mx-auto bg-white dark:bg-slate-900/80 dark:backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-yellow-400 dark:border-yellow-500/50 relative overflow-hidden transition-colors duration-300">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500"></div>
                <h1 class="text-5xl font-black text-slate-800 dark:text-white mb-8 transition-colors duration-300">Final Leaderboard</h1>
                
                <!-- Team Winner Display -->
                <div class="mb-10 rounded-xl p-6 text-white border-2 shadow-xl hidden transition-all duration-300" id="final-team-winner">
                    <h2 class="text-xl font-bold tracking-widest text-slate-400 dark:text-white/70 uppercase mb-2">Team Champions</h2>
                    <p class="text-4xl font-black" id="final-team-text"></p>
                </div>

                <ul id="final-leaderboard-list" class="space-y-4 mb-8"></ul>
                
                <div id="student-personal-stats" class="bg-slate-50 dark:bg-black/20 p-6 rounded-xl border border-slate-200 dark:border-white/10 hidden text-left mb-6 transition-colors duration-300">
                    <h3 class="font-bold text-indigo-700 dark:text-cyan-400 text-xl mb-4 transition-colors duration-300">Your Skill Profile</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="student-skill-bars"></div>
                </div>
                
                <button onclick="app.exitToHome()" class="w-full bg-slate-800 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white/10 dark:border dark:border-white/10 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all duration-300 text-lg">Return Home ↺</button>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-twelve', ModuleTwelve);