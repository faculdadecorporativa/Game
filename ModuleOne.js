// ModuleOne.js
// 🏗️ Concept Mastery Web Component (Strict Dual-Mode Framework)

export class ModuleOne extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* =========================================================
                   FLASHCARD FLIP FACES: DUAL-MODE UI 
                   ========================================================= */
                   
                /* 1. DEFAULT STATE (Light Mode) */
                #flashcards-container .flip-card-front,
                #flashcards-container .flip-card-back,
                #flashcards-container > div > div > div {
                    /* Light Mode: Clean solid background, crisp borders */
                    background-color: #ffffff !important;
                    border: 1px solid #e2e8f0 !important; 
                    border-radius: 1rem !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }
                
                /* 2. DARK MODE STATE */
                .dark #flashcards-container .flip-card-front,
                .dark #flashcards-container .flip-card-back,
                .dark #flashcards-container > div > div > div {
                    /* Dark Mode: Premium tinted glass with neon border */
                    background-color: rgba(30, 30, 40, 0.6) !important; 
                    border: 1px solid rgba(99, 102, 241, 0.3) !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                }
                
                /* =========================================================
                   TYPOGRAPHY DYNAMIC SHIFTING
                   ========================================================= */
                   
                /* Light Mode Text: Force dark readable text */
                #flashcards-container [class*="text-indigo-"],
                #flashcards-container [class*="text-slate-"],
                #flashcards-container [class*="text-blue-"],
                #flashcards-container h2,
                #flashcards-container h3,
                #flashcards-container p,
                #flashcards-container span {
                    color: #1e293b !important;
                }

                /* Dark Mode Text: Force pure white text */
                .dark #flashcards-container [class*="text-indigo-"],
                .dark #flashcards-container [class*="text-slate-"],
                .dark #flashcards-container [class*="text-blue-"],
                .dark #flashcards-container h2,
                .dark #flashcards-container h3,
                .dark #flashcards-container p,
                .dark #flashcards-container span {
                    color: #ffffff !important;
                }
                
                /* =========================================================
                   INNER BUTTONS (Listen/Audio)
                   ========================================================= */
                   
                /* Light Mode Buttons */
                #flashcards-container button {
                    background-color: #f1f5f9 !important; /* Soft slate gray */
                    color: #1e293b !important;
                    border: 1px solid #cbd5e1 !important;
                    transition: all 0.2s ease !important;
                }
                #flashcards-container button:hover {
                    background-color: #e2e8f0 !important;
                }

                /* Dark Mode Buttons */
                .dark #flashcards-container button {
                    background-color: rgba(79, 70, 229, 0.8) !important; /* Indigo soft button */
                    color: #ffffff !important;
                    border: none !important;
                }
                .dark #flashcards-container button:hover {
                    background-color: rgba(67, 56, 202, 1) !important;
                }
            </style>
            
            <!-- TYPOGRAPHY: Dynamic color shifting for section headers -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 1 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Concept Mastery</h2>
            
            <div id="flashcards-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"></div>
        `;
    }
}

// 🚀 Register the custom tag
customElements.define('module-one', ModuleOne);