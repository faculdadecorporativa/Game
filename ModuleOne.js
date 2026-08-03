// ModuleOne.js
// 🏗️ Concept Mastery Web Component (Nuclear Override for Pure White Text)

export class ModuleOne extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* 🔥 Aggressive Scoped CSS to force inner flashcard faces to use Cupertino Glass */
                #flashcards-container .flip-card-front,
                #flashcards-container .flip-card-back,
                #flashcards-container > div > div > div {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border-radius: 1rem !important;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
                    transition: all 0.3s ease !important;
                }
                
                /* Dark mode glass for the cards */
                .dark #flashcards-container .flip-card-front,
                .dark #flashcards-container .flip-card-back,
                .dark #flashcards-container > div > div > div {
                    background-color: rgba(30, 30, 40, 0.6) !important; 
                    border: 1px solid rgba(99, 102, 241, 0.4) !important; /* Indigo border */
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
                }
                
                /* 🔥 MAXIMUM SPECIFICITY: Force ANY text class inside the cards to be pure white in dark mode */
                .dark #flashcards-container [class*="text-indigo-"],
                .dark #flashcards-container [class*="text-slate-"],
                .dark #flashcards-container [class*="text-blue-"],
                .dark #flashcards-container h2,
                .dark #flashcards-container h3,
                .dark #flashcards-container p,
                .dark #flashcards-container span {
                    color: #ffffff !important;
                }
                
                /* Update the listen buttons inside flashcards to match */
                .dark #flashcards-container button {
                    background-color: rgba(79, 70, 229, 0.8) !important; /* Indigo soft button */
                    color: #ffffff !important;
                    border: none !important;
                }
                .dark #flashcards-container button:hover {
                    background-color: rgba(67, 56, 202, 1) !important;
                }
            </style>
            
            <span class="text-indigo-600 dark:text-white font-bold tracking-wider uppercase text-sm transition-colors duration-300">Module 1 of 11</span>
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-6 transition-colors duration-300">Concept Mastery</h2>
            
            <div id="flashcards-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"></div>
        `;
    }
}

// 🚀 Register the custom tag
customElements.define('module-one', ModuleOne);