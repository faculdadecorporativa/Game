// data.js
// Default Lesson Data updated to strictly conform to the Phase 6 RPG Module Schema

export const defaultLessonData = {
    vocabulary: [
        { term: "Performance Homeostasis", def: "Maintaining the same level of performance established when a job was first mastered." }, 
        { term: "Halo Effect", def: "Our perceptions being altered positively or negatively based on overall impressions." }
    ],
    puzzleMatch: { 
        image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80",
        questions: [{ q: "What is the primary goal of feedback?", options: ["Growth", "Confusion", "Criticism", "Delay"], answer: 0 }] 
    },
    hotspots: [
        { prompt: "Find the Feedback Receiver (Person listening)", target: { top: 35, left: 60, width: 20, height: 45 } }
    ],
    ticTacToe: [
        { q: "Feedback should be specific rather than general. True or False?", options: ["True", "False"], answer: 0 }
    ],
    audioGuess: [
        { desc: "This concept describes how we naturally want to defend ourselves against criticism by rejecting the validity of the feedback.", options: ["Performance Homeostasis", "Denial", "Halo Effect", "Codependence"], answer: 1, skill: "Listening" }
    ],
    spellingBee: [
        { word: "Codependence", skill: "Writing" }
    ],
    hangman: [
        { phrase: "THE POWER OF FEEDBACK", skill: "General" }
    ],
    memoryMatch: [
        { term: "Homeostasis", match: "Stability" },
        { term: "Halo Effect", match: "Bias" }
    ],
    readAloud: [
        { text: "Feedback is essential for growth. Without it, we are flying blind. We must learn to accept feedback to improve our performance.", skill: "Speaking" }
    ],
    dictation: [
        { text: "We tend to attribute other people's success or failure to the people themselves.", skill: "Writing" }
    ],
    quiz: [
        { q: "What usually happens if you receive feedback but refuse to change for the better?", options: ["You will be perceived more negatively.", "People forget it.", "Performance naturally increases.", "You are seen as independent."], answer: 0, skill: "General" }
    ],
    chatPhrases: ["Good job!", "Not bad!", "Keep it up!", "Impressive!", "You are unstoppable!"]
};

export const cyberSecurityMockData = {
    vocabulary: [
        { term: "Malware", def: "Software designed to disrupt, damage, or gain unauthorized access to a computer system." }, 
        { term: "Phishing", def: "Fraudulent practice of sending emails purporting to be from reputable companies." }
    ],
    puzzleMatch: { 
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        questions: [{ q: "What protocol secures web traffic?", options: ["HTTP", "HTTPS", "FTP", "SMTP"], answer: 1 }] 
    },
    hotspots: [
        { prompt: "Find the locked padlock symbol", target: { top: 20, left: 20, width: 15, height: 15 } }
    ],
    ticTacToe: [
        { q: "Is sharing your password safe?", options: ["Yes", "No"], answer: 1 }
    ],
    audioGuess: [
        { desc: "This is a security system that monitors and controls network traffic based on rules.", options: ["Malware", "Phishing", "Firewall", "Encryption"], answer: 2, skill: "Listening" }
    ],
    spellingBee: [
        { word: "Vulnerability", skill: "Writing" }
    ],
    hangman: [
        { phrase: "MULTIFACTOR AUTHENTICATION", skill: "General" }
    ],
    memoryMatch: [
        { term: "Firewall", match: "Filter" },
        { term: "Phishing", match: "Fraud" }
    ],
    readAloud: [
        { text: "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.", skill: "Speaking" }
    ],
    dictation: [
        { text: "Always use strong and unique passwords for your accounts.", skill: "Writing" }
    ],
    quiz: [
        { q: "Which of the following is considered a strong password?", options: ["password123", "admin", "P@ssw0rd_2026!", "123456"], answer: 2, skill: "General" }
    ],
    chatPhrases: ["Excellent!", "Secure choice!", "Well done, admin!", "Hacker defeated!", "Top tier!"]
};

export const tailwindColors = {
    red: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', light: 'text-red-400', heavy: 'bg-red-900' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', light: 'text-blue-400', heavy: 'bg-blue-900' },
    green: { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500', light: 'text-green-400', heavy: 'bg-green-900' },
    yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', light: 'text-yellow-400', heavy: 'bg-yellow-900' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', light: 'text-purple-400', heavy: 'bg-purple-900' },
    pink: { text: 'text-pink-500', bg: 'bg-pink-500', border: 'border-pink-500', light: 'text-pink-400', heavy: 'bg-pink-900' },
    orange: { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500', light: 'text-orange-400', heavy: 'bg-orange-900' },
    slate: { text: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-500', light: 'text-slate-400', heavy: 'bg-slate-900' },
    cyan: { text: 'text-cyan-500', bg: 'bg-cyan-500', border: 'border-cyan-500', light: 'text-cyan-400', heavy: 'bg-cyan-900' },
    amber: { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', light: 'text-amber-400', heavy: 'bg-amber-900' }
};

export const animalThemes = {
    lion: { name: 'Lions', icon: '🦁', color: 'yellow' },
    eagle: { name: 'Eagles', icon: '🦅', color: 'blue' },
    wolf: { name: 'Wolves', icon: '🐺', color: 'slate' },
    shark: { name: 'Sharks', icon: '🦈', color: 'cyan' },
    tiger: { name: 'Tigers', icon: '🐯', color: 'orange' },
    bear: { name: 'Bears', icon: '🐻', color: 'amber' },
    dragon: { name: 'Dragons', icon: '🐉', color: 'red' },
    panda: { name: 'Pandas', icon: '🐼', color: 'green' }
};