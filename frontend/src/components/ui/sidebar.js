import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InputConsole } from '../inputconsole';
import { FeedTerminal } from '../feedterminal';
export const Sidebar = ({ logs, onSubmit, isLoading }) => {
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar__section", children: [_jsx("h2", { className: "panel-label", children: "Core Controls" }), _jsx(InputConsole, { onSubmit: onSubmit, isLoading: isLoading })] }), _jsx("div", { className: "sidebar__section sidebar__section--grow", children: _jsx(FeedTerminal, { logs: logs }) })] }));
};
