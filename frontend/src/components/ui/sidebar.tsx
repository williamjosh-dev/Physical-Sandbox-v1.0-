import React from 'react';
import { InputConsole } from '../inputconsole';
import { FeedTerminal } from '../feedterminal';
import { LogEntry } from '../../types';

interface SidebarProps {
  logs: LogEntry[];
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ logs, onSubmit, isLoading }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h2 className="panel-label">Core Controls</h2>
        <InputConsole onSubmit={onSubmit} isLoading={isLoading} />
      </div>
      <div className="sidebar__section sidebar__section--grow">
        <FeedTerminal logs={logs} />
      </div>
    </aside>
  );
};
