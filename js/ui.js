/* ==========================================================================
   Nebula Time — UI Controller & DOM Manipulation (Con Bloqueo de Días)
   ========================================================================== */

let currentFilter = 'all';
let searchQuery = '';
let currentEditingTaskId = null;
let currentActiveNoteId = null;
let statsChartInstance = null;

const colorClasses = {
    cyan: 'border-neon-cyan text-cyan-400 bg-cyan-950/20',
    amber: 'border-neon-amber text-amber-400 bg-amber-950/20',
    emerald: 'border-neon-emerald text-emerald-400 bg-emerald-950/20',
    indigo: 'border-neon-indigo text-indigo-400 bg-indigo-950/20',
    purple: 'border-neon-purple text-purple-400 bg-purple-950/20',
    rose: 'border-neon-rose text-rose-400 bg-rose-950/20',
    pink: 'border-neon-pink text-pink-400 bg-pink-950/20'
};

/* --- Renderizado Principal --- */

function renderSchedule() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const daysMap = {
        lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
        jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
    };

    const currentDayName = getTodayDayName();

    DAYS.forEach(dayKey => {
        const tasks = (appData && appData.schedule) ? (appData.schedule[dayKey] || []) : [];
        const isToday = dayKey === currentDayName;

        const filteredTasks = tasks.filter(task => {
            const matchesCategory = currentFilter === 'all' || task.category === currentFilter;
            const matchesSearch = searchQuery === '' || 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                task.time.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        const dayColumn = document.createElement('div');
        dayColumn.className = `glass-panel rounded-2xl p-3.5 flex flex-col gap-3 min-h-[300px] transition-all ${
            isToday 
                ? 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/10' 
                : 'bg-gray-950/40 border-gray-800/40 opacity-75'
        }`;

        const dayHeader = document.createElement('div');
        dayHeader.className = 'flex justify-between items-center pb-2 border-b border-gray-800/80';
        dayHeader.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xs font-bold font-display uppercase tracking-wider ${isToday ? 'text-cyan-400' : 'text-gray-400'}">${daysMap[dayKey]}</span>
                ${isToday ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">HOY</span>' : '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700/50 font-medium"><i class="fa-solid fa-lock text-[8px] mr-1"></i>Bloqueado</span>'}
            </div>
            <button onclick="openTaskModalForDay('${dayKey}')" class="text-gray-400 hover:text-purple-400 text-xs p-1 rounded-lg hover:bg-gray-800/60 transition-all" title="Añadir actividad al ${daysMap[dayKey]}">
                <i class="fa-solid fa-plus"></i>
            </button>
        `;

        const taskListContainer = document.createElement('div');
        taskListContainer.className = 'space-y-2.5 flex-grow';

        if (filteredTasks.length === 0) {
            taskListContainer.innerHTML = `
                <div class="h-24 flex flex-col items-center justify-center text-gray-600 text-[11px] font-medium border border-dashed border-gray-800/80 rounded-xl">
                    <span>Sin actividades</span>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const card = document.createElement('div');
                const baseColorStyle = colorClasses[task.color] || colorClasses.purple;
                
                const lockedStyle = !isToday ? 'filter grayscale contrast-75 opacity-60 cursor-not-allowed bg-slate-900/40 border-slate-700/30 text-slate-400' : baseColorStyle;

                card.className = `task-card p-3 rounded-xl relative group flex flex-col justify-between transition-all ${lockedStyle} ${task.completed ? 'completed' : ''}`;
                card.dataset.taskId = task.id;
                
                card.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start gap-1 mb-1">
                            <span class="text-[10px] font-mono font-bold ${isToday ? 'text-gray-400' : 'text-slate-400'} flex items-center gap-1">
                                <i class="${task.icon || 'fa-solid fa-clock'} text-xs"></i> ${task.time}
                            </span>
                            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button onclick="event.stopPropagation(); openNotesModal('${task.id}')" class="text-gray-400 hover:text-cyan-300 text-xs p-1" title="Notas y checklist">
                                    <i class="fa-solid fa-note-sticky"></i>
                                </button>
                                <button onclick="event.stopPropagation(); startPomodoroForTask('${task.id}')" class="text-gray-400 hover:text-purple-300 text-xs p-1" title="Modo Enfoque Pomodoro">
                                    <i class="fa-solid fa-stopwatch"></i>
                                </button>
                                ${isToday ? `
                                    <button onclick="event.stopPropagation(); toggleTaskComplete('${dayKey}', '${task.id}')" class="text-xs p-1 ${task.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}" title="${task.completed ? 'Desmarcar' : 'Completar'}">
                                        <i class="fa-solid ${task.completed ? 'fa-circle-check' : 'fa-circle'}"></i>
                                    </button>
                                ` : `
                                    <span class="text-xs p-1 text-slate-500 cursor-not-allowed" title="Sólo podés marcar actividades en el día correspondiente">
                                        <i class="fa-solid ${task.completed ? 'fa-circle-check' : 'fa-lock'}"></i>
                                    </span>
                                `}
                            </div>
                        </div>
                        <h4 class="text-xs font-bold ${isToday ? 'text-white' : 'text-slate-300'} task-title leading-snug mb-1">${task.title}</h4>
                    </div>

                    <div class="flex justify-between items-center mt-2 pt-1.5 border-t border-gray-800/40 text-[10px]">
                        <span class="uppercase text-[9px] font-bold tracking-wider ${isToday ? 'text-gray-400' : 'text-slate-400'}">${task.category}</span>
                        <div class="flex gap-1.5">
                            <button onclick="event.stopPropagation(); editTaskModal('${dayKey}', '${task.id}')" class="text-gray-500 hover:text-amber-400"><i class="fa-solid fa-pencil"></i></button>
                            <button onclick="event.stopPropagation(); deleteTask('${dayKey}', '${task.id}')" class="text-gray-500 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;

                taskListContainer.appendChild(card);
            });
        }

        dayColumn.appendChild(dayHeader);
        dayColumn.appendChild(taskListContainer);
        grid.appendChild(dayColumn);
    });

    updateProgressHeader();
}

