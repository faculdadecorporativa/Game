// 🏗️ auth.js
// Finalized Logic Layer using the appStore Vault, Gatekeeper Protocol, and EmailJS.

import { appStore } from './store.js';

// Configuration - I have pre-filled your actual EmailJS IDs!
const EMAIL_CONFIG = {
    serviceID: 'service_zheujzk', 
    templateID: 'template_ovt15kk'
};

export const authManager = {
    // --- DATABASE UTILS ---
    async getDB(node = 'feedbackStudentsDb') { 
        const snapshot = await window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), node));
        return snapshot.exists() ? snapshot.val() : {}; 
    },
    async saveDB(data, node = 'feedbackStudentsDb') { 
        await window.firebaseSet(window.firebaseRef(window.firebaseDB, node), data); 
    },

    // --- PROFESSOR AUTH: THE GATEKEEPER PROTOCOL ---
    async registerProfessor(email, password, name) {
        if (!email || !password || !name) throw new Error("Name, email, and password are required.");

        const userCredential = await window.firebaseCreateUser(window.firebaseAuth, email, password);
        const uid = userCredential.user.uid;

        const profData = {
            uid: uid,
            name: name,
            email: email,
            status: "pending", 
            registeredAt: new Date().toISOString()
        };
        
        await window.firebaseSet(window.firebaseRef(window.firebaseDB, `professorsDb/${uid}`), profData);

        if (typeof emailjs !== 'undefined') {
            try {
                const firebaseLink = `https://console.firebase.google.com/project/elearning-game-28b64/database/elearning-game-28b64-default-rtdb/data/professorsDb/${uid}`;
                
                await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, {
                    prof_name: name,
                    prof_email: email,
                    page_name: "E-Learning Platform",
                    action_link: firebaseLink
                });
                console.log("✅ Approval request email sent successfully!");
            } catch (emailError) {
                console.error("❌ EmailJS failed:", emailError);
            }
        } else {
            console.warn("⚠️ EmailJS SDK not found. Skipping notification.");
        }

        await window.firebaseSignOut(window.firebaseAuth);
        return userCredential;
    },

    async loginProfessor(email, password) {
        if (!email || !password) throw new Error("Email and password are required.");
        
        const userCredential = await window.firebaseSignIn(window.firebaseAuth, email, password);
        const uid = userCredential.user.uid;

        const profSnapshot = await window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), `professorsDb/${uid}`));
        
        if (!profSnapshot.exists()) {
            await window.firebaseSignOut(window.firebaseAuth);
            throw new Error("Professor profile not found. Please contact management.");
        }

        const profData = profSnapshot.val();

        if (profData.status !== "approved") {
            await window.firebaseSignOut(window.firebaseAuth);
            throw new Error("Your account is pending management approval.");
        }

        appStore.set('role', 'host');
        return userCredential;
    },

    // --- STUDENT AUTH ---
    async registerStudent(countryCode, phoneInput, password, name, avatar) {
        // MENTOR FIX: Defensive Programming - Strip spaces and dashes right here at the source
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');

        if(!cleanPhoneInput || !password || !/^\d{8,15}$/.test(cleanPhoneInput)) {
            throw new Error("Please enter a valid numeric phone number (8-15 digits).");
        }

        const phone = countryCode + cleanPhoneInput;
        const shadowEmail = `${phone}@student.app.com`;
        
        // 1. Create User
        const userCredential = await window.firebaseCreateUser(window.firebaseAuth, shadowEmail, password);
        
        // 2. Setup Profile Data
        const teams = appStore.get('teams');
        const rTeam = teams[Math.floor(Math.random() * teams.length)].id;
        const finalName = name || "Student";
        
        // 3. Target only the specific student's database node
        const studentData = { uid: userCredential.user.uid, name: finalName, avatar, team: rTeam }; 
        await this.saveDB(studentData, `feedbackStudentsDb/${phone}`);
        
        // 4. Update Local State via Vault
        const newMe = { 
            phone, name: finalName, avatar, team: rTeam, border: 'border-slate-300', 
            scores: { total:0, Speaking:0, Writing:0, Listening:0, General:0 }, 
            lifelines: { fiftyFifty: true, askProf: true, google: true, callFriend: true }, streak: 0 
        };
        appStore.set('me', newMe);
        appStore.set('role', 'student');
        
        return userCredential;
    },

    async loginStudent(countryCode, phoneInput, password) {
        // MENTOR FIX: Clean the phone number defensively
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');

        if(!cleanPhoneInput || !password) throw new Error("Phone and password are required.");

        const phone = countryCode + cleanPhoneInput;
        const shadowEmail = `${phone}@student.app.com`;

        // 1. Login User
        const userCredential = await window.firebaseSignIn(window.firebaseAuth, shadowEmail, password);
        
        // 2. Fetch only this specific student's profile from DB
        const studentProfile = await this.getDB(`feedbackStudentsDb/${phone}`);
        if (!studentProfile || Object.keys(studentProfile).length === 0) {
            throw new Error("Profile data missing from database.");
        }

        // 3. Update Local State via Vault
        const teams = appStore.get('teams');
        const newMe = { 
            phone, name: studentProfile.name, avatar: studentProfile.avatar, 
            team: studentProfile.team || teams[0].id, border: 'border-slate-300', 
            scores: { total:0, Speaking:0, Writing:0, Listening:0, General:0 }, 
            lifelines: { fiftyFifty: true, askProf: true, google: true, callFriend: true }, streak: 0 
        };
        
        appStore.set('me', newMe);
        appStore.set('role', 'student');
        
        return userCredential;
    },

    async sendRecoveryCode(countryCode, phoneInput) {
        // MENTOR FIX: Clean the phone number defensively
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');

        if(!/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Enter a valid numeric phone number.");
        
        const phone = countryCode + cleanPhoneInput;
        const shadowEmail = `${phone}@student.app.com`;
        
        await window.firebaseReset(window.firebaseAuth, shadowEmail);
        return shadowEmail; 
    }
};