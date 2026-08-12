// ModuleFive.js
// 🏗️ Web Component for Listening Comprehension (Premium Glassmorphism Edition)

export class ModuleFive extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- STREAMING_CHUNK:Rendering Module 5 Header -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 5 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Listening Comprehension</h2>
            
            <div id="lifeline-mount-5"></div>
            
            <!-- STREAMING_CHUNK:Rendering Audio Challenge Container -->
            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300 w-full max-w-2xl mx-auto">
                
                <!-- Premium Listen Button -->
                <button id="btn-audio-listen" class="mb-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-10 rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] text-xl flex items-center justify-center gap-4 transition-all duration-300 hover:-translate-y-1 active:scale-95 mx-auto w-full sm:w-auto cursor-pointer">
                    <span class="text-3xl drop-shadow-md">🔊</span> Play Audio
                </button>
                
                <!-- Options injected dynamically by UIController.js -->
                <div id="audio-options-container" class="space-y-4 relative w-full"></div>
                
                <div id="audio-feedback" class="mt-4 font-bold text-xl text-center text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

customElements.define('module-five', ModuleFive);