import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addCalendarDays,
  compareYmd,
  expandWeeklyEvent,
  getRecurrenceConfig,
  MAX_WEEKLY_OCCURRENCES,
  parseRecurrenceUntil,
} from './expand-recurring-events.mjs';

function mockParseChicago(str) {
  const m = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})$/);
  return `${m[1]}T${m[2].padStart(2, '0')}:${m[3]}:00-05:00`;
}

function mockDeriveMonthDay(iso) {
  const month = iso.slice(5, 7);
  const day = iso.slice(8, 10);
  const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return { month: names[Number(month) - 1], day };
}

const helpers = { parseChicagoDatetime: mockParseChicago, deriveMonthDay: mockDeriveMonthDay };

describe('getRecurrenceConfig', () => {
  it('returns oneoff when recurrence is empty', () => {
    const errors = [];
    const config = getRecurrenceConfig({ _row: 2, recurrence: '', recurrence_until: '' }, { year: 2026, month: 9, day: 19 }, errors);
    assert.deepEqual(config, { type: 'oneoff' });
    assert.equal(errors.length, 0);
  });

  it('errors when until is set without recurrence', () => {
    const errors = [];
    const config = getRecurrenceConfig(
      { _row: 2, recurrence: '', recurrence_until: '2026-12-31' },
      { year: 2026, month: 9, day: 19 },
      errors,
    );
    assert.equal(config, null);
    assert.match(errors[0], /recurrence_until should be empty/);
  });

  it('errors on unsupported recurrence type', () => {
    const errors = [];
    const config = getRecurrenceConfig(
      { _row: 2, recurrence: 'biweekly', recurrence_until: '2026-12-31' },
      { year: 2026, month: 9, day: 19 },
      errors,
    );
    assert.equal(config, null);
    assert.match(errors[0], /must be empty or "weekly"/);
  });

  it('errors when weekly is missing until', () => {
    const errors = [];
    const config = getRecurrenceConfig(
      { _row: 2, recurrence: 'weekly', recurrence_until: '' },
      { year: 2026, month: 9, day: 19 },
      errors,
    );
    assert.equal(config, null);
    assert.match(errors[0], /recurrence_until required/);
  });

  it('errors when until is before start date', () => {
    const errors = [];
    const config = getRecurrenceConfig(
      { _row: 2, recurrence: 'weekly', recurrence_until: '2026-09-01' },
      { year: 2026, month: 9, day: 19 },
      errors,
    );
    assert.equal(config, null);
    assert.match(errors[0], /on or after start date/);
  });
});

describe('expandWeeklyEvent', () => {
  const base = {
    tag: 'Live music',
    title: 'Patio vinyl night',
    timeLabel: 'Every Friday · 7–10pm · Free',
    desc: 'Soul & disco on the turntable.',
  };

  it('generates weekly occurrences through recurrence_until inclusive', () => {
    const items = expandWeeklyEvent(
      base,
      { year: 2026, month: 9, day: 19, hour: 19, minute: 0 },
      { hour: 22, minute: 0 },
      '2026-10-03',
      helpers,
    );
    assert.equal(items.length, 3);
    assert.equal(items[0].start, '2026-09-19T19:00:00-05:00');
    assert.equal(items[1].start, '2026-09-26T19:00:00-05:00');
    assert.equal(items[2].start, '2026-10-03T19:00:00-05:00');
    assert.equal(items[0].title, base.title);
  });

  it('caps expansion at MAX_WEEKLY_OCCURRENCES', () => {
    const items = expandWeeklyEvent(
      base,
      { year: 2026, month: 1, day: 1, hour: 19, minute: 0 },
      { hour: 22, minute: 0 },
      '2030-12-31',
      helpers,
    );
    assert.equal(items.length, MAX_WEEKLY_OCCURRENCES);
  });
});

describe('parseRecurrenceUntil', () => {
  it('parses YYYY-MM-DD', () => {
    assert.deepEqual(parseRecurrenceUntil('2026-12-31'), { year: 2026, month: 12, day: 31 });
  });

  it('throws on invalid format', () => {
    assert.throws(() => parseRecurrenceUntil('12/31/2026'), /expected YYYY-MM-DD/);
  });
});

describe('addCalendarDays', () => {
  it('adds days across month boundaries', () => {
    const next = addCalendarDays(2026, 9, 26, 7);
    assert.deepEqual(next, { year: 2026, month: 10, day: 3 });
    assert.equal(compareYmd(next, parseRecurrenceUntil('2026-10-03')), 0);
  });
});
