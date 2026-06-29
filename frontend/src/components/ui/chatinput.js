import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
export const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading)
            return;
        onSendMessage(input);
        setInput('');
    };
    return (_jsxs("div", { className: "flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-100", children: [_jsxs("div", { className: "p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50", children: [_jsx(Sparkles, { className: "text-sky-400 w-5 h-5" }), _jsx("h1", { className: "font-bold text-sm tracking-wide uppercase text-slate-300", children: "4D Sandbox Workspace" })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [messages.map((msg) => (_jsxs("div", { className: `flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`, children: [_jsx("div", { className: `p-2 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-sky-600' : 'bg-slate-800'}`, children: msg.sender === 'user' ? _jsx(User, { size: 16 }) : _jsx(Bot, { size: 16 }) }), _jsx("div", { className: `p-3 rounded-xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-sky-500/20 text-sky-100 border border-sky-500/30' : 'bg-slate-900 text-slate-300 border border-slate-800'}`, children: msg.text })] }, msg.id))), isLoading && (_jsxs("div", { className: "flex gap-3 max-w-[85%] animate-pulse", children: [_jsx("div", { className: "p-2 h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center", children: _jsx(Bot, { size: 16 }) }), _jsx("div", { className: "p-3 rounded-xl text-sm bg-slate-900 border border-slate-800 text-slate-500", children: "Generating object parameters..." })] }))] }), _jsx("form", { onSubmit: handleSubmit, className: "p-4 border-t border-slate-800 bg-slate-900/30", children: _jsxs("div", { className: "flex gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-sky-500 transition-colors", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask LLM to build a red sphere or neon torus...", className: "flex-1 bg-transparent text-sm text-slate-100 focus:outline-none", disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading, className: "text-slate-400 hover:text-sky-400 disabled:opacity-50 transition-colors", children: _jsx(Send, { size: 18 }) })] }) })] }));
};
