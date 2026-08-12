// ProfDashboard.js
// Strict Dual-Mode Framework: Crisp Light / Glass Dark

export class ProfDashboard extends HTMLElement {
    
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #818cf8; 
                    border-radius: 10px;
                }
                .dark ::-webkit-scrollbar-thumb {
                    background-color: rgba(99,102,241,0.5); 
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color: #6366f1;
                }

                #admin-team-list > div {
                    background-color: #f8fafc !important; 
                    border: 1px solid #e2e8f0 !important; 
                    color: #1e293b !important;
                    box-shadow: none !important;
                    border-radius: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                    padding: 0.75rem 1rem !important;
                    transition: all 0.3s ease;
                }
                .dark #admin-team-list > div {
                    background-color: rgba(30, 41, 59, 0.8) !important; 
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #f1f5f9 !important;
                }
                .dark #admin-team-list > div span, .dark #admin-team-list > div div { color: #f1f5f9 !important; }
                
                #student-management-list > div {
                    background-color: #f8fafc !important; 
                    border: 1px solid #e2e8f0 !important; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
                    border-radius: 1rem !important;
                    margin-bottom: 0.75rem !important;
                    color: #1e293b !important;
                    transition: all 0.3s ease;
                }
                .dark #student-management-list > div {
                    background-color: rgba(30, 41, 59, 0.8) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #f1f5f9 !important;
                    box-shadow: none !important;
                }
                .dark #student-management-list > div h4, 
                .dark #student-management-list > div p { color: #f1f5f9 !important; }
                
                #student-management-list span.phone-badge {
                    background-color: #e2e8f0 !important;
                    color: #475569 !important;
                    border: none !important;
                    transition: all 0.3s ease;
                }
                .dark #student-management-list span.phone-badge {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    color: #cbd5e1 !important;
                }
                
                #admin-mod3-list > div,
                #admin-mod8-list > div {
                    background-color: #f8fafc !important;
                    border: 1px solid #cbd5e1 !important;
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
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                    border: 1px solid #cbd5e1 !important;
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
                    color: #94a3b8 !important; 
                }
                .dark #student-management-list input::placeholder,
                .dark #admin-content-editors input::placeholder,
                .dark #admin-content-editors textarea::placeholder {
                    color: #94a3b8 !important;
                }

                .dark select option, .dark select optgroup {
                    background-color: #1e293b !important;
                    color: #f1f5f9 !important;
                }
            </style>

            <div class="flex items-start min-h-[calc(100vh-140px)] w-full max-w-[1600px] xl:max-w-[95vw] mx-auto bg-white dark:bg-slate-900/40 backdrop-blur-none dark:backdrop-blur-2xl text-slate-800 dark:text-slate-200 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300">
                
                <aside class="w-16 md:w-64 bg-slate-50 dark:bg-transparent border-r border-slate-200 dark:border-white/10 p-4 md:p-6 flex flex-col justify-between z-20 transition-all duration-300 shrink-0 sticky top-8 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                    <div>
                        <div class="flex items-center gap-3 mb-10 overflow-hidden">
                            <div class="min-w-[40px] h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg transition-colors duration-300">&#9889;</div>
                            <div class="hidden md:block">
                                <h1 class="font-bold text-sm text-slate-900 dark:text-white tracking-widest uppercase transition-colors duration-300">Command Hub</h1>
                                <span class="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5 transition-colors duration-300"><span class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span> Live</span>
                            </div>
                        </div>

                        <nav class="space-y-2">
                            <button onclick="adminUI.switchTab('lobby')" id="tab-lobby" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">&#128736;</span> <span class="hidden md:block whitespace-nowrap">Lobby & Modules</span>
                            </button>
                            <button onclick="adminUI.switchTab('analytics')" id="tab-analytics" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">&#128202;</span> <span class="hidden md:block whitespace-nowrap">Live Analytics</span>
                            </button>
                            <button onclick="adminUI.switchTab('settings')" id="tab-settings" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-all duration-300">
                                <span class="text-lg">&#9881;</span> <span class="hidden md:block whitespace-nowrap">Room Settings</span>
                            </button>
                        </nav>
                    </div>

                    <div class="bg-white dark:bg-slate-800/40 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-center transition-colors duration-300 shadow-sm dark:shadow-none mt-8">
                        <span class="hidden md:block text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1 transition-colors duration-300">Active PIN</span>
                        <span class="md:hidden text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1 block transition-colors duration-300">PIN</span>
                        <span id="admin-pin" class="text-lg md:text-2xl font-bold text-indigo-700 dark:text-white tracking-widest transition-colors duration-300"></span>
                    </div>
                </aside>

                <main class="flex-1 p-4 md:p-8 space-y-6 relative z-10">
                    
                    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-transparent border-b border-slate-200 dark:border-white/10 pb-6 gap-4 transition-colors duration-300">
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
                            <div class="xl:col-span-2 bg-slate-50 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-colors duration-300 shadow-sm dark:shadow-none">
                                <div class="relative z-10">
                                    <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase transition-colors duration-300">Automated Engine</span>
                                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mt-1 mb-2 transition-colors duration-300">AI Course Generator</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-300 mb-6 font-light transition-colors duration-300">Upload a syllabus or lesson PDF. Our neural net formats all 11 modules.</p>
                                </div>
                                <div class="flex items-center gap-4 relative z-10">
                                    <input type="file" accept=".pdf" id="ai-pdf-upload" onchange="aiSimulator.handleFileUpload(event)" class="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-500/20 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-500/30 cursor-pointer transition-colors duration-300">
                                </div>
                            </div>

                            <div class="bg-slate-50 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between transition-colors duration-300 shadow-sm dark:shadow-none">
                                <div>
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="font-medium text-slate-900 dark:text-white transition-colors duration-300">Active Lobby</h3>
                                        <span class="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium transition-colors duration-300"><span id="connected-count">0</span> Players</span>
                                    </div>
                                    <ul id="admin-students-list" class="text-sm h-32 overflow-y-auto space-y-2"></ul>
                                </div>
                            </div>
                        </div>

                        <div id="ai-loading" class="hidden py-16 text-center bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-3xl border border-indigo-200 dark:border-indigo-500/20 mb-6 transition-colors duration-300 shadow-lg dark:shadow-none">
                            <div class="loader mb-6" style="border-top-color: #818cf8;"></div>
                            <h3 class="text-xl font-medium text-indigo-700 dark:text-indigo-400 animate-pulse mb-2 transition-colors duration-300">Analyzing document...</h3>
                            <p class="text-slate-600 dark:text-slate-400 text-sm font-light transition-colors duration-300">Generating learning matrix.</p>
                        </div>

                        <div id="admin-content-editors" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            
                            <div class="xl:col-span-2 space-y-6">
                                <button onclick="adminUI.saveContent()" class="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-2">
                                    &#128190; Save All Lesson Changes
                                </button>
                                
                                <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300">
                                    <h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase mb-4 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">Active Modules Selector</h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" id="active-modules-toggles">
                                        ${[1,2,3,4,5,6,7,8,9,10,11].map(m => `
                                            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:text-indigo-600">
                                                <input type="checkbox" class="module-toggle w-4 h-4 rounded text-indigo-600 bg-white dark:bg-black/30 border-slate-300 dark:border-white/20 focus:ring-indigo-500 transition-colors duration-300" data-mod="${m}" checked>
                                                Module ${m}
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-6">
                                <div class="bg-transparent">
                                    <div class="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Inspirational Chat</h3>
                                        <button onclick="adminUI.addItem('chatPhrase')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">+ Add</button>
                                    </div>
                                    <div id="admin-chat-list" class="space-y-2 pr-2"></div>
                                </div>

                                <div class="bg-transparent mt-8">
                                    <div class="flex justify-between items-center mb-2 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h3 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Visual Assessment (Mod 3)</h3>
                                    </div>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">1. Upload an image. 2. Click and drag on the image to draw a target zone. 3. Enter a prompt and click Add.</p>
                                    
                                    <input type="file" accept="image/*" class="w-full text-xs mb-4 text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 dark:file:bg-white/10 file:text-slate-800 dark:file:text-slate-200 cursor-pointer transition-colors duration-300" onchange="adminUI.handleBgUpload(event, 'mod3-admin-bg', 'hotspot-bg')">
                                    
                                    <!-- 🔥 UPGRADED: Cinematic aspect-video container for accurate drawing 🔥 -->
                                    <div id="mod3-draw-container" class="relative w-full aspect-video overflow-hidden border-2 border-indigo-400 dark:border-indigo-500/50 rounded-2xl cursor-crosshair mb-4 select-none bg-slate-100 dark:bg-slate-900/80 transition-all duration-300 shadow-inner">
                                        <img id="mod3-admin-bg" src="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80" class="w-full h-full object-contain pointer-events-none">
                                        <div id="mod3-admin-layer" class="absolute inset-0"></div>
                                    </div>
                                    
                                    <div class="flex gap-2 mb-4">
                                        <input type="text" id="mod3-prompt-input" class="flex-1 text-sm p-3 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-300" placeholder="e.g., 'Find the red button...'">
                                        <button onclick="adminUI.addDrawnHotspot(3)" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-sm rounded-lg font-bold shadow-md transition-colors duration-300">Add Target</button>
                                    </div>
                                    <div id="admin-mod3-list" class="space-y-2"></div>
                                </div>

                                <div class="bg-transparent mt-8">
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Memory Match (Mod 8)</h4>
                                        <button onclick="adminUI.addItem('memoryMatch')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button>
                                    </div>
                                    <select id="mod8-match-type" onchange="adminUI.renderContentEditors()" class="w-full mb-3 p-2 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 text-sm focus:border-indigo-500 transition-colors duration-300 text-slate-900 dark:text-slate-200">
                                        <option value="text-text">&#128221; Text to Text</option>
                                        <option value="image-text">&#128444; Image to Text</option>
                                        <option value="image-image">&#128248; Image to Image</option>
                                    </select>
                                    <div id="admin-memory-list" class="space-y-3"></div>
                                </div>
                            </div>

                            <div class="space-y-8 pr-4">
                                
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Vocabulary (Mod 1)</h4><button onclick="adminUI.addItem('vocab')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-vocab-list" class="space-y-3"></div>
                                </div>

                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">PvP Puzzle (Mod 2)</h4>
                                        <button onclick="adminUI.addItem('puzzleMatch')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button>
                                    </div>
                                    <input type="file" accept="image/*" class="w-full text-xs mb-3 text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 dark:file:bg-white/10 file:text-slate-800 dark:file:text-slate-200 cursor-pointer transition-colors duration-300" onchange="adminUI.handlePuzzleBgUpload(event)">
                                    <div id="mod2-puzzle-preview" class="hidden w-full h-32 mb-3 rounded-lg bg-cover bg-center border border-slate-300 dark:border-white/20"></div>
                                    <div id="admin-puzzle-list" class="space-y-3"></div>
                                </div>

                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                        <h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Tic-Tac-Toe (Mod 4)</h4>
                                        <button onclick="adminUI.addItem('ticTacToe')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button>
                                    </div>
                                    <div id="admin-tictactoe-list" class="space-y-3"></div>
                                </div>

                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Audio Guessing (Mod 5)</h4><button onclick="adminUI.addItem('audioGuess')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-audio-list" class="space-y-3"></div>
                                </div>
                                <div class="flex flex-col xl:flex-row gap-8">
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Spelling (Mod 6)</h4><button onclick="adminUI.addItem('spellingBee')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">+</button></div>
                                        <div id="admin-spelling-list" class="space-y-3"></div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Hangman (Mod 7)</h4><button onclick="adminUI.addItem('hangman')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">+</button></div>
                                        <div id="admin-hangman-list" class="space-y-3"></div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Read Aloud (Mod 9)</h4><button onclick="adminUI.addItem('readAloud')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-read-list" class="space-y-3"></div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Dictation (Mod 10)</h4><button onclick="adminUI.addItem('dictation')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
                                    <div id="admin-dict-list" class="space-y-3"></div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300"><h4 class="font-medium text-slate-800 dark:text-slate-200 text-sm tracking-wider uppercase transition-colors duration-300">Final Quiz (Mod 11)</h4><button onclick="adminUI.addItem('quiz')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">Add +</button></div>
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
                            <div class="bg-slate-50 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center transition-colors duration-300 shadow-sm dark:shadow-none">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Class Skill Breakdown</h3>
                                <div><canvas id="classRadarChart" class="w-full max-h-64"></canvas></div>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center transition-colors duration-300 shadow-sm dark:shadow-none">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Student Demographics</h3>
                                <div><canvas id="demographicsChart" class="w-full max-h-64"></canvas></div>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-800/40 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl transition-colors duration-300 shadow-sm dark:shadow-none">
                                <h3 class="font-medium text-slate-900 dark:text-slate-200 mb-4 text-center tracking-wider uppercase text-sm transition-colors duration-300">Detailed Stats</h3>
                                <div id="analytics-player-list" class="space-y-3 max-h-64 overflow-y-auto pr-2"></div>
                            </div>
                        </div>
                        
                        <div id="prof-game-controls" class="mt-8 hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl text-center transition-colors duration-300 dark:backdrop-blur-md shadow-lg dark:shadow-md">
                            <h3 class="font-bold text-slate-900 dark:text-white mb-6 text-2xl uppercase tracking-widest transition-colors duration-300" id="prof-current-module">Ready to Start</h3>
                            <div class="flex justify-center gap-4 flex-wrap">
                                <button onclick="app.hostNextModule()" id="btn-broadcast-next" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                                    Broadcast Next Module
                                </button>
                                <button onclick="adminUI.toggleLiveView()" id="btn-toggle-live" class="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-sm">
                                    Live Game View
                                </button>
                                
                                <button onclick="adminUI.exitToLobby()" id="btn-end-session" class="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                                    &#128689; Return to Dashboard Lobby
                                </button>

                                <button onclick="adminUI.restartSession()" id="btn-restart-session" class="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                                    &#128260; Restart Session
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="admin-tab-settings" class="hidden space-y-10">
                        
                        <div class="bg-transparent w-full">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-4 text-sm tracking-wider uppercase border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">Secure Credential Update</h3>
                            
                            <div class="flex flex-col md:flex-row gap-5 items-start">
                                <div class="relative w-20 h-20 shrink-0 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/20 overflow-hidden transition-colors duration-300 shadow-inner">
                                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" id="new-prof-avatar-preview" class="w-full h-full object-cover opacity-50">
                                    <input type="file" accept="image/*" onchange="adminUI.handleProfAvatar(event)" class="absolute inset-0 opacity-0 cursor-pointer" title="Change Professor Photo">
                                </div>
                                <div class="w-full space-y-3">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input type="text" id="current-prof-email" placeholder="* Current Login Email (Required)" class="w-full p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 focus:border-red-500 font-medium text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                        <input type="password" id="current-prof-pass" placeholder="* Current Password (Required)" class="w-full p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 focus:border-red-500 font-medium text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input type="text" id="new-prof-user" placeholder="New Display Name" class="w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                        <input type="text" id="new-prof-email" placeholder="New Email Address" class="w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                        <input type="password" id="new-prof-pass" placeholder="New Password" class="w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    </div>
                                </div>
                                <button onclick="adminUI.changeProfCredentials()" id="btn-save-prof-pass" class="w-full md:w-auto bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-2.5 mt-1 rounded-lg font-medium shadow-md transition-all duration-300 whitespace-nowrap text-sm h-full">Verify & Save</button>
                            </div>
                        </div>

                        <div class="bg-transparent w-full max-w-xl">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-4 text-sm tracking-wider uppercase border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">Manage Custom Teams</h3>
                            <div class="flex gap-2 w-full mb-4">
                                <input type="text" id="new-team-icon" placeholder="&#128526;" class="w-16 p-2.5 rounded-lg text-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-medium text-lg text-slate-900 dark:text-slate-200 transition-colors duration-300" maxlength="2">
                                <input type="text" id="new-team-name" placeholder="Enter Team Name..." class="flex-1 p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-medium text-sm text-slate-900 dark:text-slate-200 transition-colors duration-300">
                                <button onclick="adminUI.addTeam()" class="bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm">Add</button>
                            </div>
                            <div id="admin-team-list" class="max-h-48 overflow-y-auto pr-2"></div>
                        </div>

                        <div class="bg-transparent w-full">
                            <h3 class="font-medium text-slate-800 dark:text-slate-200 mb-6 text-sm tracking-wider uppercase flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 transition-colors duration-300">
                                Student Roster Management
                                <button onclick="adminUI.renderStudentManagement()" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300">&#8635; Refresh</button>
                            </h3>
                            
                            <div id="pending-approvals-wrapper" class="hidden mb-6">
                                <h4 class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Requires Approval</h4>
                                <div id="pending-approvals-list" class="space-y-3"></div>
                            </div>
                            
                            <h4 class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 border-t border-slate-200 dark:border-white/10 pt-4 mt-6">Active Roster & Manual Add</h4>

                            <div class="mb-8">
                                <div class="flex flex-col lg:flex-row gap-4 items-center">
                                    <div class="relative w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded-full border border-slate-300 dark:border-white/20 overflow-hidden transition-colors duration-300 shadow-inner">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" id="manual-student-avatar-preview" class="w-full h-full object-cover opacity-30">
                                        <input type="file" accept="image/*" onchange="adminUI.handleManualStudentAvatar(event)" class="absolute inset-0 opacity-0 cursor-pointer" title="Upload Photo">
                                    </div>

                                    <input type="text" id="manual-student-name" placeholder="Full Name" class="flex-1 w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    
                                    <div class="flex-1 w-full flex gap-2">
                                        <select id="manual-student-cc" class="p-2.5 rounded-lg w-24 text-xs font-mono bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-slate-200 transition-colors duration-300 custom-scrollbar">
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
                                        <input type="tel" id="manual-student-phone" placeholder="Phone" class="w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    </div>
                                    
                                    <input type="password" id="manual-student-pass" placeholder="Password" class="flex-1 w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-white transition-colors duration-300">
                                    
                                    <select id="manual-student-team" class="flex-1 w-full p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 font-light text-sm text-slate-900 dark:text-slate-200 transition-colors duration-300">
                                        <!-- Populated by JS -->
                                    </select>

                                    <button onclick="adminUI.manualRegisterStudent()" class="w-full lg:w-auto bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-colors duration-300 whitespace-nowrap text-sm">Create Student</button>
                                </div>
                            </div>

                            <div id="student-management-list" class="pr-2">
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