import React, { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook providing robust, bidirectional lockstep synchronized scrolling
 * for dual-page book spreads with proportional alignment and wheel delegation.
 */
export function useSynchronizedScroll(resetKey?: string | number) {
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Bidirectional synchronized scroll handler for left page -> right page
  const handleLeftScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    if (maxLeft > 0 && maxRight > 0) {
      const ratio = left.scrollTop / maxLeft;
      const targetY = Math.round(ratio * maxRight);
      if (Math.abs(right.scrollTop - targetY) > 1) {
        isSyncingRef.current = true;
        right.scrollTop = targetY;
        requestAnimationFrame(() => {
          isSyncingRef.current = false;
        });
      }
    } else if (maxRight > 0) {
      isSyncingRef.current = true;
      right.scrollTop = left.scrollTop;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    }
  }, []);

  // Bidirectional synchronized scroll handler for right page -> left page
  const handleRightScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    if (maxLeft > 0 && maxRight > 0) {
      const ratio = right.scrollTop / maxRight;
      const targetY = Math.round(ratio * maxLeft);
      if (Math.abs(left.scrollTop - targetY) > 1) {
        isSyncingRef.current = true;
        left.scrollTop = targetY;
        requestAnimationFrame(() => {
          isSyncingRef.current = false;
        });
      }
    } else if (maxLeft > 0) {
      isSyncingRef.current = true;
      left.scrollTop = right.scrollTop;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    }
  }, []);

  // Synchronized mouse-wheel handler over the entire two-page spread (including spine/gutters)
  const handleBookWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const target = e.target as HTMLElement;
    const isOverLeft = left.contains(target);
    const isOverRight = right.contains(target);

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    // When hovering over spine or outer margins
    if (!isOverLeft && !isOverRight) {
      if (maxLeft > 0) {
        left.scrollTop += e.deltaY;
      } else if (maxRight > 0) {
        right.scrollTop += e.deltaY;
      }
      return;
    }

    // If hovering over left, but left cannot scroll further in this direction
    if (isOverLeft) {
      const cannotScrollDown = e.deltaY > 0 && left.scrollTop >= maxLeft - 1;
      const cannotScrollUp = e.deltaY < 0 && left.scrollTop <= 1;
      if ((maxLeft <= 0 || cannotScrollDown || cannotScrollUp) && maxRight > 0) {
        right.scrollTop += e.deltaY;
      }
    }

    // If hovering over right, but right cannot scroll further in this direction
    if (isOverRight) {
      const cannotScrollDown = e.deltaY > 0 && right.scrollTop >= maxRight - 1;
      const cannotScrollUp = e.deltaY < 0 && right.scrollTop <= 1;
      if ((maxRight <= 0 || cannotScrollDown || cannotScrollUp) && maxLeft > 0) {
        left.scrollTop += e.deltaY;
      }
    }
  }, []);

  // Reset scroll positions when the resetKey changes (spread or page index)
  useEffect(() => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = 0;
    }
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = 0;
    }
  }, [resetKey]);

  return {
    leftScrollRef,
    rightScrollRef,
    handleLeftScroll,
    handleRightScroll,
    handleBookWheel,
  };
}
