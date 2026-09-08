// GamifiedShop.js
export class GamifiedShop extends HTMLElement {
    connectedCallback() {
        // Prevent connectedCallback from wiping inner HTML and ShopController state on DOM re-attaches
        if (this.hasRendered) return;
        this.hasRendered = true;

        this.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl h-full flex flex-col">
                <div class="flex justify-between items-center mb-8 shrink-0">
                    <h2 class="text-3xl md:text-5xl font-black text-slate-800 dark:text-white drop-shadow-md">Avatar <span class="text-indigo-600 dark:text-indigo-400">Shop</span></h2>
                    <div class="bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 text-amber-700 dark:text-amber-400 px-6 py-2 rounded-full font-black text-xl flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                        <span id="shop-coins">0</span> <span>&#129689;</span>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    <button id="tab-btn-consumables" onclick="window.shopController.switchTab('consumables')" class="shop-tab-btn flex-1 min-w-[120px] bg-indigo-600 text-white font-black py-4 px-4 rounded-xl">Boosts</button>
                    <button id="tab-btn-cosmetics" onclick="window.shopController.switchTab('cosmetics')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Borders</button>
                    <button id="tab-btn-titles" onclick="window.shopController.switchTab('titles')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Titles</button>
                    <button id="tab-btn-avatars_free" onclick="window.shopController.switchTab('avatars_free')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Free Avatars</button>
                    <button id="tab-btn-avatars_judges" onclick="window.shopController.switchTab('avatars_judges')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Judges</button>
                    <button id="tab-btn-avatars_apostles" onclick="window.shopController.switchTab('avatars_apostles')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Apostles</button>
                    <button id="tab-btn-avatars_kings_queens" onclick="window.shopController.switchTab('avatars_kings_queens')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Kings & Queens</button>
                    <button id="tab-btn-avatars_valiant" onclick="window.shopController.switchTab('avatars_valiant')" class="shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl">Valiant</button>
                </div>

                <!-- Scrollable Items Area -->
                <div id="shop-items-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10">
                    <!-- Items injected here by ShopController -->
                </div>
            </div>
        `;
    }
}
customElements.define('gamified-shop', GamifiedShop);