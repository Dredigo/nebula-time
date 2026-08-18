/* ==========================================================================
   Nebula Time — Main Controller (Con Validación de Día y Modales Blindados)
   ========================================================================== */

let pomodoroTimer = null;
let pomodoroSecondsLeft = 25 * 60;
let isPomodoroRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderSchedule();
    updateLiveBanner();
    setInterval(updateLiveBanner, 30000);
});

/* --- Reloj e Indicadores --- */

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

function updateLiveBanner() {
    const banner = document.getElementById('live-banner');
    const bannerText = document.getElementById('live-banner-text');
    if (!banner || !bannerText) return;

    const todayKey = typeof getTodayDayName === 'function' ? getTodayDayName() : 'lunes';
    const todayTasks = (appData && appData.schedule) ? (appData.schedule[todayKey] || []) : [];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let currentTask = null;

    todayTasks.forEach(task => {
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

/* --- Gestión de Tareas con Bloqueo y Blindaje de Modales --- */

function toggleTaskComplete(dayKey, taskId) {
    const todayKey = getTodayDayName();
    // Bloqueo de seguridad: Evita la ejecución si el día no coincide con la fecha de hoy
    if (dayKey !== todayKey) {
        showCustomDialog('Día Bloqueado', 'Sólo podés tildar o destildar las actividades del día de hoy.');
        return;
    }

    const list = appData.schedule[dayKey] || [];
    const task = list.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed && typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    saveScheduleData();
    evaluateDayCompletion(dayKey);
    renderSchedule();
    updateLiveBanner();
}

function deleteTask(dayKey, taskId) {
    showCustomDialog('¿Eliminar actividad?', 'Esta acción quitará el elemento del horario.', () => {
        appData.schedule[dayKey] = (appData.schedule[dayKey] || []).filter(t => t.id !== taskId);
        delete appData.notes[taskId];

        saveScheduleData();
        saveNotesData();
        evaluateDayCompletion(dayKey);

        renderSchedule();
        updateLiveBanner();
    });
}

function openTaskModal() {
    const today = typeof getTodayDayName === 'function' ? getTodayDayName() : 'lunes';
    openTaskModalForDay(today);
}

function openTaskModalForDay(dayKey) {
    currentEditingTaskId = null;
    
    const modal = document.getElementById('task-modal');
    const title = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');
    const formDay = document.getElementById('form-day');

    if (!modal) {
        console.error("No se encontró el elemento #task-modal en el DOM.");
        return;
    }

    if (title) title.innerText = 'Nueva Actividad';
    if (form) form.reset();
    if (formDay) formDay.value = dayKey || 'lunes';

    modal.classList.remove('hidden');
}

function editTaskModal(dayKey, taskId) {
    const task = (appData.schedule[dayKey] || []).find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskId = taskId;

    const modal = document.getElementById('task-modal');
    const title = document.getElementById('task-modal-title');
    const formDay = document.getElementById('form-day');
    const formTitle = document.getElementById('form-title');
    const formTime = document.getElementById('form-time');
    const formIcon = document.getElementById('form-icon-class');
    const formCat = document.getElementById('form-category');
    const formColor = document.getElementById('form-color');

    if (!modal) return;

    if (title) title.innerText = 'Editar Actividad';
    if (formDay) formDay.value = dayKey;
    if (formTitle) formTitle.value = task.title || '';
    if (formTime) formTime.value = task.time || '';
    if (formIcon) formIcon.value = task.icon || 'fa-solid fa-database';
    if (formCat) formCat.value = task.category || 'bd';
    if (formColor) formColor.value = task.color || 'cyan';

    modal.classList.remove('hidden');
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('hidden');
}

function saveTask(event) {
    if (event) event.preventDefault();

    const formDay = document.getElementById('form-day');
    const formTitle = document.getElementById('form-title');
    const formTime = document.getElementById('form-time');
    const formIcon = document.getElementById('form-icon-class');
    const formCat = document.getElementById('form-category');
    const formColor = document.getElementById('form-color');

    const day = formDay ? formDay.value : 'lunes';
    const title = formTitle ? formTitle.value.trim() : '';
    const time = formTime ? formTime.value.trim() : '';
    const icon = formIcon ? formIcon.value : 'fa-solid fa-clock';
    const category = formCat ? formCat.value : 'bd';
    const color = formColor ? formColor.value : 'cyan';

    if (!title) return;

    if (currentEditingTaskId) {
        DAYS.forEach(d => {
            appData.schedule[d] = (appData.schedule[d] || []).filter(t => t.id !== currentEditingTaskId);
        });
        if (!appData.schedule[day]) appData.schedule[day] = [];
        appData.schedule[day].push({
            id: currentEditingTaskId,
            title, time, icon, category, color, completed: false
        });
    } else {
        const newId = 'task_' + Date.now();
        if (!appData.schedule[day]) appData.schedule[day] = [];
        appData.schedule[day].push({
            id: newId,
            title, time, icon, category, color, completed: false
        });
    }

    saveScheduleData();
    evaluateDayCompletion(day);
    closeTaskModal();
    renderSchedule();
    updateLiveBanner();
}

/* --- Modales de Notas y Subtareas --- */

function saveNotesModal() {
    if (!currentActiveNoteId) return;
    if (!appData.notes[currentActiveNoteId]) {
        appData.notes[currentActiveNoteId] = { text: '', subtasks: [], links: [] };
    }

    const noteArea = document.getElementById('note-text-area');
    if (noteArea) appData.notes[currentActiveNoteId].text = noteArea.value;

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
    if (titleInput) titleInput.value = '';
    if (urlInput) urlInput.value = '';
    saveNotesData();
    renderNoteLinks(appData.notes[currentActiveNoteId].links);
}

function removeResourceLink(idx) {
    if (!currentActiveNoteId || !appData.notes[currentActiveNoteId]) return;
    appData.notes[currentActiveNoteId].links.splice(idx, 1);
    saveNotesData();
    renderNoteLinks(appData.notes[currentActiveNoteId].links);
}

/* --- Pomodoro --- */

function startPomodoroForTask(taskId) {
    let foundTask = null;
    DAYS.forEach(d => {
        const match = (appData.schedule[d] || []).find(t => t.id === taskId);
        if (match) foundTask = match;
    });

    const pomoSubj = document.getElementById('pomo-subject');
    const pomoTitle = document.getElementById('pomo-title');

    if (foundTask) {
        if (pomoSubj) pomoSubj.innerText = (foundTask.category || '').toUpperCase();
        if (pomoTitle) pomoTitle.innerText = foundTask.title;
    }

    renderAmbientMixer();
    const modal = document.getElementById('pomodoro-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePomodoro() {
    clearInterval(pomodoroTimer);
    isPomodoroRunning = false;
    const btn = document.getElementById('pomo-start-btn');
    if (btn) btn.innerText = 'Iniciar';
    const modal = document.getElementById('pomodoro-modal');
    if (modal) modal.classList.add('hidden');
}

function togglePomodoroTimer() {
    if (typeof getAudioContext === 'function') getAudioContext();

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
                if (typeof playPomodoroChime === 'function') playPomodoroChime();
                if (btn) btn.innerText = 'Iniciar';
                if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 80 });
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

/* --- Gamificación y Estadísticas --- */

function openStatsModal() {
    renderStatsChart();
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.add('hidden');
}

function openGamificationModal() {
    const monthName = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const monthElem = document.getElementById('current-month-name');
    if (monthElem) monthElem.innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const activeCount = appData.streak && appData.streak.activeDays ? appData.streak.activeDays.length : 0;
    const badge = document.getElementById('streak-days-badge');
    if (badge) badge.innerText = `${activeCount} días`;

    const percent = Math.min(100, Math.round((activeCount / 20) * 100));
    const pBar = document.getElementById('streak-progress-bar');
    const pText = document.getElementById('streak-percent-text');
    if (pBar) pBar.style.width = `${percent}%`;
    if (pText) pText.innerText = `${percent}%`;

    const trophyCard = document.getElementById('trophy-awarded-card');
    if (appData.streak && appData.streak.trophyEarned) {
        if (trophyCard) trophyCard.classList.remove('hidden');
        const quoteElem = document.getElementById('trophy-quote-display');
        if (quoteElem) quoteElem.innerText = `"${appData.streak.quote || '¡Excelente disciplina!'}"`;
    } else {
        if (trophyCard) trophyCard.classList.add('hidden');
    }

    renderTrophiesShelf();
    const modal = document.getElementById('gamification-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeGamificationModal() {
    const modal = document.getElementById('gamification-modal');
    if (modal) modal.classList.add('hidden');
}

function renderTrophiesShelf() {
    const container = document.getElementById('trophies-shelf');
    if (!container) return;
    container.innerHTML = '';

    const activeCount = appData.streak && appData.streak.activeDays ? appData.streak.activeDays.length : 0;

    const badges = [
        { name: 'Cero Procrastinación', icon: '⚡', unlocked: activeCount >= 5 },
        { name: 'Constancia Nebular', icon: '🔥', unlocked: activeCount >= 10 },
        { name: 'Leyenda del Mes', icon: '🏆', unlocked: !!(appData.streak && appData.streak.trophyEarned) }
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

/* --- Respaldo y Reinicio Semanal --- */

function openBackupModal() {
    const modal = document.getElementById('backup-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeBackupModal() {
    const modal = document.getElementById('backup-modal');
    if (modal) modal.classList.add('hidden');
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
    showCustomDialog('Reiniciar Marcas Semanales', '¿Deseas desmarcar todas las actividades para la nueva semana? La racha ganada anteriormente se mantendrá intacta.', () => {
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
        icon.className = document.body.classList.contains('light-theme') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

function toggleNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                new Notification('Nebula Time', { body: 'Notificaciones activadas correctamente.' });
            }
        });
    }
}

function triggerNebulaEffect() {
    if (typeof getAudioContext === 'function') getAudioContext();
    if (typeof playPomodoroChime === 'function') playPomodoroChime();
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
    }
}

function showCustomDialog(title, message, onConfirm = null) {
    const modal = document.getElementById('custom-dialog-modal');
    if (!modal) return;

    const tElem = document.getElementById('dialog-title');
    const mElem = document.getElementById('dialog-message');
    if (tElem) tElem.innerText = title;
    if (mElem) mElem.innerText = message;

    const okBtn = document.getElementById('dialog-ok-btn');
    const cancelBtn = document.getElementById('dialog-cancel-btn');

    if (onConfirm) {
        if (cancelBtn) cancelBtn.classList.remove('hidden');
        if (okBtn) {
            okBtn.onclick = () => {
                modal.classList.add('hidden');
                onConfirm();
            };
        }
        if (cancelBtn) cancelBtn.onclick = () => modal.classList.add('hidden');
    } else {
        if (cancelBtn) cancelBtn.classList.add('hidden');
        if (okBtn) okBtn.onclick = () => modal.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}