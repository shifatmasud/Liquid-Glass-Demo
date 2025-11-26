
import React, { useEffect, useRef } from 'react';
import { Theme } from '../../utils/theme';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'action' | 'system';
}

interface ConsoleProps {
  logs: LogEntry[];
}

export const Console: React.FC<ConsoleProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px', 
      height: '100%',
      justifyContent: 'flex-start' 
    }}>
      {logs.length === 0 && (
        <div style={{ ...Theme.Type.Readable.Code.M, color: Theme.Color.Base.Content[3], textAlign: 'center', marginTop: '20px' }}>
          _
        </div>
      )}
      
      {logs.map((log, index) => (
        <div 
          key={log.id} 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 1fr',
            gap: '12px', 
            ...Theme.Type.Readable.Code.M,
            fontSize: '11px',
            opacity: Math.max(0.4, 1 - (logs.length - 1 - index) * 0.1), // Fade old logs
          }}
        >
          <span style={{ color: Theme.Color.Base.Content[3], textAlign: 'right' }}>
            {log.timestamp.split(' ')[0]}
          </span>
          <span style={{ 
            color: log.type === 'action' ? '#79C0FF' : 
                   log.type === 'system' ? '#E2E8F0' : 
                   Theme.Color.Base.Content[2],
            wordBreak: 'break-word'
          }}>
            {log.type === 'system' && <span style={{ color: Theme.Color.Fixed.Warning, marginRight: '8px' }}>➜</span>}
            {log.message}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
