import { describe, it, expect } from 'vitest';
import { WebRuntimeAdapter } from '../runtimes/web/webAdapter';

describe('WebRuntimeAdapter', () => {
  it('correctly constructs preview HTML with script injection and console bridge', () => {
    const adapter = new WebRuntimeAdapter();
    const files = {
      'index.html': '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>',
      'styles.css': 'h1 { color: red; }',
      'script.js': 'console.log("Hello from script");',
    };

    const compiled = adapter.buildPreviewHtml(files, files['index.html'], 'html');

    expect(compiled).toContain('<title>Test</title>');
    expect(compiled).toContain('h1 { color: red; }');
    expect(compiled).toContain('console.log("Hello from script");');
    expect(compiled).toContain('PREVIEW_CONSOLE'); // Console bridge exists
  });

  it('generates fallback HTML when index.html is missing', () => {
    const adapter = new WebRuntimeAdapter();
    const compiled = adapter.buildPreviewHtml({}, '', 'plaintext');
    expect(compiled).toContain('Web Playground');
  });
});
