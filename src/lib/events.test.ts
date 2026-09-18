import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { collapseRecurringForList, eventKey } from './events.ts';

describe('collapseRecurringForList', () => {
  it('keeps one upcoming occurrence per seriesId', () => {
    const items = collapseRecurringForList([
      {
        seriesId: 'row-3',
        start: '2026-10-03T19:00:00-05:00',
        end: '2026-10-03T22:00:00-05:00',
        month: 'OCT',
        day: '03',
        tag: 'Live music',
        title: 'Patio vinyl night',
        timeLabel: '7–10pm',
        desc: 'Weekly',
      },
      {
        seriesId: 'row-3',
        start: '2026-09-26T19:00:00-05:00',
        end: '2026-09-26T22:00:00-05:00',
        month: 'SEP',
        day: '26',
        tag: 'Live music',
        title: 'Patio vinyl night',
        timeLabel: '7–10pm',
        desc: 'Weekly',
      },
      {
        start: '2026-09-27T12:00:00-05:00',
        end: '2026-09-27T17:00:00-05:00',
        month: 'SEP',
        day: '27',
        tag: 'Market',
        title: 'Makers market',
        timeLabel: '12–5pm',
        desc: 'One-off',
      },
    ]);

    assert.equal(items.length, 2);
    assert.equal(items[0].title, 'Patio vinyl night');
    assert.equal(items[0].start, '2026-09-26T19:00:00-05:00');
    assert.equal(items[1].title, 'Makers market');
  });

  it('uses eventKey for one-offs without seriesId', () => {
    const item = {
      start: '2026-10-04T16:00:00-05:00',
      end: '2026-10-04T18:00:00-05:00',
      month: 'OCT',
      day: '04',
      tag: 'Tasting',
      title: 'Happy hour',
      timeLabel: '4–6pm',
      desc: 'One-off',
    };
    assert.equal(collapseRecurringForList([item])[0], item);
    assert.equal(eventKey(item), '2026-10-04T16:00:00-05:00|Happy hour');
  });
});
