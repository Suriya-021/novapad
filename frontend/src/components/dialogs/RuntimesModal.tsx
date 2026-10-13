import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { ExecutionRuntime } from '../../runtimes/contracts/runtime';
import { RemoteBackendAdapter } from '../../runtimes/remote/remoteAdapter';

interface RuntimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  runtimes: ExecutionRuntime[];
  onResetRuntime: (runtimeId: string) => void;
}

export const RuntimesModal: React.FC<RuntimesModalProps> = ({
  isOpen,
  onClose,
  runtimes,
  onResetRuntime,
}) => {
  const [backendHealth, setBackendHealth] = useState<{
    checking: boolean;
    online: boolean;
    compilers?: Record<string, boolean>;
    error?: string;
  }>({ checking: false, online: false });

  const checkRemoteHealth = async () => {
    const remote = runtimes.find((r) => r.id === 'backend-remote') as RemoteBackendAdapter | undefined;
    if (!remote) return;

    setBackendHealth({ checking: true, online: false });
    try {
      const health = await remote.checkHealth();
      setBackendHealth({
        checking: false,
        online: health.status === 'ok',
        compilers: health.compilers,
      });
    } catch (e) {
      setBackendHealth({
        checking: false,
        online: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkRemoteHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '560px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Runtime Environments & Capabilities</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {runtimes.map((r) => {
            const isRemote = r.id === 'backend-remote';
            return (
              <div
                key={r.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-sidebar)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {r.name}
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: isRemote ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: isRemote ? '#c084fc' : '#38bdf8',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isRemote ? 'Backend Service' : 'Browser Engine'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isRemote && (
                      <button
                        onClick={checkRemoteHealth}
                        title="Check Backend Health"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '3px',
                        }}
                      >
                        <RefreshCw size={13} className={backendHealth.checking ? 'animate-spin' : ''} />
                      </button>
                    )}
                    {r.reset && (
                      <button
                        onClick={() => onResetRuntime(r.id)}
                        title="Reset Runtime State"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '3px',
                        }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', gap: '16px' }}>
                  <div>
                    Languages: <strong>{r.supportedLanguages.join(', ')}</strong>
                  </div>
                  <div>
                    VFS Support: <strong>{r.capabilities.supportsVirtualFS ? 'Yes' : 'No'}</strong>
                  </div>
                  <div>
                    Max Timeout: <strong>{r.capabilities.maxExecutionTimeMs / 1000}s</strong>
                  </div>
                </div>

                {isRemote && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-tab)',
                      fontSize: '11px',
                    }}
                  >
                    {backendHealth.checking ? (
                      <span style={{ color: 'var(--text-muted)' }}>Probing FastAPI service...</span>
                    ) : backendHealth.online ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                        <CheckCircle2 size={13} />
                        <span>Connected to backend. Available compilers: {Object.keys(backendHealth.compilers || {}).filter(k => backendHealth.compilers?.[k]).join(', ') || 'Process Runner'}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)' }}>
                        <AlertCircle size={13} />
                        <span>{backendHealth.error || 'Backend execution server is unreachable.'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
