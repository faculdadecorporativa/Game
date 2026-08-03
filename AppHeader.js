// AppHeader.js
// 🏗️ Web Component for the App Header (HUD Email set to Bold White)

export class AppHeader extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 FORCE HUD TEXT TO BOLD WHITE 🔥 */
                /* This intercepts the injected yellow text in the top right profile badge */
                #player-hud-container * {
                    color: #ffffff !important;
                    font-weight: 700 !important;
                }
            </style>

            <!-- 🧊 Cupertino Frosted Glass Header / Scoreboard -->
            <header class="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl text-slate-800 dark:text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-slate-200/50 dark:border-white/10 sticky top-0 z-40 transition-colors duration-300" id="main-header">
                <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <button onclick="app.exitToHome()" id="btn-exit-home" class="flex items-center justify-center w-10 h-10 text-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm" title="Exit to Home">⬅️</button>
                        <h1 class="text-xl font-bold tracking-tight hidden sm:block">E-Learning Platform <span id="room-code-display" class="ml-2 text-indigo-800 dark:text-white font-bold font-mono hidden transition-colors duration-300"></span></h1>
                    </div>
                    
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <div id="game-status" class="hidden flex items-center space-x-4 sm:space-x-6">
                            <!-- Dynamic Global Timer (Frosted Glass) -->
                            <div id="global-timer-container" class="hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-300/50 dark:border-white/20 px-4 py-1 rounded-full flex items-center justify-center min-w-[80px] shadow-inner transition-all duration-300">
                                <span class="font-mono font-black text-2xl text-slate-800 dark:text-white transition-colors duration-300" id="global-timer">60</span><span id="global-timer-sec" class="text-sm ml-1 font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">s</span>
                            </div>
                            <!-- Player/Host HUD -->
                            <div id="player-hud-container"></div>
                        </div>
                        
                        <!-- 🌞/🌙 Light/Dark Mode Toggle Switch -->
                        <button onclick="document.documentElement.classList.toggle('dark');" class="flex items-center justify-center w-10 h-10 text-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm" title="Toggle Theme">
                            <span class="block dark:hidden">🌙</span>
                            <span class="hidden dark:block">☀️</span>
                        </button>
                    </div>
                </div>
                
                <div id="scoreboard-container" class="hidden bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200/50 dark:border-white/10 text-sm transition-colors duration-300">
                    <div class="max-w-6xl mx-auto px-4 py-2 flex gap-4 overflow-x-auto custom-scrollbar" id="scoreboard-list"></div>
                </div>
            </header>
        `;
    }
}

customElements.define('app-header', AppHeader);