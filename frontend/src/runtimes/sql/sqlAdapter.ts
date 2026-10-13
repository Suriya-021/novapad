import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { ExecutionRuntime } from '../contracts/runtime';
import { ExecutionRequest, ExecutionResult, RuntimeCapabilities, SqlQueryResult } from '../../types/execution';
import { getSqlBinary, saveSqlBinary, clearSqlBinary } from '../../storage/db';

export class SqlRuntimeAdapter implements ExecutionRuntime {
  readonly id = 'browser-sql';
  readonly name = 'SQLite (sql.js WebAssembly)';
  readonly supportedLanguages = ['sql'];
  readonly capabilities: RuntimeCapabilities = {
    supportsCancellation: false,
    supportsVirtualFS: false,
    supportsStructuredOutput: true,
    maxExecutionTimeMs: 10000,
  };

  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private currentProjectId = 'default';
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.SQL && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!this.SQL) {
        // Resolve initialization factory
        const initFn =
          typeof initSqlJs === 'function'
            ? initSqlJs
            : (initSqlJs as unknown as { default: (cfg?: unknown) => Promise<SqlJsStatic> }).default;

        if (typeof initFn !== 'function') {
          throw new Error('Failed to resolve sql.js initialization factory.');
        }

        let wasmBinary: ArrayBuffer | undefined;
        try {
          const resp = await fetch('/sql-wasm.wasm');
          if (resp.ok) {
            wasmBinary = await resp.arrayBuffer();
          }
        } catch (fetchErr) {
          console.warn('Could not pre-fetch /sql-wasm.wasm, falling back to locateFile:', fetchErr);
        }

        if (wasmBinary) {
          this.SQL = await initFn({ wasmBinary });
        } else {
          this.SQL = await initFn({
            locateFile: (file: string) => `/${file}`,
          });
        }
      }

      // Check if we have persisted DB for this project
      const savedBinary = await getSqlBinary(`sqlite-${this.currentProjectId}`);
      if (savedBinary) {
        this.db = new this.SQL.Database(savedBinary);
      } else {
        this.db = new this.SQL.Database();
      }
    })();

    try {
      await this.initPromise;
    } catch (err) {
      this.initPromise = null;
      throw err;
    }
  }

  setProjectId(projectId: string): void {
    if (this.currentProjectId !== projectId) {
      this.currentProjectId = projectId;
      // Reinitialize DB for new project if needed
      if (this.SQL) {
        this.db?.close();
        this.db = null;
        this.initPromise = null;
      }
    }
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = performance.now();
    try {
      this.setProjectId(request.projectId);
      await this.initialize();

      if (!this.db) {
        throw new Error('SQLite database engine failed to initialize.');
      }

      const sqlText = request.source.trim();
      if (!sqlText) {
        return {
          requestId: request.requestId,
          status: 'success',
          stdout: 'Empty query executed.',
          stderr: '',
          structuredResults: [],
          durationMs: 0,
        };
      }

      // Execute SQL. sql.js exec returns QueryExecResult[]: [{ columns: string[], values: any[][] }]
      const rawResults = this.db.exec(sqlText);

      const structuredResults: SqlQueryResult[] = rawResults.map((r) => ({
        columns: r.columns,
        values: r.values as (string | number | boolean | null)[][],
      }));

      // Persist modified DB binary to IndexedDB
      try {
        const exported = this.db.export();
        await saveSqlBinary(`sqlite-${this.currentProjectId}`, exported);
      } catch (saveErr) {
        console.warn('Failed to persist SQLite state to IndexedDB:', saveErr);
      }

      let summaryText = '';
      if (structuredResults.length > 0) {
        const totalRows = structuredResults.reduce((acc, curr) => acc + curr.values.length, 0);
        summaryText = `Query executed successfully: ${structuredResults.length} result set(s), ${totalRows} total row(s) returned.\n`;
      } else {
        summaryText = `Statement(s) executed successfully. (0 result rows returned)\n`;
      }

      const durationMs = Math.round(performance.now() - startTime);

      return {
        requestId: request.requestId,
        status: 'success',
        stdout: summaryText,
        stderr: '',
        structuredResults,
        durationMs,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'browser',
          database: 'SQLite 3 (WebAssembly)',
        },
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);

      return {
        requestId: request.requestId,
        status: 'error',
        stdout: '',
        stderr: `SQLite Error: ${message}`,
        durationMs,
        errorCategory: 'runtime',
        errorMessage: message,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'browser',
        },
      };
    }
  }

  async reset(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    await clearSqlBinary(`sqlite-${this.currentProjectId}`);
    if (this.SQL) {
      this.db = new this.SQL.Database();
    }
  }

  async dispose(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.SQL = null;
    this.initPromise = null;
  }
}
