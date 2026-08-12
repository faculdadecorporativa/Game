// ModuleTwelve.js
// 🏗️ Web Component for the Final Results / Leaderboard Module

export class ModuleTwelve extends HTMLElement {
    
    connectedCallback() {
        this.render();
        
        // Smart Routing: Wait a tiny bit for the global state to be ready
        setTimeout(() => {
            const btn = this.querySelector('#btn-return-routing');
            if (window.appStore && window.appStore.get('role') === 'host') {
                btn.innerHTML = "Return to Control Center ⚙️";
                btn.onclick = () => { 
                    if(window.adminUI) window.adminUI.exitToLobby(); 
                    else window.location.reload(); 
                };
            } else {
                btn.innerHTML = "Return to Dashboard ➔";
                btn.onclick = () => { 
                    if(window.dashboardController) window.dashboardController.openDashboard(); 
                    else window.location.reload(); 
                };
            }
        }, 100);
    }

    render() {
        this.innerHTML = `
            <div class="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/80 backdrop-blur-3xl p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-yellow-400 dark:border-yellow-500/50 relative overflow-hidden transition-colors duration-300">
                
                <!-- Epic Glowing Ambient Top Border -->
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.6)]"></div>
                <div class="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-[300px] h-[100px] bg-yellow-400/20 blur-[60px] pointer-events-none"></div>

                <h1 class="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-600 to-amber-500 dark:from-yellow-300 dark:to-amber-500 mb-8 transition-colors duration-300 drop-shadow-sm uppercase tracking-tight">Final Leaderboard</h1>
                
                <!-- Team Winner Display -->
                <div class="mb-10 rounded-2xl p-8 text-white border-2 shadow-2xl hidden transition-all duration-500 transform hover:scale-[1.02]" id="final-team-winner">
                    <h2 class="text-xl font-bold tracking-widest text-slate-100 dark:text-white/80 uppercase mb-2 drop-shadow-sm">Team Champions</h2>
                    <p class="text-4xl md:text-5xl font-black drop-shadow-lg" id="final-team-text"></p>
                </div>

                <ul id="final-leaderboard-list" class="space-y-4 mb-8"></ul>
                
                <div id="student-personal-stats" class="bg-slate-50/80 dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hidden text-left mb-8 shadow-inner transition-colors duration-300 backdrop-blur-md">
                    <h3 class="font-black text-indigo-700 dark:text-cyan-400 text-xl mb-6 transition-colors duration-300 tracking-wide">Your Skill Profile</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="student-skill-bars"></div>
                </div>
                
                <!-- 🔥 SMART FIX: Dynamic routing button with glow hover 🔥 -->
                <button id="btn-return-routing" class="w-full bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 border border-transparent text-white font-black tracking-widest uppercase py-5 px-6 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(79,70,229,0.5)] text-lg md:text-xl">
                    <div class="flex items-center justify-center gap-3">
                        <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Loading Route...
                    </div>
                </button>
            </div>
        `;
    }
}

customElements.define('module-twelve', ModuleTwelve);