// ProfDashboard.js
// 🏗️ Cupertino Frosted Glass Layout (Fixed End Session Button)

export class ProfDashboard extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <!-- 🔥 SCOPED CSS TO FIX INJECTED WHITE BOXES FOR FROSTED GLASS -->
            <style>
                #admin-team-list > div {
                    background-color: rgba(255, 255, 255, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    color: #1e293b !important;
                    box-shadow: none !important;
                    border-radius: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                    padding: 0.75rem 1rem !important;
                    transition: all 0.3s ease;
                }
                .dark #admin-team-list > div {
                    background-color: rgba(0, 0, 0, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #f1f5f9 !important;
                }
                .dark #admin-team-list > div span, .dark #admin-team-list > div div { color: #f1f5f9 !important; }
                
                #student-management-list > div {
                    background-color: rgba(255, 255, 255, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    box-shadow: none !important;
                    border-radius: 1rem !important;
                    margin-bottom: 0.75rem !important;
                    color: #1e293b !important;
                    transition: all 0.3s ease;
                }
                .dark #student-management-list > div {
                    background-color: rgba(0, 0, 0, 0.15) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #f1f5f9 !important;
                }
                .dark #student-management-list > div h4, 
                .dark #student-management-list > div p { color: #f1f5f9 !important; }
                
                #student-management-list span {
                    background-color: rgba(255, 255, 255, 0.8) !important;
                    color: #475569 !important;
                    border: none !important;
                    transition: all 0.3s ease;
                }
                .dark #student-management-list span {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    color: #cbd5e1 !important;
                }
                
                #admin-mod3-list > div,
                #admin-mod8-list > div {
                    background-color: rgba(255, 255, 255, 0.5) !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    color: #1e293b !important;
                    border-radius: 0.5rem !important;
                    padding: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                    transition: all 0.3s ease;
                }
                .dark #admin-mod3-list > div,
                .dark #admin-mod8-list > div {
                    background-color: rgba(0, 0, 0, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #f8fafc !important;
                }

                #student-management-list input,
                #student-management-list select,
                #admin-content-editors input,
                #admin-content-editors textarea,
                #admin-content-editors select {
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    color: #1e293b !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    border-radius: 0.5rem !important;
                    outline: none !important;
                    padding: 0.5rem !important;
                    transition: all 0.3s ease;
                }
                .dark #student-management-list input,
                .dark #student-management-list select,
                .dark #admin-content-editors input,
                .dark #admin-content-editors textarea,
                .dark #admin-content-editors select {
                    background-color: rgba(0, 0, 0, 0.3) !important;
                    color: #f8fafc !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                
                #student-management-list input::placeholder,
                #admin-content-editors input::placeholder,
                #admin-content-editors textarea::placeholder {
                    color: #64748b !important;
                }
                .dark #student-management-list input::placeholder,
                .dark #admin-content-editors input::placeholder,
                .dark #admin-content-editors textarea::placeholder {
                    color: #94a3b8 !important;
                }
                
                #student-management-list button.bg-green-600 {
                    background-color: #4f46e5 !important; 
                    color: #ffffff !important;
                    border-radius: 0.5rem !important;
                    font-weight: bold !important;
                    transition: all 0.3s ease;
                }
                #student-management-list button.bg-green-600:hover {
                    background-color: #4338ca !important; 
                }
            </style>

            <div class="flex h-[calc(100vh-140px)] bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl text-slate-800 dark:text-slate-200 rounded-3xl border border-white/40 dark:border-white/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300">
                
                <aside class="w-16 md:w-64 bg-white/40 dark:bg-slate-900/40 border-r border-white/40 dark:border-white/10 p-4 md:p-6 flex flex-col justify-between z-20 transition-all duration-300">
                    <div>
                        <div class="flex items-center gap-3 mb-10 overflow-hidden">
                            <div class="min-w-[40px] h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg transition-colors duration-300">⚡</div>
                            <div class="hidden md:block">
                                <h1 class="font-bold text-sm text-slate-900 dark:text-white tracking-widest uppercase transition-colors duration-300">Command Hub</h1>
                                <span class="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5 transition-colors duration-300"><span class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span> Live</span>
                            </div>
                        </div>

                        <nav class="space-y-2">
                            <button onclick="adminUI.switchTab('lobby')" id="tab-lobby" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">🛠️</span> <span class="hidden md:block whitespace-nowrap">Lobby & Modules</span>
                            </button>
                            <button onclick="adminUI.switchTab('analytics')" id="tab-analytics" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">📊</span> <span class="hidden md:block whitespace-nowrap">Live Analytics</span>
                            </button>
                            <button onclick="adminUI.switchTab('settings')" id="tab-settings" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">⚙️</span> <span class="hidden md:block whitespace-nowrap">Room Settings</span>
                            </button>
                        </nav>
                    </div>

                    <div class="bg-white/50 dark:bg-slate-800/40 p-3 md:p-4 rounded-2xl border border-white/40 dark:border-white/10 text-center transition-colors duration-300">
                        <span class="hidden md:block text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1 transition-colors duration-300">Active PIN</span>
                        <span class="md:hidden text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1 block transition-colors duration-300">PIN</span>
                        <span id="admin-pin" class="text-lg md:text-2xl font-bold text-indigo-700 dark:text-white tracking-widest transition-colors duration-300"></span>
                    </div>
                </aside>

                <main class="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 custom-scrollbar">
                    
                    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-transparent border-b border-slate-200/50 dark:border-white/10 pb-6 gap-4 transition-colors duration-300">
                        <div>
                            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Professor Control Center</h2>
                            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">Manage simultaneous multiplayer progression.</p>
                        </div>
                        <button onclick="app.hostStartGame()" id="btn-launch-game-top" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all duration-300">
                            Launch Session
                        </button>
                    </header>

                    <div id="admin-tab-lobby" class="space-y-8">
                        
                        <div id="dynamic-team-scoreboard" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div class="xl:col-span-2 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-colors duration-300 shadow-sm">
                                <div class="relative z-10">
                                    <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase transition-colors duration-300">Automated Engine</span>
                                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mt-1 mb-2 transition-colors duration-300">AI Course Generator</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-300 mb-6 font-light transition-colors duration-300">Upload a syllabus or lesson PDF. Our neural net formats all 11 modules.</p>
                                </div>
                                <div class="flex items-center gap-4 relative z-10">
                                    <input type="file" accept=".pdf" id="ai-pdf-upload" onchange="aiSimulator.handleFileUpload(event)" class="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-500/20 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-500/30 cursor-pointer transition-colors duration-300">
                                </div>
                            </div>

                            <div class="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between transition-colors duration-300 shadow-sm">
                                <div>
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="font-medium text-slate-900 dark:text-white transition-colors duration-300">Active Lobby</h3>
                                        <span class="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium transition-colors duration-300"><span id="connected-count">0</span> Players</span>
                                    </div>
                                    <ul id="admin-students-list" class="text-sm h-32 overflow-y-auto space-y-2 custom-scrollbar"></ul>
                                </div>
                            </div>
                        </div>

                        <div id="ai-loading" class="hidden py-16 text-center bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-indigo-200 dark:border-indigo-500/20 mb-6 transition-colors duration-300 shadow-lg">
                            <div class="loader mb-6" style="border-top-color: #818cf8;"></div>
                            <h3 class="text-xl font-medium text-indigo-700 dark:text-indigo-400 animate-pulse mb-2 transition-colors duration-300">Analyzing document...</h3>
                            <p class="text-slate-600 dark:text-slate-400 text-sm font-light transition-colors duration-300">Generating learning matrix.</p>
                        </div>

                        <div id="admin-content-editors" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div class="space-y-6">
                                <div class="bg-transparent">
                                    <div class="flex justify-between items-center mb-4 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Inspirational Chat</h3>
                                        <button onclick="adminUI.addItem('chatPhrase')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">+ Add</button>
                                    </div>
                                    <div id="admin-chat-list" class="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar"></div>
                                </div>

                                <div class="bg-transparent mt-8">
                                    <div class="flex justify-between items-center mb-4 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Visual Assessment (Mod 3)</h3></div>
                                    <input type="file" accept="image/*" class="w-full text-xs mb-3 text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/50 dark:file:bg-white/10 file:text-slate-800 dark:file:text-slate-200 cursor-pointer transition-colors duration-300" onchange="adminUI.handleBgUpload(event, 'mod3-admin-bg', 'hotspot-bg')">
                                    <div id="mod3-draw-container" class="relative w-full h-48 overflow-hidden border border-slate-300/50 dark:border-white/10 rounded-xl cursor-crosshair mb-3 select-none bg-white/30 dark:bg-slate-900/50 transition-colors duration-300"><img id="mod3-admin-bg" src="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80" class="w-full h-full object-contain pointer-events-none"><div id="mod3-admin-layer" class="absolute inset-0"></div></div>
                                    <div class="flex gap-2 mb-3"><input type="text" id="mod3-prompt-input" class="flex-1 text-sm p-2 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-300" placeholder="Target Prompt..."><button onclick="adminUI.addDrawnHotspot(3)" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-300">Add</button></div>
                                    <div id="admin-mod3-list" class="space-y-2 max-h-32 overflow-y-auto custom-scrollbar"></div>
                                </div>

                                <div class="bg-transparent mt-8">
                                    <div class="flex justify-between items-center mb-4 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Where's Wally (Mod 8)</h3></div>
                                    <input type="file" accept="image/*" class="w-full text-xs mb-3 text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/50 dark:file:bg-white/10 file:text-slate-800 dark:file:text-slate-200 cursor-pointer transition-colors duration-300" onchange="adminUI.handleBgUpload(event, 'mod8-admin-bg', 'wally-bg')">
                                    <div id="mod8-draw-container" class="relative w-full h-48 overflow-hidden border border-slate-300/50 dark:border-white/10 rounded-xl cursor-crosshair mb-3 select-none bg-white/30 dark:bg-slate-900/50 transition-colors duration-300"><img id="mod8-admin-bg" src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80" class="w-full h-full object-contain pointer-events-none"><div id="mod8-admin-layer" class="absolute inset-0"></div></div>
                                    <div class="flex gap-2 mb-3"><input type="text" id="mod8-prompt-input" class="flex-1 text-sm p-2 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-300" placeholder="Target Prompt..."><button onclick="adminUI.addDrawnHotspot(8)" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-300">Add</button></div>
                                    <div id="admin-mod8-list" class="space-y-2 max-h-32 overflow-y-auto custom-scrollbar"></div>
                                </div>
                            </div>

                            <div class="space-y-8 overflow-y-auto max-h-[850px] pr-4 custom-scrollbar">
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Vocabulary (Mods 1, 2, 4)</h4><button onclick="adminUI.addItem('vocab')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-vocab-list" class="space-y-3"></div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Audio Guessing (Mod 5)</h4><button onclick="adminUI.addItem('audioGuess')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-audio-list" class="space-y-3"></div>
                                </div>
                                <div class="flex flex-col xl:flex-row gap-8">
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Spelling (Mod 6)</h4><button onclick="adminUI.addItem('spellingBee')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">+</button></div>
                                        <div id="admin-spelling-list" class="space-y-3"></div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Hangman (Mod 7)</h4><button onclick="adminUI.addItem('hangman')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">+</button></div>
                                        <div id="admin-hangman-list" class="space-y-3"></div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Read Aloud (Mod 9)</h4><button onclick="adminUI.addItem('readAloud')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-read-list" class="space-y-3"></div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Dictation (Mod 10)</h4><button onclick="adminUI.addItem('dictation')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-dict-list" class="space-y-3"></div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Final Quiz (Mod 11)</h4><button onclick="adminUI.addItem('quiz')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-quiz-list" class="space-y-3"></div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-12 mb-4 flex justify-center w-full">
                            <button onclick="app.hostStartGame()" id="btn-start-test-bottom" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-semibold py-3 px-10 text-lg rounded-xl shadow-lg transition-all duration-300 w-full max-w-md mx-auto">
                                Launch Session
                            </button>
                        </div>
                    </div>

                    <div id="admin-tab-analytics" class="hidden space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center transition-colors duration-300 shadow-sm">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Class Skill Breakdown</h3>
                                <div><canvas id="classRadarChart" class="w-full max-h-64"></canvas></div>
                            </div>
                            <div class="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center transition-colors duration-300 shadow-sm">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Student Demographics</h3>
                                <div><canvas id="demographicsChart" class="w-full max-h-64"></canvas></div>
                            </div>
                            <div class="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-6 rounded-3xl transition-colors duration-300 shadow-sm">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Detailed Stats</h3>
                                <div id="analytics-player-list" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar"></div>
                            </div>
                        </div>
                        
                        <!-- 🔥 FIXED: Navigates back to the Dashboard Lobby Tab 🔥 -->
                        <div id="prof-game-controls" class="mt-8 hidden bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 p-8 rounded-3xl text-center transition-colors duration-300 backdrop-blur-md shadow-md">
                            <h3 class="font-bold text-white mb-6 text-2xl uppercase tracking-widest transition-colors duration-300" id="prof-current-module">Ready to Start</h3>
                            <div class="flex justify-center gap-4 flex-wrap">
                                <button onclick="app.hostNextModule()" id="btn-broadcast-next" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                                    Broadcast Next Module
                                </button>
                                <button onclick="adminUI.toggleLiveView()" id="btn-toggle-live" class="bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300/50 dark:border-white/10 font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-sm">
                                    Live Game View
                                </button>
                                <!-- The Corrected Return to Dashboard Button -->
                                <button onclick="adminUI.switchTab('lobby')" id="btn-end-session" class="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                                    🛑 Return to Dashboard Lobby
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="admin-tab-settings" class="hidden space-y-10">
                        
                        <div class="bg-transparent w-full">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-4 text-sm tracking-wider uppercase border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300">Update Credentials</h3>
                            
                            <div class="flex flex-col sm:flex-row gap-5 items-center">
                                <div class="relative w-16 h-16 shrink-0 rounded-full bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/20 overflow-hidden transition-colors duration-300 shadow-inner">
                                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" id="new-prof-avatar-preview" class="w-full h-full object-cover opacity-50">
                                    <input type="file" accept="image/*" onchange="adminUI.handleProfAvatar(event)" class="absolute inset-0 opacity-0 cursor-pointer" title="Change Professor Photo">
                                </div>
                                <input type="text" id="new-prof-user" placeholder="New Username" class="w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                <input type="password" id="new-prof-pass" placeholder="New Password" class="w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                <button onclick="adminUI.changeProfCredentials()" id="btn-save-prof-pass" class="w-full sm:w-auto bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all duration-300 whitespace-nowrap text-sm">Save</button>
                            </div>
                        </div>

                        <div class="bg-transparent w-full max-w-xl">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-4 text-sm tracking-wider uppercase border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300">Manage Animal Teams</h3>
                            <div class="flex gap-3 mb-4">
                                <select id="new-team-animal" class="p-2.5 rounded-lg w-full bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-slate-200 transition-colors duration-300">
                                    <option value="lion">🦁 Lions</option>
                                    <option value="eagle">🦅 Eagles</option>
                                    <option value="wolf">🐺 Wolves</option>
                                    <option value="shark">🦈 Sharks</option>
                                    <option value="tiger">🐯 Tigers</option>
                                    <option value="bear">🐻 Bears</option>
                                    <option value="dragon">🐉 Dragons</option>
                                    <option value="panda">🐼 Pandas</option>
                                </select>
                                <button onclick="adminUI.addTeam()" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm">Add</button>
                            </div>
                            <div id="admin-team-list" class="max-h-48 overflow-y-auto pr-2 custom-scrollbar"></div>
                        </div>

                        <div class="bg-transparent w-full">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-6 text-sm tracking-wider uppercase flex items-center justify-between border-b border-slate-300/50 dark:border-white/10 pb-2 transition-colors duration-300">
                                Student Roster Management
                                <button onclick="adminUI.renderStudentManagement()" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">↻ Refresh</button>
                            </h3>
                            
                            <div class="mb-8">
                                <div class="flex flex-col lg:flex-row gap-4 items-center">
                                    <div class="relative w-12 h-12 shrink-0 bg-white/50 dark:bg-slate-900/50 rounded-full border border-white/60 dark:border-white/20 overflow-hidden transition-colors duration-300 shadow-inner">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" id="manual-student-avatar-preview" class="w-full h-full object-cover opacity-30">
                                        <input type="file" accept="image/*" onchange="adminUI.handleManualStudentAvatar(event)" class="absolute inset-0 opacity-0 cursor-pointer" title="Upload Photo">
                                    </div>

                                    <input type="text" id="manual-student-name" placeholder="Full Name" class="flex-1 w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    
                                    <div class="flex-1 w-full flex gap-2">
                                        <select id="manual-student-cc" class="p-2.5 rounded-lg w-24 text-xs font-mono bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-slate-200 transition-colors duration-300">
                                            <optgroup label="N. America"><option value="+1" selected>US +1</option><option value="+52">MX +52</option></optgroup>
                                        </select>
                                        <input type="tel" id="manual-student-phone" placeholder="Phone" class="w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    </div>
                                    
                                    <input type="password" id="manual-student-pass" placeholder="Password" class="flex-1 w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    
                                    <select id="manual-student-team" class="flex-1 w-full p-2.5 rounded-lg bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-slate-200 transition-colors duration-300">
                                        <!-- Populated by JS -->
                                    </select>

                                    <button onclick="adminUI.manualRegisterStudent()" class="w-full lg:w-auto bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-colors duration-300 whitespace-nowrap text-sm">Create Student</button>
                                </div>
                            </div>

                            <div id="student-management-list" class="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                <!-- Populated by JS -->
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }
}

customElements.define('prof-dashboard', ProfDashboard);