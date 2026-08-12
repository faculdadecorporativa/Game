// ModuleFour.js
// Web Component for the Tic-Tac-Toe Module

export class ModuleFour extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 4 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Tic-Tac-Toe Showdown</h2>
            
            <div id="lifeline-mount-4"></div>
            
            <!-- 🔥 Increased max-w to 2xl to comfortably fit massive 4x4 grids 🔥 -->
            <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-6 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative overflow-hidden transition-all duration-300 w-full max-w-2xl mx-auto">
                
                <div id="ttt-matchup-header" class="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-white/5 mb-6 shadow-sm">
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">Player X</span>
                        <span id="ttt-player-x" class="font-black text-lg text-slate-800 dark:text-white truncate w-full text-center">Waiting...</span>
                    </div>
                    <div class="text-3xl font-black text-slate-300 dark:text-slate-600 italic px-2">VS</div>
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">Player O</span>
                        <span id="ttt-player-o" class="font-black text-lg text-slate-800 dark:text-white truncate w-full text-center">Waiting...</span>
                    </div>
                </div>

                <div id="ttt-status" class="text-center font-black text-xl text-indigo-600 dark:text-indigo-400 mb-6 animate-pulse uppercase tracking-widest">
                    Waiting for Matchmaking...
                </div>

                <!-- 🔥 Dynamic Tic-Tac-Toe Grid Container 🔥 -->
                <div id="ttt-board" class="w-full relative z-10 pointer-events-none opacity-50 transition-all duration-300">
                    <!-- UIController.js will dynamically inject the grid structure (2x2, 3x3, or 4x4) here -->
                </div>

                <div id="ttt-question-overlay" class="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 hidden opacity-0 transition-opacity duration-300 rounded-3xl">
                    <h3 id="ttt-q-text" class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center leading-tight">Question goes here?</h3>
                    <div id="ttt-options" class="w-full space-y-3">
                        <!-- Options injected dynamically -->
                    </div>
                </div>

            </div>
        `;
    }
}

customElements.define('module-four', ModuleFour);