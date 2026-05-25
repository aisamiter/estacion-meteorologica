# LinkedIn Post — Casual Friday: Weather Station Side Project

---

Everyone has that old phone in a drawer.

Mine was a Samsung A72 with a cracked screen that hadn't been charged in a year. Yesterday I turned it into a weather station + digital picture frame. Total build time: one afternoon. Total cost: $0.

Here's what happened:

I saw someone's post about repurposing old phones and thought "I could build something better." So I opened Claude Code and started talking to it like a colleague. No frameworks. No npm install. No tutorial rabbit holes. Just one HTML file, free weather APIs, and a conversation.

Four hours later, my daughter's photos rotate with a Ken Burns effect on the cracked screen — and every 5 minutes, it interrupts with a full weather dashboard: temperature, humidity, wind, UV, air quality, satellite imagery from NOAA, and a 7-day forecast.

The best part? The features I didn't plan for:
- Swipe left/right to browse photos manually
- Double tap for "focus mode" (permanent weather station)
- Night mode dims automatically at 11pm
- Smart alerts when storms or extreme UV hit

My wife's reaction: "Wait, this actually looks good?"

The technical nerdy details for those who care:
- One HTML file (~900 lines)
- Zero dependencies
- Open-Meteo + NOAA GOES-19 satellite + RainViewer radar
- GitHub Pages deploy (free)
- GitHub Action auto-compresses any new photos I push

This is what vibe coding looks like in practice. Not "AI wrote my code." More like: I had an idea at lunch, and by dinner it was running on my desk.

The gap isn't in the tooling. It's in the willingness to start.

What's collecting dust in your drawer that could get a second life?

---

Live demo: https://aisamiter.github.io/estacion-meteorologica/
Source: https://github.com/aisamiter/estacion-meteorologica

#CasualFriday #SideProject #VibeCoding #BuildNotPlan #AI #WeatherStation

---

# Version Castellano

---

Todos tenemos un celular viejo en un cajon.

El mio era un Samsung A72 con la pantalla rota que no cargaba hace un anio. Ayer lo converti en una estacion meteorologica + portarretratos digital. Tiempo de construccion: una tarde. Costo total: $0.

Esto es lo que paso:

Vi un post de alguien que reutilizaba celulares viejos y pense "puedo hacer algo mejor." Abri Claude Code y le empece a hablar como a un colega. Sin frameworks. Sin npm install. Sin rabbit holes de tutoriales. Un solo archivo HTML, APIs de clima gratuitas, y una conversacion.

Cuatro horas despues, las fotos de mi hija rotan con efecto Ken Burns en la pantalla rota — y cada 5 minutos, se interrumpe con un dashboard meteorologico completo: temperatura, humedad, viento, UV, calidad del aire, imagen satelital de la NOAA, y pronostico de 7 dias.

La mejor parte? Las features que no habia planeado:
- Swipe izquierda/derecha para navegar fotos
- Doble tap para "modo focus" (estacion meteorologica permanente)
- Modo nocturno que baja el brillo automaticamente a las 23h
- Alertas inteligentes cuando hay tormentas o UV extremo

La reaccion de mi mujer: "Para, esto se ve bien de verdad?"

Los detalles tecnicos nerds para los que les interese:
- Un solo archivo HTML (~900 lineas)
- Cero dependencias
- Open-Meteo + satelite NOAA GOES-19 + radar RainViewer
- Deploy en GitHub Pages (gratis)
- GitHub Action que comprime fotos automaticamente al pushear

Esto es lo que significa vibe coding en la practica. No es "la IA me escribio el codigo." Es mas bien: tuve una idea al mediodia, y a la noche ya estaba funcionando en mi escritorio.

La brecha no esta en las herramientas. Esta en la voluntad de arrancar.

Que tenes juntando polvo en un cajon que podria tener una segunda vida?

---

Demo en vivo: https://aisamiter.github.io/estacion-meteorologica/
Codigo: https://github.com/aisamiter/estacion-meteorologica

#ViernesCasual #SideProject #VibeCoding #ConstruirNosPlanear #IA #EstacionMeteorologica
