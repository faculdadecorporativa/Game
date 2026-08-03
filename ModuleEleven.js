// ModuleEleven.js
// 🏗️ Web Component for the Final Assessment Module (Wildcard Interaction States)

export class ModuleEleven extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 1. ABSOLUTE DEFAULT STATE - ALWAYS BRIGHT & VISIBLE */
                #quiz-options-container button {
                    background-color: rgba(40, 45, 60, 0.7) !important;
                    border: 2px solid rgba(255, 255, 255, 0.45) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border-radius: 1rem !important;
                    transition: all 0.3s ease !important;
                    padding: 1.25rem !important;
                    font-weight: 700 !important;
                    text-align: left !important;
                    opacity: 1 !important; 
                    visibility: visible !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
                }
                
                /* Force ALL nested text inside to be pure white initially */
                #quiz-options-container button * {
                    color: #ffffff !important;
                    opacity: 1 !important;
                }

                /* 2. CORRECT STATE (Wildcard catches any green/emerald/correct class) */
                #quiz-options-container button[class*="green"],
                #quiz-options-container button[class*="emerald"],
                #quiz-options-container button[class*="correct"],
                #quiz-options-container button[style*="197"] {
                    background-color: #4f46e5 !important;
                    border: 2px solid #ffffff !important;
                    box-shadow: 0 0 20px rgba(79, 70, 229, 0.8) !important;
                    color: #ffffff !important;
                }
                #quiz-options-container button[class*="green"] *,
                #quiz-options-container button[class*="emerald"] *,
                #quiz-options-container button[class*="correct"] *,
                #quiz-options-container button[style*="197"] * {
                    color: #ffffff !important;
                }

                /* 3. WRONG STATE (Wildcard catches any red/rose/wrong/missed class) */
                #quiz-options-container button[class*="red"],
                #quiz-options-container button[class*="rose"],
                #quiz-options-container button[class*="wrong"],
                #quiz-options-container button[class*="missed"],
                #quiz-options-container button[class*="incorrect"],
                #quiz-options-container button[style*="68"] {
                    background-color: rgba(0, 0, 0, 0.7) !important; /* Turns dark */
                    border: 2px solid transparent !important; /* Border vanishes */
                    box-shadow: inset 0 6px 15px rgba(0,0,0,0.9) !important; /* Inner shadow */
                    color: rgba(255, 255, 255, 0.2) !important;
                }
                
                /* Force nested text in wrong boxes to dim completely */
                #quiz-options-container button[class*="red"] *,
                #quiz-options-container button[class*="rose"] *,
                #quiz-options-container button[class*="wrong"] *,
                #quiz-options-container button[class*="missed"] *,
                #quiz-options-container button[class*="incorrect"] *,
                #quiz-options-container button[style*="68"] * {
                    color: rgba(255, 255, 255, 0.2) !important;
                }
            </style>

            <span class="text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 11 of 11</span>
            <h2 class="text-3xl font-extrabold text-white mt-1 mb-6 transition-colors duration-300">Final Assessment</h2>
            
            <div id="lifeline-mount-11"></div>
            
            <div class="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 relative pb-14 transition-all duration-300">
                <h3 id="quiz-question-text" class="text-2xl font-semibold text-white mb-6 leading-snug transition-colors duration-300"></h3>
                <div id="quiz-options-container" class="space-y-3 relative"></div>
                <div id="quiz-feedback" class="mt-4 font-bold text-xl text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

customElements.define('module-eleven', ModuleEleven);