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

```text
nebulatime/
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── assets/
│   └── audio/
├── css/
│   └── styles.css
└── js/
    ├── data.js
    ├── audio.js
    ├── ui.js
    └── app.js
```
