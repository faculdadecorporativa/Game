// RoleSelection.js
// 🏗️ Option 2: Neon Tinted Glass (Dynamic Light/Dark Mode)

export class RoleSelection extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[60vh]">
                
                <!-- 🔥 Solid White in Light Mode, Neon Tinted Glass in Dark Mode 🔥 -->
                <div class="bg-white dark:bg-indigo-900/20 backdrop-blur-none dark:backdrop-blur-xl p-10 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-slate-200 dark:border-indigo-500/40 text-center max-w-lg w-full transition-all duration-300">
                    
                    <h2 class="text-4xl font-black text-slate-800 dark:text-white mb-3 transition-colors duration-300 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Multiplayer Edition</h2>
                    <p class="text-slate-600 dark:text-indigo-200 mb-8 font-medium transition-colors duration-300">Choose your role to begin simultaneous play.</p>
                    
                    <div class="space-y-4">
                        <!-- Neon Host Button -->
                        <button onclick="window.authUI.showProfLogin()" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600/90 dark:hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-transparent dark:border-indigo-400/60 hover:-translate-y-1">
                            <span class="text-2xl drop-shadow-md">👨‍🏫</span> Host Game (Professor)
                        </button>
                        
                        <!-- Neon Student Button -->
                        <button onclick="window.authUI.showStudentAuth()" class="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg dark:shadow-[0_0_15px_rgba(148,163,184,0.3)] transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-transparent dark:border-slate-500/50 hover:-translate-y-1">
                            <span class="text-2xl drop-shadow-md">🎓</span> Join Game (Student)
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    }
}

customElements.define('role-selection', RoleSelection);