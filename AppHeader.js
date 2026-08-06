// AppHeader.js
// 🏗️ Web Component for the App Header (Strict Dual-Mode Framework)

export class AppHeader extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* =========================================================
                   HUD TEXT & BADGE: DUAL-MODE UI CONTRAST FIXES
                   ========================================================= */
                
                /* Light Mode: Force HUD text to crisp dark slate */
                #player-hud-container * {
                    color: #1e293b !important; /* slate-800 */
                    font-weight: 700 !important;
                }
                
                /* Light Mode: Force injected HUD badge background to light indigo */
                #player-hud-container > div,
                #player-hud-container [class*="bg-"] {
                    background-color: #e0e7ff !important; /* indigo-100 */
                    border-color: #c7d2fe !important; /* indigo-200 */
                    border-width: 1px !important;
                    border-style: solid !important;
                }
                
                /* Dark Mode: Force HUD text to pure white */
                .dark #player-hud-container * {
                    color: #ffffff !important;
                }
                
                /* Dark Mode: Maintain premium dark glass badge */
                .dark #player-hud-container > div,
                .dark #player-hud-container [class*="bg-"] {
                    background-color: rgba(30, 30, 40, 0.6) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
            </style>

            <!-- MAIN HEADER: Solid White & Shadow in Light Mode (No Border), Glass in Dark Mode -->
            <header class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl text-slate-800 dark:text-slate-100 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:border-b dark:border-white/10 sticky top-0 z-40 transition-all duration-300" id="main-header">
                <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <button onclick="app.exitToHome()" id="btn-exit-home" class="flex items-center justify-center w-10 h-10 text-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm" title="Exit to Home">⬅️</button>
                        <!-- 🔥 NEW: My Dashboard Button -->
                        <button onclick="window.dashboardController.openDashboard()" id="btn-dashboard" class="flex items-center justify-center w-10 h-10 text-xl bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 border border-indigo-200 dark:border-indigo-500/30 rounded-full transition-all duration-300 shadow-sm" title="My Dashboard">📊</button>
                        <h1 class="text-xl font-bold tracking-tight hidden sm:block">E-Learning Platform <span id="room-code-display" class="ml-2 text-indigo-700 dark:text-white font-bold font-mono hidden transition-colors duration-300"></span></h1>
                    </div>
                    
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <div id="game-status" class="hidden flex items-center space-x-4 sm:space-x-6">
                            
                            <!-- Dynamic Global Timer: Solid light gray in Light Mode, Glass in Dark Mode -->
                            <div id="global-timer-container" class="hidden bg-slate-100 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/20 px-4 py-1 rounded-full flex items-center justify-center min-w-[80px] shadow-sm dark:shadow-inner transition-all duration-300">
                                <span class="font-mono font-black text-2xl text-slate-800 dark:text-white transition-colors duration-300" id="global-timer">60</span><span id="global-timer-sec" class="text-sm ml-1 font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">s</span>
                            </div>
                            
                            <!-- Player/Host HUD -->
                            <div id="player-hud-container"></div>
                        </div>
                        
                        <!-- 🌞/🌙 Light/Dark Mode Toggle Switch -->
                        <button onclick="document.documentElement.classList.toggle('dark');" class="flex items-center justify-center w-10 h-10 text-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm" title="Toggle Theme">
                            <span class="block dark:hidden">🌙</span>
                            <span class="hidden dark:block">☀️</span>
                        </button>
                    </div>
                </div>
                
                <!-- SCOREBOARD: Now COMPLETELY transparent so it seamlessly inherits the Header's background! -->
                <div id="scoreboard-container" class="hidden bg-transparent text-sm transition-all duration-300">
                    <div class="max-w-6xl mx-auto px-4 py-2 flex gap-4 overflow-x-auto custom-scrollbar" id="scoreboard-list"></div>
                </div>
            </header>
        `;
    }
}

customElements.define('app-header', AppHeader);