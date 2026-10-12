# Mini Estacion Meteorologica

[![API Health Check](https://github.com/aisamiter/estacion-meteorologica/actions/workflows/health-check.yml/badge.svg)](https://github.com/aisamiter/estacion-meteorologica/actions/workflows/health-check.yml)
[![GitHub Pages](https://img.shields.io/badge/live-GitHub%20Pages-00e5ff?style=flat&logo=github)](https://aisamiter.github.io/estacion-meteorologica/)

Dashboard meteorologico en tiempo real para Buenos Aires, corriendo en un Samsung A72 como pantalla dedicada de escritorio.

![Samsung A72 running the weather dashboard](demo.jpg)

**[Ver en vivo](https://aisamiter.github.io/estacion-meteorologica/)**

## Features

- Reloj en tiempo real con fecha en espanol
- Temperatura, sensacion termica, min/max del dia
- Humedad + probabilidad de lluvia
- Viento (velocidad + direccion cardinal)
- Indice UV con categoria coloreada
- Presion atmosferica con tendencia
- Amanecer/ocaso + fase lunar (calculo local)
- Calidad del aire (EAQI, PM2.5, Ozono)
- Imagen satelital GOES-19 de NOAA en vivo
- Pronostico horario 12h + pronostico 7 dias (alternan automaticamente)
- Marcador pulsante de ubicacion sobre la imagen satelital
- Wake Lock API para pantalla siempre encendida
- Agenda: proximos eventos de un calendario de Google (ver seccion Agenda)
- PWA: "Agregar a pantalla de inicio" para fullscreen sin barras

## Agenda

El panel de agenda muestra los proximos 4 eventos en la fila inferior. Se oculta solo si no hay eventos.

**Importante:** el repo y el sitio son publicos, asi que usa un calendario **aparte** (ej. "Pantalla") con solo lo que quieras mostrar. No uses tu calendario personal.

1. En Google Calendar crea el calendario "Pantalla" y cargale los eventos que quieras ver.
2. Configuracion del calendario > "Permisos de acceso" > marcar "Hacer disponible públicamente".
3. En "Integrar el calendario" copia la **URL publica en formato iCal** (termina en `.ics`).
4. En GitHub: Settings > Secrets and variables > Actions > New repository secret, nombre `AGENDA_ICAL_URL`, pega la URL.
5. Actions > "Update Agenda" > Run workflow (despues corre solo cada 30 minutos).

La Action (`.github/workflows/update-agenda.yml`) corre `scripts/build-agenda.mjs`, que expande eventos recurrentes (14 dias hacia adelante) y escribe `agenda.json` solo si hubo cambios. Tests: `npm ci --prefix scripts && npm test --prefix scripts`.

## Stack

| Componente | Tecnologia |
|---|---|
| Frontend | HTML + CSS + Vanilla JS (un solo archivo) |
| Clima | [Open-Meteo API](https://open-meteo.com/) (gratis, sin API key) |
| Calidad del aire | [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) |
| Imagen satelital | [NOAA GOES-19](https://www.star.nesdis.noaa.gov/goes/) (GEOCOLOR, gratis) |
| Radar fallback | [RainViewer](https://www.rainviewer.com/api.html) (gratis) |
| Tipografia | Share Tech Mono + Exo 2 (Google Fonts) |
| Hosting | GitHub Pages |
| CI | GitHub Actions (health check diario) |

## Setup

1. Abri [https://aisamiter.github.io/estacion-meteorologica/](https://aisamiter.github.io/estacion-meteorologica/) en Chrome
2. Toca "Toca para iniciar" para fullscreen + wake lock
3. Para PWA: Menu (3 puntos) > "Agregar a pantalla de inicio"

### Uso en telefono dedicado (Samsung A72)

1. Conectar a WiFi
2. Activar Developer Options > "Permanecer activo" (Stay awake)
3. Abrir la URL en Chrome > "Agregar a pantalla de inicio"
4. Abrir desde el icono del home en landscape
5. Conectar cargador + activar "Proteger bateria" (85%)
6. Brillo al 20-30%

## APIs utilizadas

| API | Datos | Refresh | Key |
|---|---|---|---|
| Open-Meteo Forecast | Temp, humedad, viento, UV, presion, pronostico | 15 min | No |
| Open-Meteo Air Quality | EAQI, PM2.5, Ozono | 15 min | No |
| NOAA GOES-19 | Imagen satelital Sudamerica sur | 5 min | No |
| RainViewer | Radar de precipitaciones (fallback) | 5 min | No |

## Creditos

Inspirado por [este post](https://x.com/) de alguien que convirtio un Motorola viejo en estacion meteorologica.

Construido con [Claude Code](https://claude.ai/claude-code) en ~2 horas.

## Licencia

MIT
