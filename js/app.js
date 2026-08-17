/* ==========================================================================
   Nebula Time — Main Application Controller & Event Handlers
   ========================================================================== */

let pomodoroTimer = null;
let pomodoroSecondsLeft = 25 * 60;
let isPomodoroRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderSchedule();
    updateLiveBanner();
    setInterval(updateLiveBanner, 30000); // Actualiza banner cada 30 seg
});

/* --- Reloj en Tiempo Real y Fecha --- */

function initClock() {
    function tick() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dayOptions = { weekday: 'long', day: 'numeric', month: 'short' };
        const dateStr = now.toLocaleDateString('es-AR', dayOptions);

        const timeElem = document.getElementById('current-time-display');
        const dateElem = document.getElementById('today-name-display');

        if (timeElem) timeElem.innerText = timeStr;
        if (dateElem) dateElem.innerText = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    tick();
    setInterval(tick, 1000);
}

/* --- Banner de Actividad En Curso --- */

function updateLiveBanner() {
    const banner = document.getElementById('live-banner');
    const bannerText = document.getElementById('live-banner-text');
    if (!banner || !bannerText) return;

    const todayKey = getTodayDayName();
    const todayTasks = appData.schedule[todayKey] || [];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let currentTask = null;

    todayTasks.forEach(task => {
        // Intentar parsear el horario "HH:MM – HH:MM"
        const parts = task.time.split('–').map(s => s.trim());
        if (parts.length === 2) {
            const [startH, startM] = parts[0].split(':').map(Number);
            const [endH, endM] = parts[1].split(':').map(Number);

            if (!isNaN(startH) && !isNaN(endH)) {
                const startTotal = startH * 60 + startM;
                const endTotal = endH * 60 + endM;

                if (currentMinutes >= startTotal && currentMinutes <= endTotal) {
                    currentTask = task;
                }
            }
        }
    });

    if (currentTask && !currentTask.completed) {
        banner.classList.remove('hidden');
        bannerText.innerHTML = `<i class="${currentTask.icon}"></i> ${currentTask.title} (${currentTask.time})`;

        const checkBtn = document.getElementById('live-banner-check');
        const pomoBtn = document.getElementById('live-banner-pomo');

        if (checkBtn) {
            checkBtn.onclick = () => {
                toggleTaskComplete(todayKey, currentTask.id);
                updateLiveBanner();
            };
        }
        if (pomoBtn) {
            pomoBtn.onclick = () => startPomodoroForTask(currentTask.id);
        }
    } else {
        banner.classList.add('hidden');
    }
}

/* --- Gestión de Tareas (Completar, Eliminar, Crear, Editar) --- */

function toggleTaskComplete(dayKey, taskId) {
    const list = appData.schedule[dayKey] || [];
    const task = list.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            recordDailyActivity();
            if (typeof confetti === 'function') {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            }
        }
        saveScheduleData();
        renderSchedule();
        updateLiveBanner();
    }
}

function deleteTask(dayKey, taskId) {
    showCustomDialog('¿Eliminar actividad?', 'Esta acción quitará el elemento del horario.', () => {
        appData.schedule[dayKey] = (appData.schedule[dayKey] || []).filter(t => t.id !== taskId);
        delete appData.notes[taskId];
        saveScheduleData();
        saveNotesData();
        renderSchedule();
        updateLiveBanner();
    });
}

function openTaskModalForDay(dayKey) {
    currentEditingTaskId = null;
    document.getElementById('task-modal-title').innerText = 'Nueva Actividad';
    document.getElementById('task-form').reset();
    document.getElementById('form-day').value = dayKey;
    document.getElementById('task-modal').classList.remove('hidden');
}

