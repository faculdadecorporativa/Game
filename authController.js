// authController.js
// Strict Gatekeeper Version with Canvas Compression & RPG Safety

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
    
    async loadProfessorsDropdown() {
        const selectEl = document.getElementById('professor-select');
        if (!selectEl) return;

        selectEl.innerHTML = '<option value="" disabled selected>Select a Professor...</option>';

        try {
            if (window.firebaseRef && window.firebaseGet && window.firebaseDB) {
                const profRef = window.firebaseRef(window.firebaseDB, 'professorsList');
                const snapshot = await window.firebaseGet(profRef);
                
                if (snapshot.exists()) {
                    const professors = snapshot.val();
                    for (let key in professors) {
                        const prof = professors[key];
                        const option = document.createElement('option');
                        option.value = prof.uid || key;
                        option.textContent = prof.name || prof.email || key;
                        selectEl.appendChild(option);
                    }
                } else {
                    selectEl.innerHTML += '<option value="" disabled>No professors registered.</option>';
                }
            } else {
                console.warn("Firebase references not fully loaded for professor list.");
            }
        } catch (error) {
            console.error("Error loading professors:", error);
            selectEl.innerHTML += '<option value="" disabled>Error loading list.</option>';
        }
    },

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
                this.tempAvatar = compressedData; 
                
                const previewImgs = document.querySelectorAll('#student-avatar-preview, .modal-avatar-preview');
                previewImgs.forEach(img => {
                    if(img) img.src = compressedData;
                });
            });
        }
    },

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
        
        const forgotBtn = document.getElementById('p-forgot-pass-container');
        if (forgotBtn) forgotBtn.classList.toggle('hidden', this.isProfRegistering);
    },
    
    async submitProfAuth() {
        const inputEmail = document.getElementById('prof-email').value.trim();
        const inputPass = document.getElementById('prof-pass').value.trim();
        const nameEl = document.getElementById('prof-name');
        const inputName = nameEl ? nameEl.value.trim() : '';
        const authBtn = document.getElementById('p-auth-btn');
        
        try {
            // UI Polish: Loading State
            if (authBtn) {
                authBtn.innerText = "Authenticating...";
                authBtn.disabled = true;
                authBtn.classList.add('opacity-70', 'cursor-not-allowed');
            }

            if (this.isProfRegistering) {
                await window.authManager.registerProfessor(inputEmail, inputPass, inputName);
                if(window.toast) window.toast("Registration sent to Management for approval!", true);
                this.toggleProfAuthMode();
            } else {
                await window.authManager.loginProfessor(inputEmail, inputPass);
                if(window.toast) window.toast("Professor authenticated securely.", true);
                
                if (window.databaseJanitor) {
                    window.databaseJanitor.runCleanup();
                }
                
                if (window.uiManager) window.uiManager.closeModals(); 
                const mod0 = document.getElementById('module-0');
                if (mod0) mod0.classList.add('hidden'); 
                
                if (window.app && window.app.hostGame) {
                    await window.app.hostGame(); 
                }
            }
        } catch (error) {
            if(window.toast) window.toast(`Auth Failed: ${error.message}`, false);
        } finally {
            // UI Polish: Restore Button State
            if (authBtn) {
                authBtn.innerText = this.isProfRegistering ? "Register & Request Approval" : "Login";
                authBtn.disabled = false;
                authBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }
    },

    async resetProfPassword() {
        const email = document.getElementById('prof-email')?.value.trim();
        
        if (!email) {
            if(window.toast) window.toast("Please enter your email address in the top box first to reset your password.", false);
            if(window.sfx) window.sfx.play('wrong');
            return;
        }

        try {
            if (window.firebaseReset && window.firebaseAuth) {
                await window.firebaseReset(window.firebaseAuth, email);
                if(window.toast) window.toast("Password reset email sent! Check your inbox.", true);
                if(window.sfx) window.sfx.play('correct');
            } else {
                console.error("Firebase auth/reset methods not bound to window.");
            }
        } catch (error) {
            let errorMsg = "Failed to send reset email.";
            if (error.code === 'auth/user-not-found') errorMsg = "No account found with this email.";
            if (error.code === 'auth/invalid-email') errorMsg = "Invalid email format.";
            if(window.toast) window.toast(errorMsg, false);
            if(window.sfx) window.sfx.play('wrong');
        }
    },

    showStudentAuth() { 
        this.isRegistering = false;
        // Reset temp avatar so it doesn't bleed over from previous interactions
        this.tempAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        const previewImgs = document.querySelectorAll('#student-avatar-preview, .modal-avatar-preview');
        previewImgs.forEach(img => { if(img) img.src = this.tempAvatar; });

        this.updateAuthUI(); 
        if(window.uiManager) window.uiManager.closeModals(); 
        document.getElementById('modal-student-auth').classList.remove('hidden'); 
        
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
        const profSelect = document.getElementById('professor-select');
        const profId = profSelect ? profSelect.value : null;
        const authBtn = document.getElementById('s-auth-btn');
        
        try {
            if (!cc) throw new Error("Please select a Country Code.");
            if (!phone) throw new Error("Please enter your Phone Number.");
            if (phone.length < 6) throw new Error("Please enter a valid Phone Number.");

            // UI Polish: Loading State
            if (authBtn) {
                authBtn.innerText = "Authenticating...";
                authBtn.disabled = true;
                authBtn.classList.add('opacity-70', 'cursor-not-allowed');
            }

            if (this.isRegistering) {
                if (!profId) throw new Error("Please select a Professor.");
                
                await window.authManager.registerStudent(cc, phone, pass, name, this.tempAvatar, profId);
                
                if(window.toast) window.toast(`Account registered! Waiting for professor approval.`, true);
                
                if (window.uiManager) window.uiManager.closeModals();
                return; 
                
            } else {
                await window.authManager.loginStudent(cc, phone, pass, profId);
                if(window.toast) window.toast("Login successful!", true);
                
                if (window.firebaseAuth && window.firebaseAuth.currentUser && window.syncManager) {
                    window.syncManager.startMirroring(window.firebaseAuth.currentUser.uid);
                }
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
        } finally {
            // UI Polish: Restore Button State
            if (authBtn) {
                authBtn.innerText = this.isRegistering ? "Register & Continue" : "Login";
                authBtn.disabled = false;
                authBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }
    },

    // --- NEW: Classroom-Secure Recovery Flow ---
    showRecovery() {
        if(window.uiManager) window.uiManager.closeModals(); 
        document.getElementById('modal-recovery').classList.remove('hidden'); 
    },

    sendCode() {
        // Shadow Emails cannot receive actual Firebase reset emails. 
        // Intercepting and enforcing a secure Classroom Management flow.
        if (window.uiManager) window.uiManager.closeModals(); 
        if (window.sfx) window.sfx.play('alert');
        window.toast("🔒 For security, please ask your Professor to instantly reset your password from their Control Center.", false);
    },

    resetPassword() {
        // Fallback catch (UI should prevent reaching here natively)
        this.sendCode();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const enableEnter = (inputId, actionMethod) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    authUI[actionMethod]();
                }
            });
        }
    };

    enableEnter("prof-email", "submitProfAuth");
    enableEnter("prof-pass", "submitProfAuth");
    enableEnter("s-phone", "submitStudentAuth");
    enableEnter("s-pass", "submitStudentAuth");
});