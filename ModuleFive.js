// ModuleFive.js
// 🏗️ Web Component for Listening Comprehension (Strict Dual-Mode Framework)

export class ModuleFive extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* =========================================================
                   MULTIPLE CHOICE BUTTONS: DUAL-MODE UI 
                   ========================================================= */
                   
                /* 1. DEFAULT STATE */
                #audio-options-container button {
                    /* Light Mode: Clean solid background, readable text, crisp borders */
                    background-color: #ffffff !important;
                    border: 1px solid #cbd5e1 !important; 
                    color: #1e293b !important; 
                    border-radius: 1rem !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    padding: 1.25rem !important;
                    font-weight: 700 !important;
                    text-align: left !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .dark #audio-options-container button {
                    /* Dark Mode: Premium tinted glass */
                    background-color: rgba(40, 45, 60, 0.7) !important;
                    border: 2px solid rgba(255, 255, 255, 0.45) !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                }

                /* Ensure all nested text matches the parent button text color */
                #audio-options-container button * {
                    color: inherit !important;
                    opacity: 1 !important;
                }

                /* 2. CORRECT STATE (Active/Green) */
                /* Light Mode: Vibrant Solid Green */
                #audio-options-container button[class*="green"],
                #audio-options-container button[class*="emerald"],
                #audio-options-container button[class*="correct"],
                #audio-options-container button[style*="197"] {
                    background-color: #22c55e !important;
                    border: 2px solid #16a34a !important;
                    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4) !important;
                    color: #ffffff !important;
                }
                
                /* Dark Mode: Premium Glowing Indigo */
                .dark #audio-options-container button[class*="green"],
                .dark #audio-options-container button[class*="emerald"],
                .dark #audio-options-container button[class*="correct"],
                .dark #audio-options-container button[style*="197"] {
                    background-color: #4f46e5 !important;
                    border: 2px solid #ffffff !important;
                    box-shadow: 0 0 20px rgba(79, 70, 229, 0.6) !important;
                    color: #ffffff !important;
                }
                
                #audio-options-container button[class*="green"] *,
                #audio-options-container button[class*="emerald"] *,
                #audio-options-container button[class*="correct"] *,
                #audio-options-container button[style*="197"] * {
                    color: #ffffff !important;
                }

                /* 3. WRONG STATE (Recessed/Red) */
                #audio-options-container button[class*="red"],
                #audio-options-container button[class*="rose"],
                #audio-options-container button[class*="wrong"],
                #audio-options-container button[class*="missed"],
                #audio-options-container button[class*="incorrect"],
                #audio-options-container button[style*="68"] {
                    /* Light Mode: Soft recessed gray */
                    background-color: #f8fafc !important;
                    border: 2px solid #e2e8f0 !important;
                    box-shadow: inset 0 3px 6px rgba(0,0,0,0.05) !important;
                    color: #94a3b8 !important;
                }
                
                .dark #audio-options-container button[class*="red"],
                .dark #audio-options-container button[class*="rose"],
                .dark #audio-options-container button[class*="wrong"],
                .dark #audio-options-container button[class*="missed"],
                .dark #audio-options-container button[class*="incorrect"],
                .dark #audio-options-container button[style*="68"] {
                    /* Dark Mode: Dark empty hole */
                    background-color: rgba(0, 0, 0, 0.7) !important;
                    border: 2px solid transparent !important;
                    box-shadow: inset 0 6px 15px rgba(0,0,0,0.9) !important;
                    color: rgba(255, 255, 255, 0.2) !important;
                }
                
                #audio-options-container button[class*="red"] *,
                #audio-options-container button[class*="rose"] *,
                #audio-options-container button[class*="wrong"] *,
                #audio-options-container button[class*="missed"] *,
                #audio-options-container button[class*="incorrect"] *,
                #audio-options-container button[style*="68"] * {
                    color: inherit !important; /* Inherits the faded color from parent */
                }
            </style>

            <!-- TYPOGRAPHY: Dynamic color shifting -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 5 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Listening Comprehension</h2>
            
            <div id="lifeline-mount-5"></div>
            
            <!-- CONTAINER: Solid White in Light Mode, Frosted Glass in Dark Mode -->
            <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300">
                
                <!-- Added dynamic dual-mode hover states for the listen button -->
                <button id="btn-audio-listen" class="mb-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-lg text-xl mx-auto flex items-center gap-3 transition-colors duration-300">
                    <span class="text-3xl">🔊</span> Listen
                </button>
                
                <div id="audio-options-container" class="space-y-3 relative"></div>
                
                <!-- FEEDBACK TEXT: Ensures text doesn't disappear in Light Mode -->
                <div id="audio-feedback" class="mt-4 font-bold text-xl text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

customElements.define('module-five', ModuleFive);