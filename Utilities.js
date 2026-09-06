// 🏗️ Utilities.js
// Secondary logic controllers: AI Simulator, Global Timer, and safe deprecations.

// 🧹 DEPRECATED: Safely stubbed to prevent index.html import crashes. 
// Functionality moved to ShopController.js
export const shopManager = {
    buy() { console.warn("shopManager is deprecated. Use shopController.buyItem instead."); }
};

// 🧹 DEPRECATED: Safely stubbed. Functionality moved to AdminController.compressBackgroundImage
export const imageManager = {
    async handleUpload() { console.warn("imageManager is deprecated. Use adminUI compression instead."); }
};

export const aiSimulator = {
    // 🔥 FIX: this prompt template is exported so it can be reused in
    // your server-side implementation of `/api/ai/generate-course` (see
    // the note in callAI() below). Also fixes a real, high-impact bug:
    // NONE of the question types in the original prompt asked for a
    // `skill` field. GameController.js's submitScore() does
    // `me.scores[skill] += points` using each question's own `.skill`
    // value — with it missing, every AI-generated puzzle/tic-tac-toe/
    // audio/spelling/hangman/read-aloud/dictation/quiz question would
    // silently route its points into a bogus `scores.undefined` bucket
    // instead of a real category, invisible in the dashboard and
    // analytics radar chart. This is the exact same bug found and fixed
    // in data.js's seed content in an earlier batch — but here it would
    // have affected EVERY AI-generated course, not just two seed
    // datasets. Skill values below match the conventions already
    // established in data.js (General for puzzle/ticTacToe/quiz/hangman,
    // Listening for audioGuess, Writing for spellingBee/dictation,
    // Speaking for readAloud; memoryMatch and hotspots consistently have
    // no skill field anywhere else in the app, so none was added here).
    AI_COURSE_PROMPT_TEMPLATE: (text) => `You are an expert instructional designer. Extract the text: ${text}. 
        You must output your response as strictly valid JSON matching this exact 11-module structure. Do not include markdown code blocks, just the raw JSON:
        {
          "vocabulary": [{"term": "word", "def": "definition"}],
          "puzzleMatch": { "questions": [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "General"}] },
          "hotspots": [],
          "ticTacToe": [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "General"}],
          "audioGuess": [{"desc": "Concept to read aloud", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "Listening"}],
          "spellingBee": [{"word": "spelling", "skill": "Writing"}],
          "hangman": [{"phrase": "SHORT PHRASE", "skill": "General"}],
          "memoryMatch": [{"term": "Concept", "match": "Pair"}],
          "readAloud": [{"text": "Short sentence to practice speaking.", "skill": "Speaking"}],
          "dictation": [{"text": "Short sentence to practice listening.", "skill": "Writing"}],
          "quiz": [{"q": "Final Question?", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "General"}],
          "chatPhrases": ["Great job!", "Keep going!"]
        }`,

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Direct JSON Upload Bypass
        if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.populateEditors(data);
                    if (window.toast) window.toast("Course successfully loaded from JSON!", true);
                } catch (err) {
                    if (window.toast) window.toast("Error reading JSON formatting.", false);
                }
            };
            // 🔥 FIX: was missing entirely — a failed read (permissions,
            // corrupted file) would silently do nothing: no toast, no
            // console log, the UI just sits there with no feedback.
            reader.onerror = () => {
                console.error("Failed to read uploaded JSON file.");
                if (window.toast) window.toast("Couldn't read that file. Please try again.", false);
            };
            reader.readAsText(file);
            event.target.value = ''; 
            return;
        }

        // 🔥 FIX: these two lookups were unguarded and OUTSIDE the
        // try/catch below — a missing element would throw immediately,
        // before any error handling could catch it.
        const editorsEl = document.getElementById('admin-content-editors');
        const loadingEl = document.getElementById('ai-loading');
        if (editorsEl) editorsEl.classList.add('hidden');
        if (loadingEl) loadingEl.classList.remove('hidden');

        try {
            if (window.toast) window.toast("Reading document...", true);
            const extractedText = await this.extractTextFromFile(file);
            
            if (!extractedText || extractedText.trim().length === 0) throw new Error("Could not find readable text.");

            if (window.toast) window.toast("Generating course with AI...", true);
            const aiGeneratedJSON = await this.callAI(extractedText);
            this.populateEditors(aiGeneratedJSON);
            if (window.toast) window.toast("Course generated successfully!", true);

        } catch (error) {
            console.error("AI Generation Error:", error);
            if (window.toast) window.toast(error.message, false);
        } finally {
            if (loadingEl) loadingEl.classList.add('hidden');
            if (editorsEl) editorsEl.classList.remove('hidden');
            event.target.value = ''; 
        }
    },

    async extractTextFromFile(file) {
        if (file.type === "text/plain") {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("Failed to read text file."));
                reader.readAsText(file);
            });
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    if (typeof window.pdfjsLib === 'undefined') throw new Error("PDF Engine Missing!");
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                    const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                    }
                    resolve(fullText);
                } catch (err) { reject(new Error(err.message || "Failed to parse PDF.")); }
            };
            reader.onerror = () => reject(new Error("Failed to read file from your device."));
            reader.readAsArrayBuffer(file);
        });
    },

    async callAI(text) {
        // 🚨🚨🚨 CRITICAL SECURITY / FINANCIAL VULNERABILITY — the most
        // severe finding in this entire review series 🚨🚨🚨
        // The original code had a Google Gemini API key hardcoded directly
        // in this client-side JS file:
        //   const API_KEY = "AQ.Ab8RN6IAwi74Be9MM5gO6KIRbeTak5CwHWWdpF-gsTweSvoreg";
        // This file ships to every browser that loads the app. ANYONE can
        // open devtools, view source, or inspect the network tab and read
        // this key in plain text, then use it to make unlimited calls
        // against your Google AI billing account — running up charges or
        // exhausting quota with zero attribution back to your app.
        // A raw API key must NEVER appear in client-side code, full stop.
        // If this key has already shipped to any deployed build, ROTATE IT
        // IMMEDIATELY in Google AI Studio regardless of anything else here.
        //
        // The fix has to be architectural, not just a code edit: the
        // Gemini call must move server-side, where the key can be kept
        // secret. Since your stack is PocketBase, the natural place is a
        // PocketBase custom route (a Go or JS hook) that receives the
        // extracted text from the client, calls Gemini using a key read
        // from a server-side environment variable, and returns the
        // generated JSON. This function now calls that route via
        // `pb.send(...)` instead of hitting Google directly — you'll need
        // to actually implement `/api/ai/generate-course` in PocketBase's
        // hooks before this works; nothing here fabricates that backend.
        try {
            const response = await window.pb.send('/api/ai/generate-course', {
                method: 'POST',
                body: { text }
            });

            if (!response || !response.lessonData) {
                throw new Error("AI course generation returned an unexpected response.");
            }

            return response.lessonData;
        } catch (error) {
            throw new Error("AI parsing failed: " + (error.message || "Unknown error."));
        }
    },

    // 🔥 FIX: shared defensive normalization for both upload paths (direct
    // JSON upload and AI generation). Neither path previously validated
    // the shape of what it was about to hand to AdminController.js, whose
    // renderContentEditors() assumes these arrays exist (e.g.
    // `window.lessonData.puzzleMatch.questions.map(...)`) — a JSON upload
    // missing an expected key would throw the moment the editor tried to
    // render it. Mirrors the same `if(!window.lessonData.X) ... = []`
    // defensive pattern AdminController.js's own addItem()/deleteItem()
    // already use everywhere else.
    ensureLessonDataShape(data) {
        const shaped = data || {};
        shaped.vocabulary = shaped.vocabulary || [];
        shaped.puzzleMatch = shaped.puzzleMatch || { image: "", questions: [] };
        shaped.puzzleMatch.questions = shaped.puzzleMatch.questions || [];
        shaped.hotspots = shaped.hotspots || [];
        shaped.ticTacToe = shaped.ticTacToe || [];
        shaped.audioGuess = shaped.audioGuess || [];
        shaped.spellingBee = shaped.spellingBee || [];
        shaped.hangman = shaped.hangman || [];
        shaped.memoryMatch = shaped.memoryMatch || [];
        shaped.readAloud = shaped.readAloud || [];
        shaped.dictation = shaped.dictation || [];
        shaped.quiz = shaped.quiz || [];
        shaped.chatPhrases = shaped.chatPhrases || [];
        return shaped;
    },

    populateEditors(data) {
        // Use structuredClone to prevent array reference mutation
        window.lessonData = this.ensureLessonDataShape(structuredClone(data));
        
        // 🔥 FIX: was unconditionally overwriting `activeModules` to all
        // 11 modules, even for the direct-JSON-upload path where a
        // professor might have intentionally uploaded a curated subset
        // (e.g. `activeModules: [1,5,11]` for a shorter lesson). Only
        // default it when the uploaded/generated data didn't specify one.
        window.lessonData.activeModules = window.lessonData.activeModules || [1,2,3,4,5,6,7,8,9,10,11];
        
        if (window.adminUI && typeof window.adminUI.renderContentEditors === 'function') {
            window.adminUI.renderContentEditors();
        }
    }
};

