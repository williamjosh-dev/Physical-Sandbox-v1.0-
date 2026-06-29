import React from 'react';
import { RotateCcw } from 'lucide-react';

interface AppHeaderProps {
  onReset: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onReset }) => {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__dot" />
        <h1 className="app-header__title">4D Sandbox Engine</h1>
        <span className="app-header__version">v1.0</span>
      </div>
      <div className="app-header__actions">
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          <RotateCcw size={14} />
          Reset Runtime
        </button>
      </div>
    </header>
  );
};
