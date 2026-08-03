// ModuleThree.js
// 🏗️ Web Component for the Visual Assessment Module (Cupertino Glass Edition)

export class ModuleThree extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 3 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Visual Assessment</h2>
            
            <div id="lifeline-mount-3"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                
                <h3 class="text-2xl font-bold text-indigo-700 dark:text-white mb-4 transition-colors duration-300" id="hotspot-prompt"></h3>
                
                <div class="relative w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-950 mx-auto shadow-inner border border-white/50 dark:border-white/5 transition-colors duration-300" style="aspect-ratio: 16/9;" id="image-container">
                    <img src="${window.lessonData?.visualAssessment?.image || 'image_df315b.jpg'}" class="w-full h-full object-contain select-none pointer-events-none" id="hotspot-bg">
                    <div id="hotspots-layer" class="absolute inset-0"></div>
                </div>
                
                <div id="hotspot-feedback" class="mt-4 font-bold text-xl absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-three', ModuleThree);