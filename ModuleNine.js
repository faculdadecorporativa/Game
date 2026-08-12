// ModuleNine.js
// 🏗️ Web Component for the Speaking & Pronunciation Module (Premium Glassmorphism Edition)

export class ModuleNine extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- STREAMING_CHUNK:Rendering Module 9 Header -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 9 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Speaking & Pronunciation</h2>
            
            <div id="lifeline-mount-9"></div>

            <!-- STREAMING_CHUNK:Rendering Read Aloud Container -->
            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300 w-full max-w-4xl mx-auto">
                
                <!-- Text Target Box (Recessed Glass) -->
                <div id="read-aloud-target" class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed mb-10 p-8 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border-2 border-slate-300 dark:border-white/10 shadow-inner text-center transition-colors duration-300 tracking-wide"></div>
                
                <!-- Premium Record Button -->
                <button id="btn-record-read" onclick="game.toggleReadAloud()" class="bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-10 rounded-full shadow-[0_10px_20px_rgba(225,29,72,0.3)] text-xl mx-auto flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer border border-transparent">
                    <span class="text-3xl drop-shadow-md" id="record-icon">🎙️</span> <span id="record-text" class="tracking-widest uppercase">Start Recording</span>
                </button>
                
                <!-- Dynamic Status Text -->
                <div id="read-status-feedback" class="mt-8 text-lg font-bold text-slate-500 dark:text-slate-400 transition-colors text-center tracking-widest uppercase" data-state="ready">🎤 Ready to record</div>
            </div>
        `;
    }
}

customElements.define('module-nine', ModuleNine);