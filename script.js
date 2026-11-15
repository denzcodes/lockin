// Default & Saved Settings
const defaultSettings = { work: 25, short: 5, long: 15 };
let settings = JSON.parse(localStorage.getItem('lockInSettings')) || defaultSettings;

const themes = {
  work: { accent: '#ef4444', hover: '#dc2626', label: 'Locked In' },
  short: { accent: '#10b981', hover: '#059669', label: 'Quick Breather' },
  long: { accent: '#3b82f6', hover: '#2563eb', label: 'Recharge' }
};

let currentMode = 'work';
let timeLeft = settings[currentMode] * 60;
let timerId = null;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsForm = document.getElementById('settings-form');
const cancelBtn = document.getElementById('cancel-btn');

// Synthesize a clean chime using Web Audio API (no external audio file required)
function playNotificationSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // Slide to A5
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  timerDisplay.textContent = formatted;
  document.title = `${formatted} - ${themes[currentMode].label}`;
}

function switchMode(mode) {
  pauseTimer();
  currentMode = mode;
  timeLeft = settings[mode] * 60;

  // Update active button & theme variables
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  document.documentElement.style.setProperty('--accent', themes[mode].accent);
  document.documentElement.style.setProperty('--accent-hover', themes[mode].hover);

  updateDisplay();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startPauseBtn.textContent = 'Pause';

  timerId = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      pauseTimer();
      playNotificationSound();
      alert(`${themes[currentMode].label} session complete!`);
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerId);
  startPauseBtn.textContent = 'Start';
}

function resetTimer() {
  pauseTimer();
  timeLeft = settings[currentMode] * 60;
  updateDisplay();
}

// Event Listeners
startPauseBtn.addEventListener('click', () => {
  isRunning ? pauseTimer() : startTimer();
});

resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Settings Modal Handlers
settingsBtn.addEventListener('click', () => {
  document.getElementById('work-input').value = settings.work;
  document.getElementById('short-input').value = settings.short;
  document.getElementById('long-input').value = settings.long;
  settingsModal.showModal();
});

cancelBtn.addEventListener('click', () => settingsModal.close());

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  settings = {
    work: parseInt(document.getElementById('work-input').value, 10),
    short: parseInt(document.getElementById('short-input').value, 10),
    long: parseInt(document.getElementById('long-input').value, 10)
  };
  localStorage.setItem('lockInSettings', JSON.stringify(settings));
  settingsModal.close();
  resetTimer();
});

// Initialize
updateDisplay();