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
            reader.readAsText(file);
            event.target.value = ''; 
            return;
        }

        // Standard Text/PDF Fallback
        document.getElementById('admin-content-editors').classList.add('hidden');
        document.getElementById('ai-loading').classList.remove('hidden');

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
            document.getElementById('ai-loading').classList.add('hidden');
            document.getElementById('admin-content-editors').classList.remove('hidden');
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
        // NOTE: Keep API keys secure in production!
        const API_KEY = "AQ.Ab8RN6IAwi74Be9MM5gO6KIRbeTak5CwHWWdpF-gsTweSvoreg";
        
        // 🔥 CRITICAL FIX: Prompt strictly enforces the Phase 6 RPG Module Schema
        const prompt = `You are an expert instructional designer. Extract the text: ${text}. 
        You must output your response as strictly valid JSON matching this exact 11-module structure. Do not include markdown code blocks, just the raw JSON:
        {
          "vocabulary": [{"term": "word", "def": "definition"}],
          "puzzleMatch": { "questions": [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0}] },
          "hotspots": [],
          "ticTacToe": [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0}],
          "audioGuess": [{"desc": "Concept to read aloud", "options": ["A", "B", "C", "D"], "answer": 0}],
          "spellingBee": [{"word": "spelling"}],
          "hangman": [{"phrase": "SHORT PHRASE"}],
          "memoryMatch": [{"term": "Concept", "match": "Pair"}],
          "readAloud": [{"text": "Short sentence to practice speaking."}],
          "dictation": [{"text": "Short sentence to practice listening."}],
          "quiz": [{"q": "Final Question?", "options": ["A", "B", "C", "D"], "answer": 0}],
          "chatPhrases": ["Great job!", "Keep going!"]
        }`;
        
        try {
            // 🔥 CRITICAL FIX: Upgraded to Gemini 1.5 Flash (Valid Model)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: prompt }] }], 
                    generationConfig: { 
                        temperature: 0.1,
                        responseMimeType: "application/json" 
                    } 
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("GOOGLE API ERROR DETAILS:", errData);
                throw new Error(errData.error?.message || "Google API rejected request.");
            }

            const data = await response.json();
            let jsonString = data.candidates[0].content.parts[0].text;
            
            // 🔥 FIX: Cleanly parse markdown safely on a single line
            return JSON.parse(jsonString.replace(/```json/gi, '').replace(/```/g, '').trim());
        } catch (error) { 
            throw new Error("AI parsing failed: " + error.message); 
        }
    },

    populateEditors(data) {
        // 🔥 CRITICAL FIX: Use structuredClone to prevent array reference mutation
        window.lessonData = structuredClone(data);
        
        // Ensure core arrays exist to prevent Admin Controller crashes
        window.lessonData.activeModules = [1,2,3,4,5,6,7,8,9,10,11];
        
        if (window.adminUI && typeof window.adminUI.renderContentEditors === 'function') {
            window.adminUI.renderContentEditors();
        }
    }
};

// 🚀 The Global Timer Engine
export const timerManager = {
    timeLeft: 60, interval: null, isActive: false,
    
    start() { this.stop(); this.timeLeft = 60; this.isActive = true; this.updateUI(); this.interval = setInterval(() => this.tick(), 1000); },
    pause() { if (this.isActive) clearInterval(this.interval); },
    resume() { if (this.isActive) { clearInterval(this.interval); this.interval = setInterval(() => this.tick(), 1000); } },
    stop() { clearInterval(this.interval); this.isActive = false; document.getElementById('global-timer-container').classList.add('hidden'); },
    
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