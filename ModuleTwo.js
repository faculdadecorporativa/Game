// ModuleTwo.js
// Web Component for the PvP Puzzle Reveal Module

export class ModuleTwo extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- Changed blur-md to nothing, kept scale-105 -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 2 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">PvP Puzzle Race</h2>
            
            <div id="lifeline-mount-2"></div>
            
            <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative overflow-hidden transition-all duration-300 w-full max-w-5xl mx-auto">
                
                <!-- 🔥 PvP Player Header 🔥 -->
                <div id="puzzle-matchup-header" class="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-white/5 mb-6 shadow-sm">
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Player 1</span>
                        <span id="puzzle-player-1" class="font-black text-lg md:text-2xl text-slate-800 dark:text-white truncate w-full text-center">Waiting...</span>
                    </div>
                    <div class="text-3xl md:text-5xl font-black text-slate-300 dark:text-slate-600 italic px-2">VS</div>
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">Player 2</span>
                        <span id="puzzle-player-2" class="font-black text-lg md:text-2xl text-slate-800 dark:text-white truncate w-full text-center">Waiting...</span>
                    </div>
                </div>

                <!-- 🔥 Game Status Indicator 🔥 -->
                <div id="puzzle-status" class="text-center font-black text-xl md:text-2xl text-indigo-600 dark:text-indigo-400 mb-8 animate-pulse uppercase tracking-widest">
                    Waiting for Matchmaking...
                </div>

                <!-- 🔥 Dynamic Puzzle Grid Container 🔥 -->
                <div class="relative w-full aspect-video max-h-[60vh] mx-auto rounded-3xl overflow-hidden border-4 border-slate-300 dark:border-white/20 shadow-2xl bg-slate-200 dark:bg-slate-800">
                    <!-- Background Image (Target Image) -->
                    <div id="puzzle-bg-img" class="absolute inset-0 bg-cover bg-center z-0 transition-all duration-500 scale-105"></div>
                    
                    <!-- Frosted Glass Tiles Overlay (Injected dynamically by UIController) -->
                    <div id="puzzle-board" class="absolute inset-0 z-10 pointer-events-none opacity-50 transition-all duration-300">
                        <!-- UIController.js will inject the exact number of grid cells here (4, 9, or 16) -->
                    </div>
                </div>

                <!-- 🔥 Pop-Up Question Overlay 🔥 -->
                <div id="puzzle-question-overlay" class="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-6 md:p-12 hidden opacity-0 transition-opacity duration-300 rounded-3xl">
                    <h3 id="puzzle-q-text" class="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center leading-tight">Question goes here?</h3>
                    <div id="puzzle-options" class="w-full max-w-2xl space-y-4 grid grid-cols-1 gap-4">
                        <!-- Options injected by UIController.js -->
                    </div>
                </div>

            </div>
        `;
    }
}

customElements.define('module-two', ModuleTwo);