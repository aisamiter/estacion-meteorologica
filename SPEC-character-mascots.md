# SPEC: Personajes Animados para la Estacion Meteorologica

## Vision

Personajes queridos de las chicas aparecen cada 5 minutos asomandose desde los bordes de la pantalla, vestidos o reaccionando segun el clima actual. Cada personaje dice una frase iconica adaptada al clima.

## Personajes

| # | Personaje | Origen | Variantes clima |
|---|-----------|--------|-----------------|
| 1 | Snoopy | Peanuts (Schulz) | sol, lluvia, frio |
| 2 | Olga | Macanudo (Liniers) | sol, lluvia, frio |
| 3 | Martincito | Macanudo (Liniers) | sol, lluvia, frio |
| 4 | Enriqueta | Macanudo (Liniers) | sol, lluvia, frio |
| 5 | Felini | Macanudo (Liniers) | sol, lluvia, frio |
| 6 | Madariaga | Macanudo (Liniers) | sol, lluvia, frio |
| 7 | Percy Jackson | Rick Riordan | sol, lluvia, frio |
| 8 | Harry Potter | J.K. Rowling | sol, lluvia, frio |
| 9 | Mafalda | Quino | sol, lluvia, frio |
| 10 | Inodoro Pereyra | Fontanarrosa | sol, lluvia, frio |

**Total imagenes necesarias: 30** (10 personajes x 3 variantes)

## Imagenes

- Formato: PNG con fondo transparente (preferido) o JPG
- Tamano recomendado: 200-400px de alto
- Carpeta: `characters/`
- Naming: `{personaje}-{clima}.png`
  - Ejemplo: `mafalda-sol.png`, `mafalda-lluvia.png`, `mafalda-frio.png`
  - Climas: `sol`, `lluvia`, `frio`

El usuario busca y guarda las imagenes reales (dibujos originales).

## Mapeo de clima a variante

| Condicion | Variante |
|-----------|----------|
| Weather code 0-2, temp > 15 | `sol` |
| Weather code 51-99 (llovizna, lluvia, tormenta) | `lluvia` |
| Weather code 3, 45, 48 o temp < 15 | `frio` |

## Animacion: Asomarse desde los bordes

Cada personaje se asoma desde un borde aleatorio:
- **Desde abajo**: sube desde el borde inferior
- **Desde la izquierda**: se asoma desde el costado izquierdo
- **Desde la derecha**: se asoma desde el costado derecho
- **Desde arriba**: baja desde el borde superior

El borde se elige al azar cada vez. El personaje:
1. Se desliza hacia adentro (0.8s ease-out)
2. Se queda visible 10 segundos
3. Se desliza hacia afuera (0.8s ease-in)

## Frases

Cada personaje tiene frases iconicas por clima:

### Snoopy
- sol: "Suppertime!"
- lluvia: "Lleva paraguas, Charlie Brown"
- frio: "Mi casita tiene calefaccion"

### Olga
- sol: "Que lindo dia para pensar en nada"
- lluvia: "La lluvia lava todo, hasta la tristeza"
- frio: "Frio es cuando el alma se pone bufanda"

### Martincito
- sol: "Vamos a jugar afuera!"
- lluvia: "Los charcos son piletas gratis"
- frio: "Quiero chocolate caliente"

### Enriqueta
- sol: "Hoy es un buen dia para leer al sol"
- lluvia: "Dia perfecto para leer adentro"
- frio: "Un libro abriga mas que una frazada"

### Felini
- sol: "Miau"
- lluvia: "No me mojo. Soy gato."
- frio: "Busco falda para dormir encima"

### Madariaga
- sol: "Todo bien, todo lindo"
- lluvia: "Hay que bancarsela"
- frio: "Ponete la campera, pibe"

### Percy Jackson
- sol: "Los dioses estan de buen humor"
- lluvia: "Poseidon esta de mal humor hoy"
- frio: "Hasta el Olimpo se congela"

### Harry Potter
- sol: "Expecto Patronum!"
- lluvia: "Impervius!"
- frio: "Necesito una bufanda de Gryffindor"

### Mafalda
- sol: "Estamos perdidos. Hace buen tiempo y nadie protesta"
- lluvia: "La humanidad se moja y no aprende"
- frio: "Con este frio ni la sopa se salva"

### Inodoro Pereyra
- sol: "Lindo dia pa' matear, Mendieta"
- lluvia: "Llueve como vaca mirando al cielo"
- frio: "Hace un frio que pela, Mendieta"

## Rotacion

- Un personaje aleatorio cada 5 minutos
- No repetir el mismo personaje dos veces seguidas
- Si la imagen no existe (el usuario no la puso), skip silencioso al siguiente

## Non-goals

- No generar imagenes de los personajes con IA
- No hotlinkear imagenes de internet
- No SVGs aproximados — solo imagenes reales del usuario