function editTaskModal(dayKey, taskId) {
    const task = (appData.schedule[dayKey] || []).find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskId = taskId;
    document.getElementById('task-modal-title').innerText = 'Editar Actividad';
    document.getElementById('form-day').value = dayKey;
    document.getElementById('form-title').value = task.title;
    document.getElementById('form-time').value = task.time;
    document.getElementById('form-icon-class').value = task.icon || 'fa-solid fa-database';
    document.getElementById('form-category').value = task.category || 'bd';
    document.getElementById('form-color').value = task.color || 'cyan';

    document.getElementById('task-modal').classList.remove('hidden');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

function saveTask(event) {
    event.preventDefault();
    const day = document.getElementById('form-day').value;
    const title = document.getElementById('form-title').value.trim();
    const time = document.getElementById('form-time').value.trim();
    const icon = document.getElementById('form-icon-class').value;
    const category = document.getElementById('form-category').value;
    const color = document.getElementById('form-color').value;

    if (currentEditingTaskId) {
        // Actualizar existente
        DAYS.forEach(d => {
            appData.schedule[d] = (appData.schedule[d] || []).filter(t => t.id !== currentEditingTaskId);
        });
        appData.schedule[day].push({
            id: currentEditingTaskId,
            title, time, icon, category, color, completed: false
        });
    } else {
        // Crear nuevo
        const newId = 'task_' + Date.now();
        if (!appData.schedule[day]) appData.schedule[day] = [];
        appData.schedule[day].push({
            id: newId,
            title, time, icon, category, color, completed: false
        });
    }

    saveScheduleData();
    closeTaskModal();
    renderSchedule();
    updateLiveBanner();
}

/* --- Gestión de Notas y Subtareas --- */

function saveNotesModal() {
    if (!currentActiveNoteId) return;
    if (!appData.notes[currentActiveNoteId]) {
        appData.notes[currentActiveNoteId] = { text: '', subtasks: [], links: [] };
    }

    appData.notes[currentActiveNoteId].text = document.getElementById('note-text-area').value;
    saveNotesData();
    closeNotesModal();
}

function addSubTask() {
    const input = document.getElementById('new-subtask-input');
    const val = input ? input.value.trim() : '';
    if (!val || !currentActiveNoteId) return;

    if (!appData.notes[currentActiveNoteId]) {
        appData.notes[currentActiveNoteId] = { text: '', subtasks: [], links: [] };
    }

    appData.notes[currentActiveNoteId].subtasks.push({ title: val, completed: false });
    input.value = '';
    saveNotesData();
    renderNoteChecklist(appData.notes[currentActiveNoteId].subtasks);
}

function toggleSubTaskCheck(idx) {
    if (!currentActiveNoteId || !appData.notes[currentActiveNoteId]) return;
    const list = appData.notes[currentActiveNoteId].subtasks;
    if (list[idx]) {
        list[idx].completed = !list[idx].completed;
        saveNotesData();
        renderNoteChecklist(list);
    }
}

function removeSubTask(idx) {
    if (!currentActiveNoteId || !appData.notes[currentActiveNoteId]) return;
    appData.notes[currentActiveNoteId].subtasks.splice(idx, 1);
    saveNotesData();
    renderNoteChecklist(appData.notes[currentActiveNoteId].subtasks);
}

function addResourceLink() {
    const titleInput = document.getElementById('link-title-input');
    const urlInput = document.getElementById('link-url-input');
    const url = urlInput ? urlInput.value.trim() : '';
    const title = titleInput ? titleInput.value.trim() : '';

    if (!url || !currentActiveNoteId) return;

    if (!appData.notes[currentActiveNoteId]) {
        appData.notes[currentActiveNoteId] = { text: '', subtasks: [], links: [] };
    }

    appData.notes[currentActiveNoteId].links.push({ title: title || url, url });
    titleInput.value = '';
    urlInput.value = '';
    saveNotesData();
    renderNoteLinks(appData.notes[currentActiveNoteId].links);
}

function removeResourceLink(idx) {
    if (!currentActiveNoteId || !appData.notes[currentActiveNoteId]) return;
    appData.notes[currentActiveNoteId].links.splice(idx, 1);
    saveNotesData();
    renderNoteLinks(appData.notes[currentActiveNoteId].links);
}

/* --- Temporizador Pomodoro --- */

function startPomodoroForTask(taskId) {
    let foundTask = null;
    DAYS.forEach(d => {
        const match = (appData.schedule[d] || []).find(t => t.id === taskId);
        if (match) foundTask = match;
    });

    if (foundTask) {
        document.getElementById('pomo-subject').innerText = foundTask.category.toUpperCase();
        document.getElementById('pomo-title').innerText = foundTask.title;
    }

    renderAmbientMixerGrid();
    document.getElementById('pomodoro-modal').classList.remove('hidden');
}

function closePomodoro() {
    clearInterval(pomodoroTimer);
    isPomodoroRunning = false;
    document.getElementById('pomo-start-btn').innerText = 'Iniciar';
    document.getElementById('pomodoro-modal').classList.add('hidden');
}

function togglePomodoroTimer() {
    const btn = document.getElementById('pomo-start-btn');
    if (isPomodoroRunning) {
        clearInterval(pomodoroTimer);
        isPomodoroRunning = false;
        if (btn) btn.innerText = 'Continuar';
    } else {
        isPomodoroRunning = true;
        if (btn) btn.innerText = 'Pausar';
        pomodoroTimer = setInterval(() => {
            if (pomodoroSecondsLeft > 0) {
                pomodoroSecondsLeft--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroTimer);
                isPomodoroRunning = false;
                playPomodoroChime();
                if (btn) btn.innerText = 'Iniciar';
                if (typeof confetti === 'function') {
                    confetti({ particleCount: 100, spread: 80 });
                }
            }
        }, 1000);
    }
}

