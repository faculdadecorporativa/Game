// AppHeader.js
// 🏗️ Web Component for the App Header (Strict Dual-Mode Framework with Embedded Jitsi & Breakout Rooms)

export class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.jitsiApi = null;
        this.currentRoom = 'FaculdadeCorporativaClass';
    }
    
    connectedCallback() {
        this.render();
        window.appHeader = this; // Expose instance globally for button event handlers
    }

    render() {
        this.innerHTML = `
            <style>
                /* =========================================================
                   HUD TEXT & BADGE: DUAL-MODE UI CONTRAST FIXES
                   ========================================================= */
                
                /* Light Mode: Force HUD text to crisp dark slate */
                #player-hud-container * {
                    color: #1e293b !important; /* slate-800 */
                    font-weight: 700 !important;
                }
                
                /* Light Mode: Force injected HUD badge background to light indigo */
                #player-hud-container > div,
                #player-hud-container [class*="bg-"] {
                    background-color: #e0e7ff !important; /* indigo-100 */
                    border-color: #c7d2fe !important; /* indigo-200 */
                    border-width: 1px !important;
                    border-style: solid !important;
                }
                
                /* Dark Mode: Force HUD text to pure white */
                .dark #player-hud-container * {
                    color: #ffffff !important;
                }
                
                /* Dark Mode: Maintain premium dark glass badge */
                .dark #player-hud-container > div,
                .dark #player-hud-container [class*="bg-"] {
                    background-color: rgba(30, 30, 40, 0.6) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
            </style>

            <!-- MAIN HEADER: Frosted Glass in both modes for seamless overlay -->
            <header class="bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl text-slate-800 dark:text-slate-100 shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 transition-all duration-300" id="main-header">
                <div class="max-w-[1920px] mx-auto px-4 py-3 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <button onclick="app.exitToHome()" id="btn-exit-home" class="flex items-center justify-center w-10 h-10 text-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm hover:-translate-y-1 active:scale-95 cursor-pointer" title="Exit to Home">⬅️</button>
                        
                        <button onclick="window.dashboardController.openDashboard()" id="btn-dashboard" class="flex items-center justify-center w-10 h-10 text-xl bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/40 border border-indigo-200 dark:border-indigo-500/30 rounded-full transition-all duration-300 shadow-sm hover:-translate-y-1 active:scale-95 cursor-pointer" title="My Dashboard">📊</button>
                        
                        <!-- ADDED: Shop Button -->
                        <button onclick="window.shopController.openShop()" id="btn-shop" class="flex items-center justify-center w-10 h-10 text-xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/40 border border-amber-200 dark:border-amber-500/30 rounded-full transition-all duration-300 shadow-sm hover:-translate-y-1 active:scale-95 cursor-pointer" title="Avatar Shop">🛍️</button>

                        <!-- EMBEDDED JITSI MEET BUTTON -->
                        <button onclick="window.appHeader.openJitsiModal()" id="btn-meet" class="flex items-center justify-center w-10 h-10 text-xl bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/40 border border-emerald-200 dark:border-emerald-500/30 rounded-full transition-all duration-300 shadow-sm hover:-translate-y-1 active:scale-95 cursor-pointer" title="Join Class Meeting">📹</button>

                        <h1 class="text-xl font-bold tracking-tight hidden sm:block">Faculdade <span class="text-indigo-600 dark:text-indigo-400">Corporativa</span> <span id="room-code-display" class="ml-2 text-indigo-700 dark:text-white font-bold font-mono hidden transition-colors duration-300"></span></h1>
                    </div>
                    
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <div id="game-status" class="hidden flex items-center space-x-4 sm:space-x-6">
                            
                            <!-- Global Timer mounts here and is styled by Utilities.js -->
                            <div id="global-timer-container" class="hidden">
                                <span id="global-timer">60</span><span id="global-timer-sec">s</span>
                            </div>
                            
                            <!-- Player/Host HUD -->
                            <div id="player-hud-container"></div>
                        </div>
                        
                        <!-- 🌞/🌙 Light/Dark Mode Toggle Switch -->
                        <button onclick="document.documentElement.classList.toggle('dark');" class="flex items-center justify-center w-10 h-10 text-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-300 shadow-sm hover:-translate-y-1 active:scale-95 cursor-pointer" title="Toggle Theme">
                            <span class="block dark:hidden">🌙</span>
                            <span class="hidden dark:block">☀️</span>
                        </button>
                    </div>
                </div>
                
                <div id="scoreboard-container" class="hidden bg-transparent text-sm transition-all duration-300">
                    <div class="max-w-[1920px] mx-auto px-4 py-2 flex gap-4 overflow-x-auto custom-scrollbar" id="scoreboard-list"></div>
                </div>
            </header>

            <!-- =========================================================
                 EMBEDDED JITSI MODAL & BREAKOUT ROOM CONTROLS
                 ========================================================= -->
            <div id="jitsi-modal" class="fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
                <div class="relative w-full max-w-6xl h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                    
                    <!-- Modal Header Toolbar -->
                    <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <div class="flex items-center gap-3">
                            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
                                <span id="jitsi-room-title">Main Class Room</span>
                            </h3>
                        </div>

                        <!-- Host Breakout Controls -->
                        <div id="jitsi-breakout-controls" class="flex items-center gap-2 flex-wrap">
                            <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">Breakout Rooms:</label>
                            <select id="jitsi-room-count" class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none">
                                <option value="2">2 Rooms (10 / room)</option>
                                <option value="4" selected>4 Rooms (5 / room)</option>
                                <option value="5">5 Rooms (4 / room)</option>
                            </select>
                            <button onclick="window.appHeader.divideBreakoutRooms()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95">
                                🔀 Divide Class
                            </button>
                            <button onclick="window.appHeader.returnToMainRoom()" class="bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95">
                                🏠 Return All to Main
                            </button>
                        </div>

                        <!-- Close Button -->
                        <button onclick="window.appHeader.closeJitsiModal()" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white text-2xl font-bold transition-all rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
                            &times;
                        </button>
                    </div>

                    <!-- Jitsi Iframe Target Container -->
                    <div id="jitsi-iframe-container" class="flex-1 w-full h-full bg-slate-950 flex items-center justify-center text-slate-400">
                        <p class="animate-pulse">Loading video call...</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Load Jitsi External API Script dynamically if not present
    async loadJitsiScript() {
        if (window.JitsiMeetExternalAPI) return true;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Failed to load Jitsi SDK'));
            document.body.appendChild(script);
        });
    }

    // Open Jitsi Modal and Initialize Stream
    async openJitsiModal(roomSuffix = '') {
        const modal = this.querySelector('#jitsi-modal');
        if (modal) modal.classList.remove('hidden');

        try {
            await this.loadJitsiScript();
            
            const baseRoom = 'FaculdadeCorporativaClass';
            const roomName = roomSuffix ? `${baseRoom}_${roomSuffix}` : baseRoom;
            this.currentRoom = roomName;

            const roomTitle = this.querySelector('#jitsi-room-title');
            if (roomTitle) {
                roomTitle.textContent = roomSuffix ? `Breakout Room: ${roomSuffix.replace('Room_', 'Room ')}` : 'Main Class Room';
            }

            const container = this.querySelector('#jitsi-iframe-container');
            container.innerHTML = ''; // Reset container

            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: container,
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop', 'chat', 'raisehand',
                        'participants-pane', 'tileview', 'fullscreen', 'hangup'
                    ]
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false
                }
            };

            if (this.jitsiApi) {
                this.jitsiApi.dispose();
            }

            this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
        } catch (err) {
            console.error('Failed to load Jitsi Meet:', err);
            alert('Could not initialize video call. Check connection.');
        }
    }

    // Close Modal and Dispose API
    closeJitsiModal() {
        const modal = this.querySelector('#jitsi-modal');
        if (modal) modal.classList.add('hidden');

        if (this.jitsiApi) {
            this.jitsiApi.dispose();
            this.jitsiApi = null;
        }
    }

    // Host Action: Divide participants into breakout rooms
    async divideBreakoutRooms() {
        const select = this.querySelector('#jitsi-room-count');
        const numRooms = parseInt(select ? select.value : '4', 10);

        try {
            // Fetch connected players from PocketBase or local store
            let players = [];
            if (window.pb) {
                players = await window.pb.collection('players').getFullList();
            }

            if (!players || players.length === 0) {
                // Fallback demo distribution if no PB connected yet
                alert(`Configured ${numRooms} breakout rooms! Directing users into Room 1 through Room ${numRooms}.`);
                this.openJitsiModal('Room_1');
                return;
            }

            // Round-robin distribution of players into rooms
            for (let i = 0; i < players.length; i++) {
                const roomIndex = (i % numRooms) + 1;
                const assignedRoom = `Room_${roomIndex}`;

                // Update PocketBase player record with assigned breakout room
                await window.pb.collection('players').update(players[i].id, {
                    current_room: assignedRoom
                });
            }

            alert(`Successfully assigned ${players.length} students across ${numRooms} breakout rooms!`);
            this.openJitsiModal('Room_1');

        } catch (err) {
            console.error('Breakout room error:', err);
            alert('Failed to update breakout room assignments.');
        }
    }

    // Host Action: Pull all students back to main room
    async returnToMainRoom() {
        try {
            if (window.pb) {
                const players = await window.pb.collection('players').getFullList();
                for (const player of players) {
                    await window.pb.collection('players').update(player.id, {
                        current_room: ''
                    });
                }
            }
            this.openJitsiModal();
        } catch (err) {
            console.error('Error resetting rooms:', err);
        }
    }
}

customElements.define('app-header', AppHeader);