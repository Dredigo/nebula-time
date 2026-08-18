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

// Desbloquear el contexto con la primera interacción del usuario
document.addEventListener('click', function unlockAudioOnInteraction() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    } else if (!audioCtx) {
        getAudioContext();
    }
    document.removeEventListener('click', unlockAudioOnInteraction);
}, { once: true });

// Reproducir tono sintético de finalización o notificación
function playSynthesizedBeep(freq = 587.33, type = 'sine', duration = 0.3) {
    try {
        const ctx = getAudioContext();

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn("Audio no iniciado o bloqueado por el navegador", e);
    }
}

// Alarma alegre de fin de Pomodoro (secuencia de notas)
function playPomodoroChime() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do alto
    notes.forEach((note, index) => {
        setTimeout(() => {
            playSynthesizedBeep(note, 'triangle', 0.4);
        }, index * 150);
    });
}

/* ==========================================================================
   Catálogo de Audios Locales por Categorías (15 Subcarpetas)
   ========================================================================== */

const audioCatalog = {
    ambient_music: [
        { id: 'ambient_1', name: 'ambient music 1', file: 'assets/audio/ambient_music/meditation_music_1.mp3' }
    ],
    ambient_sound: [
        { id: 'ambient_sound_1', name: 'Garden', file: 'assets/audio/ambient_sound/garden.mp3' },
        { id: 'ambient_sound_2', name: 'Park children', file: 'assets/audio/ambient_sound/park_children.mp3' },
        { id: 'ambient_sound_3', name: 'Work sound', file: 'assets/audio/ambient_sound/trabajo_sonido.mp3' }
    ],
    binaural: [
        { id: 'binaural_1', name: 'Ondas delta 440 5Hz', file: 'assets/audio/binaural/binaural_beats_delta_440_440_5hz.mp3' },
        { id: 'binaural_2', name: 'Ondas theta 4Hz', file: 'assets/audio/binaural/binaural_beats_theta_waves_4_hz.mp3' },
        { id: 'binaural_3', name: 'Ondas delta 52 5Hz', file: 'assets/audio/binaural/binaural_delta_52_52_5hz.mp3' },
        { id: 'binaural_4', name: 'Ondas delta 60-61 5Hz', file: 'assets/audio/binaural/binaural_delta_60_61_5hz.mp3' },
        { id: 'binaural_5', name: 'Binaural denver bookstore', file: 'assets/audio/binaural/binaural_denver_bookstore.mp3' },
        { id: 'binaural_6', name: 'Binaural denver botanic gardens eveningtime insects', file: 'assets/audio/binaural/binaural_denver_botanic_gardens_eveningtime_insects.mp3' },
        { id: 'binaural_7', name: 'Binaural upper maxwell falls at top of falls', file: 'assets/audio/binaural/binaural_upper_maxwell_falls_at_top_of_falls.mp3' },
        { id: 'binaural_8', name: 'Binaurale alpha waves 8hz', file: 'assets/audio/binaural/binaurale_beats_pur_alpha_waves_8_hz.mp3' },
        { id: 'binaural_9', name: 'Ondas theta 6hz ocean waves', file: 'assets/audio/binaural/purebinaural_6_hz_theta_binaural_beats_with_ocean_waves.mp3' },
        { id: 'binaural_10', name: 'Ondas alpha 10Hz ocean waves', file: 'assets/audio/binaural/purebinaural_10_hz_alpha_binaural_beats_with_ocean_waves.mp3' },
        { id: 'binaural_11', name: 'Ondas 13Hz ocean waves', file: 'assets/audio/binaural/purebinaural_13_hz_binaural_beats_with_ocean_waves.mp3' }
    ],
    coffee: [
        { id: 'coffee_1', name: 'Cafetería 1', file: 'assets/audio/coffee/cafe_1.mp3' },
        { id: 'coffee_2', name: 'Cafetería 2', file: 'assets/audio/coffee/cafe_2.mp3' },
        { id: 'coffee_3', name: 'Cafetería 3', file: 'assets/audio/coffee/cafe_3.mp3' },
        { id: 'coffee_4', name: 'Cafetería 4', file: 'assets/audio/coffee/cafe_4.mp3' },
        { id: 'coffee_5', name: 'Cafetería 5', file: 'assets/audio/coffee/cafe_5.mp3' },
        { id: 'coffee_6', name: 'Cafetería 6', file: 'assets/audio/coffee/cafe_6.mp3' },
        { id: 'coffee_7', name: 'Cafetería 7', file: 'assets/audio/coffee/cafe_7.mp3' },
        { id: 'coffee_8', name: 'Cafetería 8', file: 'assets/audio/coffee/cafe_8.mp3' },
        { id: 'coffee_9', name: 'Cafetería 9', file: 'assets/audio/coffee/cafe_9.mp3' }
    ],
    fire: [
        { id: 'fire_1', name: 'Fogata 1', file: 'assets/audio/fire/fuego_campamento.mp3' },
        { id: 'fire_2', name: 'Fogata 2', file: 'assets/audio/fire/fuego_crepitando_suave_2.mp3' },
        { id: 'fire_3', name: 'Fogata 3', file: 'assets/audio/fire/fuego_crepitando_suave_3.mp3' },
        { id: 'fire_4', name: 'Fogata 4', file: 'assets/audio/fire/fuego_crepitando_suave.mp3' },
        { id: 'fire_5', name: 'Fogata 5', file: 'assets/audio/fire/fuego_leña.mp3' },
        { id: 'fire_6', name: 'Fogata y pájaros', file: 'assets/audio/fire/fuego_pajaros.mp3' },
        { id: 'fire_7', name: 'Llamarada', file: 'assets/audio/fire/llamarada.mp3' }
    ],
    forest: [
        { id: 'forest_1', name: 'Bosque y abejas', file: 'assets/audio/forest/bosque_abejas.mp3' },
        { id: 'forest_2', name: 'Bosque armonia y pajaros', file: 'assets/audio/forest/bosque_armonia_pajaros.mp3' },
        { id: 'forest_3', name: 'Arroyo', file: 'assets/audio/forest/bosque_arroyo.mp3' },
        { id: 'forest_4', name: 'Cuervos', file: 'assets/audio/forest/bosque_cuervos.mp3' },
        { id: 'forest_5', name: 'Bosque y grillos', file: 'assets/audio/forest/bosque_grillos.mp3' },
        { id: 'forest_6', name: 'Bosque lejanía', file: 'assets/audio/forest/bosque_lejano.mp3' },
        { id: 'forest_7', name: 'Bosque y pajaros', file: 'assets/audio/forest/bosque_pajaros.mp3' },
        { id: 'forest_8', name: 'Bosque relajante', file: 'assets/audio/forest/bosque_relajante.mp3' },
        { id: 'forest_9', name: 'Lluvia en el bosque', file: 'assets/audio/forest/bosque_y_lluvia.mp3' },
        { id: 'forest_10', name: 'Grillos', file: 'assets/audio/forest/crickets_binaural.mp3' },
        { id: 'forest_11', name: 'Chacales', file: 'assets/audio/forest/jackals.mp3' },
        { id: 'forest_12', name: 'Pájaros, sonido agudo', file: 'assets/audio/forest/pajaros_agudo.mp3' },
        { id: 'forest_13', name: 'Pájaros, sonido relajante', file: 'assets/audio/forest/pajaros_relajante.mp3' },
        { id: 'forest_14', name: 'Río', file: 'assets/audio/forest/rio.mp3' },
        { id: 'forest_15', name: 'Sonido de ambiente', file: 'assets/audio/forest/sonido_de_ambiente.mp3' },
        { id: 'forest_16', name: 'Pájaros', file: 'assets/audio/forest/sonido_pajaros.mp3' }
    ],
    guitar: [
        { id: 'guitar_1', name: 'Guitarra 1', file: 'assets/audio/guitar/guitarra_1.mp3' },
        { id: 'guitar_2', name: 'Guitarra 2', file: 'assets/audio/guitar/guitarra_2.mp3' },
        { id: 'guitar_3', name: 'Guitarra 3', file: 'assets/audio/guitar/guitarra_3.mp3' },
        { id: 'guitar_4', name: 'Guitarra 4', file: 'assets/audio/guitar/guitarra_4.mp3' },
        { id: 'guitar_5', name: 'Guitarra 5', file: 'assets/audio/guitar/guitarra_5.mp3' },
        { id: 'guitar_6', name: 'Guitarra 6', file: 'assets/audio/guitar/guitarra_6.mp3' },
        { id: 'guitar_7', name: 'Guitarra 7', file: 'assets/audio/guitar/guitarra_7.mp3' },
        { id: 'guitar_8', name: 'Guitarra 8', file: 'assets/audio/guitar/guitarra_8.mp3' },
        { id: 'guitar_9', name: 'Guitarra 9', file: 'assets/audio/guitar/guitarra_9.mp3' },
        { id: 'guitar_10', name: 'Guitarra 10', file: 'assets/audio/guitar/guitarra_10.mp3' }
    ],
    lub_dub: [
        { id: 'heartbeat_1', name: 'Latidos 1', file: 'assets/audio/lub_dub/pulso_cardiaco.mp3' }
    ],
    rain: [
        { id: 'rain_1', name: 'Lluvia calmada', file: 'assets/audio/rain/lluvia calmada.mp3' },
        { id: 'rain_2', name: 'Lluvia al aire libre', file: 'assets/audio/rain/lluvia_aire_libre.mp3' },
        { id: 'rain_3', name: 'Lluvia relajante', file: 'assets/audio/rain/lluvia_relajante.mp3' },
        { id: 'rain_4', name: 'Lluvia relajante 2', file: 'assets/audio/rain/lluvia_relajante_2.mp3' },
        { id: 'rain_5', name: 'Lluvia relajante 3', file: 'assets/audio/rain/lluvia_relajante_3.mp3' },
        { id: 'rain_6', name: 'Lluvia relajante con paraguas', file: 'assets/audio/rain/lluvia_relajante_paraguas_personas.mp3' },
        { id: 'rain_7', name: 'Lluvia y olas 1', file: 'assets/audio/rain/lluvias_y_olas.mp3' },
        { id: 'rain_8', name: 'Lluvia y olas 2', file: 'assets/audio/rain/lluvia_y_olas_2.mp3' },
        { id: 'rain_9', name: 'Tormenta relajante', file: 'assets/audio/rain/tormenta_relajante.mp3' },
        { id: 'rain_10', name: 'Tormenta torrencial', file: 'assets/audio/rain/tormenta_torrencial.mp3' }
    ],
    retro: [
        { id: 'retro_1', name: 'Creepy synth', file: 'assets/audio/retro/creepy_synth.mp3' },
        { id: 'retro_2', name: 'Retro_music_garage', file: 'assets/audio/retro/retro_music_garage.mp3' },
        { id: 'retro_3', name: 'Retro_music_space', file: 'assets/audio/retro/retro_music_space.mp3' }
    ],
    sci_fi: [
        { id: 'scifi_1', name: 'Sci-Fi 1', file: 'assets/audio/sci_fi/sci_fi_1.mp3' },
        { id: 'scifi_2', name: 'Sci-Fi 2', file: 'assets/audio/sci_fi/sci_fi_2.mp3' },
        { id: 'scifi_3', name: 'Sci-Fi 3', file: 'assets/audio/sci_fi/sci_fi_3.mp3' },
        { id: 'scifi_4', name: 'Sci-Fi 4', file: 'assets/audio/sci_fi/alien_ambient.mp3' }
    ],
    sea: [
        { id: 'sea_1', name: 'Olas calmadas', file: 'assets/audio/sea/olas_calmadas.mp3' },
        { id: 'sea_2', name: 'Olas fuertes', file: 'assets/audio/sea/olas_fuertes.mp3' },
        { id: 'sea_3', name: 'Olas de izquierda a derecha', file: 'assets/audio/sea/olas_izquierda_a_derecha.mp3' },
        { id: 'sea_4', name: 'Olas relajantes', file: 'assets/audio/sea/olas_relajantes.mp3' },
        { id: 'sea_5', name: 'Olas tormenta', file: 'assets/audio/sea/tormenta_marina.mp3' },
        { id: 'sea_6', name: 'Debajo del agua', file: 'assets/audio/sea/debajo_del_agua.mp3' }
    ],
    space: [
        { id: 'space_1', name: 'Espacio 1', file: 'assets/audio/space/space_1.mp3' },
        { id: 'space_2', name: 'Espacio 2', file: 'assets/audio/space/space_2.mp3' },
        { id: 'space_3', name: 'Espacio 3', file: 'assets/audio/space/space_3.mp3' },
        { id: 'space_4', name: 'Espacio 4', file: 'assets/audio/space/space_4.mp3' },
        { id: 'space_5', name: 'Espacio 5', file: 'assets/audio/space/space_5.mp3' },
        { id: 'space_6', name: 'Espacio 6', file: 'assets/audio/space/space_working.mp3' }
    ],
    train: [
        { id: 'train_1', name: 'Tren 1', file: 'assets/audio/train/tren.mp3' },
        { id: 'train_2', name: 'Tren 2', file: 'assets/audio/train/tren_2.mp3' },
        { id: 'train_3', name: 'Tren 3', file: 'assets/audio/train/tren_3.mp3' },
        { id: 'train_4', name: 'Tren 4', file: 'assets/audio/train/tren_4.mp3' },
        { id: 'train_5', name: 'Tren 5', file: 'assets/audio/train/tren_5.mp3' },
        { id: 'train_6', name: 'Tren 6', file: 'assets/audio/train/tren_6.mp3' }
    ],
    wind: [
        { id: 'wind_1', name: 'Viento fuerte 1', file: 'assets/audio/wind/viento_fuerte_1.mp3' },
        { id: 'wind_2', name: 'Viento fuerte 2', file: 'assets/audio/wind/viento_fuerte_2.mp3' },
        { id: 'wind_3', name: 'Viento fuerte 3', file: 'assets/audio/wind/viento_fuerte_3.mp3' },
        { id: 'wind_4', name: 'Viento fuerte 4', file: 'assets/audio/wind/viento_fuerte_4.mp3' },
        { id: 'wind_5', name: 'Viento relajante 1', file: 'assets/audio/wind/viento_relajante_1.mp3' },
        { id: 'wind_6', name: 'Viento relajante 2', file: 'assets/audio/wind/viento_relajante_2.mp3' },
        { id: 'wind_7', name: 'Viento relajante 3', file: 'assets/audio/wind/viento_relajante_3.mp3' },
        { id: 'wind_8', name: 'Viento relajante 4', file: 'assets/audio/wind/viento_relajante_4.mp3' },
        { id: 'wind_9', name: 'Viento relajante 5', file: 'assets/audio/wind/viento_relajante_5.mp3' },
        { id: 'wind_10', name: 'Viento relajante 6', file: 'assets/audio/wind/viento_relajante_6.mp3' },
        { id: 'wind_11', name: 'Viento relajante 7', file: 'assets/audio/wind/viento_relajante_7.mp3' },
        { id: 'wind_12', name: 'Viento y pájaros', file: 'assets/audio/wind/viento_pajaros.mp3' }
    ]
};

