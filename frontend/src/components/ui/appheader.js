import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RotateCcw } from 'lucide-react';
export const AppHeader = ({ onReset }) => {
    return (_jsxs("header", { className: "app-header", children: [_jsxs("div", { className: "app-header__brand", children: [_jsx("span", { className: "app-header__dot" }), _jsx("h1", { className: "app-header__title", children: "4D Sandbox Engine" }), _jsx("span", { className: "app-header__version", children: "v1.0" })] }), _jsx("div", { className: "app-header__actions", children: _jsxs("button", { type: "button", className: "btn btn--ghost", onClick: onReset, children: [_jsx(RotateCcw, { size: 14 }), "Reset Runtime"] }) })] }));
};
