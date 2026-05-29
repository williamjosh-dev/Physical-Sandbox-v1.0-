import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ControlPanel({ currentFrame, totalFrames, onFrameChange, isPlaying, setIsPlaying }) {
    if (totalFrames <= 0)
        return null;
    return (_jsxs("div", { style: {
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '600px',
            backgroundColor: 'rgba(11, 11, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #00ffcc',
            borderRadius: '6px',
            padding: '15px',
            color: '#00ffcc',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        }, children: [_jsx("button", { onClick: () => setIsPlaying(!isPlaying), style: {
                    backgroundColor: '#00ffcc',
                    color: '#0b0b1a',
                    border: 'none',
                    padding: '5px 12px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                }, children: isPlaying ? 'PAUSE' : 'PLAY' }), _jsxs("div", { style: { flexGrow: 1, display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("span", { children: "0s" }), _jsx("input", { type: "range", min: 0, max: totalFrames - 1, value: currentFrame, onChange: (e) => onFrameChange(parseInt(e.target.value)), style: {
                            flexGrow: 1,
                            accentColor: '#00ffcc',
                            cursor: 'pointer'
                        } }), _jsxs("span", { children: ["FRAME: ", currentFrame, "/", totalFrames] })] })] }));
}
