import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { eventKey, resolveFeaturedEvent } from './resolve-featured-event.mjs';

describe('resolveFeaturedEvent', () => {
  it('returns null featured when no rows flagged', () => {
    const { featured, items } = resolveFeaturedEvent([
      { start: '2026-10-01T12:00:00-05:00', title: 'A' },
    ]);
    assert.equal(featured, null);
    assert.equal(items.length, 1);
  });

  it('picks earliest flagged upcoming event', () => {
    const { featured, items } = resolveFeaturedEvent([
      { start: '2026-10-10T12:00:00-05:00', title: 'Later', featured: true },
      { start: '2026-10-01T12:00:00-05:00', title: 'Sooner', featured: true },
    ]);
    assert.equal(featured?.title, 'Sooner');
    assert.equal(items.length, 2);
    assert.ok(!('featured' in (featured ?? {})));
    assert.ok(items.every((item) => !('featured' in item)));
  });

  it('builds stable event keys', () => {
    assert.equal(
      eventKey({ start: '2026-10-01T12:00:00-05:00', title: 'Test' }),
      '2026-10-01T12:00:00-05:00|Test',
    );
  });
});
