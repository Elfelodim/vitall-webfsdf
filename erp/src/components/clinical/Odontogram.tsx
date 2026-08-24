'use client';

import React, { useState } from 'react';

type ToothState = 'Healthy' | 'Caries' | 'Filled' | 'Absent' | 'Endodontics' | 'Crown';

interface OdontogramProps {
    value: Record<string, ToothState>;
    onChange: (newValue: Record<string, ToothState>) => void;
    readOnly?: boolean;
}

const TOOTH_STATES: { label: string; value: ToothState; color: string }[] = [
    { label: 'Sano', value: 'Healthy', color: '#e2e8f0' }, // Slate-200
    { label: 'Caries', value: 'Caries', color: '#ef4444' }, // Red-500
    { label: 'Obturado', value: 'Filled', color: '#3b82f6' }, // Blue-500
    { label: 'Ausente', value: 'Absent', color: '#1e293b' }, // Slate-800
    { label: 'Endodoncia', value: 'Endodontics', color: '#8b5cf6' }, // Violet-500
    { label: 'Corona', value: 'Crown', color: '#f59e0b' }, // Amber-500
];

export default function Odontogram({ value = {}, onChange, readOnly = false }: OdontogramProps) {
    const [selectedTool, setSelectedTool] = useState<ToothState>('Caries');

    const handleToothClick = (toothId: number) => {
        if (readOnly) return;
        const current = value[toothId] || 'Healthy';
        // If clicking with same tool, toggle back to healthy, else apply tool
        const newState = current === selectedTool ? 'Healthy' : selectedTool;
        onChange({ ...value, [toothId]: newState });
    };

    const renderTooth = (id: number) => {
        const state = value[id] || 'Healthy';
        const config = TOOTH_STATES.find(s => s.value === state) || TOOTH_STATES[0];

        return (
            <div
                key={id}
                onClick={() => handleToothClick(id)}
                className={`tooth-container ${readOnly ? 'readonly' : ''}`}
            >
                <div
                    className="tooth-visual"
                    style={{
                        backgroundColor: state === 'Absent' ? 'transparent' : config.color,
                        borderColor: config.color
                    }}
                >
                    {state === 'Absent' && <span className="absent-x">✕</span>}
                    <span className="tooth-number">{id}</span>
                </div>
            </div>
        );
    };

    const Quadrant = ({ start, end, reverse = false }: { start: number, end: number, reverse?: boolean }) => {
        const teeth = [];
        if (reverse) {
            for (let i = start; i >= end; i--) teeth.push(i);
        } else {
            for (let i = start; i <= end; i++) teeth.push(i);
        }
        return <div className="quadrant">{teeth.map(renderTooth)}</div>;
    };

    return (
        <div className="odontogram-wrapper">
            {!readOnly && (
                <div className="tools-palette">
                    <h4>Herramientas / Estados:</h4>
                    <div className="tools-grid">
                        {TOOTH_STATES.map(tool => (
                            <button
                                key={tool.value}
                                type="button"
                                className={`tool-btn ${selectedTool === tool.value ? 'active' : ''}`}
                                onClick={() => setSelectedTool(tool.value)}
                                style={{ '--tool-color': tool.color } as any}
                            >
                                <span className="color-dot"></span>
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="arch-container">
                <div className="arch upper-arch">
                    <div className="quadrant-label">Superior Derecha (Q1)</div>
                    <div className="quadrant-label">Superior Izquierda (Q2)</div>
                    <Quadrant start={18} end={11} reverse />
                    <Quadrant start={21} end={28} />
                </div>
                <div className="arch lower-arch">
                    <div className="quadrant-label">Inferior Derecha (Q4)</div>
                    <div className="quadrant-label">Inferior Izquierda (Q3)</div>
                    <Quadrant start={48} end={41} reverse />
                    <Quadrant start={31} end={38} />
                </div>
            </div>

            <style jsx>{`
        .odontogram-wrapper {
            padding: 1rem;
            background: #fff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
        }

        .tools-palette {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px dashed #cbd5e1;
        }

        .tools-palette h4 {
            margin-bottom: 0.5rem;
            color: #64748b;
            font-size: 0.9rem;
            text-transform: uppercase;
        }

        .tools-grid {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .tool-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 99px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }

        .tool-btn:hover { background: #f1f5f9; }
        .tool-btn.active {
            background: #eff6ff;
            border-color: #3b82f6;
            color: #1d4ed8;
            font-weight: 600;
            box-shadow: 0 0 0 2px #bfdbfe;
        }

        .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--tool-color);
            border: 1px solid rgba(0,0,0,0.1);
        }

        .arch-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            align-items: center;
        }

        .arch {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            position: relative;
        }
        
        .arch::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 2rem;
            bottom: 0;
            width: 1px;
            background: #cbd5e1;
            transform: translateX(-50%);
        }

        .quadrant {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }

        .quadrant-label {
            text-align: center;
            font-size: 0.75rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tooth-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.1s;
        }

        .tooth-container:not(.readonly):hover {
            transform: scale(1.1);
        }

        .tooth-visual {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 2px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: #f8fafc;
        }

        .tooth-number {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 700;
            background: rgba(255,255,255,0.8);
            padding: 1px 4px;
            border-radius: 4px;
        }

        .absent-x {
            position: absolute;
            font-size: 1.5rem;
            color: #1e293b;
            font-weight: bold;
        }
      `}</style>
        </div>
    );
}
