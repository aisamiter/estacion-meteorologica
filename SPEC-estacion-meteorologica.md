# SPEC: Mini Estacion Meteorologica — Dashboard para Samsung A72

## Vision

Webapp estatica tipo "cartelera digital" que muestra datos meteorologicos en tiempo real de Buenos Aires en un Samsung A72 dedicado, apoyado en landscape como tercera pantalla de escritorio. Inspirado en [este post de LinkedIn](https://x.com/...) que usa un Motorola viejo con open-meteo.

---

## 1. Dispositivo Target

| Atributo | Valor |
|---|---|
| Modelo | Samsung Galaxy A72 |
| Pantalla | 6.7" Super AMOLED, 1080x2400px |
| Orientacion | **Landscape** (2400x1080 effective) |
| Aspect ratio | ~20:9 (en landscape: ~9:20 invertido = muy ancho) |
| Android | 11+ (excelente soporte CSS Grid, Wake Lock API) |
| Browser | Chrome Android (ultima version disponible) |
| AMOLED | Si — fondo `#000000` puro para ahorro de bateria |

### Requisitos de display
- Fullscreen (sin barra de navegacion ni barra de estado del browser)
- Landscape forzado via `<meta>` + CSS
- Wake Lock API activo para evitar que se apague la pantalla
- Sin scrolling — todo el contenido visible en una sola pantalla

---

## 2. Ubicacion

- **Ciudad**: Buenos Aires, CABA, Argentina
- **Coordenadas hardcodeadas**: `-34.6037, -58.3816` (centro CABA)
- **Timezone**: `America/Argentina/Buenos_Aires`
- **No configurable en V1** — se puede parametrizar despues

---

## 3. Arquitectura

### Stack
- **HTML/CSS/JS puro** — cero dependencias, cero frameworks, cero build step
- Un solo archivo `index.html` (o maximo 3 archivos: `index.html`, `style.css`, `app.js`)
- Sin npm, sin bundler, sin transpiler
- CSS Grid para layout
- Vanilla JS con `fetch()` para APIs
- Iconos: emoji unicode o SVG inline (sin icon fonts externos)

### Hosting
- **GitHub Pages** — push al repo, sirve como `https://aisamiter.github.io/estacion-meteorologica/`
- HTTPS habilitado (requerido para Wake Lock API y Geolocation si se agrega despues)
- Dominio custom: no necesario en V1

### Modo de operacion
- **100% pasivo** — sin interaccion del usuario, sin tocar la pantalla
- Sin menu, sin configuracion en pantalla, sin scroll
- Los datos se actualizan automaticamente

---

## 4. APIs

### 4.1 Open-Meteo (clima principal)

- **URL base**: `https://api.open-meteo.com/v1/forecast`
- **Costo**: Gratis, sin API key
- **Rate limit**: 10,000 requests/dia (mas que suficiente)
- **Datos requeridos**:

#### Current weather
```
&current=temperature_2m,relative_humidity_2m,apparent_temperature,
precipitation,weather_code,wind_speed_10m,wind_direction_10m,
surface_pressure,uv_index
```

#### Hourly forecast (proximas 12 horas)
```
&hourly=temperature_2m,weather_code,precipitation_probability
&forecast_hours=12
```

#### Daily (min/max, amanecer/ocaso)
```
&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,
uv_index_max,precipitation_probability_max
```

#### Parametros globales
```
?latitude=-34.6037&longitude=-58.3816
&timezone=America/Argentina/Buenos_Aires
&current=...&hourly=...&daily=...
```

### 4.2 Camara de transito / Imagen visual

**Opcion principal**: Camara de transito publica de Buenos Aires (GCBA)
- Investigar disponibilidad en: `https://buenosaires.gob.ar/transito`
- Las camaras de transito de CABA se acceden como imagenes JPEG que se refrescan

**Fallback** (si no hay camara publica accesible):
- **Radar meteorologico del SMN** (Servicio Meteorologico Nacional)
  - URL del radar de Ezeiza: `https://www.smn.gob.ar/radar/ezeiza/...` (imagen PNG)
  - Muestra precipitaciones en tiempo real sobre la zona de Buenos Aires
- **Imagen satelite GOES** (alternativa)

**Refresh de la imagen**: Cada 5 minutos (independiente del refresh del clima)

**Comportamiento**:
- Mostrar la imagen en el cuadrante superior derecho del dashboard
- Si la imagen falla al cargar: mostrar placeholder oscuro con texto "Sin imagen"
- Timestamp de la ultima actualizacion de la imagen visible

### 4.3 Datos astronomicos

Open-Meteo provee `sunrise` y `sunset` en el endpoint `daily`. Para la fase lunar, calcular localmente con algoritmo (no necesita API extra).

---

## 5. Widgets y Layout

### Layout general (landscape 2400x1080)

```
+------------------+------------------+-------------------+
|                  |                  |                   |
|   RELOJ/FECHA    |   TEMPERATURA    |  HUMEDAD          |   CAMARA/RADAR
|   + Estado       |   + Sensacion    |  + Prob lluvia    |   (imagen)
|                  |   + Min/Max      |  + Precipitacion  |
+------------------+------------------+-------------------+
|        |         |                  |                   |
| VIENTO | UV      | AMANECER/OCASO   |  PRESION ATM      |  CALIDAD AIRE
|        |         | + Luna           |                   |  (futuro V2)
+--------+---------+------------------+-------------------+
|                                                         |
|              PRONOSTICO HORARIO (12 horas)               |
|  [17h] [18h] [19h] [20h] [21h] [22h] [23h] [00h] ...  |
+---------------------------------------------------------+
```

**Nota**: El layout exacto se ajustara durante implementacion. La imagen de referencia del post sirve como guia. El grid tiene 3 filas principales:
1. **Fila superior**: Datos principales (reloj, temp, humedad) + imagen
2. **Fila media**: Datos secundarios (viento, UV, astro, presion)
3. **Fila inferior**: Pronostico horario (scroll horizontal si hace falta, o mostrar las que entren)

### 5.1 Widget: Reloj y Fecha
- **Hora**: `HH:MM` en formato 24h, tamanio grande (~120px)
- **Segundos**: Opcionalmente en tamanio mas chico al lado
- **Dia**: `JUEVES 19 MARZO 2026`
- **Estado del clima**: Texto + icono (ej: "Despejado" con sol)
- **Refresh**: Cada segundo (solo el reloj)
- **Fuente del weather code**: `weather_code` de Open-Meteo → mapear a texto en espanol + icono

### 5.2 Widget: Temperatura
- **Temperatura actual**: Numero grande (~80px), con signo de grado
- **Label**: "TEMP. EXT." arriba
- **Sensacion termica**: "Sensacion: XX°" debajo
- **Min/Max del dia**: "↓XX° ↑XX°" en la parte inferior
- **Color**: Cyan/celeste para el numero principal
- **Unidad**: Celsius

### 5.3 Widget: Humedad
- **Humedad relativa**: Numero grande + "%"
- **Label**: "HUMEDAD EXT."
- **Probabilidad de lluvia**: "XX% prob. lluvia" debajo
- **Precipitacion actual**: "X mm" si esta lloviendo
- **Color**: Verde para el numero principal

### 5.4 Widget: Viento
- **Velocidad**: Numero grande + "km/h"
- **Direccion**: "NE 41°" o similar (grados + punto cardinal)
- **Label**: "VIENTO"
- **Color**: Blanco/gris

### 5.5 Widget: Indice UV
- **Valor numerico**: Numero grande
- **Categoria**: "Bajo" / "Moderado" / "Alto" / "Muy alto" / "Extremo"
- **Color por categoria**:
  - 0-2: Verde (Bajo)
  - 3-5: Amarillo (Moderado)
  - 6-7: Naranja (Alto)
  - 8-10: Rojo (Muy alto)
  - 11+: Violeta (Extremo)

### 5.6 Widget: Amanecer / Ocaso + Luna
- **Amanecer**: Icono sol arriba + hora (ej: "07:22")
- **Ocaso**: Icono sol abajo + hora (ej: "19:25")
- **Fase lunar**: Nombre (ej: "Luna nueva") + icono emoji de la fase
- **Horas de luz**: "12h 03m luz"
- **Label**: "AMANECER · OCASO"

### 5.7 Widget: Presion Atmosferica
- **Valor**: Numero grande + "hPa"
- **Tendencia**: Flecha arriba/abajo/estable (comparando con lectura anterior)
- **Label**: "PRESION ATM."
- **Color**: Naranja/ambar

### 5.8 Widget: Camara / Radar
- **Imagen**: JPEG o PNG de la camara de transito o radar
- **Tamanio**: Ocupa el cuadrante superior derecho
- **Overlay**: Texto semi-transparente con nombre de la fuente + timestamp
- **Error**: Placeholder oscuro con "Sin imagen"

### 5.9 Widget: Pronostico Horario
- **Cantidad**: Proximas 12 horas
- **Por cada hora**: Hora (ej: "17h"), icono del clima, temperatura
- **Layout**: Fila horizontal en la parte inferior
- **Fuente**: Endpoint `hourly` de Open-Meteo
- **Iconos**: Mapeo de `weather_code` a emojis/SVGs

---

## 6. Weather Codes → Iconos y Textos

Mapeo de `weather_code` de Open-Meteo (WMO):

| Code | Descripcion (ES) | Icono |
|------|-------------------|-------|
| 0 | Despejado | ☀️ (dia) / 🌙 (noche) |
| 1 | Mayormente despejado | 🌤️ |
| 2 | Parcialmente nublado | ⛅ |
| 3 | Nublado | ☁️ |
| 45, 48 | Niebla | 🌫️ |
| 51, 53, 55 | Llovizna | 🌦️ |
| 61, 63, 65 | Lluvia | 🌧️ |
| 66, 67 | Lluvia congelante | 🌧️❄️ |
| 71, 73, 75 | Nieve | 🌨️ |
| 77 | Granizo | 🌨️ |
| 80, 81, 82 | Chubascos | 🌧️ |
| 85, 86 | Chubascos de nieve | 🌨️ |
| 95 | Tormenta | ⛈️ |
| 96, 99 | Tormenta con granizo | ⛈️ |

**Nota**: Diferenciar dia/noche usando `sunrise`/`sunset` para elegir el icono correcto (sol vs luna para codigo 0).

---

## 7. Estilo Visual

### Paleta de colores
- **Fondo**: `#000000` (negro puro AMOLED)
- **Fondo de widgets**: `#111111` o `#1a1a1a` con bordes sutiles `#333333`
- **Texto principal**: `#FFFFFF`
- **Texto secundario**: `#AAAAAA`
- **Acento temperatura**: `#00E5FF` (cyan neon)
- **Acento humedad**: `#00FF88` (verde neon)
- **Acento presion**: `#FF8800` (naranja/ambar)
- **Acento hora**: `#00E5FF` (cyan)
- **Labels**: `#888888` (gris medio), uppercase, font-size pequeno

### Tipografia
- **Numeros grandes**: Font monospace (ej: `'Courier New'`, `monospace`, o Google Font `JetBrains Mono` si se agrega)
- **Labels**: Sans-serif, uppercase, letter-spacing amplio
- **Usar font-display: swap** si se usa Google Fonts
- **Preferir system fonts** para evitar dependencias externas y carga lenta

### Bordes y separacion
- Widgets separados con bordes de 1px `#333333` o gap de CSS Grid
- Border-radius: 4-8px (sutil, no redondeado)
- Sin sombras (flat design, AMOLED puro)

---

## 8. Comportamiento

### Ciclo de actualizacion

| Dato | Frecuencia | Metodo |
|------|-----------|--------|
| Reloj (HH:MM:SS) | Cada 1 segundo | `setInterval` local |
| Datos de clima | Cada 15 minutos | `fetch` a Open-Meteo |
| Imagen camara/radar | Cada 5 minutos | Recargar `<img>` src con cache-bust |
| Fase lunar | Al cargar + cada hora | Calculo local |

### Manejo de errores
- **API falla**: Mantener los ultimos datos validos en pantalla. Mostrar indicador pequeno "Sin conexion" o "Datos de hace X min" en un rincón.
- **Imagen falla**: Placeholder oscuro con texto "Sin imagen".
- **Sin internet al cargar**: Pantalla negra con mensaje "Conecta a WiFi" centrado.
- **Wake Lock falla**: No es critico. El usuario puede configurar "Stay awake" manualmente.

### Inicializacion
1. Solicitar Wake Lock
2. Entrar en fullscreen (`requestFullscreen()`)
3. Fetch inicial de datos de clima
4. Cargar imagen de camara/radar
5. Iniciar timer del reloj (cada 1s)
6. Iniciar timer de refresh clima (cada 15min)
7. Iniciar timer de refresh imagen (cada 5min)

### Source indicator
- Esquina inferior izquierda: logo/texto pequeno "open-meteo" + timestamp del ultimo fetch
- Similar al que se ve en la imagen de referencia

---

## 9. Fase Lunar (calculo local)

Calcular la fase lunar sin API externa usando el algoritmo de John Conway o similar:
- Input: fecha actual
- Output: nombre de la fase + edad en dias

| Fase | Dias (~) | Icono |
|------|----------|-------|
| Luna nueva | 0 | 🌑 |
| Creciente | 1-6 | 🌒 |
| Cuarto creciente | 7 | 🌓 |
| Gibosa creciente | 8-13 | 🌔 |
| Luna llena | 14 | 🌕 |
| Gibosa menguante | 15-20 | 🌖 |
| Cuarto menguante | 21 | 🌗 |
| Menguante | 22-28 | 🌘 |

---

## 10. Non-Goals (fuera de scope V1)

- **No** calidad del aire (requiere API adicional, se agrega en V2)
- **No** configuracion de ubicacion (CABA hardcodeado)
- **No** Service Worker / PWA / offline mode
- **No** interactividad (no tap, no swipe, no menu)
- **No** notificaciones push
- **No** historial de datos
- **No** multi-idioma (solo espanol)
- **No** responsive para otras pantallas (optimizado solo para A72 landscape)
- **No** modo portrait
- **No** temas / dark-light toggle (siempre dark)

---

## 11. V2 Ideas (backlog)

- Calidad del aire (ICA, PM2.5, Ozono) via API de OpenAQ o AQICN
- Ubicacion configurable
- Service Worker para modo offline
- Pronostico extendido (7 dias)
- Alertas meteorologicas (SMN)
- Multiples camaras con rotacion
- Soporte PWA (Add to Home Screen)
- Modo portrait alternativo

---

## 12. Estructura de archivos

```
estacion-meteorologica/
├── index.html      ← Entry point, layout HTML, estilos inline o linkeados
├── style.css       ← Estilos del dashboard (opcional, puede ir inline)
├── app.js          ← Logica: fetch APIs, update DOM, timers
└── README.md       ← Instrucciones de uso y setup
```

**Alternativa single-file**: Todo en `index.html` con `<style>` y `<script>` inline. Mas simple para mantener y deployar.

---

## 13. Acceptance Criteria

- [ ] La webapp carga en Chrome Android del Samsung A72 en landscape
- [ ] El reloj se actualiza cada segundo
- [ ] La temperatura, humedad, viento, presion, UV se muestran correctamente
- [ ] El pronostico horario muestra las proximas 12 horas con icono y temperatura
- [ ] Amanecer, ocaso y fase lunar se calculan/muestran correctamente
- [ ] La imagen (camara o radar) se carga y refresca cada 5 min
- [ ] Los datos de clima se refrescan cada 15 min sin recargar la pagina
- [ ] La pantalla no se apaga (Wake Lock activo)
- [ ] El fondo es negro puro (#000) para AMOLED
- [ ] No hay scroll — todo visible en una sola pantalla
- [ ] Funciona sin API keys — solo APIs gratuitas publicas
- [ ] Se puede deployar en GitHub Pages sin build step
