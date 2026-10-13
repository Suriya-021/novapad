import React, { useState } from 'react';
import { SqlQueryResult } from '../../types/execution';
import { Table, Copy, Check } from 'lucide-react';

interface SqlResultTableProps {
  results: SqlQueryResult[] | undefined;
}

export const SqlResultTable: React.FC<SqlResultTableProps> = ({ results }) => {
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!results || results.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontSize: '13px',
          gap: '8px',
        }}
      >
        <Table size={24} />
        <span>No SQL results to display. Run a SELECT query to view structured data.</span>
      </div>
    );
  }

  const currentSet = results[Math.min(activeSetIndex, results.length - 1)];

  const copyAsCsv = () => {
    if (!currentSet) return;
    const header = currentSet.columns.join(',');
    const rows = currentSet.values.map((r) => r.map((c) => JSON.stringify(c ?? '')).join(','));
    const csv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-editor)' }}>
      {/* Result set tabs & toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {results.map((set, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSetIndex(idx)}
              style={{
                background: activeSetIndex === idx ? 'var(--bg-tab-active)' : 'transparent',
                color: activeSetIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: activeSetIndex === idx ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Result Set {idx + 1} ({set.values.length} rows)
            </button>
          ))}
        </div>

        <button
          onClick={copyAsCsv}
          title="Copy as CSV"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
          }}
        >
          {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
          <span>{copied ? 'Copied CSV' : 'Copy CSV'}</span>
        </button>
      </div>

      {/* Table view */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tab)', borderBottom: '2px solid var(--border-subtle)' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', width: '40px', color: 'var(--text-muted)' }}>#</th>
              {currentSet.columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRight: '1px solid var(--border-subtle)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentSet.values.length === 0 ? (
              <tr>
                <td
                  colSpan={currentSet.columns.length + 1}
                  style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  0 rows returned.
                </td>
              </tr>
            ) : (
              currentSet.values.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <td style={{ padding: '6px 10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    {rowIdx + 1}
                  </td>
                  {row.map((val, cellIdx) => (
                    <td
                      key={cellIdx}
                      style={{
                        padding: '6px 12px',
                        color: val === null ? 'var(--text-muted)' : 'var(--text-primary)',
                        borderRight: '1px solid var(--border-subtle)',
                      }}
                    >
                      {val === null ? <i>NULL</i> : String(val)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
