// AppModals.js
// 🏗️ Web Component for all application overlay Modals (Optimized Depth & UX)

export class AppModals extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- MODALS FOR AUTH & LIFELINES -->
            
            <!-- Prof Login & Registration Modal -->
            <div id="modal-prof-login" class="fixed inset-0 bg-black/60 dark:bg-slate-900/80 z-[99999] flex items-center justify-center hidden backdrop-blur-md transition-all duration-300">
                <!-- 🔥 Solid Light Mode, Elevated & Defined Dark Mode 🔥 -->
                <div class="bg-white dark:bg-slate-800/95 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-2xl dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-600/60 w-full max-w-sm mx-4 relative transition-all duration-300">
                    <h3 class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mb-6 text-center transition-colors duration-300" id="p-auth-title">Professor Login</h3>
                    
                    <div id="p-register-fields" class="hidden mb-3">
                        <input type="text" id="prof-name" class="w-full p-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Full Name">
                    </div>

                    <input type="email" id="prof-email" class="w-full p-3 mb-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Email Address">
                    
                    <div class="relative w-full mb-2">
                        <input type="password" id="prof-pass" class="w-full p-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Password">
                        <button type="button" onclick="window.authUI.toggleVisibility('prof-pass')" class="absolute right-4 top-3.5 text-xl opacity-60 hover:opacity-100 cursor-pointer dark:text-white">
                            👁️
                        </button>
                    </div>

                    <div class="text-right w-full mb-6" id="p-forgot-pass-container">
                        <button onclick="window.authUI.resetProfPassword()" type="button" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-bold transition-colors cursor-pointer">
                            Forgot Password?
                        </button>
                    </div>

                    <button onclick="window.authUI.submitProfAuth()" id="p-auth-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3 rounded-xl shadow-md transition-colors duration-300 mb-4">Login</button>
                    <button onclick="window.authUI.toggleProfAuthMode()" id="p-toggle-btn" class="w-full text-slate-600 dark:text-slate-300 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors duration-300">Need an account? Register</button>
                    <button onclick="window.uiManager.closeModals()" class="w-full mt-4 text-rose-500 dark:text-rose-400 text-sm hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-300">Cancel</button>
                </div>
            </div>

            <!-- Student Auth Modal -->
            <div id="modal-student-auth" class="fixed inset-0 bg-black/60 dark:bg-slate-900/80 z-[99999] flex items-center justify-center hidden backdrop-blur-md transition-all duration-300">
                <!-- 🔥 Solid Light Mode, Elevated & Defined Dark Mode 🔥 -->
                <div class="bg-white dark:bg-slate-800/95 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-2xl dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-600/60 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto relative custom-scrollbar transition-all duration-300">
                    <h3 class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mb-6 text-center transition-colors duration-300" id="s-auth-title">Student Login</h3>
                    
                    <div class="flex gap-2 mb-3">
                        <select id="s-cc" class="p-3 border border-slate-300 dark:border-slate-500/60 rounded-lg bg-slate-100 dark:bg-slate-700/80 font-mono text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer dark:text-white transition-colors duration-300 custom-scrollbar">
                            <option value="" disabled selected>Code</option>
                            <optgroup label="North America">
                                <option value="+1">CA +1</option>
                                <option value="+52">MX +52</option>
                                <option value="+1">US +1</option>
                            </optgroup>
                            <optgroup label="Central America">
                                <option value="+501">BZ +501</option>
                                <option value="+506">CR +506</option>
                                <option value="+502">GT +502</option>
                                <option value="+504">HN +504</option>
                                <option value="+505">NI +505</option>
                                <option value="+507">PA +507</option>
                                <option value="+503">SV +503</option>
                            </optgroup>
                            <optgroup label="South America">
                                <option value="+54">AR +54</option>
                                <option value="+591">BO +591</option>
                                <option value="+55">BR +55</option>
                                <option value="+56">CL +56</option>
                                <option value="+57">CO +57</option>
                                <option value="+593">EC +593</option>
                                <option value="+592">GY +592</option>
                                <option value="+51">PE +51</option>
                                <option value="+595">PY +595</option>
                                <option value="+597">SR +597</option>
                                <option value="+598">UY +598</option>
                                <option value="+58">VE +58</option>
                            </optgroup>
                            <optgroup label="Caribbean">
                                <option value="+1">BS +1</option>
                                <option value="+53">CU +53</option>
                                <option value="+1">DO +1</option>
                                <option value="+509">HT +509</option>
                                <option value="+1">JM +1</option>
                                <option value="+1">PR +1</option>
                                <option value="+1">TT +1</option>
                            </optgroup>
                        </select>
                        <input type="tel" id="s-phone" class="w-full p-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Phone Number">
                    </div>

                    <div class="relative w-full mb-2">
                        <input type="password" id="s-pass" class="w-full p-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Password">
                        <button type="button" onclick="window.authUI.toggleVisibility('s-pass')" class="absolute right-4 top-3.5 text-xl opacity-60 hover:opacity-100 cursor-pointer dark:text-white">
                            👁️
                        </button>
                    </div>
                    <div class="text-right mb-6"><a href="#" onclick="window.authUI.showRecovery()" class="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline transition-colors duration-300">Forgot Password?</a></div>
                    
                    <div id="s-register-fields" class="hidden space-y-4 mb-6 border-t border-slate-300/50 dark:border-white/10 pt-4 transition-colors duration-300">
                        <p class="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-center transition-colors duration-300">New Account Details</p>
                        <input type="text" id="s-name" class="w-full p-3 bg-slate-100 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-500/60 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-colors duration-300" placeholder="Full Name">
                        
                        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-300 dark:border-slate-500/50 transition-colors duration-300">
                            <img id="student-avatar-preview" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" class="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-500/60 object-cover bg-white dark:bg-slate-800 transition-colors duration-300">
                            <input type="file" accept="image/*" class="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-500/20 file:text-indigo-700 dark:file:text-indigo-400 cursor-pointer transition-colors duration-300" onchange="window.authUI.handleAvatarUpload(event)">
                        </div>
                    </div> 
                    
                    <div class="mb-4">
                        <label for="professor-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left mb-1 transition-colors duration-300">Select Your Professor</label>
                        <select id="professor-select" class="w-full p-3 border border-slate-300 dark:border-slate-500/60 rounded-lg bg-slate-100 dark:bg-slate-700/80 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer dark:text-white transition-colors duration-300 custom-scrollbar" required>
                            <option value="" disabled selected>Select a Professor...</option>
                        </select>
                    </div>
                    
                    <button onclick="window.authUI.submitStudentAuth()" id="s-auth-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3 rounded-xl shadow-md transition-colors duration-300 mb-4">Login</button>
                    <button onclick="window.authUI.toggleAuthMode()" id="s-toggle-btn" class="w-full text-slate-600 dark:text-slate-300 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors duration-300">Need an account? Register</button>
                    <button onclick="window.uiManager.closeModals()" class="w-full mt-4 text-rose-500 dark:text-rose-400 text-sm hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-300">Cancel</button>
                </div>
            </div>

            <!-- 🔥 NEW: Classroom-Secure Password Recovery Modal 🔥 -->
            <div id="modal-recovery" class="fixed inset-0 bg-black/60 dark:bg-slate-900/80 z-[99999] flex items-center justify-center hidden backdrop-blur-md transition-all duration-300">
                <div class="bg-white dark:bg-slate-800/95 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-2xl dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-600/60 w-full max-w-sm mx-4 relative transition-all duration-300 text-center">
                    
                    <div class="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                        🔒
                    </div>
                    
                    <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Account Locked?</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">For security reasons, students cannot reset passwords via SMS. Please ask your Professor to instantly reset your password from their Control Center.</p>
                    
                    <button onclick="window.uiManager.closeModals()" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors duration-300">Understood</button>
                </div>
            </div>

            <!-- Lifeline Modal -->
            <div id="modal-lifeline" class="fixed inset-0 bg-black/60 dark:bg-slate-900/80 z-[99999] flex items-center justify-center hidden backdrop-blur-md transition-all duration-300">
                <div class="bg-white dark:bg-slate-800/95 backdrop-blur-none dark:backdrop-blur-2xl p-8 rounded-3xl shadow-2xl dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-600/60 text-center max-w-sm w-full mx-4 relative transition-all duration-300">
                    <h3 id="modal-title" class="text-2xl font-black text-indigo-700 dark:text-indigo-400 mb-2 transition-colors duration-300">Title</h3>
                    <p id="modal-desc" class="text-slate-700 dark:text-slate-300 mb-6 font-medium transition-colors duration-300">Description</p>
                    <div id="modal-timer" class="text-6xl font-black text-slate-800 dark:text-white mb-6 hidden transition-colors duration-300">30</div>
                    <button onclick="window.lifelineManager.closeModal()" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors duration-300">Close & Return</button>
                </div>
            </div>
        `;
    }
}

customElements.define('app-modals', AppModals);
