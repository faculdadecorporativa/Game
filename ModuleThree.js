// ModuleThree.js
// 🏗️ Web Component for the Visual Assessment Module (Premium Glassmorphism Edition)

export class ModuleThree extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-4xl');
        this.classList.add('w-full');
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- STREAMING_CHUNK:Rendering Module 3 Header -->
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 3 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Visual Assessment</h2>
            
            <div id="lifeline-mount-3"></div>
            
            <!-- STREAMING_CHUNK:Rendering Hotspot Container -->
            <!-- 🔥 Unified Premium Glassmorphism Wrapper 🔥 -->
            <div class="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative overflow-hidden transition-all duration-300 w-full max-w-5xl mx-auto pb-14">
                
                <h3 class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mb-6 transition-colors duration-300 drop-shadow-sm text-center tracking-wide" id="hotspot-prompt"></h3>
                
                <!-- STREAMING_CHUNK:Rendering Hotspot Image Area -->
                <div class="relative w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950/80 mx-auto shadow-inner border-4 border-slate-300 dark:border-white/10 transition-colors duration-300" style="aspect-ratio: 16/9;" id="image-container">
                    
                    <!-- 🔥 Safe SVG Placeholder prevents broken image icons if Professor forgets to upload 🔥 -->
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E" class="w-full h-full object-contain select-none pointer-events-none opacity-50 dark:opacity-20 transition-all duration-300" id="hotspot-bg" alt="Visual Target">
                    
                    <div id="hotspots-layer" class="absolute inset-0"></div>
                </div>
                
                <div id="hotspot-feedback" class="mt-4 font-black text-xl text-center text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-three', ModuleThree);