// Instancias activas por categoría
const activeAudioInstances = {};

/**
 * Reproduce o pausa el audio de una categoría.
 * @param {string} categoryKey - Clave de la categoría (ej: 'rain', 'coffee')
 * @param {number} trackIndex - Índice de la pista seleccionada dentro de la categoría
 * @param {number} volume - Nivel de volumen (0.0 a 1.0)
 */
function toggleAmbientSound(categoryKey, trackIndex = 0, volume = 0.5) {
    getAudioContext();

    const categoryTracks = audioCatalog[categoryKey];
    if (!categoryTracks || !categoryTracks[trackIndex]) return false;

    const track = categoryTracks[trackIndex];

    if (activeAudioInstances[categoryKey]) {
        const currentInstance = activeAudioInstances[categoryKey];

        // Si cambia de pista dentro de la misma categoría, detiene la anterior y carga la nueva
        if (currentInstance.datasetTrackId !== track.id) {
            currentInstance.pause();
            const newAudio = new Audio(track.file);
            newAudio.loop = true;
            newAudio.volume = volume;
            newAudio.datasetTrackId = track.id;
            newAudio.play().catch(() => console.warn("Interacción requerida para reproducir audio."));
            activeAudioInstances[categoryKey] = newAudio;
            return true;
        }

        // Alternar reproducción / pausa si es la misma pista
        if (!currentInstance.paused) {
            currentInstance.pause();
            return false;
        } else {
            currentInstance.play().catch(() => {});
            return true;
        }
    } else {
        // Primera activación de la categoría
        const audio = new Audio(track.file);
        audio.loop = true;
        audio.volume = volume;
        audio.datasetTrackId = track.id;
        audio.play().catch(() => console.warn("Interacción requerida para reproducir audio."));
        activeAudioInstances[categoryKey] = audio;
        return true;
    }
}

/**
 * Cambia el volumen de una categoría en ejecución.
 */
function setAmbientVolume(categoryKey, volume) {
    if (activeAudioInstances[categoryKey]) {
        activeAudioInstances[categoryKey].volume = volume;
    }
}

/**
 * Detiene todas las pistas ambientales activas.
 */
function stopAllAmbientSounds() {
    Object.keys(activeAudioInstances).forEach(key => {
        activeAudioInstances[key].pause();
        activeAudioInstances[key].currentTime = 0;
    });
}