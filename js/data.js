/* ==========================================================================
   Nebula Time — Data Management & Initial State
   ========================================================================== */

const DATA_VERSION = 'v2.3';

const STORAGE_KEY = `nebula_time_tasks_${DATA_VERSION}`;
const NOTES_KEY = `nebula_time_notes_${DATA_VERSION}`;
const STREAK_KEY = `nebula_time_streak_${DATA_VERSION}`;

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const initialSchedule = {
    lunes: [
        { id: 'l1', time: '09:00 – 11:00', title: 'Base de Datos (Teoría)', category: 'bd', icon: 'fa-solid fa-database', color: 'cyan', completed: false },
        { id: 'l2', time: '11:15 – 13:00', title: 'Linux & Terminal', category: 'linux', icon: 'fa-brands fa-linux', color: 'amber', completed: false },
        { id: 'l3', time: '15:00 – 17:00', title: 'Práctica de Excel Pro', category: 'excel', icon: 'fa-solid fa-table', color: 'emerald', completed: false }
    ],
    martes: [
        { id: 'm1', time: '09:00 – 11:30', title: 'Laboratorio de BD', category: 'lab', icon: 'fa-solid fa-flask', color: 'purple', completed: false },
        { id: 'm2', time: '12:00 – 13:30', title: 'Herramientas Digitales', category: 'herramientas', icon: 'fa-solid fa-laptop-code', color: 'indigo', completed: false },
        { id: 'm3', time: '18:00 – 19:30', title: 'Entrenamiento & Cardio', category: 'ejercicio', icon: 'fa-solid fa-dumbbell', color: 'rose', completed: false }
    ],
    miercoles: [
        { id: 'mi1', time: '09:00 – 11:00', title: 'Administración de Sistemas Linux', category: 'linux', icon: 'fa-brands fa-linux', color: 'amber', completed: false },
        { id: 'mi2', time: '11:15 – 13:00', title: 'Consultas SQL Avanzadas', category: 'bd', icon: 'fa-solid fa-database', color: 'cyan', completed: false },
        { id: 'mi3', time: '16:00 – 18:00', title: 'Automatización y Macros Excel', category: 'excel', icon: 'fa-solid fa-table', color: 'emerald', completed: false }
    ],
    jueves: [
        { id: 'j1', time: '09:00 – 11:30', title: 'Taller de BD y Normalización', category: 'bd', icon: 'fa-solid fa-database', color: 'cyan', completed: false },
        { id: 'j2', time: '14:00 – 16:00', title: 'Herramientas y Software', category: 'herramientas', icon: 'fa-solid fa-laptop-code', color: 'indigo', completed: false },
        { id: 'j3', time: '18:00 – 19:30', title: 'Rutina Físico / Descanso', category: 'ejercicio', icon: 'fa-solid fa-dumbbell', color: 'rose', completed: false }
    ],
    viernes: [
        { id: 'v1', time: '09:00 – 11:00', title: 'Repaso General y Tests', category: 'lab', icon: 'fa-solid fa-flask', color: 'purple', completed: false },
        { id: 'v2', time: '11:15 – 13:00', title: 'Proyectos Personales / Scripts', category: 'herramientas', icon: 'fa-solid fa-laptop-code', color: 'indigo', completed: false },
        { id: 'v3', time: '16:00 – 17:30', title: 'Cierre de Semana y Reporte', category: 'descanso', icon: 'fa-solid fa-heart', color: 'pink', completed: false }
    ],
    sabado: [
        { id: 's1', time: '10:00 – 12:00', title: 'Lectura / Desarrollo Libre', category: 'herramientas', icon: 'fa-solid fa-book', color: 'indigo', completed: false },
        { id: 's2', time: '16:00 – 18:00', title: 'Tiempo de Descanso / Ocio', category: 'descanso', icon: 'fa-solid fa-heart', color: 'pink', completed: false }
    ],
    domingo: [
        { id: 'd1', time: '11:00 – 13:00', title: 'Planificación de la Semana', category: 'descanso', icon: 'fa-solid fa-heart', color: 'pink', completed: false }
    ]
};

const TROPHY_QUOTES = [
    "¡Sos un GOAT de la productividad!",
    "¡Nivel Dios alcanzado este mes!",
    "¡Disciplina de acero, imparable!",
    "¡Constancia legendaria demostrada!",
    "¡Dominio total del tiempo cósmico!"
];

/* --- Manejo de Fechas Locales y Ayudantes de Sistema --- */