// 🚀 The Global Timer Engine
export const timerManager = {
    timeLeft: 60, interval: null, isActive: false, isPaused: false,
    
    start() { this.stop(); this.timeLeft = 60; this.isActive = true; this.isPaused = false; this.updateUI(); this.interval = setInterval(() => this.tick(), 1000); },

    // 🔥 FIX: `pause()` cleared the interval but never set `isActive =
    // false` — meaning `isActive` stayed `true` throughout a paused
    // window even though nothing was actually ticking. That happened to
    // not break the pause→resume round trip itself (resume's old guard
    // also checked `isActive`, so it still worked), but `isActive` no
    // longer meant what its name says, which is a landmine for any other
    // code that reasonably assumes it reflects "is the timer currently
    // running." Added a separate `isPaused` flag so `isActive` means "a
    // countdown session is in progress" (true from start() to stop()) and
    // `isPaused` means "currently frozen within that session" — matching
    // how LifelineController.js's freezeTime already uses pause()/resume()
    // as a pair. Also drops resume()'s redundant `clearInterval` call —
    // pause() already cleared it, so resume() calling it again was a
    // harmless but pointless no-op.
    pause() { if (this.isActive && !this.isPaused) { clearInterval(this.interval); this.isPaused = true; } },
    resume() { if (this.isActive && this.isPaused) { this.isPaused = false; this.interval = setInterval(() => this.tick(), 1000); } },

    stop() { 
        clearInterval(this.interval); 
        this.isActive = false; 
        this.isPaused = false;
        // 🔥 FIX: unguarded — this is called from many places across the
        // codebase (every module's win/lose handling, LifelineController,
        // network.js's exitToHome) and a missing element used to throw.
        const container = document.getElementById('global-timer-container');
        if (container) container.classList.add('hidden');
    },
    
    tick() { 
        this.timeLeft--; 
        this.updateUI(); 
        if (this.timeLeft <= 0) { 
            this.stop(); 
            if(window.game && window.game.isRecordingReadAloud) window.game.toggleReadAloud(); 
            else if(window.game) window.game.submitScore(-1, "General", "Time's Up!"); 
            if(window.uiManager) window.uiManager.lockModule(); 
        } 
    },
    
    updateUI() {
        const tc = document.getElementById('global-timer-container'); 
        const tt = document.getElementById('global-timer');
        const ts = document.getElementById('global-timer-sec');
        if (!tc || !tt || !ts) return;
        
        // Strip all dynamic classes
        tc.className = "fixed top-6 right-6 md:top-8 md:right-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-4 shadow-lg rounded-2xl p-3 flex flex-col items-center justify-center min-w-[80px] transition-all duration-300 z-40";
        tt.className = "text-3xl font-black leading-none drop-shadow-sm transition-colors duration-300";
        ts.className = "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300";

        // 🔥 UI Polish: Dynamic Glassmorphism Threat Levels
        if (this.timeLeft > 40) {
            tc.classList.add('border-emerald-500', 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'); 
            tt.classList.add('text-emerald-600', 'dark:text-emerald-400'); 
            ts.classList.add('text-emerald-500');
        } else if (this.timeLeft > 15) {
            tc.classList.add('border-amber-500', 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', 'scale-105'); 
            tt.classList.add('text-amber-600', 'dark:text-amber-400'); 
            ts.classList.add('text-amber-500');
        } else {
            tc.classList.add('border-rose-500', 'shadow-[0_0_20px_rgba(244,63,94,0.8)]', 'animate-pulse'); 
            tt.classList.add('text-rose-600', 'dark:text-rose-400'); 
            ts.classList.add('text-rose-500');
            if (this.timeLeft <= 5) { 
                tc.classList.add('bg-rose-100', 'dark:bg-rose-900/80', 'scale-110'); 
            }
        }
        
        tt.innerText = this.timeLeft;
        tc.classList.remove('hidden');
    }
};

// 🔥 NOTE ON WINDOW BINDINGS: unlike several controllers flagged in
// earlier batches (adminUI, databaseJanitor), this file's own comments
// ("Safely stubbed to prevent index.html import crashes") strongly imply
// a central bootstrap file already imports these modules and assigns them
// to `window` in one place — which would also explain why some controllers
// in this codebase self-bind and others don't. Worth confirming directly
// against that bootstrap file rather than assuming either way. Added here
// regardless since it's a strictly safe, harmless-if-redundant addition,
// consistent with every other controller in this series that gets called
// from inline HTML.
window.aiSimulator = aiSimulator;
window.timerManager = timerManager;
window.shopManager = shopManager;
window.imageManager = imageManager;