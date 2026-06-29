import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface FeedTerminalProps {
  logs: LogEntry[];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const FeedTerminal: React.FC<FeedTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="feed-terminal">
      <div className="feed-terminal__header">
        <h2 className="panel-label">Runtime Execution Stream</h2>
        <span className="feed-terminal__pulse" title="Live" />
      </div>
      <div className="feed-terminal__body" ref={scrollRef}>
        {logs.map((log) => (
          <div key={log.id} className={`log-entry log-entry--${log.level}`}>
            <span className="log-entry__time">{formatTime(log.timestamp)}</span>
            <span className="log-entry__symbol">&gt;</span>
            <span className="log-entry__text">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