function resetPomodoroTimer() {
    clearInterval(pomodoroTimer);
    isPomodoroRunning = false;
    pomodoroSecondsLeft = 25 * 60;
    updatePomodoroDisplay();
    const btn = document.getElementById('pomo-start-btn');
    if (btn) btn.innerText = 'Iniciar';
}

function updatePomodoroDisplay() {
    const mins = Math.floor(pomodoroSecondsLeft / 60);
    const secs = pomodoroSecondsLeft % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const display = document.getElementById('pomo-timer-display');
    if (display) display.innerText = str;
}

function renderAmbientMixerGrid() {
    const container = document.getElementById('ambient-mixer-grid');
    if (!container) return;
    container.innerHTML = '';

    const tracks = [
        { key: 'rain', label: '🌧️ Lluvia' },
        { key: 'waves', label: '🌊 Océano' },
        { key: 'forest', label: '🌲 Bosque' },
        { key: 'fire', label: '🔥 Fogata' },
        { key: 'lofi', label: '🎧 Lo-Fi Beats' }
    ];

    tracks.forEach(tr => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-gray-900/60 p-2 rounded-xl border border-gray-800';
        div.innerHTML = `
            <span class="text-gray-300 text-[11px] font-medium">${tr.label}</span>
            <button onclick="handleAmbientToggle('${tr.key}', this)" class="px-2 py-1 bg-gray-800 hover:bg-purple-600 text-gray-300 rounded-lg text-[10px] transition-all">
                Activar
            </button>
        `;
        container.appendChild(div);
    });
}

function handleAmbientToggle(key, btnElem) {
    const isPlaying = toggleAmbientSound(key);
    if (isPlaying) {
        btnElem.innerText = 'Sonando';
        btnElem.className = 'px-2 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold shadow-sm';
    } else {
        btnElem.innerText = 'Activar';
        btnElem.className = 'px-2 py-1 bg-gray-800 hover:bg-purple-600 text-gray-300 rounded-lg text-[10px] transition-all';
    }
}

/* --- Estadísticas y Gamificación --- */

function openStatsModal() {
    renderStatsChart();
    document.getElementById('stats-modal').classList.remove('hidden');
}

function closeStatsModal() {
    document.getElementById('stats-modal').classList.add('hidden');
}

