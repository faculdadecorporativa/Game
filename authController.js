// authController.js
// Gatekeeper UI Controller (PocketBase Integrated - NO PHOTO UPLOAD)

import { appStore, DEFAULT_AVATAR } from './store.js';
import { authManager, pb } from './auth.js';

export const authUI = {
    isProfRegistering: false,
    isRegistering: false,

    async handleGoogleLogin() {
        try {
            if (!pb) throw new Error("PocketBase client is not initialized.");

            // Trigger Google OAuth2 popup
            const authData = await pb.collection('players').authWithOAuth2({ 
                provider: 'google' 
            });

            // Optional: Save Google profile name if name is empty
            if (authData.meta && authData.meta.name && !authData.record.name) {
                await pb.collection('players').update(authData.record.id, {
                    name: authData.meta.name
                });
            }

            if (window.toast) window.toast('Logged in with Google successfully!', true);
            if (window.uiManager) window.uiManager.closeModals();
            
            // Reload window to initiate app state with the new auth token
            window.location.reload();

        } catch (err) {
            console.error('Google Auth Error:', err);
            if (!err.isAbort && window.toast) {
                window.toast('Google Login failed: ' + err.message, false);
            }
        }
    },

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
            const professors = await authManager.getProfessors();

            if (professors && professors.length > 0) {
                professors.forEach(prof => {
                    const option = document.createElement('option');
                    option.value = prof.user || prof.id;
                    option.textContent = prof.nickname || "Professor";
                    selectEl.appendChild(option);
                });
            } else {
                selectEl.innerHTML += '<option value="" disabled>No professors registered.</option>';
            }
        } catch (error) {
            console.error("Error loading professors:", error);
            selectEl.innerHTML += '<option value="" disabled>Error loading list.</option>';
        }
    },

    showProfLogin() {
        this.isProfRegistering = false;
        this.updateProfAuthUI();
        if (window.uiManager) window.uiManager.closeModals();
        document.getElementById('modal-prof-login')?.classList.remove('hidden');
    },

    toggleProfAuthMode() {
        this.isProfRegistering = !this.isProfRegistering;
        this.updateProfAuthUI();
    },

    updateProfAuthUI() {
        const titleEl = document.getElementById('p-auth-title');
        const btnEl = document.getElementById('p-auth-btn');
        const toggleEl = document.getElementById('p-toggle-btn');
        const regFields = document.getElementById('p-register-fields');
        const forgotBtn = document.getElementById('p-forgot-pass-container');

        if (titleEl) titleEl.innerText = this.isProfRegistering ? "Professor Registration" : "Professor Login";
        if (btnEl) btnEl.innerText = this.isProfRegistering ? "Register & Request Approval" : "Login";
        if (toggleEl) toggleEl.innerText = this.isProfRegistering ? "Already approved? Login here" : "Need an account? Register";
        if (regFields) regFields.classList.toggle('hidden', !this.isProfRegistering);
        if (forgotBtn) forgotBtn.classList.toggle('hidden', this.isProfRegistering);
    },

    async submitProfAuth() {
        const inputEmail = document.getElementById('prof-email')?.value.trim();
        const inputPass = document.getElementById('prof-pass')?.value.trim();
        const nameEl = document.getElementById('prof-name');
        const inputName = nameEl ? nameEl.value.trim() : '';
        const authBtn = document.getElementById('p-auth-btn');

        try {
            if (authBtn) {
                authBtn.innerText = "Authenticating...";
                authBtn.disabled = true;
                authBtn.classList.add('opacity-70', 'cursor-not-allowed');
            }

            if (this.isProfRegistering) {
                await authManager.registerProfessor(inputEmail, inputPass, inputName);
                if (window.toast) window.toast("Registration sent! Please wait for management approval before logging in.", true);
                this.toggleProfAuthMode();
            } else {
                await authManager.loginProfessor(inputEmail, inputPass);
                if (window.toast) window.toast("Professor authenticated securely.", true);

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
            if (window.toast) window.toast(error.message, false);
        } finally {
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
            if (window.toast) window.toast("Please enter your email address in the top box first to reset your password.", false);
            if (window.sfx) window.sfx.play('wrong');
            return;
        }

        try {
            await authManager.resetProfessorPassword(email);
            if (window.toast) window.toast("Password reset email sent! Check your inbox.", true);
            if (window.sfx) window.sfx.play('correct');
        } catch (error) {
            if (window.toast) window.toast(`Failed: ${error.message}`, false);
            if (window.sfx) window.sfx.play('wrong');
        }
    },

    showStudentAuth() {
        this.isRegistering = false;
        this.updateAuthUI();
        if (window.uiManager) window.uiManager.closeModals();
        document.getElementById('modal-student-auth')?.classList.remove('hidden');
        this.loadProfessorsDropdown();
    },

    toggleAuthMode() {
        this.isRegistering = !this.isRegistering;
        this.updateAuthUI();
    },

    updateAuthUI() {
        const titleEl = document.getElementById('s-auth-title');
        const btnEl = document.getElementById('s-auth-btn');
        const toggleEl = document.getElementById('s-toggle-btn');
        const regFields = document.getElementById('s-register-fields');

        if (titleEl) titleEl.innerText = this.isRegistering ? "Student Registration" : "Student Login";
        if (btnEl) btnEl.innerText = this.isRegistering ? "Register & Continue" : "Login";
        if (toggleEl) toggleEl.innerText = this.isRegistering ? "Already have an account? Login" : "Need an account? Register";
        if (regFields) regFields.classList.toggle('hidden', !this.isRegistering);
    },

    async submitStudentAuth() {
        const cc = document.getElementById('s-cc')?.value;
        const rawPhone = document.getElementById('s-phone')?.value || '';
        const phone = rawPhone.replace(/\D/g, '');
        const pass = document.getElementById('s-pass')?.value.trim();
        const nameEl = document.getElementById('s-name');
        const name = nameEl ? nameEl.value.trim() : '';
        const profSelect = document.getElementById('professor-select');
        const profId = profSelect ? profSelect.value : null;
        const authBtn = document.getElementById('s-auth-btn');

        try {
            if (!cc) throw new Error("Please select a Country Code.");
            if (!phone) throw new Error("Please enter your Phone Number.");
            if (phone.length < 8) throw new Error("Please enter a valid Phone Number.");

            if (authBtn) {
                authBtn.innerText = "Authenticating...";
                authBtn.disabled = true;
                authBtn.classList.add('opacity-70', 'cursor-not-allowed');
            }

            if (this.isRegistering) {
                if (!profId) throw new Error("Please select a Professor.");
                
                await authManager.registerStudent(cc, phone, pass, name, DEFAULT_AVATAR, profId);

                if (window.toast) window.toast(`Account registered! Waiting for professor approval.`, true);
                if (window.uiManager) window.uiManager.closeModals();
                return;

            } else {
                await authManager.loginStudent(cc, phone, pass, profId);
                if (window.toast) window.toast("Login successful!", true);

                if (window.syncManager) {
                    const me = appStore.get('me');
                    const playerId = me?.playerId || window.pb?.authStore?.model?.id;
                    if (playerId) {
                        window.syncManager.startMirroring(playerId);
                    }
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
            if (window.toast) window.toast(error.message, false);
        } finally {
            if (authBtn) {
                authBtn.innerText = this.isRegistering ? "Register & Continue" : "Login";
                authBtn.disabled = false;
                authBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }
    },

    showRecovery() {
        if (window.uiManager) window.uiManager.closeModals();
        document.getElementById('modal-recovery')?.classList.remove('hidden');
    },

    sendCode() {
        if (window.uiManager) window.uiManager.closeModals();
        if (window.sfx) window.sfx.play('alert');
        if (window.toast) window.toast("🔒 For security, please ask your Professor to instantly reset your password from their Control Center.", false);
    },

    resetPassword() {
        this.sendCode();
    }
};

// ... Ensure global access is set for the DOM to interact with authUI ...
window.authUI = authUI;

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

export async function handleCharacterSelection(userId, imageName) {
    try {
        if (!window.pb) throw new Error("PocketBase client not found.");
        
        const finalAvatar = imageName || DEFAULT_AVATAR;
        const playerRecord = await pb.collection('players').getFirstListItem(`user="${userId}"`);
        await pb.collection('players').update(playerRecord.id, { avatar: finalAvatar });

        let me = appStore.get('me');
        if (me) {
            me.avatar = finalAvatar;
            appStore.set('me', me);
        }

        // Apply avatar-img class to all dynamic user avatar elements across the interface
        document.querySelectorAll('.user-avatar, [data-user-avatar]').forEach(img => {
            img.src = finalAvatar;
            img.classList.add('avatar-img');
        });

        if (window.toast) window.toast("Character selected successfully!", true);

    } catch (error) {
        console.error("Failed to update avatar in PocketBase:", error);
        if (window.toast) window.toast("Error saving character.", false);
    }
}