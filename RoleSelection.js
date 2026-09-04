// RoleSelection.js
// Web Component for the Entry Screen (Premium Glassmorphism)

export class RoleSelection extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[70vh] px-4">
                
                <div class="w-full max-w-md p-8 rounded-3xl bg-[#080C14]/90 backdrop-blur-xl border border-indigo-500/20 shadow-[0_0_35px_rgba(79,70,229,0.2)] text-center">
                    
                    <!-- Title with Vertical Accent Line -->
                    <div class="flex items-center justify-center space-x-2 mb-1">
                        <span class="w-[3px] h-7 bg-slate-300 rounded-full inline-block"></span>
                        <h2 class="text-3xl font-black text-white tracking-tight">Multiplayer Edition</h2>
                    </div>
                    
                    <!-- Subtitle -->
                    <p class="text-xs text-slate-300/80 font-normal mb-6">
                        Choose your role to begin simultaneous play.
                    </p>

                    <!-- Action Buttons -->
                    <div class="space-y-3">
                        <!-- Host Game (Professor) Button -->
                        <button onclick="window.authUI.showProfLogin()" class="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] cursor-pointer">
                            <span class="text-base">🧑‍🏫</span>
                            <span>Host Game (Professor)</span>
                        </button>

                        <!-- Join Game (Student) Button -->
                        <button onclick="window.authUI.showStudentAuth()" class="w-full py-3.5 px-4 rounded-2xl bg-[#1A2333]/80 hover:bg-[#222E42] border border-slate-700/50 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] cursor-pointer">
                            <span class="text-base">🎓</span>
                            <span>Join Game (Student)</span>
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    }
}

customElements.define('role-selection', RoleSelection);