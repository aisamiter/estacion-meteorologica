// Genera agenda.json a partir de un calendario iCal publico.
// Uso: AGENDA_ICAL_URL=<url .ics> node scripts/build-agenda.mjs
// Solo escribe el archivo si los eventos cambiaron, para no llenar el historial de commits.
// node-ical genera las recurrencias en hora local del proceso; con UTC los resultados no dependen de la maquina.
process.env.TZ = 'UTC';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ical from 'node-ical';

const WINDOW_DAYS = 14;
const MAX_EVENTS = 30;
const OUT_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'agenda.json');

export function toEntry(ev, start, end) {
  const allDay = ev.datetype === 'date';
  const fmt = (d) => (allDay ? d.toISOString().slice(0, 10) : d.toISOString());
  return {
    title: String(ev.summary || '(sin titulo)').trim(),
    start: fmt(start),
    end: fmt(end),
    allDay,
  };
}

// Devuelve las ocurrencias de un VEVENT que caen dentro de [from, to].
export function expandEvent(ev, from, to) {
  if (ev.type !== 'VEVENT' || !ev.start) return [];
  const duration = (ev.end ? ev.end - ev.start : 0) || 0;
  const overlaps = (s, e) => e >= from && s <= to;

  if (!ev.rrule) {
    const end = ev.end || ev.start;
    return overlaps(ev.start, end) ? [toEntry(ev, ev.start, end)] : [];
  }

  const exdates = new Set(Object.keys(ev.exdate || {}));
  const overrides = ev.recurrences || {};
  // Con TZ=UTC, rrule.between devuelve instantes reales (tambien para DTSTART con TZID).
  // Se busca desde "from - duracion" para no perder eventos multi-dia ya empezados.
  const starts = ev.rrule.between(new Date(from.getTime() - duration), to, true);
  return starts.flatMap((s) => {
    const key = s.toISOString().slice(0, 10);
    if (exdates.has(key) || exdates.has(s.toISOString())) return [];
    const o = overrides[key];
    const os = o ? o.start : s;
    const oe = o ? (o.end || o.start) : new Date(s.getTime() + duration);
    return overlaps(os, oe) ? [toEntry(o || ev, os, oe)] : [];
  });
}

export function buildEvents(data, now = new Date()) {
  const from = new Date(now.getTime() - 60 * 60 * 1000);
  const to = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return Object.values(data)
    .flatMap((ev) => expandEvent(ev, from, to))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, MAX_EVENTS);
}

async function main() {
  const url = process.env.AGENDA_ICAL_URL;
  if (!url) {
    console.log('::warning::AGENDA_ICAL_URL no esta configurada; no se genera agenda.json');
    return;
  }
  const data = await ical.async.fromURL(url);
  const events = buildEvents(data);

  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  } catch {
    // primera vez o archivo invalido: se reescribe
  }
  if (previous && JSON.stringify(previous.events) === JSON.stringify(events)) {
    console.log(`Sin cambios (${events.length} eventos)`);
    return;
  }
  const out = { generatedAt: new Date().toISOString(), events };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(`agenda.json actualizado: ${events.length} eventos`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Error generando la agenda:', err.message);
    process.exit(1);
  });
}
