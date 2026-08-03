// 🏗️ Utilities.js
// Secondary logic controllers: Shop, AI Simulator, Image Compression, and Global Timer.

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

        // Standard Text/PDF Fallback (If API is working)
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
        // 🚀 Corrected API Key
        const API_KEY = "AQ.Ab8RN6IAwi74Be9MM5gO6KIRbeTak5CwHWWdpF-gsTweSvoreg";
        const prompt = `You are an expert instructional designer. Extract the text: ${text}. 
        You must output your response as strictly valid JSON matching this exact structure:
        {
          "vocabulary": [{"term": "", "definition": ""}],
          "audioGuessing": {"concept": "", "correctAnswer": "", "wrongAnswers": []},
          "spelling": "",
          "hangman": "",
          "readAloud": "",
          "dictation": "",
          "finalQuiz": [{"question": "", "options": [], "answer": ""}]
        }`;
        
        try {
            // 🚀 Upgraded to the newest gemini-3.6-flash model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: prompt }] }], 
                    // 🚀 Force the AI to only return JSON data
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
            return JSON.parse(jsonString.replace(/```json/gi, '').replace(/```/g, '').trim());
        } catch (error) { 
            throw new Error(error.message); 
        }
    },

    populateEditors(data) {
        window.lessonData = JSON.parse(JSON.stringify(data));
        
        // 🧹 Wipe the old hardcoded images completely clean
        const mod3bg = document.getElementById('mod3-admin-bg');
        if (mod3bg) mod3bg.src = ''; 
        if (window.lessonData.visualAssessment) window.lessonData.visualAssessment.image = '';

        const mod8bg = document.getElementById('mod8-admin-bg') || document.getElementById('wally-bg');
        if (mod8bg) mod8bg.src = '';
        if (window.lessonData.wheresWally) window.lessonData.wheresWally.image = '';

        if (window.adminUI && typeof window.adminUI.renderContentEditors === 'function') {
            window.adminUI.renderContentEditors();
        }
    }
};

// 🚀 NEW: The Image Compression Manager
export const imageManager = {
    async handleUpload(event, moduleId) {
        const file = event.target.files[0];
        if (!file) return;

        if (window.toast) window.toast("Compressing image for multiplayer...", true);

        try {
            // Compress image to max 800px width, 70% JPEG quality
            const compressedImage = await this.compressImage(file, 800, 0.7);
            
            // 1. Update the UI visibly for the Professor
            let imgElement;
            if (moduleId === 3) imgElement = document.getElementById('mod3-admin-bg');
            if (moduleId === 8) imgElement = document.getElementById('mod8-admin-bg') || document.getElementById('wally-bg');
            if (imgElement) imgElement.src = compressedImage;

            // 2. Save to global lesson data to push to students
            if (!window.lessonData) window.lessonData = {};
            if (moduleId === 3) {
                if (!window.lessonData.visualAssessment) window.lessonData.visualAssessment = {};
                window.lessonData.visualAssessment.image = compressedImage;
            }
            if (moduleId === 8) {
                if (!window.lessonData.wheresWally) window.lessonData.wheresWally = {};
                window.lessonData.wheresWally.image = compressedImage;
            }

            if (window.toast) window.toast("Image compressed and loaded successfully!", true);

        } catch (error) {
            console.error("Compression Error:", error);
            if (window.toast) window.toast("Error compressing image.", false);
        }
    },

    compressImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
        if (!tc || !tt || !ts) return;
        
        tc.classList.remove('hidden', 'border-green-500', 'border-yellow-500', 'border-red-500', 'bg-red-900', 'scale-110', 'animate-bounce');
        tt.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500', 'text-white');
        ts.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500', 'text-white');

        if (this.timeLeft > 40) {
            tc.classList.add('border-green-500'); tt.classList.add('text-green-500'); ts.classList.add('text-green-500');
        } else if (this.timeLeft > 20) {
            tc.classList.add('border-yellow-500'); tt.classList.add('text-yellow-500'); ts.classList.add('text-yellow-500');
        } else {
            tc.classList.add('border-red-500'); tt.classList.add('text-red-500'); ts.classList.add('text-red-500');
            if (this.timeLeft <= 10) { tc.classList.add('bg-red-900', 'scale-110'); tt.classList.add('text-white'); ts.classList.add('text-white'); }
        }
        tt.innerText = this.timeLeft;
    }
};