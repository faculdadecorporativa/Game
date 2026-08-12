// 🏗️ auth.js
// Multi-Tenant Logic Layer using strict Database Isolation

import { appStore } from './store.js';

const EMAIL_CONFIG = {
    serviceID: 'service_zheujzk', 
    templateID: 'template_ovt15kk'
};

export const authManager = {
    // --- MULTI-TENANT DATABASE UTILS ---
    async getDB(node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        const snapshot = await window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), `professors/${profId}/${node}`));
        return snapshot.exists() ? snapshot.val() : {}; 
    },
    
    async saveDB(data, node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        await window.firebaseSet(window.firebaseRef(window.firebaseDB, `professors/${profId}/${node}`), data); 
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
        
        await window.firebaseSet(window.firebaseRef(window.firebaseDB, `professorsList/${uid}`), profData);

        if (typeof emailjs !== 'undefined') {
            try {
                const firebaseLink = `https://console.firebase.google.com/project/elearning-game-28b64/database/elearning-game-28b64-default-rtdb/data/professorsList/${uid}`;
                await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, {
                    prof_name: name,
                    prof_email: email,
                    page_name: "E-Learning Platform",
                    action_link: firebaseLink
                });
            } catch (emailError) { console.error("❌ EmailJS failed:", emailError); }
        }

        await window.firebaseSignOut(window.firebaseAuth);
        return userCredential;
    },

    async loginProfessor(email, password) {
        if (!email || !password) throw new Error("Email and password are required.");
        
        const userCredential = await window.firebaseSignIn(window.firebaseAuth, email, password);
        const uid = userCredential.user.uid;

        const profSnapshot = await window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), `professorsList/${uid}`));
        
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
        appStore.set('currentProfId', uid);
        appStore.set('profName', profData.name); 
        return userCredential;
    },

    // --- STUDENT AUTH (WITH PENDING APPROVAL QUEUE) ---
    async registerStudent(countryCode, phoneInput, password, name, avatar, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!cleanPhoneInput || !password || !/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Please enter a valid numeric phone number (8-15 digits).");
        if(!profId) throw new Error("Please select a Professor.");

        appStore.set('currentProfId', profId);

        const phone = countryCode + cleanPhoneInput;
        const shadowEmail = `${phone}_${Date.now()}@student.app.com`;
        
        const userCredential = await window.firebaseCreateUser(window.firebaseAuth, shadowEmail, password);
        
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        const rTeam = teams[Math.floor(Math.random() * teams.length)].id;
        const finalName = name || "Student";
        
        const studentData = { uid: userCredential.user.uid, name: finalName, avatar, team: rTeam, shadowEmail, status: 'pending' }; 
        await this.saveDB(studentData, `students/${phone}`);
        
        appStore.set('role', 'student');
        return userCredential;
    },

    async loginStudent(countryCode, phoneInput, password, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!cleanPhoneInput || !password) throw new Error("Phone and password are required.");
        
        if(!profId || profId === "undefined" || profId === "") throw new Error("Please select your Professor.");

        appStore.set('currentProfId', profId);
        const phone = countryCode + cleanPhoneInput;
        
        const studentProfile = await this.getDB(`students/${phone}`);
        if (!studentProfile || Object.keys(studentProfile).length === 0) throw new Error("Profile not found. Please register first.");
        
        if (studentProfile.status === 'pending') throw new Error("Account pending. Please wait for your professor to approve you.");
        
        const shadowEmail = studentProfile.shadowEmail || `${phone}@student.app.com`;
        let userCredential;

        try {
            // Try standard login first
            userCredential = await window.firebaseSignIn(window.firebaseAuth, shadowEmail, password);
        } catch (error) {
            // AUTO-FIX MAGIC: If manually added by a professor, create their login right now silently
            try {
                userCredential = await window.firebaseCreateUser(window.firebaseAuth, shadowEmail, password);
                studentProfile.uid = userCredential.user.uid;
                studentProfile.shadowEmail = shadowEmail;
                await this.saveDB(studentProfile, `students/${phone}`);
            } catch (fallbackError) {
                console.error("Login fallback failed:", fallbackError);
                throw new Error("Incorrect password. Please try again.");
            }
        }
        
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        
        // 🔥 CRITICAL FIX: Ensure the ENTIRE Phase 3 RPG Payload is loaded seamlessly 🔥
        const newMe = { 
            uid: studentProfile.uid || userCredential.user.uid,
            phone: phone, 
            name: studentProfile.name, 
            avatar: studentProfile.avatar, 
            team: studentProfile.team || teams[0].id, 
            border: studentProfile.border || 'border-slate-300', 
            scores: studentProfile.scores || { total:0, Speaking:0, Writing:0, Listening:0, General:0 }, 
            lifelines: studentProfile.lifelines || { fiftyFifty: true, askProf: true, google: true, callFriend: true, freezeTime: true, timeBurn: true }, 
            streak: studentProfile.streak || 0,
            maxStreak: studentProfile.maxStreak || 0,
            xp: studentProfile.xp || 0,
            coins: studentProfile.coins || 0,
            inventory: studentProfile.inventory || {},
            equipped: studentProfile.equipped || { title: 'Novice Learner', border: 'border-slate-300' }
        };
        
        appStore.set('me', newMe);
        appStore.set('role', 'student');
        
        return userCredential;
    },

    async sendRecoveryCode(countryCode, phoneInput, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Enter a valid numeric phone number.");
        if(!profId) throw new Error("Select your professor first.");
        
        appStore.set('currentProfId', profId);
        const phone = countryCode + cleanPhoneInput;
        
        const studentProfile = await this.getDB(`students/${phone}`);
        const shadowEmail = studentProfile?.shadowEmail || `${phone}@student.app.com`;
        
        await window.firebaseReset(window.firebaseAuth, shadowEmail);
        return shadowEmail; 
    }
};