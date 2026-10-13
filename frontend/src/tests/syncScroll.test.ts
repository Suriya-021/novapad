import { describe, it, expect } from 'vitest';

/**
 * Pure calculation tests for two-page spread synchronized scrolling
 */
describe('Spread Synchronized Scrolling Logic', () => {
  const calculateSyncTarget = (
    sourceScrollTop: number,
    sourceScrollHeight: number,
    sourceClientHeight: number,
    targetScrollHeight: number,
    targetClientHeight: number
  ): number => {
    const maxSource = sourceScrollHeight - sourceClientHeight;
    const maxTarget = targetScrollHeight - targetClientHeight;

    if (maxSource > 0 && maxTarget > 0) {
      const ratio = sourceScrollTop / maxSource;
      return Math.round(ratio * maxTarget);
    } else if (maxTarget > 0) {
      return sourceScrollTop;
    }
    return 0;
  };

  it('synchronizes 1:1 when both pages have identical scroll dimensions', () => {
    // Both pages have 1200px scrollHeight and 600px viewport (600px maxScroll)
    expect(calculateSyncTarget(0, 1200, 600, 1200, 600)).toBe(0);
    expect(calculateSyncTarget(300, 1200, 600, 1200, 600)).toBe(300);
    expect(calculateSyncTarget(600, 1200, 600, 1200, 600)).toBe(600);
  });

  it('proportionally scales scroll when pages have different content heights', () => {
    // Left page has 1000px height (maxScroll 500)
    // Right page has 1500px height (maxScroll 1000)
    // When Left is at top (0%), Right is at 0
    expect(calculateSyncTarget(0, 1000, 500, 1500, 500)).toBe(0);

    // When Left is at 50% (250px), Right is at 50% (500px)
    expect(calculateSyncTarget(250, 1000, 500, 1500, 500)).toBe(500);

    // When Left is at 100% (500px / bottom), Right is at 100% (1000px / bottom)
    expect(calculateSyncTarget(500, 1000, 500, 1500, 500)).toBe(1000);
  });

  it('handles reverse sync accurately (right to left)', () => {
    // Right page has 1500px (maxScroll 1000)
    // Left page has 1000px (maxScroll 500)
    expect(calculateSyncTarget(500, 1500, 500, 1000, 500)).toBe(250);
    expect(calculateSyncTarget(1000, 1500, 500, 1000, 500)).toBe(500);
  });

  it('safely handles non-overflowing target page', () => {
    // Target page content fits completely in viewport (maxTarget <= 0)
    expect(calculateSyncTarget(200, 1000, 500, 400, 500)).toBe(0);
  });
});
