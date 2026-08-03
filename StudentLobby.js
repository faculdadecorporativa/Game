// StudentLobby.js
// 🏗️ This is your extracted Student Lobby Web Component!

export class StudentLobby extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div id="wait-spinner" class="loader mb-6 border-indigo-600"></div>
            <h2 id="wait-title" class="text-4xl font-extrabold text-slate-800 mb-4 animate-pulse">Waiting for Professor...</h2>
            <p id="wait-subtitle" class="text-slate-500 text-lg">The game will start automatically on your screen once the Professor launches it.</p>
            
            <!-- 60s Countdown Container -->
            <div id="wait-countdown" class="hidden text-[8rem] font-black text-indigo-600 mt-8 drop-shadow-lg leading-none">60</div>
        `;
    }
}

// 🚀 Register the custom tag
customElements.define('student-lobby', StudentLobby);