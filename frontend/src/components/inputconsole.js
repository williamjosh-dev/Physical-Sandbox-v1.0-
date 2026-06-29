import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
export const InputConsole = ({ onSubmit, isLoading = false }) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);
    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || isLoading)
            return;
        onSubmit(trimmed);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [value, isLoading, onSubmit]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    const handleInput = () => {
        const el = textareaRef.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };
    return (_jsx("div", { className: "input-console", children: _jsx("div", { className: "panel-card", children: _jsxs("div", { className: "panel-card__body", children: [_jsx("p", { className: "panel-card__desc", children: "Describe a 3D simulation or shader effect. The LLM compiles GLSL and injects it into the runtime." }), _jsxs("div", { className: "input-console__field", children: [_jsx("span", { className: "input-console__prefix", children: ">" }), _jsx("textarea", { ref: textareaRef, className: "input-console__textarea", value: value, onChange: (e) => setValue(e.target.value), onKeyDown: handleKeyDown, onInput: handleInput, placeholder: "e.g. generate a revolving orbit vortex with green particles...", disabled: isLoading, rows: 2 }), _jsx("button", { type: "button", className: "btn btn--icon", onClick: handleSubmit, disabled: isLoading || !value.trim(), title: "Compile (Enter)", children: _jsx(Send, { size: 16 }) })] }), _jsxs("div", { className: "input-console__actions", children: [_jsxs("span", { className: "input-console__hint", children: [_jsx("kbd", { children: "Enter" }), " compile \u00B7 ", _jsx("kbd", { children: "Shift+Enter" }), " new line"] }), _jsx("button", { type: "button", className: "btn btn--accent", onClick: handleSubmit, disabled: isLoading || !value.trim(), children: isLoading ? 'Compiling…' : 'Compile' })] })] }) }) }));
};
