// ModuleNine.js
// 🏗️ Web Component for the Speaking & Pronunciation Module

export class ModuleNine extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- 🔥 CHANGED CYAN TO WHITE 🔥 -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 9 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Speaking & Pronunciation</h2>
            
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                <div id="read-aloud-target" class="text-2xl font-medium text-slate-800 dark:text-white leading-relaxed mb-8 p-6 bg-white/50 dark:bg-black/30 rounded-2xl border border-slate-300/50 dark:border-white/20 text-left transition-colors duration-300"></div>
                
                <button id="btn-record-read" onclick="game.toggleReadAloud()" class="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold py-4 px-10 rounded-full shadow-lg text-xl mx-auto flex items-center gap-3 transition-all duration-300">
                    <span class="text-3xl" id="record-icon">🎙️</span> <span id="record-text">Start Recording</span>
                </button>
                
                <div id="read-status-feedback" class="mt-6 text-lg font-bold text-slate-500 dark:text-slate-300 transition-colors" data-state="ready">🎤 Ready to record</div>
            </div>
        `;
    }
}

customElements.define('module-nine', ModuleNine);