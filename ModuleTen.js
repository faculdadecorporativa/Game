// ModuleTen.js
// 🏗️ Web Component for the Strict Dictation Module (Premium Glassmorphism Edition)

export class ModuleTen extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 10 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Strict Dictation</h2>
            
            <div id="lifeline-mount-10"></div>

            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300 w-full max-w-3xl mx-auto">
                
                <p class="text-slate-600 dark:text-slate-300 mb-6 font-medium transition-colors duration-300 text-base">Listen and type exactly what you hear (punctuation and casing matter).</p>
                
                <!-- Hear Sentence Button (Premium Pill) -->
                <button id="btn-dict-listen" class="mb-8 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-black py-4 px-8 rounded-full shadow-sm text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 mx-auto w-full sm:w-auto cursor-pointer">
                    <span class="text-2xl drop-shadow-md">🔊</span> Hear Sentence
                </button>
                
                <!-- Textarea (Recessed Glass) -->
                <textarea id="dict-input" rows="3" class="w-full mb-6 p-5 bg-slate-100 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/10 shadow-inner rounded-2xl text-lg font-medium text-slate-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/30 focus:outline-none transition-all duration-300 resize-none" placeholder="Type what you hear here..."></textarea>
                
                <!-- Submit Button (Solid Premium) -->
                <button onclick="game.submitDictation()" id="btn-dict-submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all duration-300 text-xl tracking-widest uppercase hover:-translate-y-1 active:scale-95 cursor-pointer">
                    Submit
                </button>
                
                <!-- Feedback Container -->
                <div id="dict-feedback" class="mt-6 opacity-0 transition-opacity duration-300 w-full text-left"></div>
            </div>
        `;
    }
}

customElements.define('module-ten', ModuleTen);