function getTodayDayName() {
    const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const todayIndex = new Date().getDay();
    return daysMap[todayIndex];
}

function getLocalFormattedDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getLocalFormattedMonth(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function getDateForDayOfWeek(dayName) {
    const dayIndex = DAYS.indexOf(dayName.toLowerCase());
    if (dayIndex === -1) return getLocalFormattedDate();

    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
    const diff = dayIndex - currentDay;

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    return getLocalFormattedDate(targetDate);
}

/* --- Persistencia de Datos --- */

function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

function loadScheduleData() {
    if (!isStorageAvailable()) return structuredClone(initialSchedule);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialSchedule);
    try {
        const parsed = JSON.parse(saved);
        return DAYS.every(day => Array.isArray(parsed[day])) ? parsed : structuredClone(initialSchedule);
    } catch (e) {
        return structuredClone(initialSchedule);
    }
}

function saveScheduleData() {
    if (!isStorageAvailable()) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData.schedule));
    } catch (e) {
        console.error("Error guardando agenda:", e);
    }
}

function loadNotesData() {
    if (!isStorageAvailable()) return {};
    const saved = localStorage.getItem(NOTES_KEY);
    if (!saved) return {};
    try {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
        return {};
    }
}

function saveNotesData() {
    if (!isStorageAvailable()) return;
    try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(appData.notes));
    } catch (e) {
        console.error("Error guardando notas:", e);
    }
}

function loadStreakData() {
    const currentMonthKey = getLocalFormattedMonth();
    const defaultStreak = { activeDays: [], monthKey: currentMonthKey, trophyEarned: false, quote: "" };

    if (!isStorageAvailable()) return defaultStreak;

    const saved = localStorage.getItem(STREAK_KEY);
    if (!saved) return defaultStreak;

    try {
        const parsed = JSON.parse(saved);
        if (!parsed || !Array.isArray(parsed.activeDays)) return defaultStreak;
        
        // Filtramos días pertenecientes únicamente al mes activo
        const validDays = parsed.monthKey === currentMonthKey 
            ? parsed.activeDays 
            : parsed.activeDays.filter(d => d.startsWith(currentMonthKey));

        return {
            activeDays: validDays,
            monthKey: currentMonthKey,
            trophyEarned: validDays.length >= 20,
            quote: parsed.quote || ""
        };
    } catch (e) {
        return defaultStreak;
    }
}

function saveStreakData() {
    if (!isStorageAvailable()) return;
    try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(appData.streak));
    } catch (e) {
        console.error("Error guardando racha:", e);
    }
}

/* --- Estado Global --- */

let appData = {
    schedule: loadScheduleData(),
    notes: loadNotesData(),
    streak: loadStreakData()
};

/* --- Algoritmo Dinámico de Auditoría de Rachas --- */

function evaluateDayCompletion(dayName) {
    const tasks = appData.schedule[dayName] || [];
    if (tasks.length === 0) return;

    const is100PercentCompleted = tasks.every(task => task.completed === true);
    const dateStr = getDateForDayOfWeek(dayName);

    if (!Array.isArray(appData.streak.activeDays)) {
        appData.streak.activeDays = [];
    }

    const index = appData.streak.activeDays.indexOf(dateStr);

    if (is100PercentCompleted) {
        if (index === -1) {
            appData.streak.activeDays.push(dateStr);
        }
    } else {
        if (index !== -1) {
            appData.streak.activeDays.splice(index, 1);
        }
    }

    if (appData.streak.activeDays.length >= 20) {
        appData.streak.trophyEarned = true;
        if (!appData.streak.quote) {
            appData.streak.quote = TROPHY_QUOTES[Math.floor(Math.random() * TROPHY_QUOTES.length)];
        }
    } else {
        appData.streak.trophyEarned = false;
    }

    saveStreakData();
}

function syncWeeklyStreak() {
    DAYS.forEach(day => evaluateDayCompletion(day));
}

function resetAppData() {
    appData.schedule = structuredClone(initialSchedule);
    appData.notes = {};
    appData.streak = { activeDays: [], monthKey: getLocalFormattedMonth(), trophyEarned: false, quote: "" };
    saveScheduleData();
    saveNotesData();
    saveStreakData();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STORAGE_KEY, NOTES_KEY, STREAK_KEY, DAYS, initialSchedule, TROPHY_QUOTES,
        appData, getTodayDayName, loadScheduleData, saveScheduleData, loadNotesData, saveNotesData,
        loadStreakData, saveStreakData, evaluateDayCompletion, syncWeeklyStreak, resetAppData
    };
}