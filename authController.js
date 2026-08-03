// 🏗️ authController.js - Strict Gatekeeper Version with Canvas Compression

export const authUI = {
    isProfRegistering: false,
    isRegistering: false,
    tempAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",

    toggleVisibility(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },
// 🚀 Dynamically load professors from Firebase into the dropdown
    async loadProfessorsDropdown() {
        const selectEl = document.getElementById('professor-select');
        if (!selectEl) return;

        selectEl.innerHTML = '<option value="" disabled selected>Select a Professor...</option>';

        try {
            const dbRef = window.firebaseDatabase.ref('users');
            const snapshot = await dbRef.orderByChild('role').equalTo('professor').once('value');
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const prof = childSnapshot.val();
                    const profUid = childSnapshot.key;
                    const profName = prof.name || prof.email || "Unnamed Professor";

                    const option = document.createElement('option');
                    option.value = profUid;
                    option.textContent = profName;
                    selectEl.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error loading professors:", error);
        }
    },
    // --- MENTOR FIX: Advanced Canvas Image Compressor for Student Registration ---
    compressImageToSquare(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 150; 
                
                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    handleAvatarUpload(e) {
        const f = e.target.files[0];
        if (f) {
            this.compressImageToSquare(f, (compressedData) => {
                this.tempAvatar = compressedData; // Store compressed image in memory
                
                // Update the visual preview circle in the modal
                const previewImgs = document.querySelectorAll('#student-avatar-preview, .modal-avatar-preview');
                previewImgs.forEach(img => {
                    if(img) img.src = compressedData;
                });
            });
        }
    },

    // --- Professor UI ---
    showProfLogin() { 
        this.isProfRegistering = false;
        this.updateProfAuthUI();
        if (window.uiManager) window.uiManager.closeModals(); 
        document.getElementById('modal-prof-login').classList.remove('hidden'); 
    },

    toggleProfAuthMode() {
        this.isProfRegistering = !this.isProfRegistering;
        this.updateProfAuthUI();
    },

    updateProfAuthUI() {
        document.getElementById('p-auth-title').innerText = this.isProfRegistering ? "Professor Registration" : "Professor Login";
        document.getElementById('p-auth-btn').innerText = this.isProfRegistering ? "Register & Request Approval" : "Login";
        document.getElementById('p-toggle-btn').innerText = this.isProfRegistering ? "Already approved? Login here" : "Need an account? Register";
        document.getElementById('p-register-fields').classList.toggle('hidden', !this.isProfRegistering);
    },
    
    async submitProfAuth() {
        const inputEmail = document.getElementById('prof-email').value.trim();
        const inputPass = document.getElementById('prof-pass').value.trim();
        const nameEl = document.getElementById('prof-name');
        const inputName = nameEl ? nameEl.value.trim() : '';
        
        try {
            if (this.isProfRegistering) {
                await window.authManager.registerProfessor(inputEmail, inputPass, inputName);
                if(window.toast) window.toast("Registration sent to Management for approval!", true);
                this.toggleProfAuthMode();
            } else {
                await window.authManager.loginProfessor(inputEmail, inputPass);
                if(window.toast) window.toast("Professor authenticated securely.", true);
                
                if (window.uiManager) window.uiManager.closeModals(); 
                const mod0 = document.getElementById('module-0');
                if (mod0) mod0.classList.add('hidden'); 
                
                if (window.app && window.app.hostGame) {
                    await window.app.hostGame(); 
                }
            }
        } catch (error) {
            if(window.toast) window.toast(`Auth Failed: ${error.message}`, false);
        }
    },

    // --- Student UI ---
    showStudentAuth() { 
        this.isRegistering = false; 
        this.updateAuthUI(); 
        if(window.uiManager) window.uiManager.closeModals(); 
        document.getElementById('modal-student-auth').classList.remove('hidden'); 
        
        // 🚀 Load the dynamic professors list instantly
        this.loadProfessorsDropdown();
    },
    
    toggleAuthMode() { 
        this.isRegistering = !this.isRegistering; 
        this.updateAuthUI(); 
    },
    
    updateAuthUI() {
        document.getElementById('s-auth-title').innerText = this.isRegistering ? "Student Registration" : "Student Login";
        document.getElementById('s-auth-btn').innerText = this.isRegistering ? "Register & Continue" : "Login";
        document.getElementById('s-toggle-btn').innerText = this.isRegistering ? "Already have an account? Login" : "Need an account? Register";
        document.getElementById('s-register-fields').classList.toggle('hidden', !this.isRegistering);
    },

    async submitStudentAuth() {
        const cc = document.getElementById('s-cc').value;
        const rawPhone = document.getElementById('s-phone').value;
        const phone = rawPhone.replace(/\D/g, ''); 
        const pass = document.getElementById('s-pass').value.trim();
        const nameEl = document.getElementById('s-name');
        const name = nameEl ? nameEl.value.trim() : '';
        
        // 🚀 NEW: Grab the professor selection
        const profSelect = document.getElementById('professor-select');
        const profId = profSelect ? profSelect.value : null;
        
        try {
            if (!cc) throw new Error("Please select a Country Code.");
            if (!phone) throw new Error("Please enter your Phone Number.");
            if (phone.length < 6) throw new Error("Please enter a valid Phone Number.");

            if (this.isRegistering) {
                // 🚀 NEW: Validate professor selection
                if (!profId) throw new Error("Please select a Professor.");
                
                // 🚀 NEW: Pass profId to authManager
                await window.authManager.registerStudent(cc, phone, pass, name, this.tempAvatar, profId);
                
                // 🚀 NEW: Alert user and stop them from proceeding to game
                if(window.toast) window.toast(`Account registered! Waiting for professor approval.`, true);
                
                if (window.uiManager) window.uiManager.closeModals();
                return; // 🛑 Stops the code here so they don't enter the game unapproved
                
            } else {
                await window.authManager.loginStudent(cc, phone, pass);
                if(window.toast) window.toast("Login successful!", true);
            }

            if (window.sfx && window.sfx.play) window.sfx.play('alert');
            if (window.startConfetti) window.startConfetti();

            setTimeout(() => { 
                if (window.uiManager) {
                    window.uiManager.closeModals(); 
                    window.uiManager.hideAll(); 
                }
                
                const joinPinMod = document.getElementById('module-join-pin');
                if (joinPinMod) {
                    joinPinMod.classList.remove('hidden');
                } else {
                    console.error("Critical Error: module-join-pin element is missing from HTML.");
                }
            }, 0);

        } catch (error) {
            if(window.toast) window.toast(error.message, false);
        }
    }
};

// ==========================================
// 🚀 NEW: ENTER KEY SUBMISSION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Reusable function that triggers a specific authUI method when Enter is pressed
    const enableEnter = (inputId, actionMethod) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    authUI[actionMethod](); // Calls authUI.submitProfAuth() or authUI.submitStudentAuth()
                }
            });
        }
    };

    // Attach listeners to your exact input IDs
    enableEnter("prof-email", "submitProfAuth");
    enableEnter("prof-pass", "submitProfAuth");
    enableEnter("s-phone", "submitStudentAuth");
    enableEnter("s-pass", "submitStudentAuth");
});