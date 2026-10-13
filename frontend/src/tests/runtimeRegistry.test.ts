import { describe, it, expect } from 'vitest';
import { RuntimeRegistry } from '../runtimes/registry/runtimeRegistry';
import { PythonRuntimeAdapter } from '../runtimes/python/pythonAdapter';
import { SqlRuntimeAdapter } from '../runtimes/sql/sqlAdapter';
import { WebRuntimeAdapter } from '../runtimes/web/webAdapter';
import { RemoteBackendAdapter } from '../runtimes/remote/remoteAdapter';

describe('RuntimeRegistry', () => {
  it('registers and resolves browser and server runtimes correctly', () => {
    const registry = new RuntimeRegistry();
    const pythonAdapter = new PythonRuntimeAdapter();
    const sqlAdapter = new SqlRuntimeAdapter();
    const webAdapter = new WebRuntimeAdapter();
    const remoteAdapter = new RemoteBackendAdapter();

    registry.register(pythonAdapter);
    registry.register(sqlAdapter);
    registry.register(webAdapter);
    registry.register(remoteAdapter);

    // Python resolution
    const resolvedPy = registry.resolveRuntime('python');
    expect(resolvedPy?.id).toBe('browser-python');

    // SQL resolution
    const resolvedSql = registry.resolveRuntime('sql');
    expect(resolvedSql?.id).toBe('browser-sql');

    // Web resolution (html, css, js)
    const resolvedHtml = registry.resolveRuntime('html');
    expect(resolvedHtml?.id).toBe('browser-web');

    const resolvedJs = registry.resolveRuntime('javascript');
    expect(resolvedJs?.id).toBe('browser-web');

    // C/C++ resolution (routes to backend remote)
    const resolvedCpp = registry.resolveRuntime('cpp');
    expect(resolvedCpp?.id).toBe('backend-remote');

    // Server preference override
    const resolvedServerPy = registry.resolveRuntime('python', 'server');
    expect(resolvedServerPy).toBeDefined();

    // Unknown language returns undefined
    const resolvedUnknown = registry.resolveRuntime('fortran');
    expect(resolvedUnknown).toBeUndefined();
  });
});
