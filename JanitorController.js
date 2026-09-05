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
            if (window.pb) {
                // 🔥 SIMPLIFICATION: the old Firebase version had to
                // special-case rooms with no `createdAt` field as "legacy
                // garbage" to delete unconditionally, because Firebase RTDB
                // nodes have no built-in creation timestamp. PocketBase
                // records always carry a system `created` field
                // automatically on every row — so that whole "missing
                // timestamp" branch is structurally impossible to hit here
                // and has been dropped; age is just `now - created`.
                const rooms = await window.pb.collection('rooms').getFullList();

                const expiredRooms = rooms.filter(room => (now - new Date(room.created).getTime()) > ONE_DAY_MS);

                // 🔥 FIX: the old code awaited each Firebase delete
                // SEQUENTIALLY inside a `for...in` loop. Besides being
                // slower than necessary for a batch cleanup job, a single
                // failed delete threw out of the loop and skipped every
                // room after it in iteration order — one permissions hiccup
                // on one room silently aborted cleanup for the rest.
                // Promise.allSettled runs them independently: one failure
                // doesn't block the others, and every result is reported.
                const results = await Promise.allSettled(
                    expiredRooms.map(room => window.pb.collection('rooms').delete(room.id))
                );
                results.forEach((result, i) => {
                    if (result.status === 'fulfilled') {
                        console.log(`%c🗑️ Deleted expired room: ${expiredRooms[i].id}`, "color: #D97706;");
                    } else {
                        console.error(`%c⚠️ Failed to delete room ${expiredRooms[i].id}:`, "color: #ef4444;", result.reason);
                    }
                });
            }
        } catch (error) {
            console.error("%c⚠️ Rooms cleanup failed:", "color: #ef4444;", error);
        }

        // -----------------------------------------------------
        // 2. CLEAN UP FEEDBACK STUDENTS (Inactive for 30 Days)
        // -----------------------------------------------------
        // 🔥 FLAG: no file reviewed anywhere in this series ever writes to
        // anything resembling "feedbackStudentsDb" — every student-facing
        // write goes through the `players` collection instead (see
        // auth.js, AdminController.js). This looks like cleanup logic left
        // over from a discontinued/legacy feature rather than something
        // that maps cleanly onto the current PocketBase schema. Migrated
        // it as a best-effort, best-guess equivalent below (assuming a
        // `feedbackStudents` collection with `phone` and a `lastActive`
        // timestamp field) — but it's worth confirming whether this
        // collection still exists in your PocketBase schema before relying
        // on this block; if the feature is gone, this whole section can
        // just be deleted instead. Wrapped in try/catch either way, so a
        // missing collection fails harmlessly rather than breaking the
        // rest of the cleanup run.
        try {
            if (window.pb) {
                const students = await window.pb.collection('feedbackStudents').getFullList();

                const inactiveStudents = students.filter(student =>
                    (now - new Date(student.lastActive || student.created).getTime()) > THIRTY_DAYS_MS
                );

                const results = await Promise.allSettled(
                    inactiveStudents.map(student => window.pb.collection('feedbackStudents').delete(student.id))
                );
                results.forEach((result, i) => {
                    if (result.status === 'fulfilled') {
                        console.log(`%c🗑️ Deleted inactive legacy student: ${inactiveStudents[i].phone || inactiveStudents[i].id}`, "color: #D97706;");
                    } else {
                        console.error(`%c⚠️ Failed to delete student ${inactiveStudents[i].id}:`, "color: #ef4444;", result.reason);
                    }
                });
            }
        } catch (error) {
            console.error("%c⚠️ Students cleanup failed:", "color: #ef4444;", error);
        }
        
        console.log("%c✨ Janitor cleanup complete! Database optimized.", "color: #10b981; font-weight: bold;");
        console.groupEnd();
    }
};

// 🔥 FIX: this binding was missing. authController.js's submitStudentAuth()
// checks `if (window.databaseJanitor) { window.databaseJanitor.runCleanup(); }`
// after every professor login — without this line, that check silently
// evaluates to false every time, and the entire cleanup routine has never
// actually run. Every other controller in this codebase that's called
// from outside its own module self-binds this way (shopController,
// dashboardController, syncManager, app) — this makes janitorController
// consistent with that pattern.
window.databaseJanitor = databaseJanitor;