function openGamificationModal() {
    const monthName = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    document.getElementById('current-month-name').innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const activeCount = appData.streak.activeDays.length;
    document.getElementById('streak-days-badge').innerText = `${activeCount} días`;

    const percent = Math.min(100, Math.round((activeCount / 20) * 100));
    document.getElementById('streak-progress-bar').style.width = `${percent}%`;
    document.getElementById('streak-percent-text').innerText = `${percent}%`;

    const trophyCard = document.getElementById('trophy-awarded-card');
    if (appData.streak.trophyEarned) {
        trophyCard.classList.remove('hidden');
        document.getElementById('trophy-quote-display').innerText = `"${appData.streak.quote || '¡Excelente disciplina!'}"`;
    } else {
        trophyCard.classList.add('hidden');
    }

    renderTrophiesShelf();
    document.getElementById('gamification-modal').classList.remove('hidden');
}

function closeGamificationModal() {
    document.getElementById('gamification-modal').classList.add('hidden');
}

function renderTrophiesShelf() {
    const container = document.getElementById('trophies-shelf');
    if (!container) return;
    container.innerHTML = '';

    const badges = [
        { name: 'Cero Procrastinación', icon: '⚡', unlocked: appData.streak.activeDays.length >= 5 },
        { name: 'Constancia Nebular', icon: '🔥', unlocked: appData.streak.activeDays.length >= 10 },
        { name: 'Leyenda del Mes', icon: '🏆', unlocked: appData.streak.trophyEarned }
    ];

    badges.forEach(b => {
        const card = document.createElement('div');
        card.className = `p-3 rounded-2xl border text-center transition-all ${
            b.unlocked 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                : 'bg-gray-900/40 border-gray-800 text-gray-600 grayscale'
        }`;
        card.innerHTML = `
            <div class="text-2xl mb-1">${b.icon}</div>
            <div class="text-[10px] font-bold">${b.name}</div>
            <div class="text-[9px] mt-0.5">${b.unlocked ? 'Desbloqueado' : 'Bloqueado'}</div>
        `;
        container.appendChild(card);
    });
}

/* --- Respaldo y Temas --- */

function openBackupModal() {
    document.getElementById('backup-modal').classList.remove('hidden');
}

function closeBackupModal() {
    document.getElementById('backup-modal').classList.add('hidden');
}

function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `nebula_time_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.schedule) {
                appData = imported;
                saveScheduleData();
                saveNotesData();
                saveStreakData();
                renderSchedule();
                closeBackupModal();
                showCustomDialog('¡Respaldo Restaurado!', 'Tus actividades y notas se han cargado exitosamente.');
            }
        } catch (err) {
            showCustomDialog('Error de Archivo', 'El archivo subido no es un respaldo válido de Nebula Time.');
        }
    };
    reader.readAsText(file);
}

function confirmResetWeek() {
    showCustomDialog('Reiniciar Marcas Semanales', '¿Deseas desmarcar todas las actividades como completadas?', () => {
        DAYS.forEach(d => {
            (appData.schedule[d] || []).forEach(t => t.completed = false);
        });
        saveScheduleData();
        renderSchedule();
        closeBackupModal();
    });
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }
}

function toggleNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                new Notification('Nebula Time', { body: '¡Notificaciones del sistema activadas correctamente!' });
            }
        });
    }
}

function triggerNebulaEffect() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }
}

/* --- Diálogo Personalizado (Sustituto de alert/confirm) --- */

function showCustomDialog(title, message, onConfirm = null) {
    const modal = document.getElementById('custom-dialog-modal');
    if (!modal) return;

    document.getElementById('dialog-title').innerText = title;
    document.getElementById('dialog-message').innerText = message;

    const okBtn = document.getElementById('dialog-ok-btn');
    const cancelBtn = document.getElementById('dialog-cancel-btn');

    if (onConfirm) {
        cancelBtn.classList.remove('hidden');
        okBtn.onclick = () => {
            modal.classList.add('hidden');
            onConfirm();
        };
        cancelBtn.onclick = () => modal.classList.add('hidden');
    } else {
        cancelBtn.classList.add('hidden');
        okBtn.onclick = () => modal.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}