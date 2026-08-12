// ModuleEight.js
// Web Component for the Memory Match Module

export class ModuleEight extends HTMLElement {
    
    connectedCallback() {
        this.classList.remove('max-w-5xl');
        this.classList.add('w-full', 'max-w-4xl');
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                .perspective-1000 {
                    perspective: 1000px;
                }
                
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }

                .front-face, .back-face {
                    border-radius: 1rem !important;
                    overflow: hidden !important; 
                }

                .front-face, .back-face {
                    background-color: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    
                    position: absolute !important;
                    top: 0;
                    left: 0;
                    width: 100% !important;
                    height: 100% !important;
                }
                
                .dark .front-face, .dark .back-face {
                    background-color: rgba(30, 30, 40, 0.6) !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                }

                #memory-grid .flipped .flip-card-inner, 
                #memory-grid .matched .flip-card-inner { 
                    transform: rotateY(180deg) !important; 
                }

                #memory-grid .matched .back-face {
                    background-color: #22c55e !important; 
                    border-color: #16a34a !important; 
                    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4) !important;
                }

                .dark #memory-grid .matched .back-face {
                    background-color: rgba(79, 70, 229, 0.8) !important; 
                    border-color: #ffffff !important;
                    box-shadow: 0 0 20px rgba(79, 70, 229, 0.8) !important;
                }

                #memory-grid img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 1rem !important; 
                    pointer-events: none !important;
                    background-color: transparent !important;
                }

                #memory-grid * {
                    color: #1e293b !important;
                }
                
                #memory-grid .matched .back-face * {
                    color: #ffffff !important;
                }

                .dark #memory-grid * {
                    color: #ffffff !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 8 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Memory Match</h2>
            
            <div id="lifeline-mount-8"></div>
            
            <div class="bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl p-4 md:p-6 rounded-3xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative pb-14 transition-all duration-300 w-full mx-auto">
                
                <div class="mb-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                    <span id="memory-progress" class="text-sm font-bold text-slate-500 dark:text-slate-300 transition-colors duration-300"></span>
                    <span class="text-sm font-bold text-indigo-600 dark:text-white transition-colors duration-300">+3 Pts / -1 Pt</span>
                </div>
                
                <div id="memory-grid" class="grid gap-2 md:gap-4 w-full transition-all duration-500"></div>
                
                <div id="memory-feedback" class="mt-4 font-bold text-xl text-slate-800 dark:text-white absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

customElements.define('module-eight', ModuleEight);