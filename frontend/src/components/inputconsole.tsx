import React, { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

interface InputConsoleProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export const InputConsole: React.FC<InputConsoleProps> = ({ onSubmit, isLoading = false }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="input-console">
      <div className="panel-card">
        <div className="panel-card__body">
          <p className="panel-card__desc">
            Describe any physical structure — from a simple box to rockets, bridges, or assemblies.
            The sandbox builds a 3D model and runs a physics preview so you can test before building in real life.
          </p>
          <div className="input-console__field">
            <span className="input-console__prefix">&gt;</span>
            <textarea
              ref={textareaRef}
              className="input-console__textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="e.g. build a red box, rocket launch, bridge with pillars..."
              disabled={isLoading}
              rows={2}
            />
            <button
              type="button"
              className="btn btn--icon"
              onClick={handleSubmit}
              disabled={isLoading || !value.trim()}
              title="Compile (Enter)"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="input-console__actions">
            <span className="input-console__hint">
              <kbd>Enter</kbd> compile · <kbd>Shift+Enter</kbd> new line
            </span>
            <button
              type="button"
              className="btn btn--accent"
              onClick={handleSubmit}
              disabled={isLoading || !value.trim()}
            >
              {isLoading ? 'Building…' : 'Build & Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
