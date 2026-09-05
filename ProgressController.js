// ProgressController.js
// Manages the UI/UX for the Progress & Habits Analytics Dashboard.
// Requires: appStore (global state), pb (PocketBase instance)

export class ProgressController {
  constructor(pb, appStore) {
    this.pb = pb; 
    this.appStore = appStore; 
    this.unsubscribe = null; 
    
    // UI Elements
    this.modal = document.getElementById('module-progress'); 
    this.btnClose = document.getElementById('btn-close-progress'); 
    
    // Configuration Data
    this.skillConfig = {
      reading: { icon: '📚', color: 'blue' }, 
      writing: { icon: '✍️', color: 'indigo' }, 
      speaking: { icon: '🗣️', color: 'purple' }, 
      interpretation: { icon: '🧠', color: 'fuchsia' }, 
      participation: { icon: '✋', color: 'pink' }, 
      influence: { icon: '👑', color: 'rose' } 
    };

    this.habitConfig = {
      sleep: { icon: '🌙', label: 'Sleep', unit: 'hrs', goal: 8, buff: 'Rest Period Buff' }, 
      exercise: { icon: '🏃', label: 'Exercise', unit: 'min', goal: 30, buff: 'Stamina Buff' }, 
      recordings: { icon: '🎙️', label: 'Recordings', unit: 'qty', goal: 3, buff: 'Charisma Buff' }, 
      books: { icon: '📖', label: 'Reading', unit: 'ch', goal: 2, buff: 'Wisdom Buff' }, 
      focus: { icon: '⏱️', label: 'Deep Work', unit: 'min', goal: 60, buff: 'Focus Buff' } 
    };

    this.init(); 
  }

