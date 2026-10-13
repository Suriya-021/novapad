import { ExecutionRuntime } from '../contracts/runtime';
import { ExecutionRequest, ExecutionResult, RuntimeCapabilities } from '../../types/execution';

export class WebRuntimeAdapter implements ExecutionRuntime {
  readonly id = 'browser-web';
  readonly name = 'Web Sandbox (HTML/CSS/JS Preview)';
  readonly supportedLanguages = ['html', 'javascript', 'css'];
  readonly capabilities: RuntimeCapabilities = {
    supportsCancellation: false,
    supportsVirtualFS: true,
    supportsStructuredOutput: false,
    maxExecutionTimeMs: 5000,
  };

  private currentBlobUrl: string | null = null;
  public onConsoleLog?: (level: 'log' | 'error' | 'warn', message: string) => void;

  async initialize(): Promise<void> {
    // Web adapter is ready immediately
  }

  // Compose HTML, CSS, JS with safe console & error capture bridge
  public buildPreviewHtml(files: Record<string, string>, activeSource: string, activeLanguage: string): string {
    let htmlContent = files['index.html'] || '';
    let cssContent = files['styles.css'] || '';
    let jsContent = files['script.js'] || '';

    // If active file is one of them and not in files map yet, override
    if (activeLanguage === 'html' && activeSource) {
      htmlContent = activeSource;
    } else if (activeLanguage === 'css' && activeSource) {
      cssContent = activeSource;
    } else if (activeLanguage === 'javascript' && activeSource) {
      jsContent = activeSource;
    }

    if (!htmlContent) {
      htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Web Playground</title></head>
<body>
  <div id="root">
    <h1>Web Playground</h1>
    <p>Add HTML, CSS, or JS files to preview your application.</p>
  </div>
</body>
</html>`;
    }

    // Bootstrap injection script for console interception and uncaught error capture
    const bootstrapScript = `
<script>
  (function() {
    function sendLog(level, args) {
      try {
        var str = Array.prototype.slice.call(args).map(function(item) {
          if (typeof item === 'object') {
            try { return JSON.stringify(item); } catch(e) { return String(item); }
          }
          return String(item);
        }).join(' ');
        window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: level, message: str }, '*');
      } catch (err) {}
    }

    var originalLog = console.log;
    var originalWarn = console.warn;
    var originalError = console.error;

    console.log = function() {
      sendLog('log', arguments);
      originalLog.apply(console, arguments);
    };
    console.warn = function() {
      sendLog('warn', arguments);
      originalWarn.apply(console, arguments);
    };
    console.error = function() {
      sendLog('error', arguments);
      originalError.apply(console, arguments);
    };

    window.onerror = function(message, source, lineno, colno, error) {
      var errStr = message + (lineno ? ' (Line: ' + lineno + ')' : '');
      window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'error', message: errStr }, '*');
      return false;
    };
  })();
</script>
`;

    // Inject CSS
    const styleInjection = cssContent ? `<style>\n${cssContent}\n</style>` : '';
    // Inject JS
    const scriptInjection = jsContent ? `<script>\n${jsContent}\n</script>` : '';

    let fullHtml = htmlContent;

    // Strip relative stylesheet and script tags for styles.css and script.js so the browser doesn't attempt to load them from the blob: URL
    fullHtml = fullHtml.replace(/<link\b[^>]*href=["']styles\.css["'][^>]*>/gi, '');
    fullHtml = fullHtml.replace(/<script\b[^>]*src=["']script\.js["'][^>]*>\s*<\/script>/gi, '');

    // Insert bootstrap script and CSS into <head> if exists, else prepend
    if (fullHtml.includes('</head>')) {
      fullHtml = fullHtml.replace('</head>', `${bootstrapScript}\n${styleInjection}\n</head>`);
    } else {
      fullHtml = `${bootstrapScript}\n${styleInjection}\n${fullHtml}`;
    }

    // Insert JS before </body> if exists, else append
    if (fullHtml.includes('</body>')) {
      fullHtml = fullHtml.replace('</body>', `${scriptInjection}\n</body>`);
    } else {
      fullHtml = `${fullHtml}\n${scriptInjection}`;
    }

    return fullHtml;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = performance.now();
    try {
      // Revoke prior blob URL to avoid memory leaks
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }

      const files = request.files || {};
      const fullHtml = this.buildPreviewHtml(files, request.source, request.language);

      const blob = new Blob([fullHtml], { type: 'text/html' });
      this.currentBlobUrl = URL.createObjectURL(blob);

      const durationMs = Math.round(performance.now() - startTime);

      return {
        requestId: request.requestId,
        status: 'success',
        stdout: 'Web preview updated successfully.\nSandboxed iframe rendered.',
        stderr: '',
        durationMs,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'browser',
          previewUrl: this.currentBlobUrl,
        },
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        requestId: request.requestId,
        status: 'error',
        stdout: '',
        stderr: `Failed to compile web preview: ${msg}`,
        durationMs,
        errorCategory: 'runtime',
        errorMessage: msg,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'browser',
        },
      };
    }
  }

  getCurrentPreviewUrl(): string | null {
    return this.currentBlobUrl;
  }

  async dispose(): Promise<void> {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
