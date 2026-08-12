// ModuleOne.js
// 🏗️ Concept Mastery Web Component (Premium Glassmorphism Edition)

export class ModuleOne extends HTMLElement {
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- STREAMING_CHUNK:Rendering Module 1 Header -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 1 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Concept Mastery</h2>
            
            <div id="lifeline-mount-1"></div>
            
            <!-- STREAMING_CHUNK:Rendering Flashcards Container -->
            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative overflow-hidden transition-all duration-300 w-full max-w-6xl mx-auto">
                
                <div class="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-white/10 pb-4 transition-colors duration-300">
                    <span class="text-sm md:text-base font-black text-slate-600 dark:text-slate-300 transition-colors duration-300 tracking-wider uppercase">Study Mode</span>
                    <span class="text-xs md:text-sm font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 rounded-full shadow-sm transition-colors duration-300">No Points</span>
                </div>

                <!-- Cards injected dynamically by UIController.js -->
                <div id="flashcards-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                </div>
                
            </div>
        `;
    }
}

// 🚀 Register the custom tag
customElements.define('module-one', ModuleOne);