/* --- Mezclador de Sonido --- */

function renderAmbientMixer() {
    const container = document.getElementById('ambient-mixer-container') || document.getElementById('ambient-mixer-grid');
    if (!container || typeof audioCatalog === 'undefined') return;

    container.innerHTML = '';

    Object.keys(audioCatalog).forEach(categoryKey => {
        const tracks = audioCatalog[categoryKey];
        if (!tracks || tracks.length === 0) return;

        const card = document.createElement('div');
        card.className = 'glass-panel p-3.5 rounded-xl border border-gray-800/80 flex flex-col gap-2.5 hover:border-purple-500/40 transition-all';

        const formattedTitle = categoryKey.replace(/_/g, ' ');

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-200 capitalize truncate font-display">${formattedTitle}</span>
                <button id="btn-${categoryKey}" onclick="handleToggleCategory('${categoryKey}')" class="w-7 h-7 rounded-lg bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white flex items-center justify-center text-xs transition-all">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>

            ${tracks.length > 1 ? `
                <select id="select-${categoryKey}" onchange="handleTrackChange('${categoryKey}')" class="bg-gray-900/90 text-[11px] text-gray-300 rounded-lg p-1 border border-gray-800 focus:ring-1 focus:ring-purple-500 focus:outline-none w-full truncate">
                    ${tracks.map((t, index) => `<option value="${index}">${t.name}</option>`).join('')}
                </select>
            ` : `<div class="text-[10px] text-gray-500 font-mono truncate">${tracks[0].name}</div>`}

            <div class="flex items-center gap-2 mt-1">
                <i class="fa-solid fa-volume-low text-[10px] text-gray-500"></i>
                <input type="range" min="0" max="1" step="0.05" value="0.5" 
                       oninput="setAmbientVolume('${categoryKey}', this.value)" 
                       class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500">
            </div>
        `;

        container.appendChild(card);
    });
}

function handleToggleCategory(categoryKey) {
    const select = document.getElementById(`select-${categoryKey}`);
    const trackIndex = select ? parseInt(select.value) : 0;
    const btn = document.getElementById(`btn-${categoryKey}`);

    if (typeof toggleAmbientSound !== 'function') return;
    const isPlaying = toggleAmbientSound(categoryKey, trackIndex);

    if (btn) {
        if (isPlaying) {
            btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            btn.classList.add('bg-purple-600', 'text-white');
            btn.classList.remove('bg-gray-800', 'text-gray-300');
        } else {
            btn.innerHTML = '<i class="fa-solid fa-play"></i>';
            btn.classList.remove('bg-purple-600', 'text-white');
            btn.classList.add('bg-gray-800', 'text-gray-300');
        }
    }
}

function handleTrackChange(categoryKey) {
    const select = document.getElementById(`select-${categoryKey}`);
    if (!select) return;

    const trackIndex = parseInt(select.value);

    if (typeof activeAudioInstances !== 'undefined' && activeAudioInstances[categoryKey] && !activeAudioInstances[categoryKey].paused) {
        if (typeof toggleAmbientSound === 'function') toggleAmbientSound(categoryKey, trackIndex);
    }
}

/* --- Métricas de Cabecera --- */

function updateProgressHeader() {
    let totalTasks = 0;
    let completedTasks = 0;

    if (typeof DAYS !== 'undefined' && appData && appData.schedule) {
        DAYS.forEach(day => {
            const list = appData.schedule[day] || [];
            totalTasks += list.length;
            completedTasks += list.filter(t => t.completed).length;
        });
    }

    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const completedCount = document.getElementById('completed-count');
    const totalCount = document.getElementById('total-count');

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.innerText = `${percent}%`;
    if (completedCount) completedCount.innerText = `${completedTasks} completadas`;
    if (totalCount) totalCount.innerText = `${totalTasks} en total`;

    const streakDisplay = document.getElementById('streak-count-display');
    const mobileStreak = document.getElementById('mobile-streak-count');
    const activeDaysCount = (appData && appData.streak && appData.streak.activeDays) ? appData.streak.activeDays.length : 0;

    if (streakDisplay) streakDisplay.innerText = activeDaysCount;
    if (mobileStreak) mobileStreak.innerText = activeDaysCount;

    if (appData && appData.streak && appData.streak.trophyEarned) {
        const trophyInd = document.getElementById('trophy-indicator');
        if (trophyInd) trophyInd.classList.remove('hidden');
    }
}

function getTodayDayName() {
    const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const idx = new Date().getDay();
    return days[idx];
}

/* --- Filtros y Buscador --- */

function filterCategory(cat) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === cat) {
            btn.classList.add('bg-purple-600', 'text-white');
            btn.classList.remove('bg-gray-800/90');
        } else {
            btn.classList.remove('bg-purple-600', 'text-white');
            btn.classList.add('bg-gray-800/90');
        }
    });
    renderSchedule();
}

function handleSearch(val) {
    searchQuery = val;
    renderSchedule();
}

/* --- Modales de Notas --- */

function openNotesModal(taskId) {
    currentActiveNoteId = taskId;
    const modal = document.getElementById('notes-modal');
    if (!modal) return;

    let foundTask = null;
    if (typeof DAYS !== 'undefined' && appData && appData.schedule) {
        DAYS.forEach(d => {
            const match = (appData.schedule[d] || []).find(t => t.id === taskId);
            if (match) foundTask = match;
        });
    }

    if (!foundTask) return;

    const modalTitle = document.getElementById('note-modal-title');
    if (modalTitle) modalTitle.innerText = foundTask.title;
    
    const noteData = (appData && appData.notes && appData.notes[taskId]) ? appData.notes[taskId] : { text: '', subtasks: [], links: [] };
    const textArea = document.getElementById('note-text-area');
    if (textArea) textArea.value = noteData.text || '';

    renderNoteChecklist(noteData.subtasks || []);
    renderNoteLinks(noteData.links || []);

    modal.classList.remove('hidden');
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal');
    if (modal) modal.classList.add('hidden');
}

function renderNoteChecklist(subtasks) {
    const container = document.getElementById('note-checklist-container');
    if (!container) return;
    container.innerHTML = '';

    subtasks.forEach((st, idx) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-xs';
        div.innerHTML = `
            <label class="flex items-center gap-2 text-gray-200 cursor-pointer">
                <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubTaskCheck(${idx})" class="rounded text-cyan-500 focus:ring-0">
                <span class="${st.completed ? 'line-through text-gray-500' : ''}">${st.title}</span>
            </label>
            <button onclick="removeSubTask(${idx})" class="text-gray-500 hover:text-rose-400"><i class="fa-solid fa-xmark"></i></button>
        `;
        container.appendChild(div);
    });
}

function renderNoteLinks(links) {
    const container = document.getElementById('note-links-container');
    if (!container) return;
    container.innerHTML = '';

    links.forEach((lk, idx) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-xs';
        div.innerHTML = `
            <a href="${lk.url}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1.5 font-medium truncate max-w-[80%]">
                <i class="fa-solid fa-link text-[10px]"></i> ${lk.title || lk.url}
            </a>
            <button onclick="removeResourceLink(${idx})" class="text-gray-500 hover:text-rose-400"><i class="fa-solid fa-xmark"></i></button>
        `;
        container.appendChild(div);
    });
}

/* --- Gráfico de Estadísticas --- */

function renderStatsChart() {
    const ctx = document.getElementById('stats-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    const categories = ['bd', 'linux', 'excel', 'herramientas', 'lab', 'ejercicio', 'descanso'];
    const categoryLabels = ['Base de Datos', 'Linux', 'Excel', 'Herramientas', 'Laboratorio', 'Ejercicio', 'Descanso'];
    const categoryCounts = categories.map(cat => {
        let count = 0;
        if (typeof DAYS !== 'undefined' && appData && appData.schedule) {
            DAYS.forEach(d => {
                (appData.schedule[d] || []).forEach(t => {
                    if (t.category === cat) count++;
                });
            });
        }
        return count;
    });

    if (statsChartInstance) {
        statsChartInstance.destroy();
    }

    statsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryCounts,
                backgroundColor: ['#06b6d4', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#f43f5e', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}