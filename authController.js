// authController.js
// Gatekeeper UI Controller (PocketBase Integrated)

import { appStore, DEFAULT_AVATAR } from './store.js';
import { authManager, pb } from './auth.js';

// Extracted so the placeholder-avatar SVG isn't defined twice (it was
// duplicated verbatim in the class property and again inside
// showStudentAuth()). One constant, one place to change it.
const DEFAULT_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

// Extracted so the same querySelectorAll+forEach block isn't duplicated
// between handleAvatarUpload() and showStudentAuth().
function applyAvatarPreview(dataUrl) {
    const previewImgs = document.querySelectorAll('#student-avatar-preview, .modal-avatar-preview');
    previewImgs.forEach(img => { if (img) img.src = dataUrl; });
}

export const authUI = {
    isProfRegistering: false,
    isRegistering: false,
    tempAvatar: DEFAULT_AVATAR_SVG,

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

    compressImageToSquare(file, callback) {
        // 🔥 FIX: no validation that the selected file is actually an
        // image. Previously, picking a PDF or any non-image file would
        // silently read as a data URL, fail to load into an <Image>, and
        // just leave the old preview showing with zero feedback.
        if (!file.type || !file.type.startsWith('image/')) {
            if (window.toast) window.toast("Please choose an image file.", false);
            return;
        }

        const reader = new FileReader();

        // 🔥 FIX: neither the FileReader nor the Image had an error
        // handler. A corrupted file or unsupported image format would
        // just hang silently with no callback ever firing.
        reader.onerror = () => {
            console.error("FileReader failed to read avatar image.");
            if (window.toast) window.toast("Couldn't read that image file. Please try another.", false);
        };

        reader.onload = (e) => {
            const img = new Image();

            img.onerror = () => {
                console.error("Failed to decode avatar image.");
                if (window.toast) window.toast("That image couldn't be loaded. Please try another.", false);
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 150;

                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                const ctx = canvas.getContext('2d');

                // 🔥 FIX: output is JPEG, which has no alpha channel.
                // Drawing a transparent PNG straight onto the canvas and
                // exporting as JPEG previously left transparent pixels as
                // solid BLACK. Filling white first makes transparent
                // source images (a common case for uploaded avatars) look
                // correct instead of getting a black halo/background.
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);

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
                applyAvatarPreview(compressedData);
            });
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
                if (window.toast) window.toast("Registration sent to Management for approval!", true);
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
            if (window.toast) window.toast(`Auth Failed: ${error.message}`, false);
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
        this.tempAvatar = DEFAULT_AVATAR_SVG;
        applyAvatarPreview(this.tempAvatar);

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
            // 🔥 FIX: was `phone.length < 6`, but auth.js's registerStudent /
            // loginStudent both require 8-15 digits via regex. A 6 or
            // 7-digit number passed this check, only to fail moments later
            // in auth.js with a different error message — a confusing
            // two-stage validation mismatch. Aligned to the same minimum.
            if (phone.length < 8) throw new Error("Please enter a valid Phone Number.");

            if (authBtn) {
                authBtn.innerText = "Authenticating...";
                authBtn.disabled = true;
                authBtn.classList.add('opacity-70', 'cursor-not-allowed');
            }

            if (this.isRegistering) {
                if (!profId) throw new Error("Please select a Professor.");

                await authManager.registerStudent(cc, phone, pass, name, this.tempAvatar, profId);

                if (window.toast) window.toast(`Account registered! Waiting for professor approval.`, true);
                if (window.uiManager) window.uiManager.closeModals();
                return;

            } else {
                await authManager.loginStudent(cc, phone, pass, profId);
                if (window.toast) window.toast("Login successful!", true);

                if (window.syncManager) {
                    // 🔥 FIX: was `window.pb?.authStore?.model.id` — the
                    // AUTH user id. Profile fields (avatar, coins, xp,
                    // scores) live on the `players` collection record, not
                    // on `users`, so mirroring against the auth id would
                    // watch the wrong record. `me.playerId` (set in
                    // auth.js's loginStudent) is the correct id.
                    // NOTE: StateSyncController.js currently subscribes to
                    // the `users` collection — it needs to be updated to
                    // subscribe to `players` using this id for real-time
                    // mirroring to actually reflect profile changes.
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

        // 🔥 FIX: was `pb.collection('users').update(userId, { avatar:
        // imageName })`. Per auth.js's schema, avatar lives on the
        // `players` profile record, not on the `users` auth record — the
        // `users` collection likely doesn't even have an `avatar` field.
        // This would either throw (unknown field) or silently write to
        // the wrong place, and the character-select screen would never
        // actually persist. Look up the player's profile via its `user`
        // relation and update THAT record.
        const playerRecord = await pb.collection('players').getFirstListItem(`user="${userId}"`);
        await pb.collection('players').update(playerRecord.id, { avatar: imageName || DEFAULT_AVATAR });

        let me = appStore.get('me');
        if (me) {
            me.avatar = imageName || DEFAULT_AVATAR;
            appStore.set('me', me);
        }

        if (window.toast) window.toast("Character selected successfully!", true);

    } catch (error) {
        console.error("Failed to update avatar in PocketBase:", error);
        if (window.toast) window.toast("Error saving character.", false);
    }
}