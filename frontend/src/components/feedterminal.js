import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
export const FeedTerminal = ({ logs }) => {
    const scrollRef = useRef(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (el)
            el.scrollTop = el.scrollHeight;
    }, [logs]);
    return (_jsxs("div", { className: "feed-terminal", children: [_jsxs("div", { className: "feed-terminal__header", children: [_jsx("h2", { className: "panel-label", children: "Runtime Execution Stream" }), _jsx("span", { className: "feed-terminal__pulse", title: "Live" })] }), _jsx("div", { className: "feed-terminal__body", ref: scrollRef, children: logs.map((log) => (_jsxs("div", { className: `log-entry log-entry--${log.level}`, children: [_jsx("span", { className: "log-entry__time", children: formatTime(log.timestamp) }), _jsx("span", { className: "log-entry__symbol", children: ">" }), _jsx("span", { className: "log-entry__text", children: log.text })] }, log.id))) })] }));
};
