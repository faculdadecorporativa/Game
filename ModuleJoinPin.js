// 🏗️ ModuleJoinPin.js - Web Component

export class ModuleJoinPin extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="bg-white p-10 rounded-3xl shadow-2xl max-w-md mx-auto border border-slate-100 mt-10 fade-in">
                <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    🎮
                </div>
                <h2 class="text-3xl font-black text-slate-800 mb-2">Join Game</h2>
                <p class="text-slate-500 mb-8 font-medium">Enter the 4-digit PIN from your Professor's screen.</p>
                
                <input type="text" id="join-pin-input" class="w-full p-4 mb-6 border-2 border-slate-200 rounded-xl text-center tracking-[0.5em] font-mono text-4xl focus:outline-none focus:border-indigo-500 uppercase transition-colors" placeholder="0000" maxlength="4">
                
                <button id="btn-join-lobby" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
                    Enter Lobby
                </button>
            </div>
        `;

        // MENTOR FIX: Clean Event Listener that validates data before calling the network
        this.querySelector('#btn-join-lobby').addEventListener('click', () => {
            const pin = document.getElementById('join-pin-input').value.trim();
            
            if (pin.length !== 4) {
                if(window.toast) window.toast("Please enter a 4-digit PIN.", false);
                return;
            }
            
            if (window.app && typeof window.app.joinGame === 'function') {
                window.app.joinGame(pin);
            } else {
                if(window.toast) window.toast("Error: joinGame function is missing in network.js!", false);
            }
        });
    }
}

customElements.define('module-join-pin', ModuleJoinPin);