// 🏗️ ModuleJoinPin.js - Web Component

export class ModuleJoinPin extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- Notice dark:bg-transparent and dark:shadow-none: This removes the ugly double-box effect in dark mode! -->
            <div class="bg-white dark:bg-transparent p-10 rounded-3xl shadow-2xl dark:shadow-none max-w-md mx-auto border border-slate-100 dark:border-transparent mt-10 fade-in transition-all duration-300">
                
                <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner transition-colors duration-300">
                    🎮
                </div>
                
                <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-2 transition-colors duration-300">Join Game</h2>
                <p class="text-slate-500 dark:text-slate-400 mb-8 font-medium transition-colors duration-300">Enter the 4-digit PIN from your Professor's screen.</p>
                
                <input type="text" id="join-pin-input" 
                    class="w-full p-4 mb-6 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/50 dark:text-white rounded-xl text-center tracking-[0.5em] font-mono text-4xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 uppercase transition-colors duration-300" 
                    placeholder="0000" maxlength="4" autocomplete="off">
                
                <button id="btn-join-lobby" 
                    class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
                    Enter Lobby
                </button>
            </div>
        `;

        // MENTOR FIX: Clean Event Listener that validates data before calling the network
        const btn = this.querySelector('#btn-join-lobby');
        const pinInput = this.querySelector('#join-pin-input');

        const submitPin = () => {
            // Automatically uppercase the PIN to prevent mismatched lowercase letters
            const pin = pinInput.value.trim().toUpperCase();
            
            if (pin.length !== 4) {
                if(window.toast) window.toast("Please enter a 4-digit PIN.", false);
                return;
            }
            
            if (window.app && typeof window.app.joinGame === 'function') {
                window.app.joinGame(pin);
            } else {
                if(window.toast) window.toast("Error: joinGame function is missing in network.js!", false);
            }
        };

        // Trigger on button click
        btn.addEventListener('click', submitPin);

        // 💡 NEW IDEA: Add "Enter" key support so students don't have to use the mouse!
        pinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent accidental form submissions
                submitPin();
            }
        });
    }
}

customElements.define('module-join-pin', ModuleJoinPin);