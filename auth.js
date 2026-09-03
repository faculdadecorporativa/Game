// auth.js
// Multi-Tenant Logic Layer using PocketBase Database Isolation

import { appStore, DEFAULT_AVATAR } from './store.js';

// Initialize PocketBase instance and expose globally if needed
export const pb = window.pb || new window.PocketBase('https://pb.faculdadecorporativa.com.br');
window.pb = pb;

const EMAIL_CONFIG = {
    serviceID: 'service_zheujzk',
    templateID: 'template_ovt15kk'
};

export const authManager = {
    // --- FETCH APPROVED PROFESSORS ---
    async getProfessors() {
        try {
            const records = await pb.collection('players').getFullList({
                filter: 'role="professor" && status="approved"'
            });
            return records;
        } catch (err) {
            console.error("Failed to fetch professors list:", err);
            return [];
        }
    },

    // --- RESET PROFESSOR PASSWORD ---
    async resetProfessorPassword(email) {
        if (!email) throw new Error("Email is required.");
        return await pb.collection('users').requestPasswordReset(email);
    },

    // --- MULTI-TENANT DATABASE UTILS ---
    async getDB(node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        try {
            const record = await pb.collection('gamedata').getFirstListItem(`profId="${profId}" && node="${node}"`);
            return record.data || {};
        } catch (err) {
            if (err?.status === 404) return {};
            console.error(`getDB("${node}") failed:`, err);
            throw err;
        }
    },

    async saveDB(data, node) {
        const profId = appStore.get('currentProfId');
        if (!profId) throw new Error("Critical Error: No Professor ID isolated in state.");
        try {
            const record = await pb.collection('gamedata').getFirstListItem(`profId="${profId}" && node="${node}"`);
            await pb.collection('gamedata').update(record.id, { data });
        } catch (err) {
            if (err?.status !== 404) {
                console.error(`saveDB("${node}") failed:`, err);
                throw err;
            }
            await pb.collection('gamedata').create({ profId, node, data });
        }
    },

    // --- PROFESSOR AUTH: THE GATEKEEPER PROTOCOL ---
    async registerProfessor(email, password, name) {
        if (!email || !password || !name) throw new Error("Name, email, and password are required.");

        // 1. Create User Account (Added role and status to match PB schema rules)
        const userRecord = await pb.collection('users').create({
            email: email,
            password: password,
            passwordConfirm: password,
            name: name,
            emailVisibility: true,
            role: 'professor',
            status: 'pending' // Enforces the PB Auth Rule block
        });

        // 2. Create Professor Profile in 'players' collection
        try {
            const profData = {
                user: userRecord.id,
                nickname: name,
                role: 'professor',
                status: 'pending'
            };
            await pb.collection('players').create(profData);
        } catch (profileErr) {
            console.error("Failed to create professor profile, rolling back user record:", profileErr);
            try { await pb.collection('users').delete(userRecord.id); } catch (cleanupErr) {
                console.error("Rollback also failed — orphaned user record:", userRecord.id, cleanupErr);
            }
            throw new Error("Registration failed while creating your profile. Please try again.");
        }

        // 3. Admin Notification via EmailJS
        if (typeof emailjs !== 'undefined') {
            try {
                const adminLink = `https://pb.faculdadecorporativa.com.br/_/`;
                await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, {
                    prof_name: name,
                    prof_email: email,
                    page_name: "E-Learning Platform",
                    action_link: adminLink
                });
            } catch (emailError) {
                console.error("❌ EmailJS failed:", emailError);
            }
        }

        pb.authStore.clear();
        return { user: userRecord };
    },

    async loginProfessor(email, password) {
        if (!email || !password) throw new Error("Email and password are required.");

        let authData;
        try {
            // This will automatically fail if status != "approved" due to your PocketBase Auth Rule
            authData = await pb.collection('users').authWithPassword(email, password);
        } catch (error) {
            pb.authStore.clear();
            throw new Error("Your account is pending management approval or credentials are invalid.");
        }

        let profProfile;
        try {
            profProfile = await pb.collection('players').getFirstListItem(`user="${authData.record.id}"`);
        } catch (err) {
            pb.authStore.clear();
            throw new Error("Professor profile not found. Please contact management.");
        }

        // Fallback check just in case rules are bypassed
        if (profProfile.status !== "approved" && authData.record.status !== "approved") {
            pb.authStore.clear();
            throw new Error("Your account is pending management approval.");
        }

        appStore.set('role', 'host');
        appStore.set('currentProfId', authData.record.id);
        appStore.set('profName', profProfile.nickname);
        return authData;
    },

    // --- STUDENT AUTH ---
    async registerStudent(countryCode, phoneInput, password, name, avatar, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if (!cleanPhoneInput || !password || !/^\d{8,15}$/.test(cleanPhoneInput)) {
            throw new Error("Please enter a valid numeric phone number (8-15 digits).");
        }
        if (!profId) throw new Error("Please select a Professor.");

        const phone = countryCode + cleanPhoneInput;

        try {
            await pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
            throw new Error("An account with this phone number already exists for this professor. Please log in instead.");
        } catch (err) {
            if (err?.status !== 404) throw err; 
        }

        appStore.set('currentProfId', profId);

        const shadowEmail = `${phone}_${Date.now()}@student.app.com`;

        // 1. Create Shadow Auth User (Added role and status)
        const userRecord = await pb.collection('users').create({
            email: shadowEmail,
            password: password,
            passwordConfirm: password,
            name: name || "Student",
            role: 'student',
            status: 'pending' // Students must also be approved or PB auth rules will block them
        });

        const teams = appStore.get('teams') || [{ id: 'eagle' }];
        const rTeam = teams[Math.floor(Math.random() * teams.length)].id;
        const finalName = name || "Student";

        // 2. Save Student Profile
        try {
            const studentData = {
                user: userRecord.id,
                nickname: finalName,
                avatar: avatar || DEFAULT_AVATAR,
                team: rTeam,
                shadowEmail: shadowEmail,
                phone: phone,
                professorId: profId,
                role: 'student',
                status: 'pending'
            };
            await pb.collection('players').create(studentData);
        } catch (profileErr) {
            console.error("Failed to create student profile, rolling back user record:", profileErr);
            try { await pb.collection('users').delete(userRecord.id); } catch (cleanupErr) {
                console.error("Rollback also failed — orphaned user record:", userRecord.id, cleanupErr);
            }
            throw new Error("Registration failed while creating your profile. Please try again.");
        }

        appStore.set('role', 'student');
        return { user: userRecord };
    },

    async loginStudent(countryCode, phoneInput, password, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if (!cleanPhoneInput || !password) throw new Error("Phone and password are required.");
        if (!profId || profId === "undefined" || profId === "") throw new Error("Please select your Professor.");

        appStore.set('currentProfId', profId);
        const phone = countryCode + cleanPhoneInput;

        let studentProfile;
        try {
            studentProfile = await pb.collection('players').getFirstListItem(`phone="${phone}" && professorId="${profId}"`);
        } catch (err) {
            throw new Error("Profile not found. Please register first.");
        }

        const shadowEmail = studentProfile.shadowEmail;
        let authData;

        try {
            authData = await pb.collection('users').authWithPassword(shadowEmail, password);
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Account pending approval or incorrect password.");
        }

        const teams = appStore.get('teams') || [{ id: 'eagle' }];

        const newMe = {
            uid: authData.record.id,
            playerId: studentProfile.id,
            phone: phone,
            name: studentProfile.nickname,
            avatar: studentProfile.avatar || DEFAULT_AVATAR,
            team: studentProfile.team || teams[0].id,
            border: studentProfile.border || 'border-slate-300',
            scores: studentProfile.scores || { total: 0, Speaking: 0, Writing: 0, Listening: 0, General: 0 },
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
        
        // Inject playerId into authData for precise synchronization in authController.js
        authData.record.playerId = studentProfile.id;

        return authData;
    },

    async sendRecoveryCode(countryCode, phoneInput, profId) {
        const cleanPhoneInput = String(phoneInput).replace(/\D/g, '');
        if (!/^\d{8,15}$/.test(cleanPhoneInput)) throw new Error("Enter a valid numeric phone number.");
        if (!profId) throw new Error("Select your professor first.");

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