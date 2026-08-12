// RoleSelection.js
// 🏗️ Web Component for the Entry Screen (Premium Glassmorphism)

export class RoleSelection extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[70vh] px-4">
                
                <div class="bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl p-10 md:p-12 rounded-[2rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 text-center max-w-lg w-full transition-all duration-500 hover:scale-[1.02]">
                    
                    <h2 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4 transition-colors duration-300 drop-shadow-sm tracking-tight">Multiplayer</h2>
                    <p class="text-slate-500 dark:text-slate-300 mb-10 font-medium text-lg transition-colors duration-300">Choose your role to begin.</p>
                    
                    <div class="space-y-4 w-full">
                        <!-- Premium Host Button -->
                        <button onclick="window.authUI.showProfLogin()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-transparent hover:-translate-y-1 active:scale-95 cursor-pointer">
                            <span class="text-2xl drop-shadow-md">👨‍🏫</span> Host Game (Professor)
                        </button>
                        
                        <!-- Premium Student Button -->
                        <button onclick="window.authUI.showStudentAuth()" class="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-white font-black py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-transparent dark:border-white/10 hover:-translate-y-1 active:scale-95 cursor-pointer">
                            <span class="text-2xl drop-shadow-md">🎓</span> Join Game (Student)
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    }
}

customElements.define('role-selection', RoleSelection);