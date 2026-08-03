// ModuleTen.js
// 🏗️ Web Component for the Strict Dictation Module

export class ModuleTen extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 Deep Scoped CSS to style the injected Feedback Box */
                #dict-feedback > div {
                    background-color: rgba(30, 30, 40, 0.6) !important;
                    border: 1px solid rgba(99, 102, 241, 0.3) !important;
                    backdrop-filter: blur(16px) !important;
                    border-radius: 1rem !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
                }
                
                /* Ensure general text inside the feedback is white, but allow diff colors to stay */
                .dark #dict-feedback p,
                .dark #dict-feedback div,
                .dark #dict-feedback strong {
                    color: #ffffff !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 10 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Strict Dictation</h2>
            
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                <p class="text-slate-600 dark:text-slate-300 mb-4 font-bold transition-colors duration-300">Listen and type exactly what you hear (punctuation matters).</p>
                
                <!-- Hear Sentence Button (Frosted Indigo with Pure White Text) -->
                <button id="btn-dict-listen" class="mb-6 bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/40 text-indigo-700 dark:text-white border border-indigo-200 dark:border-indigo-500/30 font-bold py-3 px-8 rounded-full shadow-md text-lg inline-flex items-center gap-2 transition-all duration-300">
                    <span>🔊</span> Hear Sentence
                </button>
                
                <!-- Input Box (Glass) -->
                <textarea id="dict-input" rows="3" class="w-full mb-4 p-4 bg-white/50 dark:bg-black/30 border-2 border-slate-300/50 dark:border-white/20 rounded-xl text-lg font-medium dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-300" placeholder="Type here..."></textarea>
                
                <!-- Submit Button (Solid Indigo) -->
                <button onclick="game.submitDictation()" id="btn-dict-submit" class="w-full bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md transition-colors duration-300 text-lg">
                    Submit
                </button>
                
                <!-- Feedback Container (Receives dark glass via CSS above) -->
                <div id="dict-feedback" class="mt-6 opacity-0 transition-opacity duration-300 w-full text-left"></div>
            </div>
        `;
    }
}

customElements.define('module-ten', ModuleTen);