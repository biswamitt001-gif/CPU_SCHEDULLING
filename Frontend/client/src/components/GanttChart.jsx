// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Maximize2, Minimize2, Info } from 'lucide-react';
import { useState } from 'react';

const PROCESS_COLORS = [
    '#38bdf8', '#a78bfa', '#34d399', '#fb923c',
    '#f87171', '#facc15', '#ec4899', '#0ea5e9',
];

function getColor(processId) {
    const num = parseInt(processId.replace(/\D/g, '')) - 1;
    return PROCESS_COLORS[isNaN(num) ? 0 : num % PROCESS_COLORS.length];
}

// Build ruler tick marks
function RulerTicks({ ganttData, maxTime }) {
    const ticks = new Set();
    ganttData.forEach(b => { ticks.add(b.startTime); ticks.add(b.endTime); });
    const sortedTicks = [...ticks].sort((a, b) => a - b);

    return (
        <div className="relative h-5 mt-1" style={{ marginLeft: 0, marginRight: 0 }}>
            {sortedTicks.map(t => {
                const pct = (t / maxTime) * 100;
                return (
                    <span
                        key={t}
                        className="absolute top-0 text-[9px] text-slate-500 mono select-none"
                        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                    >
                        {t}
                    </span>
                );
            })}
        </div>
    );
}

export default function GanttChart({ ganttData }) {
    const [compact, setCompact] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!ganttData || ganttData.length === 0) return null;

    const maxTime = Math.max(...ganttData.map(d => d.endTime));
    const uniqueProcesses = [...new Set(ganttData.map(d => d.processId))];

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <BarChart2 className="text-cyan-400" size={16} />
                    </div>
                    <h2 className="text-base font-semibold text-white">Execution Timeline</h2>
                    <span className="badge badge-blue mono">{maxTime} units</span>
                    <span className="badge badge-violet mono">{ganttData.length} slices</span>
                </div>
                <button
                    onClick={() => setCompact(c => !c)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-500 transition-all"
                >
                    {compact ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                    {compact ? 'Expand' : 'Compact'}
                </button>
            </div>

            {/* Gantt bar */}
            <div className="relative">
                <div
                    className={`relative w-full ${compact ? 'h-10' : 'h-16'} rounded-xl border border-slate-700/50 flex overflow-hidden transition-all duration-300`}
                    style={{ background: 'rgba(5,10,22,0.6)' }}
                >
                    {ganttData.map((block, index) => {
                        const duration = block.endTime - block.startTime;
                        const widthPercent = (duration / maxTime) * 100;
                        const color = getColor(block.processId);
                        const isHovered = hoveredIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: `${widthPercent}%`, opacity: 1 }}
                                transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
                                className="h-full flex items-center justify-center border-r border-black/30 flex-shrink-0 cursor-pointer relative overflow-visible"
                                style={{
                                    backgroundColor: color + (isHovered ? 'dd' : '88'),
                                    transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {!compact && widthPercent > 3.5 && (
                                    <span className="text-white font-bold text-[11px] drop-shadow-md select-none z-10">
                                        {block.processId}
                                    </span>
                                )}

                                {/* Tooltip — renders on top, overflow visible */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.12 }}
                                            className="absolute z-50 pointer-events-none"
                                            style={{
                                                bottom: compact ? '130%' : '115%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                            }}
                                        >
                                            <div className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 whitespace-nowrap shadow-2xl text-xs">
                                                <div className="font-bold mb-0.5" style={{ color }}>{block.processId}</div>
                                                <div className="text-slate-300">
                                                    <span className="text-slate-500">Start</span> {block.startTime}
                                                    <span className="mx-1.5 text-slate-600">→</span>
                                                    <span className="text-slate-500">End</span> {block.endTime}
                                                </div>
                                                <div className="text-slate-400">
                                                    <span className="text-slate-500">Burst</span>{' '}
                                                    <span className="font-bold mono" style={{ color }}>{duration}</span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="flex justify-center">
                                                <div className="w-2 h-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-600" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Time ruler ticks */}
                <RulerTicks ganttData={ganttData} maxTime={maxTime} />
            </div>

            {/* Legend + info */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
                {uniqueProcesses.map(pid => {
                    const color = getColor(pid);
                    const slices = ganttData.filter(g => g.processId === pid);
                    const totalTime = slices.reduce((sum, g) => sum + (g.endTime - g.startTime), 0);
                    return (
                        <div
                            key={pid}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40 group cursor-default"
                            title={`${pid}: ${slices.length} slice(s), total ${totalTime} units`}
                        >
                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-mono font-semibold" style={{ color }}>{pid}</span>
                            <span className="text-[9px] text-slate-600 group-hover:text-slate-500 transition-colors mono">{totalTime}u</span>
                        </div>
                    );
                })}
                <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
                    <Info size={10} />
                    <span>Hover blocks for details</span>
                </div>
            </div>
        </div>
    );
}
