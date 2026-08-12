// 🧹 JanitorController.js
// Background utility to auto-delete old rooms and inactive students

export const databaseJanitor = {
    async runCleanup() {
        console.group("%c🧹 Professor Janitor: Maintenance Routine", "color: #10b981; font-size: 14px; font-weight: bold;");
        console.log("Checking for expired rooms and inactive legacy data...");
        
        const now = Date.now();
        
        // Time thresholds defined in milliseconds
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

        // -----------------------------------------------------
        // 1. CLEAN UP ROOMS (Older than 24 Hours)
        // -----------------------------------------------------
        try {
            if (window.firebaseRef && window.firebaseGet && window.firebaseDB) {
                const roomsRef = window.firebaseRef(window.firebaseDB, 'rooms');
                const roomsSnap = await window.firebaseGet(roomsRef);
                
                if (roomsSnap.exists()) {
                    const rooms = roomsSnap.val();
                    for (let roomId in rooms) {
                        const room = rooms[roomId];
                        
                        // Check room age. If it doesn't have a timestamp, it's legacy garbage.
                        const roomAge = room.createdAt ? (now - room.createdAt) : null;
                        
                        // Delete if older than 24 hours OR if it has no timestamp at all
                        if ((roomAge && roomAge > ONE_DAY_MS) || !room.createdAt) {
                            await window.firebaseSet(window.firebaseRef(window.firebaseDB, `rooms/${roomId}`), null);
                            console.log(`%c🗑️ Deleted expired room: ${roomId}`, "color: #f59e0b;");
                        }
                    }
                }
            }
        } catch (error) {
            console.error("%c⚠️ Rooms cleanup failed:", "color: #ef4444;", error);
        }

        // -----------------------------------------------------
        // 2. CLEAN UP FEEDBACK STUDENTS (Inactive for 30 Days)
        // -----------------------------------------------------
        try {
            if (window.firebaseRef && window.firebaseGet && window.firebaseDB) {
                const feedbackRef = window.firebaseRef(window.firebaseDB, 'feedbackStudentsDb');
                const feedbackSnap = await window.firebaseGet(feedbackRef);
                
                if (feedbackSnap.exists()) {
                    const students = feedbackSnap.val();
                    for (let phone in students) {
                        const student = students[phone];
                        
                        // Check student age. If no timestamp, assume old legacy data.
                        const studentAge = student.lastActive ? (now - student.lastActive) : null;
                        
                        if ((studentAge && studentAge > THIRTY_DAYS_MS) || !student.lastActive) {
                            await window.firebaseSet(window.firebaseRef(window.firebaseDB, `feedbackStudentsDb/${phone}`), null);
                            console.log(`%c🗑️ Deleted inactive legacy student: ${phone}`, "color: #f59e0b;");
                        }
                    }
                }
            }
        } catch (error) {
            console.error("%c⚠️ Students cleanup failed:", "color: #ef4444;", error);
        }
        
        console.log("%c✨ Janitor cleanup complete! Database optimized.", "color: #10b981; font-weight: bold;");
        console.groupEnd();
    }
};