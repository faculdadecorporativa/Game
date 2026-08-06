// StudentLobby.js
// 🏗️ This is your extracted Student Lobby Web Component!

export class StudentLobby extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- 🔥 Perfectly Centered Container 🔥 -->
            <div class="flex flex-col items-center justify-center min-h-[60vh] text-center w-full px-4 transition-all duration-300">
                
                <!-- 🔥 Beautiful Glass Card (Adapts to Light/Dark Mode) 🔥 -->
                <div class="bg-white dark:bg-slate-900/60 backdrop-blur-2xl p-10 sm:p-14 rounded-[2rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 max-w-lg w-full flex flex-col items-center transform transition-all hover:scale-[1.02] duration-500">
                    
                    <!-- Original IDs preserved for your JS logic -->
                    <div id="wait-spinner" class="loader mb-6 w-16 h-16 border-4 border-slate-200 dark:border-white/10 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                    
                    <h2 id="wait-title" class="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-4 animate-pulse tracking-tight drop-shadow-sm">Waiting for Professor...</h2>
                    
                    <p id="wait-subtitle" class="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">The game will start automatically on your screen once the Professor launches it.</p>
                    
                    <!-- 60s Countdown Container -->
                    <div id="wait-countdown" class="hidden text-[6rem] sm:text-[8rem] font-black text-indigo-600 dark:text-indigo-400 mt-8 drop-shadow-lg leading-none">60</div>
                    
                </div>
            </div>
        `;
    }
}

// 🚀 Register the custom tag
customElements.define('student-lobby', StudentLobby);