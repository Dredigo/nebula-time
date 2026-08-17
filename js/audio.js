/* ==========================================================================
   Nebula Time — Audio & Sound Synth Management
   ========================================================================== */

// Contexto de Audio Nativo
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Reproducir tono sintético de finalización o notificación
function playSynthesizedBeep(freq = 587.33, type = 'sine', duration = 0.3) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn("Audio no iniciado o bloqueado por el navegador", e);
    }
}

// Alarma alegre de fin de Pomodoro (secuencia de notas)
function playPomodoroChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do alto
    notes.forEach((note, index) => {
        setTimeout(() => {
            playSynthesizedBeep(note, 'triangle', 0.4);
        }, index * 150);
    });
}

/* --- Mezclador de Sonidos Ambientales --- */

const ambientTrackUrls = {
    rain: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_8b05615805.mp3',
    waves: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_3d1f3b063d.mp3',
    forest: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    fire: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36e4f3586.mp3',
    lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
};

const activeAudioInstances = {};

function toggleAmbientSound(trackKey, volume = 0.5) {
    if (activeAudioInstances[trackKey]) {
        if (!activeAudioInstances[trackKey].paused) {
            activeAudioInstances[trackKey].pause();
            return false;
        } else {
            activeAudioInstances[trackKey].play().catch(() => {});
            return true;
        }
    } else {
        if (!ambientTrackUrls[trackKey]) return false;
        const audio = new Audio(ambientTrackUrls[trackKey]);
        audio.loop = true;
        audio.volume = volume;
        audio.play().catch(() => console.log("Se requiere interacción para reproducir audio"));
        activeAudioInstances[trackKey] = audio;
        return true;
    }
}

function setAmbientVolume(trackKey, volume) {
    if (activeAudioInstances[trackKey]) {
        activeAudioInstances[trackKey].volume = volume;
    }
}

function stopAllAmbientSounds() {
    Object.keys(activeAudioInstances).forEach(key => {
        activeAudioInstances[key].pause();
        activeAudioInstances[key].currentTime = 0;
    });
}