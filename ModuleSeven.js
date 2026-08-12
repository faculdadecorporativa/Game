// ModuleSeven.js
// 🏗️ Web Component for the Sentence Hangman Module (Premium Glassmorphism Edition)

export class ModuleSeven extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- STREAMING_CHUNK:Rendering Module 7 Header -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 7 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Sentence Hangman</h2>
            
            <div id="lifeline-mount-7"></div>
            
            <!-- STREAMING_CHUNK:Rendering Hangman Container -->
            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 flex flex-col items-center relative pb-14 transition-all duration-300 w-full max-w-5xl mx-auto">
                
                <div class="flex flex-col md:flex-row w-full gap-8 items-center mb-10">
                    
                    <!-- Hangman Art Box (Recessed Glass) -->
                    <div class="bg-slate-100 dark:bg-slate-900/60 p-6 rounded-2xl border-2 border-slate-300 dark:border-white/10 w-56 h-56 flex items-center justify-center transition-colors duration-300 shadow-inner">
                        <pre id="hangman-art" class="font-mono text-xl font-bold leading-tight text-slate-800 dark:text-slate-200 text-left transition-colors duration-300"></pre>
                    </div>
                    
                    <!-- Word Container -->
                    <div class="flex-1 text-center">
                        <div id="hangman-word" class="font-mono text-3xl sm:text-4xl font-black text-indigo-700 dark:text-indigo-400 tracking-widest flex flex-wrap justify-center gap-y-4 transition-colors duration-300 drop-shadow-sm"></div>
                    </div>
                </div>
                
                <!-- Dynamic Keyboard Mount (Styled automatically by UIController.js) -->
                <div id="hangman-keyboard" class="flex flex-wrap justify-center gap-2 max-w-3xl w-full"></div>
                
                <!-- Feedback Text -->
                <div id="hangman-feedback" class="mt-4 font-bold text-xl text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity text-center"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-seven', ModuleSeven);