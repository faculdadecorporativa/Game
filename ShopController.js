// ShopController.js
// Manages the completely overhauled RPG-Style Tabbed Item Store.

import { appStore } from './store.js';

// 🔥 DUPLICATION NOTE: same helper as in LifelineController.js and
// GameController.js — see the comment there recommending this be
// extracted into one shared module. Kept local so this file stays
// self-contained for this review batch.
async function persistPlayerFields(me, fields) {
    if (!window.pb) {
        console.error("PocketBase client (window.pb) not found — purchase/equip not persisted.");
        return;
    }
    if (!me?.playerId) {
        console.warn("No playerId on `me` — skipping remote sync (host test session?).");
        return;
    }
    await window.pb.collection('players').update(me.playerId, fields); 
}

export const shopController = {
    currentTab: 'consumables', 
    _busy: false, 

    // Comprehensive Categorized Premium Catalog
    catalog: {
        consumables: [
            { id: 'extraLife', name: "Extra Life", cost: 100, icon: "&#128305;", desc: "Saves you from losing your streak on a wrong answer.", glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
            { id: 'freezeTime', name: "Time Freeze", cost: 75, icon: "&#10052;", desc: "Gives you 15 extra seconds on a difficult question.", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" },
            { id: 'timeBurn', name: "Time Burn", cost: 120, icon: "&#128293;", desc: "Speed up the opponent's timer by 5 seconds in live mode.", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
            { id: 'hint', name: "Smart Hint", cost: 50, icon: "&#128161;", desc: "Removes 2 wrong options or reveals a letter in Hangman.", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'coinMagnet', name: "Coin Magnet", cost: 200, icon: "&#129484;", desc: "Triples the coins earned on your next correct answer.", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" }
        ],
        cosmetics: [
            { id: 'borderNeon', name: "Neon Cyber Ring", cost: 200, icon: "&#128994;", desc: "Equip a glowing cyan border to your avatar profile.", equipType: 'border', equipValue: 'ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]', glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
            { id: 'borderGold', name: "Champion Gold", cost: 500, icon: "&#128081;", desc: "Show off your wealth with a radiant gold border.", equipType: 'border', equipValue: 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]', glow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
            { id: 'borderFire', name: "Inferno Ring", cost: 300, icon: "&#128293;", desc: "A blazing red border to strike fear into your opponents.", equipType: 'border', equipValue: 'ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]', glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]" }
        ],
        titles: [
            { id: 'titleSpeed', name: "Speed Demon", cost: 300, icon: "&#9889;", desc: "Equip this title to show off your lightning fast reflexes.", equipType: 'title', equipValue: 'The Speed Demon', glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]" },
            { id: 'titleMaster', name: "Grammar Master", cost: 300, icon: "&#128218;", desc: "Equip this title for achieving flawless academic accuracy.", equipType: 'title', equipValue: 'Grammar Master', glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" },
            { id: 'titleUnstoppable', name: "Unstoppable", cost: 500, icon: "&#9732;", desc: "Exclusive, legendary title reserved for streak masters.", equipType: 'title', equipValue: 'Unstoppable', glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]" }
        ],
        avatars_free: [
            { id: 'abraham', name: 'Abraham', cost: 0, icon: '&#128100;', desc: 'A foundational figure in history.', equipType: 'avatar', equipValue: 'abraham.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'aquilla', name: 'Aquilla', cost: 0, icon: '&#128100;', desc: 'A dedicated historical teacher.', equipType: 'avatar', equipValue: 'aquilla.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'archangel-michael', name: 'Archangel Michael', cost: 0, icon: '&#128100;', desc: 'The fierce celestial commander.', equipType: 'avatar', equipValue: 'archangel-michael.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'barnabas', name: 'Barnabas', cost: 0, icon: '&#128100;', desc: 'An encourager and companion.', equipType: 'avatar', equipValue: 'barnabas.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'bathsheba', name: 'Bathsheba', cost: 0, icon: '&#128100;', desc: 'A figure of wisdom and royal legacy.', equipType: 'avatar', equipValue: 'bathsheba.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'cain', name: 'Cain', cost: 0, icon: '&#128100;', desc: 'The firstborn of mankind.', equipType: 'avatar', equipValue: 'cain.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'daniel', name: 'Daniel', cost: 0, icon: '&#128100;', desc: 'Known for unyielding faith.', equipType: 'avatar', equipValue: 'daniel.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'delilah', name: 'Delilah', cost: 0, icon: '&#128100;', desc: 'A figure of cunning and strategy.', equipType: 'avatar', equipValue: 'delilah.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'elijah', name: 'Elijah', cost: 0, icon: '&#128100;', desc: 'A bold and fiery prophet.', equipType: 'avatar', equipValue: 'elijah.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'gabriel', name: 'Gabriel', cost: 0, icon: '&#128100;', desc: 'The great celestial messenger.', equipType: 'avatar', equipValue: 'gabriel.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'goliath', name: 'Goliath', cost: 0, icon: '&#128100;', desc: 'An imposing champion.', equipType: 'avatar', equipValue: 'goliath.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'gomer', name: 'Gomer', cost: 0, icon: '&#128100;', desc: 'A story of redemption.', equipType: 'avatar', equipValue: 'gomer.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'jesus', name: 'Jesus', cost: 0, icon: '&#128100;', desc: 'The central figure of the narrative.', equipType: 'avatar', equipValue: 'jesus.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'job', name: 'Job', cost: 0, icon: '&#128100;', desc: 'A symbol of enduring patience.', equipType: 'avatar', equipValue: 'job.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'jonathan', name: 'Jonathan', cost: 0, icon: '&#128100;', desc: 'A fiercely loyal friend.', equipType: 'avatar', equipValue: 'jonathan.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'joseph-barsabbas', name: 'Joseph Barsabbas', cost: 0, icon: '&#128100;', desc: 'A respected early follower.', equipType: 'avatar', equipValue: 'joseph-barsabbas.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'joseph', name: 'Joseph', cost: 0, icon: '&#128100;', desc: 'A visionary and leader.', equipType: 'avatar', equipValue: 'joseph.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'josuah', name: 'Josuah', cost: 0, icon: '&#128100;', desc: 'A steadfast and brave commander.', equipType: 'avatar', equipValue: 'josuah.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'judas-iscariot', name: 'Judas Iscariot', cost: 0, icon: '&#128100;', desc: 'A complex figure of history.', equipType: 'avatar', equipValue: 'judas-iscariot.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'legion', name: 'Legion', cost: 0, icon: '&#128100;', desc: 'Many voices, one avatar.', equipType: 'avatar', equipValue: 'legion.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'lucifer', name: 'Lucifer', cost: 0, icon: '&#128100;', desc: 'The fallen light-bringer.', equipType: 'avatar', equipValue: 'lucifer.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'mary-magdalene', name: 'Mary Magdalene', cost: 0, icon: '&#128100;', desc: 'A devoted historical follower.', equipType: 'avatar', equipValue: 'mary-magdalene.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'mary', name: 'Mary', cost: 0, icon: '&#128100;', desc: 'A symbol of devotion and grace.', equipType: 'avatar', equipValue: 'mary.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'moses', name: 'Moses', cost: 0, icon: '&#128100;', desc: 'The legendary lawgiver.', equipType: 'avatar', equipValue: 'moses.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'nicolas-of-antioch', name: 'Nicolas of Antioch', cost: 0, icon: '&#128100;', desc: 'A prominent historical figure.', equipType: 'avatar', equipValue: 'nicolas-of-antioch.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'nimrod', name: 'Nimrod', cost: 0, icon: '&#128100;', desc: 'A mighty hunter of old.', equipType: 'avatar', equipValue: 'nimrod.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'noah', name: 'Noah', cost: 0, icon: '&#128100;', desc: 'A builder of epic proportions.', equipType: 'avatar', equipValue: 'noah.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'pharaoh', name: 'Pharaoh', cost: 0, icon: '&#128100;', desc: 'The sovereign of Egypt.', equipType: 'avatar', equipValue: 'pharaoh.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'phoebe-of-cenchreae', name: 'Phoebe of Cenchreae', cost: 0, icon: '&#128100;', desc: 'A trusted courier and deacon.', equipType: 'avatar', equipValue: 'phoebe-of-cenchreae.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'pontius-pilate', name: 'Pontius Pilate', cost: 0, icon: '&#128100;', desc: 'A powerful Roman governor.', equipType: 'avatar', equipValue: 'pontius-pilate.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'priscilla', name: 'Priscilla', cost: 0, icon: '&#128100;', desc: 'A key historical teacher.', equipType: 'avatar', equipValue: 'priscilla.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'rahab', name: 'Rahab', cost: 0, icon: '&#128100;', desc: 'A brave figure of ancient times.', equipType: 'avatar', equipValue: 'rahab.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'ruth', name: 'Ruth', cost: 0, icon: '&#128100;', desc: 'A symbol of enduring loyalty.', equipType: 'avatar', equipValue: 'ruth.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'silas', name: 'Silas', cost: 0, icon: '&#128100;', desc: 'A leading member among brothers.', equipType: 'avatar', equipValue: 'silas.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'simon-magus', name: 'Simon Magus', cost: 0, icon: '&#128100;', desc: 'A controversial historical figure.', equipType: 'avatar', equipValue: 'simon-magus.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' },
            { id: 'tamar', name: 'Tamar', cost: 0, icon: '&#128100;', desc: 'A deeply resourceful historical figure.', equipType: 'avatar', equipValue: 'tamar.png', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]' }
        ],
        avatars_judges: [
            { id: 'judge-abdon', name: 'Judge Abdon', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-abdon.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-deborah', name: 'Judge Deborah', cost: 300, icon: '&#9884;', desc: 'A prophetess and leader.', equipType: 'avatar', equipValue: 'judge-deborah.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-ehud', name: 'Judge Ehud', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-ehud.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-elon', name: 'Judge Elon', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-elon.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-gideon', name: 'Judge Gideon', cost: 300, icon: '&#9884;', desc: 'A valiant military leader.', equipType: 'avatar', equipValue: 'judge-gideon.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-ibzan', name: 'Judge Ibzan', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-ibzan.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-jair', name: 'Judge Jair', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-jair.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-jephthah', name: 'Judge Jephthah', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-jephthah.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-othniel', name: 'Judge Othniel', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-othniel.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-samson', name: 'Judge Samson', cost: 300, icon: '&#9884;', desc: 'Possessor of monumental strength.', equipType: 'avatar', equipValue: 'judge-samson.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-shamgar', name: 'Judge Shamgar', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-shamgar.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' },
            { id: 'judge-tola', name: 'Judge Tola', cost: 300, icon: '&#9884;', desc: 'A judge of the ancient texts.', equipType: 'avatar', equipValue: 'judge-tola.png', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]' }
        ],
        avatars_deacons: [
            { id: 'deacon-nicanor', name: 'Deacon Nicanor', cost: 200, icon: '&#128591;', desc: 'One of the historical seven.', equipType: 'avatar', equipValue: 'deacon-nicanor.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-nicolas', name: 'Deacon Nicolas', cost: 200, icon: '&#128591;', desc: 'One of the historical seven.', equipType: 'avatar', equipValue: 'deacon-nicolas.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-parmenas', name: 'Deacon Parmenas', cost: 200, icon: '&#128591;', desc: 'One of the historical seven.', equipType: 'avatar', equipValue: 'deacon-parmenas.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-philip', name: 'Deacon Philip', cost: 200, icon: '&#128591;', desc: 'A devoted evangelist.', equipType: 'avatar', equipValue: 'deacon-philip.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-prochorus', name: 'Deacon Prochorus', cost: 200, icon: '&#128591;', desc: 'One of the historical seven.', equipType: 'avatar', equipValue: 'deacon-prochorus.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-stephen', name: 'Deacon Stephen', cost: 200, icon: '&#128591;', desc: 'The first recognized martyr.', equipType: 'avatar', equipValue: 'deacon-stephen.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
            { id: 'deacon-timon', name: 'Deacon Timon', cost: 200, icon: '&#128591;', desc: 'One of the historical seven.', equipType: 'avatar', equipValue: 'deacon-timon.png', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' }
        ],
        avatars_apostles: [
            { id: 'apollos-of-alexandria', name: 'Apollos', cost: 400, icon: '&#128214;', desc: 'An eloquent historical speaker.', equipType: 'avatar', equipValue: 'apollos-of-alexandria.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-andrew', name: 'Apostle Andrew', cost: 400, icon: '&#128214;', desc: 'Brother of Simon Peter.', equipType: 'avatar', equipValue: 'apostle-andrew.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-bartholomew', name: 'Apostle Bartholomew', cost: 400, icon: '&#128214;', desc: 'A dedicated follower.', equipType: 'avatar', equipValue: 'apostle-bartholomew.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-james-the-greater', name: 'Apostle James the Greater', cost: 400, icon: '&#128214;', desc: 'One of the inner circle.', equipType: 'avatar', equipValue: 'apostle-james-the-greater.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-james', name: 'Apostle James', cost: 400, icon: '&#128214;', desc: 'A dedicated follower.', equipType: 'avatar', equipValue: 'apostle-james.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-john', name: 'Apostle John', cost: 400, icon: '&#128214;', desc: 'The beloved disciple.', equipType: 'avatar', equipValue: 'apostle-john.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-matthew', name: 'Apostle Matthew', cost: 400, icon: '&#128214;', desc: 'The tax collector turned disciple.', equipType: 'avatar', equipValue: 'apostle-matthew.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-matthias', name: 'Apostle Matthias', cost: 400, icon: '&#128214;', desc: 'Chosen to replace Judas.', equipType: 'avatar', equipValue: 'apostle-matthias.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-paul', name: 'Apostle Paul', cost: 400, icon: '&#128214;', desc: 'A prominent early missionary.', equipType: 'avatar', equipValue: 'apostle-paul.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-peter', name: 'Apostle Peter', cost: 400, icon: '&#128214;', desc: 'The rock of the early movement.', equipType: 'avatar', equipValue: 'apostle-peter.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-philip', name: 'Apostle Philip', cost: 400, icon: '&#128214;', desc: 'A dedicated follower.', equipType: 'avatar', equipValue: 'apostle-philip.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-simon-the-zealot', name: 'Apostle Simon', cost: 400, icon: '&#128214;', desc: 'A fiercely dedicated follower.', equipType: 'avatar', equipValue: 'apostle-simon-the-zealot.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-thaddaeus', name: 'Apostle Thaddaeus', cost: 400, icon: '&#128214;', desc: 'A dedicated follower.', equipType: 'avatar', equipValue: 'apostle-thaddaeus.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-thomas', name: 'Apostle Thomas', cost: 400, icon: '&#128214;', desc: 'Known for his critical thinking.', equipType: 'avatar', equipValue: 'apostle-thomas.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
            { id: 'apostle-timothy', name: 'Apostle Timothy', cost: 400, icon: '&#128214;', desc: 'A young and loyal protege.', equipType: 'avatar', equipValue: 'apostle-timothy.png', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' }
        ],
        avatars_kings_queens: [
            { id: 'king-ahab', name: 'King Ahab', cost: 800, icon: '&#128081;', desc: 'A controversial royal figure.', equipType: 'avatar', equipValue: 'king-ahab.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-asa', name: 'King Asa', cost: 800, icon: '&#128081;', desc: 'A reforming ruler.', equipType: 'avatar', equipValue: 'king-asa.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-belshazzar', name: 'King Belshazzar', cost: 800, icon: '&#128081;', desc: 'Ruler who saw the writing on the wall.', equipType: 'avatar', equipValue: 'king-belshazzar.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-david', name: 'King David', cost: 800, icon: '&#128081;', desc: 'The shepherd king.', equipType: 'avatar', equipValue: 'king-david.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-herod', name: 'King Herod', cost: 800, icon: '&#128081;', desc: 'The grand builder and ruler.', equipType: 'avatar', equipValue: 'king-herod.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-hezekiah', name: 'King Hezekiah', cost: 800, icon: '&#128081;', desc: 'A king of great faith.', equipType: 'avatar', equipValue: 'king-hezekiah.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-jehu', name: 'King Jehu', cost: 800, icon: '&#128081;', desc: 'A fierce royal commander.', equipType: 'avatar', equipValue: 'king-jehu.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-jeroboam', name: 'King Jeroboam', cost: 800, icon: '&#128081;', desc: 'A pivotal historical king.', equipType: 'avatar', equipValue: 'king-jeroboam.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-jeroboam-the-second', name: 'King Jeroboam II', cost: 800, icon: '&#128081;', desc: 'A pivotal historical king.', equipType: 'avatar', equipValue: 'king-jeroboam-the-second.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-joash', name: 'King Joash', cost: 800, icon: '&#128081;', desc: 'A youthful ruler.', equipType: 'avatar', equipValue: 'king-joash.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-johoshaphat', name: 'King Jehoshaphat', cost: 800, icon: '&#128081;', desc: 'A king of great influence.', equipType: 'avatar', equipValue: 'king-johoshaphat.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-josiah', name: 'King Josiah', cost: 800, icon: '&#128081;', desc: 'A righteous young monarch.', equipType: 'avatar', equipValue: 'king-josiah.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-manasseh', name: 'King Manasseh', cost: 800, icon: '&#128081;', desc: 'A complex royal figure.', equipType: 'avatar', equipValue: 'king-manasseh.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-nebuchadnezzar', name: 'King Nebuchadnezzar', cost: 800, icon: '&#128081;', desc: 'The powerful Babylonian king.', equipType: 'avatar', equipValue: 'king-nebuchadnezzar.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-rehoboam', name: 'King Rehoboam', cost: 800, icon: '&#128081;', desc: 'Heir to a fractured kingdom.', equipType: 'avatar', equipValue: 'king-rehoboam.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-saul', name: 'King Saul', cost: 800, icon: '&#128081;', desc: 'The first anointed king.', equipType: 'avatar', equipValue: 'king-saul.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-solomon', name: 'King Solomon', cost: 800, icon: '&#128081;', desc: 'Known for unprecedented wisdom.', equipType: 'avatar', equipValue: 'king-solomon.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'king-uzziah', name: 'King Uzziah', cost: 800, icon: '&#128081;', desc: 'A successful but tragic ruler.', equipType: 'avatar', equipValue: 'king-uzziah.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'queen-athaliah', name: 'Queen Athaliah', cost: 800, icon: '&#128081;', desc: 'A fiercely ambitious royal.', equipType: 'avatar', equipValue: 'queen-athaliah.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'queen-esther', name: 'Queen Esther', cost: 800, icon: '&#128081;', desc: 'A courageous royal hero.', equipType: 'avatar', equipValue: 'queen-esther.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
            { id: 'queen-jezebel', name: 'Queen Jezebel', cost: 800, icon: '&#128081;', desc: 'A powerful and ruthless queen.', equipType: 'avatar', equipValue: 'queen-jezebel.png', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' }
        ],
        avatars_valiant: [
            { id: 'valiant-abiezar', name: 'Valiant Abiezar', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-abiezar.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-abishai', name: 'Valiant Abishai', cost: 500, icon: '&#9876;', desc: 'A fiercely loyal warrior.', equipType: 'avatar', equipValue: 'valiant-abishai.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-benaiah', name: 'Valiant Benaiah', cost: 500, icon: '&#9876;', desc: 'A highly decorated warrior.', equipType: 'avatar', equipValue: 'valiant-benaiah.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-eleazar', name: 'Valiant Eleazar', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-eleazar.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-elhanan', name: 'Valiant Elhanan', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-elhanan.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-helez', name: 'Valiant Helez', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-helez.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-ira', name: 'Valiant Ira', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-ira.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-ittai', name: 'Valiant Ittai', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-ittai.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-jashobeam', name: 'Valiant Jashobeam', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-jashobeam.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-jonathan', name: 'Valiant Jonathan', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-jonathan.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-maharai', name: 'Valiant Maharai', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-maharai.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-shammah', name: 'Valiant Shammah', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-shammah.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-sibbecai', name: 'Valiant Sibbecai', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-sibbecai.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valiant-uriah', name: 'Valiant Uriah', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valiant-uriah.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
            { id: 'valient-asahel', name: 'Valiant Asahel', cost: 500, icon: '&#9876;', desc: 'One of the mighty warriors.', equipType: 'avatar', equipValue: 'valient-asahel.png', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' }
        ]
    },

    openShop() {
        const shopMod = document.getElementById('module-shop');
        if (!shopMod) {
            console.error("Shop module not found in the DOM.");
            return;
        }

        // 1. Manually hide all other active modules to prevent overlap
        const activeModules = document.querySelectorAll('main > *:not(.hidden)');
        activeModules.forEach(mod => {
            if (mod.id !== 'module-shop' && mod.id !== 'lifelines-panel') {
                mod.classList.add('hidden');
                mod.classList.remove('fade-in');
            }
        });

        // 2. Unhide the Shop Module and apply the animation
        shopMod.classList.remove('hidden');
        shopMod.classList.add('fade-in');

        // 3. Update the coins display safely
        const me = appStore.get('me');
        const shopCoinsEl = document.getElementById('shop-coins');
        if (me && shopCoinsEl) {
            shopCoinsEl.innerText = me.coins || 0;
        }
        
        if (window.sfx && window.sfx.play) window.sfx.play('alert'); 
        
        this.switchTab('consumables'); 
    },

    closeShop() {
        const shopMod = document.getElementById('module-shop');
        if (shopMod) {
            shopMod.classList.add('hidden');
            shopMod.classList.remove('fade-in');
        }
        
        // Return the user safely back to their dashboard
        const dashboard = document.getElementById('module-dashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
            dashboard.classList.add('fade-in');
        }
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        
        ['consumables', 'cosmetics', 'titles', 'avatars_free', 'avatars_judges', 'avatars_deacons', 'avatars_apostles', 'avatars_kings_queens', 'avatars_valiant'].forEach(id => {
            const btn = document.getElementById(`tab-btn-${id}`);
            if (!btn) return;
            
            if (id === tabId) {
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-indigo-600 text-white font-black py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-1`;
            } else {
                btn.className = `shop-tab-btn flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 px-4 rounded-xl transition-all transform hover:-translate-y-1`;
            }
        });

        this.renderItems();
    },

    renderItems() {
        const container = document.getElementById('shop-items-container');
        if (!container) return;

        const me = appStore.get('me') || {};
        me.inventory = me.inventory || {};
        me.equipped = me.equipped || { title: 'Novice Learner', border: 'border-slate-300' };

        const items = this.catalog[this.currentTab];

        let html = '';

        items.forEach(item => {
            const isConsumable = this.currentTab === 'consumables';
            const hasPurchased = me.inventory[item.id] > 0 || me.inventory[item.id] === true;
            
            const isEquipped = item.equipType === 'avatar' 
                ? me.equipped?.avatar === item.equipValue 
                : me.equipped[item.equipType] === item.equipValue;

            let actionButton = '';
            
            if (isConsumable) {
                const count = me.inventory[item.id] || 0;
                actionButton = `
                    <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                        <span>Buy for ${item.cost}</span> <span class="text-lg">&#129689;</span>
                    </button>
                    <p class="text-[10px] text-indigo-500 dark:text-indigo-300 mt-3 font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-900 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 shadow-inner">In Locker: ${count}</p>
                `;
            } else {
                if (isEquipped) {
                    actionButton = `<button disabled class="w-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]">&#10004; EQUIPPED</button>`;
                } else if (hasPurchased) {
                    actionButton = `<button onclick="window.shopController.equipItem('${this.currentTab}', '${item.id}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]">&#10024; EQUIP NOW</button>`;
                } else {
                    actionButton = `
                        <button onclick="window.shopController.buyItem('${this.currentTab}', '${item.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md">
                            <span>Unlock ${item.cost}</span> <span class="text-lg">&#129689;</span>
                        </button>
                    `;
                }
            }

            // Determine what to show in the circle (icon vs actual avatar image)
            let visualDisplay = item.icon;
            if (item.equipType === 'avatar' && item.equipValue.endsWith('.png')) {
                visualDisplay = `<img src="./public/avatars/${item.equipValue}" alt="${item.name}" class="w-full h-full object-cover rounded-full" />`;
            }

            html += `
                <div class="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col justify-between transition-all hover:border-indigo-400 dark:hover:border-indigo-400 hover:-translate-y-1 shadow-sm ${item.glow}">
                    <div>
                        <div class="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-300 dark:border-white/5 shadow-inner overflow-hidden">
                            ${visualDisplay}
                        </div>
                        <h4 class="font-black text-slate-900 dark:text-white text-xl mb-2">${item.name}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">${item.desc}</p>
                    </div>
                    <div>
                        ${actionButton}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    async buyItem(category, itemId) {
        if (this._busy) return;

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item) return;

        if (me.coins < item.cost) {
            if (window.toast) window.toast(`Not enough coins! You need ${item.cost - me.coins} more.`, false);
            if (window.sfx) window.sfx.play('wrong'); 
            
            const coinEl = document.getElementById('shop-coins');
            if (coinEl) {
                coinEl.classList.add('text-rose-500', 'animate-pulse');
                setTimeout(() => coinEl.classList.remove('text-rose-500', 'animate-pulse'), 1000);
            }
            return;
        }

        this._busy = true;
        const previousCoins = me.coins;
        const previousInventory = { ...me.inventory };

        me.coins -= item.cost;
        me.inventory = me.inventory || {};
        if (category === 'consumables') {
            me.inventory[itemId] = (me.inventory[itemId] || 0) + 1;
        } else {
            me.inventory[itemId] = true; 
        }

        appStore.set('me', me);
        this.renderItems();
        const shopCoinsEl = document.getElementById('shop-coins');
        if (shopCoinsEl) shopCoinsEl.innerText = me.coins;

        try {
            await persistPlayerFields(me, { coins: me.coins, inventory: me.inventory });

            if (window.toast) window.toast(`Successfully purchased ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            if (window.dashboardController) window.dashboardController.renderDashboard();

        } catch (error) {
            console.error("Purchase failed, rolling back local state: ", error);
            const rolledBack = appStore.get('me');
            rolledBack.coins = previousCoins;
            rolledBack.inventory = previousInventory;
            appStore.set('me', rolledBack);
            this.renderItems();
            if (shopCoinsEl) shopCoinsEl.innerText = rolledBack.coins;
            if (window.toast) window.toast("Purchase failed — your coins were not spent. Check your connection.", false);
        } finally {
            this._busy = false;
        }
    },

    async equipItem(category, itemId) {
        if (this._busy) return; 

        const me = appStore.get('me');
        const item = this.catalog[category]?.find(i => i.id === itemId);
        if (!me || !item || !me.inventory[itemId]) return;

        this._busy = true;
        const previousEquipped = { ...me.equipped };
        const previousAvatar = me.avatar;
        const previousBorder = me.border;

        me.equipped = me.equipped || {};

        // Storing the file path (e.g., abraham.png) under `me.equipped.avatar` 
        // keeps the two avatar systems (uploaded-photo filename vs. shop cosmetic overlay) separate.
        if (item.equipType === 'avatar') {
            me.equipped.avatar = item.equipValue;
        } else {
            me.equipped[item.equipType] = item.equipValue;
            if(item.equipType === 'border') {
                me.border = item.equipValue;
            }
        }

        appStore.set('me', me);
        this.renderItems();

        try {
            const fieldsToSync = { equipped: me.equipped };
            if (item.equipType === 'border') fieldsToSync.border = me.border;
            await persistPlayerFields(me, fieldsToSync);

            if (window.toast) window.toast(`Equipped ${item.name}!`, true);
            if (window.sfx) window.sfx.play('correct');
            
            if (window.dashboardController) window.dashboardController.renderDashboard();
            if (window.uiManager) window.uiManager.updateStudentHUD();

        } catch (error) {
            console.error("Equip failed, rolling back local state: ", error);
            const rolledBack = appStore.get('me');
            rolledBack.equipped = previousEquipped;
            rolledBack.avatar = previousAvatar;
            rolledBack.border = previousBorder;
            appStore.set('me', rolledBack);
            this.renderItems();
            if (window.toast) window.toast("Couldn't equip that — check your connection and try again.", false);
        } finally {
            this._busy = false;
        }
    }
};

window.shopController = shopController;