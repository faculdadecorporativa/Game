// ModuleSeven.js
// 🏗️ Web Component for the Sentence Hangman Module (Cupertino Glass Edition)

export class ModuleSeven extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 Deep Scoped CSS to override dynamically injected Hangman Keyboard */
                
                /* Default Key Style (Dark Glass) */
                #hangman-keyboard button {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    color: #1e293b !important;
                    border-radius: 0.5rem !important;
                    font-weight: 700 !important;
                    transition: all 0.3s ease !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                }
                .dark #hangman-keyboard button {
                    background-color: rgba(30, 30, 40, 0.5) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    color: #ffffff !important;
                }
                
                /* Hover State */
                .dark #hangman-keyboard button:not(:disabled):hover {
                    background-color: rgba(99, 102, 241, 0.3) !important;
                    border-color: rgba(99, 102, 241, 0.6) !important;
                }
                
                /* 🟢 OVERRIDE GREEN: Correct Guess (Change to Indigo) */
                #hangman-keyboard button.bg-green-500,
                #hangman-keyboard button[style*="background-color: rgb(34, 197, 94)"] {
                    background-color: #4f46e5 !important; /* Indigo 600 */
                    border-color: #818cf8 !important; /* Indigo 400 */
                    color: #ffffff !important;
                    opacity: 1 !important;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.4) !important;
                }
                
                /* 🔴 OVERRIDE RED/DISABLED: Incorrect Guess (Change to Recessed Dark Glass) */
                #hangman-keyboard button.bg-red-500,
                #hangman-keyboard button.opacity-50,
                #hangman-keyboard button:disabled {
                    background-color: rgba(0, 0, 0, 0.4) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.2) !important;
                    opacity: 0.8 !important;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 7 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Sentence Hangman</h2>
            
            <div id="lifeline-mount-7"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 flex flex-col items-center relative pb-14 transition-all duration-300">
                <div class="flex flex-col md:flex-row w-full gap-8 items-center mb-8">
                    
                    <!-- Hangman Art Box (Glass) -->
                    <div class="bg-white/50 dark:bg-black/30 p-4 rounded-xl border border-slate-300/50 dark:border-white/10 w-48 h-48 flex items-center justify-center transition-colors duration-300 shadow-inner">
                        <pre id="hangman-art" class="font-mono text-xl font-bold leading-tight text-slate-800 dark:text-slate-200 text-left transition-colors duration-300"></pre>
                    </div>
                    
                    <!-- Word Container (Pure White Text) -->
                    <div class="flex-1 text-center">
                        <div id="hangman-word" class="font-mono text-2xl sm:text-3xl font-black text-indigo-700 dark:text-white tracking-widest flex flex-wrap justify-center gap-y-4 transition-colors duration-300"></div>
                    </div>
                </div>
                
                <!-- Dynamic Keyboard Mount -->
                <div id="hangman-keyboard" class="flex flex-wrap justify-center gap-2 max-w-xl"></div>
                
                <!-- Feedback -->
                <div id="hangman-feedback" class="mt-4 font-bold text-xl absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-seven', ModuleSeven);