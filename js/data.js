/* ==========================================================================
   Nebula Time — Data Management & Initial State
   ========================================================================== */

const STORAGE_KEY = 'nebula_time_tasks_v2';
const NOTES_KEY = 'nebula_time_notes_v2';
const STREAK_KEY = 'nebula_time_streak_v2';

// Días de la semana estructurados
const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Horario/Calendario inicial por defecto
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

// Frases y reconocimientos aleatorios al ganar el trofeo del mes
const TROPHY_QUOTES = [
    "¡Sos un GOAT de la productividad!",
    "¡Nivel Dios alcanzado este mes!",
    "¡Disciplina de acero, imparable!",
    "¡Constancia legendaria demostrada!",
    "¡Dominio total del tiempo cósmico!"
];

// Estado global de la aplicación
let appData = {
    schedule: loadScheduleData(),
    notes: loadNotesData(),
    streak: loadStreakData()
};

/* --- Carga y guardado de datos --- */

function loadScheduleData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialSchedule;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error("Error al cargar horario desde localStorage", e);
        return initialSchedule;
    }
}

function saveScheduleData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData.schedule));
}

function loadNotesData() {
    const saved = localStorage.getItem(NOTES_KEY);
    if (!saved) return {};
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error("Error al cargar notas desde localStorage", e);
        return {};
    }
}

function saveNotesData() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(appData.notes));
}

function loadStreakData() {
    const saved = localStorage.getItem(STREAK_KEY);
    const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    
    if (!saved) {
        return { activeDays: [], monthKey: currentMonthKey, trophyEarned: false, quote: "" };
    }
    
    try {
        const parsed = JSON.parse(saved);
        // Si cambió el mes, resetear días activos del mes actual
        if (parsed.monthKey !== currentMonthKey) {
            return { activeDays: [], monthKey: currentMonthKey, trophyEarned: false, quote: "" };
        }
        return parsed;
    } catch (e) {
        return { activeDays: [], monthKey: currentMonthKey, trophyEarned: false, quote: "" };
    }
}

function saveStreakData() {
    localStorage.setItem(STREAK_KEY, JSON.stringify(appData.streak));
}

/* --- Métodos auxiliares de actualización de estado --- */

function recordDailyActivity() {
    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (!appData.streak.activeDays.includes(todayStr)) {
        appData.streak.activeDays.push(todayStr);
        
        // Si alcanza los 20 días activos en el mes, desbloquea trofeo
        if (appData.streak.activeDays.length >= 20 && !appData.streak.trophyEarned) {
            appData.streak.trophyEarned = true;
            const randomQuote = TROPHY_QUOTES[Math.floor(Math.random() * TROPHY_QUOTES.length)];
            appData.streak.quote = randomQuote;
        }
        
        saveStreakData();
    }
}