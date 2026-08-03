// ModuleTwo.js
// 🏗️ Web Component for the Drag and Drop Concept Matching Module (Cupertino Glass Edition)

export class ModuleTwo extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 Force injected draggable terms to use Cupertino Frosted Glass + Indigo */
                #drag-terms-container > div {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border-radius: 0.75rem !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
                    transition: all 0.3s ease !important;
                }
                .dark #drag-terms-container > div {
                    background-color: rgba(30, 30, 40, 0.5) !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important; /* Indigo border */
                    color: #ffffff !important;
                }
                
                /* Fix the dropped item inside the dropzone */
                #dropzone > div {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    border-radius: 0.75rem !important;
                    font-weight: bold !important;
                }
                .dark #dropzone > div {
                    background-color: rgba(79, 70, 229, 0.3) !important; /* Indigo glass for matched term */
                    border: 1px solid rgba(99, 102, 241, 0.6) !important;
                    color: #ffffff !important;
                }
                
                /* Fix dropzone border when empty in dark mode */
                .dark #dropzone {
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    background-color: rgba(0, 0, 0, 0.2) !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 2 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Concept Matching</h2>
            
            <div id="lifeline-mount-2"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="flex flex-col md:flex-row gap-8 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 max-w-4xl mx-auto relative transition-all duration-300">
                
                <!-- Left Side: Draggable Terms -->
                <div class="md:w-1/3 border-r border-slate-300/50 dark:border-white/10 pr-6 flex flex-col gap-3 transition-colors duration-300" id="drag-terms-container"></div>
                
                <!-- Right Side: Dropzone -->
                <div class="md:w-2/3 flex flex-col justify-center items-center relative">
                    <span class="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest block mb-2 transition-colors duration-300" id="dnd-progress"></span>
                    <h3 class="text-xl font-semibold text-slate-800 dark:text-white mb-6 transition-colors duration-300" id="drop-definition-text"></h3>
                    
                    <div id="dropzone" class="dropzone w-full max-w-sm h-32 border-4 border-dashed border-slate-400/50 dark:border-white/20 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 font-medium bg-white/30 dark:bg-white/5 transition-colors duration-300">
                        Drop term here
                    </div>
                    
                    <div id="dnd-feedback" class="mt-4 font-bold text-xl opacity-0 transition-opacity absolute bottom-[-40px] w-full text-center"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('module-two', ModuleTwo);