# 🌌 Nebula Time

# Nebula Time

Nebula Time es una aplicación web para la gestión del tiempo y la planificación de actividades semanales. El proyecto integra el seguimiento de tareas, temporizadores de enfoque Pomodoro con audio nativo, notas asociadas y estadísticas visuales de rendimiento dentro de una interfaz orientada a la productividad.

---

## Funcionalidades principales

- Planificación semanal: Organización de actividades en una grilla de siete días con detección en tiempo real de la tarea en curso.
- Temporizador Pomodoro: Módulo de enfoque con temporizador, notificaciones de audio sintetizadas mediante la Web Audio API y reproductor de sonidos ambientales.
- Gestión de recursos y subtareas: Posibilidad de adjuntar checklists y enlaces web a cada actividad programada.
- Visualización de datos: Gráficos de distribución de tiempo por categoría utilizando la librería Chart.js.
- Sistema de constancia: Registro de días activos y seguimiento de rachas de productividad.
- Portabilidad de datos: Persistencia en el navegador a través de localStorage con opciones para exportar e importar respaldos en formato JSON.

---

## Tecnologías utilizadas

- HTML5 y CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Chart.js
- FontAwesome 6

---

## Instrucciones de uso

1. Clonar este repositorio:
   git clone https://github.com/tu-usuario/nebula-time.git

2. Abrir el archivo index.html en cualquier navegador web moderno. No se requiere la instalación de dependencias ni un entorno de ejecución como Node.js.

---

## Estructura del repositorio

```
nebulatime/
├── assets/
│   ├── audio/
│   │   ├── ambient/              # Categorías de sonido para el mezclador de enfoque
│   │   ├── ambient_music/
│   │   ├── ambient_sound/
│   │   ├── binaural/
│   │   ├── coffee/
│   │   ├── fire/
│   │   ├── forest/
│   │   ├── guitar/
│   │   ├── lub_dub/
│   │   ├── rain/
│   │   ├── retro/
│   │   ├── sci_fi/
│   │   ├── sea/
│   │   ├── space/
│   │   ├── train/
│   │   ├── wind/
│   │   └── intro-sound.mp3       # Audio de entrada para la intro
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── video/
│       └── intro.mp4             # Video de fondo para el Splash Screen
├── css/
│   └── styles.css                # Estilos personalizados, efectos neón y orbes
├── js/
│   ├── app.js                    # Controlador principal y eventos
│   ├── audio.js                  # Motor Web Audio API y Mezclador Ambient
│   ├── data.js                   # Persistencia con LocalStorage y appData
│   └── ui.js                     # Renderizado del Grid, Modales, Tablas y Gráficos
├── index.html                    # Interfaz principal de la PWA
└── manifest.json                 # Configuración Web App