  init() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeProgress()); 
    }
  }

  async openProgress() {
    const me = this.appStore.get('me'); 
    if (!me || !me.id) {
      console.warn('User not authenticated.'); 
      return;
    }

    this.ensureDataStructure(me); 
    this.renderProgress(); 

    // Show modal & trigger transition
    this.modal.classList.remove('hidden'); 
    setTimeout(() => {
      this.modal.classList.add('opacity-100'); 
    }, 10); 

    await this.initRealtime(me.id); 
  }

  closeProgress() {
    this.modal.classList.remove('opacity-100'); 
    setTimeout(() => {
      this.modal.classList.add('hidden'); 
    }, 300); 

    if (this.unsubscribe) {
      this.unsubscribe(); 
      this.unsubscribe = null; 
    }
  }

  async initRealtime(userId) {
    if (this.unsubscribe) {
      this.unsubscribe(); 
    }

    try {
      this.unsubscribe = await this.pb.collection('users').subscribe(userId, (e) => { 
        if (e.action === 'update') { 
          this.appStore.set('me', e.record); 
          this.renderProgress(); 
        }
      });
    } catch (err) {
      console.error('Failed to initialize PB Realtime for Progress:', err); 
    }
  }

  ensureDataStructure(user) {
    let updated = false; 
    if (!user.skills) {
      user.skills = { reading: 0, writing: 0, speaking: 0, interpretation: 0, participation: 0, influence: 0 }; 
      updated = true; 
    }
    if (!user.habits) {
      user.habits = { sleep: 0, exercise: 0, recordings: 0, books: 0, focus: 0 }; 
      updated = true; 
    }
    if (updated) {
      this.appStore.set('me', user); 
    }
  }

  renderProgress() {
    const me = this.appStore.get('me'); 
    if (!me) return;

    // Header Updates
    document.getElementById('progress-name').textContent = me.name || me.username || 'Student'; 
    document.getElementById('progress-avatar').src = me.avatarUrl || '/assets/avatars/default.png'; 
    document.getElementById('progress-level').textContent = `Lvl ${me.level || 1}`; 
    
    // XP Progress Calculation
    const currentXP = me.xp || 0; 
    const nextLevelXp = (me.level || 1) * 1000; 
    const xpPercent = Math.min(100, Math.floor((currentXP / nextLevelXp) * 100)); 
    
    document.getElementById('progress-xp-text').textContent = `${currentXP} / ${nextLevelXp}`; 
    document.getElementById('progress-xp-fill').style.width = `${xpPercent}%`; 
    document.getElementById('progress-streak').textContent = `${me.streak || 0} Days`; 

    this.renderSkills(me.skills || {}); 
    this.renderHabits(me.habits || {}); 
    this.renderWeeklyMatrix(me.activityLog || []); 
  }

  renderSkills(skills) {
    const container = document.getElementById('skills-grid'); 
    container.innerHTML = ''; 

    Object.entries(this.skillConfig).forEach(([key, config]) => { 
      const score = skills[key] || 0; 
      const card = document.createElement('div'); 
      card.className = 'p-5 border rounded-2xl bg-slate-900/60 backdrop-blur-md border-slate-700/50 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group shadow-lg';
      card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-xl group-hover:scale-110 transition-transform">${config.icon}</div>
            <span class="font-bold text-slate-200 capitalize tracking-wide">${key}</span>
          </div>
          <span class="text-lg font-black text-${config.color}-400 group-hover:text-${config.color}-300 transition-colors">${score}%</span>
        </div>
        <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div class="h-full bg-${config.color}-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]" style="width: ${score}%"></div>
        </div>
      `;
      container.appendChild(card); 
    });
  }

  renderHabits(habits) {
    const container = document.getElementById('habits-grid'); 
    container.innerHTML = ''; 

    Object.entries(this.habitConfig).forEach(([key, config]) => { 
      const currentValue = habits[key] || 0; 
      const progressPercent = Math.min(100, (currentValue / config.goal) * 100); 
      const isComplete = currentValue >= config.goal; 

      const card = document.createElement('div'); 
      card.className = `p-4 border rounded-2xl transition-all duration-300 flex items-center justify-between shadow-lg ${
        isComplete ? 'bg-emerald-900/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
      }`; 
      
      card.innerHTML = `
        <div class="flex-1 pr-4">
          <div class="flex items-center gap-3 mb-1">
            <span class="text-xl">${config.icon}</span>
            <span class="font-bold text-slate-200">${config.label}</span>
          </div>
          <div class="text-[11px] font-semibold text-indigo-300 uppercase tracking-widest mb-3">${config.buff}</div>
          <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div class="h-full transition-all duration-700 ${isComplete ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'}" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        <div class="flex items-center gap-1 sm:gap-2 pl-3 sm:pl-4 border-l border-slate-700/50">
          <button data-habit="${key}" data-action="-1" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-400 hover:border-rose-500/30 active:scale-95 transition-all text-xl font-black">-</button>
          <div class="w-12 text-center flex flex-col justify-center">
             <span class="font-mono font-black text-white text-lg">${currentValue}</span>
             <span class="text-[9px] text-slate-500 uppercase tracking-widest leading-none">${config.unit}</span>
          </div>
          <button data-habit="${key}" data-action="1" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30 active:scale-95 transition-all text-xl font-black">+</button>
        </div>
      `;

      card.querySelectorAll('button').forEach(btn => { 
        btn.addEventListener('click', (e) => { 
          const habitKey = e.currentTarget.dataset.habit; 
          const action = parseInt(e.currentTarget.dataset.action); 
          this.logHabit(habitKey, action); 
        });
      });

      container.appendChild(card); 
    });
  }

  renderWeeklyMatrix(activityLog) {
    const container = document.getElementById('weekly-matrix'); 
    container.innerHTML = ''; 
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; 
    
    // Generates a mock week status based on recent data index
    days.forEach((day, index) => { 
      const isActive = index < 4;  // Mock: Mon-Thu logged
      
      container.innerHTML += `
        <div class="flex flex-col items-center gap-2 w-full max-w-[2.5rem]">
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${day}</span>
          <div class="w-full aspect-square rounded-lg sm:rounded-xl border flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
              : 'bg-slate-900/50 border-slate-800/80 text-transparent'
          }">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>
      `;
    });
  }

  async logHabit(habitKey, delta) {
    const me = this.appStore.get('me'); 
    if (!me || !me.id) return;

    const currentVal = me.habits[habitKey] || 0; 
    const newVal = Math.max(0, currentVal + delta); 
    
    me.habits[habitKey] = newVal; 
    this.appStore.set('me', me); 
    this.renderHabits(me.habits); 

    try {
      await this.pb.collection('users').update(me.id, { 
        habits: me.habits 
      });
    } catch (err) {
      console.error(`Failed to update habit ${habitKey}:`, err); 
      me.habits[habitKey] = currentVal; 
      this.appStore.set('me', me); 
      this.renderHabits(me.habits); 
    }
  }
}