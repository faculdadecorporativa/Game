// ModuleEight.js
// 🏗️ Web Component for the Where's Wally? Module (Cupertino Glass Edition, No Cyan)

export class ModuleEight extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- Removed Cyan: Module Label is now pure white -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 8 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Where's Wally?</h2>
            
            <div id="lifeline-mount-8"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                
                <!-- Removed Cyan: Target Prompt is now pure white -->
                <h3 class="text-2xl font-bold text-indigo-700 dark:text-white mb-4 transition-colors duration-300" id="wally-prompt"></h3>
                
                <div class="relative w-full h-[400px] overflow-auto rounded-2xl border border-slate-300/50 dark:border-white/10 shadow-inner bg-slate-200 dark:bg-slate-950 mx-auto transition-colors duration-300" id="wally-container">
                    <div class="relative" style="width: 2000px; height: auto;">
                        <img src="${window.lessonData?.wheresWally?.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=2000&q=80'}" class="w-full h-auto object-cover select-none pointer-events-none" id="wally-bg">
                        <div id="wally-layer" class="absolute inset-0"></div>
                    </div>
                </div>
                
                <div id="wally-feedback" class="mt-4 font-bold text-xl absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-eight', ModuleEight);