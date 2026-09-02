// 🏗️ auth.js
// Multi-Tenant Logic Layer using strict Database Isolation

import { appStore } from './store.js';
const pb = new window.PocketBase('https://pb.faculdadecorporativa.com.br');
const EMAIL_CONFIG = {
    serviceID: 'service_zheujzk', 
    templateID: 'template_ovt15kk'
};

export const authManager = {
    // --- MULTI-TENANT DATABASE UTILS (POCKETBASE SHIM) ---
    // Simulates Firebase's dynamic path routing using a 'gamedata' collection
    async getDB(node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        try {
            const record = await pb.collection('gamedata').getFirstListItem(`profId="${profId}" && node="${node}"`);
            return record.data || {};
        } catch {
            return {}; 
        }
    },
    
    async saveDB(data, node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        try {
            const record = await pb.collection('gamedata').getFirstListItem(`profId="${profId}" && node="${node}"`);
            await pb.collection('gamedata').update(record.id, { data });
        } catch {
            await pb.collection('gamedata').create({ profId, node, data });
        }
    },

    // --- PROFESSOR AUTH: THE GATEKEEPER PROTOCOL ---
    async registerProfessor(email, password, name) {
        if (!email || !password || !name) throw new Error("Name, email, and password are required.");

        // 1. Create User Account
        const userRecord = await pb.collection('users').create({
            email: email,
            password: password,
            passwordConfirm: password,
            name: name,
            emailVisibility: true
        });

        // 2. Create Professor Profile in 'players' collection
        const profData = {
            user: userRecord.id,
            nickname: name,
            role: 'professor',
            status: 'pending'
        };
        await pb.collection('players').create(profData);

        // 3. Admin Notification
        if (typeof emailjs !== 'undefined') {
            try {
                const adminLink = `https://pb.faculdadecorporativa.com.br/_/`;
                await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, {
                    prof_name: name,
                    prof_email: email,
                    page_name: "E-Learning Platform",
                    action_link: adminLink
                });
            } catch (emailError) { console.error("❌ EmailJS failed:", emailError); }
        }

        pb.authStore.clear(); // Sign out after registration
        return { user: userRecord };
    },

    async loginProfessor(email, password) {
        if (!email || !password) throw new Error("Email and password are required.");
        
        const authData = await pb.collection('users').authWithPassword(email, password);
        
        // Find corresponding profile in players collection
        let profProfile;
        try {
            profProfile = await pb.collection('players').getFirstListItem(`user="${authData.record.id}"`);
        } catch (err) {
            pb.authStore.clear();
            throw new Error("Professor profile not found. Please contact management.");
        }

        if (profProfile.status !== "approved") {
            pb.authStore.clear();
            throw new Error("Your account is pending management approval.");
        }

        appStore.set('role', 'host');
        appStore.set('currentProfId', authData.record.id);
        appStore.set('profName', profProfile.nickname); 
        return authData;
    },

    // --- STUDENT AUTH (WITH PENDING APPROVAL QUEUE) ---
    async registerStudent(countryCode, phoneInput, password, name, avatar, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!cleanPhoneInput || !password || !/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Please enter a valid numeric phone number (8-15 digits).");
        if(!profId) throw new Error("Please select a Professor.");

        appStore.set('currentProfId', profId);

        const phone = countryCode + cleanPhoneInput;
        const shadowEmail = `${phone}_${Date.now()}@student.app.com`;
        
        // 1. Create Shadow Auth User
        const userRecord = await pb.collection('users').create({
            email: shadowEmail,
            password: password,
            passwordConfirm: password,
            name: name || "Student"
        });
        
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        const rTeam = teams[Math.floor(Math.random() * teams.length)].id;
        const finalName = name || "Student";
        
        // 2. Save Student Profile to 'players' collection
        const studentData = { 
            user: userRecord.id, 
            nickname: finalName, 
            avatar: avatar, 
            team: rTeam, 
            shadowEmail: shadowEmail,
            phone: phone,
            professorId: profId,
            role: 'student',
            status: 'pending' 
        }; 
        await pb.collection('players').create(studentData);
        
        appStore.set('role', 'student');
        return { user: userRecord };
    },

    async loginStudent(countryCode, phoneInput, password, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!cleanPhoneInput || !password) throw new Error("Phone and password are required.");
        
        if(!profId || profId === "undefined" || profId === "") throw new Error("Please select your Professor.");

        appStore.set('currentProfId', profId);
        const phone = countryCode + cleanPhoneInput;
        
        // 1. Fetch Student Profile by Phone & Professor ID
        let studentProfile;
        try {
            studentProfile = await pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
        } catch (err) {
            throw new Error("Profile not found. Please register first.");
        }
        
        if (studentProfile.status === 'pending') throw new Error("Account pending. Please wait for your professor to approve you.");
        
        const shadowEmail = studentProfile.shadowEmail;
        let authData;

        try {
            authData = await pb.collection('users').authWithPassword(shadowEmail, password);
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Incorrect password. Please try again.");
        }
        
        const teams = appStore.get('teams') || [{id: 'eagle'}];
        
        // 🔥 CRITICAL FIX: Ensure the ENTIRE Phase 3 RPG Payload is loaded seamlessly 🔥
        const newMe = { 
            uid: authData.record.id,
            phone: phone, 
            name: studentProfile.nickname, 
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
        
        return authData;
    },

    async sendRecoveryCode(countryCode, phoneInput, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if(!/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Enter a valid numeric phone number.");
        if(!profId) throw new Error("Select your professor first.");
        
        appStore.set('currentProfId', profId);
        const phone = countryCode + cleanPhoneInput;
        
        let studentProfile;
        try {
            studentProfile = await pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
        } catch (err) {
             throw new Error("Profile not found.");
        }

        const shadowEmail = studentProfile.shadowEmail;
        await pb.collection('users').requestPasswordReset(shadowEmail);
        return shadowEmail; 
    }
};