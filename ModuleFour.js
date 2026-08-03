// ModuleFour.js
// 🏗️ Web Component for the Memory Match Module (Cupertino Glass Edition)

export class ModuleFour extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 Aggressive Scoped CSS for Memory Match cards */
                #memory-grid > div > div > div {
                    border-radius: 1rem !important;
                    transition: all 0.3s ease !important;
                }
                
                /* Light Mode Glass */
                #memory-grid > div > div > div {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
                }

                /* Dark Mode Glass */
                .dark #memory-grid > div > div > div {
                    background-color: rgba(30, 30, 40, 0.6) !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important; /* Indigo border */
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                }

                /* Force ALL Text and Question Marks inside Cards to be pure White */
                .dark #memory-grid * {
                    color: #ffffff !important;
                }
            </style>

            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 4 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Memory Match</h2>
            
            <div id="lifeline-mount-4"></div>
            
            <!-- 🧊 Cupertino Frosted Glass Wrapper -->
            <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 relative pb-14 transition-all duration-300">
                
                <div class="mb-4 flex justify-between items-center border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300">
                    <span id="memory-progress" class="text-sm font-bold text-slate-500 dark:text-slate-300 transition-colors duration-300"></span>
                    <span class="text-sm font-bold text-indigo-600 dark:text-white transition-colors duration-300">+3 Pts / -1 Pt</span>
                </div>
                
                <div id="memory-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
                
                <div id="memory-feedback" class="mt-4 font-bold text-xl absolute bottom-4 w-full left-0 opacity-0 transition-opacity"></div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag with the browser
customElements.define('module-four', ModuleFour);