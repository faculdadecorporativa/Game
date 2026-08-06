// ModuleSeven.js
// 🏗️ Web Component for the Sentence Hangman Module (Strict Dual-Mode Framework)

export class ModuleSeven extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* =========================================================
                   HANGMAN KEYBOARD: DUAL-MODE UI OVERRIDES
                   ========================================================= */
                
                /* 1. DEFAULT KEY STATE */
                /* Light Mode: Clean solid background, crisp borders */
                #hangman-keyboard button {
                    background-color: #f1f5f9 !important; /* slate-100 */
                    border: 1px solid #cbd5e1 !important; /* slate-300 */
                    color: #1e293b !important; /* slate-800 */
                    border-radius: 0.5rem !important;
                    font-weight: 700 !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
                }
                
                /* Dark Mode: Premium tinted glass */
                .dark #hangman-keyboard button {
                    background-color: rgba(30, 30, 40, 0.5) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    color: #ffffff !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                    box-shadow: none !important;
                }
                .dark #hangman-keyboard button:not(:disabled):hover {
                    background-color: rgba(99, 102, 241, 0.3) !important;
                    border-color: rgba(99, 102, 241, 0.6) !important;
                }
                
                /* 2. WRONG / DISABLED STATE */
                /* Light Mode: Vibrant Solid Red */
                #hangman-keyboard button.bg-red-500,
                #hangman-keyboard button.opacity-50,
                #hangman-keyboard button:disabled {
                    background-color: #f43f5e !important; /* rose-500 */
                    border-color: #e11d48 !important; /* rose-600 */
                    color: #ffffff !important;
                    opacity: 1 !important; 
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
                }
                
                /* Dark Mode: Recessed Dark Glass */
                .dark #hangman-keyboard button.bg-red-500,
                .dark #hangman-keyboard button.opacity-50,
                .dark #hangman-keyboard button:disabled {
                    background-color: rgba(0, 0, 0, 0.4) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.2) !important;
                    opacity: 1 !important; 
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
                }

                /* 3. CORRECT STATE (Highest Specificity Wildcard overrides :disabled) */
                /* Light Mode: Vibrant Solid Green */
                #hangman-keyboard button[class*="green"],
                #hangman-keyboard button[class*="green"]:disabled,
                #hangman-keyboard button[class*="correct"],
                #hangman-keyboard button[class*="correct"]:disabled,
                #hangman-keyboard button[style*="background-color"],
                #hangman-keyboard button[style*="background-color"]:disabled {
                    background-color: #22c55e !important; /* green-500 */
                    border-color: #16a34a !important; /* green-600 */
                    color: #ffffff !important;
                    opacity: 1 !important; 
                    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4) !important;
                }
                
                /* Dark Mode: Premium Glowing Indigo */
                .dark #hangman-keyboard button[class*="green"],
                .dark #hangman-keyboard button[class*="green"]:disabled,
                .dark #hangman-keyboard button[class*="correct"],
                .dark #hangman-keyboard button[class*="correct"]:disabled,
                .dark #hangman-keyboard button[style*="background-color"],
                .dark #hangman-keyboard button[style*="background-color"]:disabled {
                    background-color: #4f46e5 !important; /* Indigo 600 */
                    border-color: #818cf8 !important; /* Indigo 400 */
                    color: #ffffff !important;
                    opacity: 1 !important;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.4) !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 7 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Sentence Hangman</h2>
            
            <div id="lifeline-mount-7"></div>
            
            <!-- CONTAINER: Solid White in Light Mode, Frosted Glass in Dark Mode -->
            <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 flex flex-col items-center relative pb-14 transition-all duration-300">
                <div class="flex flex-col md:flex-row w-full gap-8 items-center mb-8">
                    
                    <!-- Hangman Art Box: Crisp Light Gray in Light Mode, Dark Glass in Dark Mode -->
                    <div class="bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/10 w-48 h-48 flex items-center justify-center transition-colors duration-300 shadow-inner">
                        <pre id="hangman-art" class="font-mono text-xl font-bold leading-tight text-slate-800 dark:text-slate-200 text-left transition-colors duration-300"></pre>
                    </div>
                    
                    <!-- Word Container -->
                    <div class="flex-1 text-center">
                        <div id="hangman-word" class="font-mono text-2xl sm:text-3xl font-black text-indigo-700 dark:text-white tracking-widest flex flex-wrap justify-center gap-y-4 transition-colors duration-300"></div>
                    </div>
                </div>
                
                <!-- Dynamic Keyboard Mount -->
                <div id="hangman-keyboard" class="flex flex-wrap justify-center gap-2 max-w-xl"></div>
                
                <!-- Feedback Text -->
                <div id="hangman-feedback" class="mt-4 font-bold text-xl text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-seven', ModuleSeven);