import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('correctly derives error state from thrown error', () => {
    const error = new Error('Simulated runtime failure');
    const state = ErrorBoundary.getDerivedStateFromError(error);

    expect(state).toEqual({
      hasError: true,
      error,
    });
  });

  it('preserves error message and stack trace in error state', () => {
    const specificError = new TypeError('Cannot read property of undefined');
    const state = ErrorBoundary.getDerivedStateFromError(specificError);

    expect(state.hasError).toBe(true);
    expect(state.error?.message).toBe('Cannot read property of undefined');
    expect(state.error).toBeInstanceOf(TypeError);
  });
});
