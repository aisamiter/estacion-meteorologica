import test from 'node:test';
import assert from 'node:assert/strict';
import ical from 'node-ical';
import { buildEvents } from './build-agenda.mjs';

const NOW = new Date('2026-10-12T12:00:00Z');

const ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//test//ES
BEGIN:VEVENT
UID:single@test
DTSTAMP:20261001T000000Z
DTSTART:20261013T180000Z
DTEND:20261013T190000Z
SUMMARY:Dentista
END:VEVENT
BEGIN:VEVENT
UID:allday@test
DTSTAMP:20261001T000000Z
DTSTART;VALUE=DATE:20261015
DTEND;VALUE=DATE:20261016
SUMMARY:Feriado
END:VEVENT
BEGIN:VEVENT
UID:weekly@test
DTSTAMP:20261001T000000Z
DTSTART:20261005T200000Z
DTEND:20261005T210000Z
RRULE:FREQ=WEEKLY;COUNT=6
EXDATE:20261019T200000Z
SUMMARY:Natacion
END:VEVENT
BEGIN:VEVENT
UID:past@test
DTSTAMP:20261001T000000Z
DTSTART:20261001T100000Z
DTEND:20261001T110000Z
SUMMARY:Ya paso
END:VEVENT
BEGIN:VEVENT
UID:far@test
DTSTAMP:20261001T000000Z
DTSTART:20261201T100000Z
DTEND:20261201T110000Z
SUMMARY:Muy lejos
END:VEVENT
END:VCALENDAR`;

const titles = (events) => events.map((e) => e.title);

test('incluye eventos de la ventana y excluye pasados y lejanos', () => {
  const events = buildEvents(ical.sync.parseICS(ICS), NOW);
  assert.deepEqual(titles(events).sort(), ['Dentista', 'Feriado', 'Natacion'].sort());
});

test('expande recurrencias y respeta EXDATE', () => {
  const events = buildEvents(ical.sync.parseICS(ICS), NOW);
  const swim = events.filter((e) => e.title === 'Natacion').map((e) => e.start);
  // 5 oct (pasado), 12 oct 20:00Z (hoy, dentro), 19 oct (EXDATE), 26 oct 20:00Z (fuera de la ventana de 14 dias)
  assert.deepEqual(swim, ['2026-10-12T20:00:00.000Z']);
});

test('marca eventos de dia completo con fecha sin hora', () => {
  const events = buildEvents(ical.sync.parseICS(ICS), NOW);
  const holiday = events.find((e) => e.title === 'Feriado');
  assert.equal(holiday.allDay, true);
  assert.match(holiday.start, /^\d{4}-\d{2}-\d{2}$/);
});

test('ordena por inicio', () => {
  const events = buildEvents(ical.sync.parseICS(ICS), NOW);
  const starts = events.map((e) => e.start);
  assert.deepEqual(starts, [...starts].sort());
});

const ICS_TZID = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//test//ES
BEGIN:VTIMEZONE
TZID:America/Argentina/Buenos_Aires
BEGIN:STANDARD
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:-03
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:school@test
DTSTAMP:20261001T000000Z
DTSTART;TZID=America/Argentina/Buenos_Aires:20261005T080000
DTEND;TZID=America/Argentina/Buenos_Aires:20261005T130000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE
SUMMARY:Escuela
END:VEVENT
END:VCALENDAR`;

test('recurrencias con TZID de Buenos Aires caen a la hora local correcta', () => {
  const events = buildEvents(ical.sync.parseICS(ICS_TZID), NOW);
  // 12 oct es lunes: 08:00 -03:00 = 11:00Z (ya empezo pero termina 16:00Z, dentro de la ventana)
  assert.deepEqual(events.map((e) => e.start).slice(0, 3), [
    '2026-10-12T11:00:00.000Z',
    '2026-10-14T11:00:00.000Z',
    '2026-10-19T11:00:00.000Z',
  ]);
});
