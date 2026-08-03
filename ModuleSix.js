// ModuleSix.js
// 🏗️ Web Component for the Spelling Bee Module (Hear Word button text is now pure white)

export class ModuleSix extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 6 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Spelling Bee</h2>
            
            <div id="lifeline-mount-6"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                
                <!-- Hear Word Button (Frosted Indigo with Pure White Text) -->
                <button id="btn-spelling-listen" class="mb-8 bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/40 text-indigo-700 dark:text-white border border-indigo-200 dark:border-indigo-500/30 font-bold py-3 px-8 rounded-full shadow-md text-lg inline-flex items-center gap-2 transition-all duration-300">
                    <span>🔊</span> Hear Word
                </button>
                
                <!-- Input Box (Glass) -->
                <input type="text" id="spelling-input" class="w-full mb-4 p-4 bg-white/50 dark:bg-black/30 border-2 border-slate-300/50 dark:border-white/20 rounded-xl text-center text-2xl font-bold font-mono focus:border-indigo-500 dark:focus:border-indigo-400 dark:text-white focus:outline-none transition-colors duration-300" autocomplete="off">
                
                <!-- Submit Button (Solid Indigo) -->
                <button id="btn-spelling-submit" onclick="game.submitSpelling()" class="w-full bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md transition-colors duration-300 text-lg">
                    Submit
                </button>
                
                <div id="spelling-feedback" class="mt-4 font-bold text-xl absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-six', ModuleSix);