// 🏗️ Utilities.js
// This file houses the secondary logic controllers: Shop, AI Simulator, and the Global Timer.

export const shopManager = {
    buy(item, cost) {
        if (window.appState.me.scores.total >= cost) {
            window.appState.me.scores.total -= cost;
            if (item === 'gold') window.appState.me.border = 'border-yellow-400';
            if (item === 'diamond') window.appState.me.border = 'border-cyan-400';
            if (item === 'lifeline') window.appState.me.lifelines.fiftyFifty = true;
            
            if (window.appState.hostConn) window.appState.hostConn.send({ type: 'SHOP_PURCHASE', id: window.appState.peer.id, cost, border: window.appState.me.border });
            
            window.uiManager.updateStudentHUD();
            document.getElementById('shop-pts-display').innerText = window.appState.me.scores.total;
            window.toast("Purchase successful!", true);
        } else {
            window.toast("Not enough points!", false);
        }
    }
};

export const aiSimulator = {
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        document.getElementById('admin-content-editors').classList.add('hidden');
        document.getElementById('ai-loading').classList.remove('hidden');

        try {
            if (window.toast) window.toast("Reading PDF document...", true);
            
            // Extract Text from the PDF securely
            const extractedText = await this.extractTextFromPDF(file);
            console.log("SUCCESS! Extracted Text:", extractedText);
            
            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error("Could not find any readable text in this PDF. It may be an image scan.");
            }

            if (window.toast) window.toast("Generating Course with Gemini AI...", true);
            
            // Connect directly to Gemini API
            const aiGeneratedJSON = await this.callAI(extractedText);

            // Fill the dashboard with new data
            this.populateEditors(aiGeneratedJSON);
            
            if (window.toast) window.toast("Course generated successfully!", true);

        } catch (error) {
            console.error("AI Generation Error:", error);
            if (window.toast) window.toast(error.message, false);
        } finally {
            // Restore the UI
            document.getElementById('ai-loading').classList.add('hidden');
            document.getElementById('admin-content-editors').classList.remove('hidden');
            event.target.value = ''; 
        }
    },

    // --- PDF EXTRACTION ENGINE ---
    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    if (!window.pdfjsLib) throw new Error("PDF Library failed to load from CDN.");
                    
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                    const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText);
                } catch (err) {
                    reject(new Error("Failed to parse PDF format. Please ensure it is not encrypted."));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file from your device."));
            reader.readAsArrayBuffer(file);
        });
    },

    // --- DIRECT FRONTEND API CONNECTION TO GEMINI ---
    async callAI(text) {
        // 🔴🔴🔴 PASTE YOUR API KEY HERE 🔴🔴🔴
        const API_KEY = "AQ.Ab8RN6JCkh86Iv5JH8g_-KSEEAdUYRQhbuALOmsoNjXjfM8EPA";

        if (API_KEY === "AQ.Ab8RN6JCkh86Iv5JH8g_-KSEEAdUYRQhbuALOmsoNjXjfM8EPA") {
            throw new Error("You must paste your API key into Utilities.js line 74!");
        }

        const prompt = `
        You are an expert instructional designer. Read the following syllabus text and generate an interactive lesson plan in STRICT JSON format. Do not use markdown blocks like \`\`\`json. Return ONLY the raw JSON object.
        
        Required JSON Structure:
        {
            "vocabulary": [ { "term": "Word", "def": "Definition" }, ... (generate 5) ],
            "audioGuess": [ { "desc": "Question", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "Listening" }, ... (generate 3) ],
            "spellingBee": [ { "word": "WordFromText", "skill": "Writing" }, ... (generate 5) ],
            "hangman": [ { "phrase": "SHORT PHRASE", "skill": "General" }, ... (generate 3) ],
            "readAloud": [ { "text": "A short, important sentence from the text.", "skill": "Speaking" }, ... (generate 3) ],
            "dictation": [ { "text": "A short sentence to dictate.", "skill": "Writing" }, ... (generate 3) ],
            "quiz": [ { "q": "Question?", "options": ["A", "B", "C", "D"], "answer": 0, "skill": "General" }, ... (generate 5) ]
        }

        Syllabus Text:
        ${text}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { 
                    temperature: 0.2, 
                    responseMimeType: "application/json" 
                }
            })
        });

        if (!response.ok) {
            throw new Error("Gemini API Error: Check your API Key.");
        }

        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        
        return JSON.parse(jsonString);
    },

    // --- DATA INJECTION ---
    populateEditors(data) {
        window.lessonData = JSON.parse(JSON.stringify(data));
        
        const mod3bg = document.getElementById('mod3-admin-bg');
        if(mod3bg) mod3bg.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80';
        
        const mod8bg = document.getElementById('mod8-admin-bg');
        if(mod8bg) mod8bg.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=2000&q=80';
        
        const hsbg = document.getElementById('hotspot-bg');
        if(hsbg) hsbg.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80';
        
        const wbg = document.getElementById('wally-bg');
        if(wbg) wbg.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=2000&q=80';

        if (window.adminUI && typeof window.adminUI.renderContentEditors === 'function') {
            window.adminUI.renderContentEditors();
        }
    }
};

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
            if(window.game.isRecordingReadAloud) window.game.toggleReadAloud(); 
            else window.game.submitScore(-1, "General", "Time's Up!"); 
            window.uiManager.lockModule(); 
        } 
    },
    updateUI() {
        const tc = document.getElementById('global-timer-container'); 
        const tt = document.getElementById('global-timer');
        const ts = document.getElementById('global-timer-sec');
        
        tc.classList.remove('hidden', 'border-green-500', 'border-yellow-500', 'border-red-500', 'bg-red-900', 'scale-110', 'animate-bounce');
        tt.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500', 'text-white');
        ts.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500', 'text-white');

        if (this.timeLeft > 40) {
            tc.classList.add('border-green-500');
            tt.classList.add('text-green-500');
            ts.classList.add('text-green-500');
        } else if (this.timeLeft > 20) {
            tc.classList.add('border-yellow-500');
            tt.classList.add('text-yellow-500');
            ts.classList.add('text-yellow-500');
            if (this.timeLeft === 40) {
                window.sfx.play('alert');
                window.toast("40 seconds left!", false);
                tc.classList.add('animate-bounce');
                setTimeout(() => tc.classList.remove('animate-bounce'), 2000);
            }
        } else {
            tc.classList.add('border-red-500');
            tt.classList.add('text-red-500');
            ts.classList.add('text-red-500');
            if (this.timeLeft === 20) {
                window.sfx.play('alert');
                window.toast("Time is running out!", false);
                tc.classList.add('animate-bounce');
                setTimeout(() => tc.classList.remove('animate-bounce'), 2000);
            }
            if (this.timeLeft <= 10) {
                tc.classList.add('bg-red-900', 'scale-110');
                tt.classList.add('text-white');
                ts.classList.add('text-white');
            }
        }
        tt.innerText = this.timeLeft;
    }
};