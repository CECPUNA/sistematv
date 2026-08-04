# Sistema TV – Ciencias Políticas UNA

Pantalla institucional para TV Smart en la entrada de la facultad.

## Funcionalidades
- Reloj en tiempo real
- Clases en curso y próximas (todos los semestres activos)
- Horario de exámenes de todos los semestres
- Auto-refresh de datos cada 5 minutos
- Re-render de clases activas cada 1 minuto
- Diseño oscuro optimizado para pantallas 1080p / 4K

## Estructura
```
sistematv/
├── index.html
├── css/tv.css
├── js/tv.js
└── data/tv.json   ← configurar semestres y sus URLs de datos aquí
```

## Agregar / quitar semestres
Editar `data/tv.json`. Cada semestre necesita:
- `id`: identificador único
- `label`: texto visible en pantalla
- `color`: color del borde y etiqueta
- `dataUrl`: URL pública del JSON del semestre (GitHub Pages)

## Deploy
Activar GitHub Pages desde Settings → Pages → Source: main / root.
