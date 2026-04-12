// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Table2, Trophy, TrendingUp, Clock, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

// Count-up animation
function CountUp({ value, decimals = 2, duration = 1100 }) {
    const [display, setDisplay] = useState('0.' + '0'.repeat(decimals));
    const frameRef = useRef(null);

    useEffect(() => {
        const start = performance.now();
        const end = parseFloat(value);
        if (isNaN(end)) return;

        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay((eased * end).toFixed(decimals));
            if (t < 1) frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, decimals, duration]);

    return <span>{display}</span>;
}

const PROCESS_COLORS = [
    '#38bdf8', '#a78bfa', '#34d399', '#fb923c',
    '#f87171', '#facc15', '#ec4899', '#0ea5e9',
];
function getColor(processId) {
    const num = parseInt(processId.replace(/\D/g, '')) - 1;
    return PROCESS_COLORS[isNaN(num) ? 0 : num % PROCESS_COLORS.length];
}

export default function ResultsTable({ metrics, averages }) {
    const [sortBy, setSortBy] = useState('processId');
    const [sortDir, setSortDir] = useState('asc');

    if (!metrics || metrics.length === 0) return null;

    const maxCompletionTime = Math.max(...metrics.map(m => m.completionTime));
    const throughput = maxCompletionTime > 0 ? (metrics.length / maxCompletionTime).toFixed(3) : '0';
    const minWait = Math.min(...metrics.map(m => m.waitingTime));
    const maxWait = Math.max(...metrics.map(m => m.waitingTime));

    const statCards = [
        {
            label: 'Avg Turnaround',
            value: averages.averageTurnaroundTime,
            icon: <TrendingUp size={15} />,
            color: 'text-cyan-400',
            colorHex: '#38bdf8',
            bg: 'from-cyan-500/10',
            border: 'border-cyan-500/20',
            suffix: 'units',
        },
        {
            label: 'Avg Waiting',
            value: averages.averageWaitingTime,
            icon: <Clock size={15} />,
            color: 'text-orange-400',
            colorHex: '#fb923c',
            bg: 'from-orange-500/10',
            border: 'border-orange-500/20',
            suffix: 'units',
        },
        {
            label: 'CPU Throughput',
            value: throughput,
            icon: <Zap size={15} />,
            color: 'text-emerald-400',
            colorHex: '#34d399',
            bg: 'from-emerald-500/10',
            border: 'border-emerald-500/20',
            suffix: 'proc/unit',
            decimals: 3,
        },
    ];

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
    };

    const sorted = [...metrics].sort((a, b) => {
        const mul = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'processId') return mul * a.processId.localeCompare(b.processId);
        return mul * (a[sortBy] - b[sortBy]);
    });

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <Minus size={10} className="opacity-20" />;
        return sortDir === 'asc' ? <ArrowUp size={10} className="text-cyan-400" /> : <ArrowDown size={10} className="text-cyan-400" />;
    };

    const waitRange = maxWait - minWait;

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Table2 className="text-violet-400" size={16} />
                </div>
                <h2 className="text-base font-semibold text-white">Execution Results</h2>
                <span className="badge badge-blue">{metrics.length} processes</span>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className={`stat-card p-4 bg-gradient-to-br ${card.bg} to-transparent border ${card.border}`}
                    >
                        <div className={`flex items-center gap-1.5 ${card.color} mb-2`}>
                            {card.icon}
                            <span className="text-[10px] uppercase tracking-widest font-semibold">{card.label}</span>
                        </div>
                        <div className={`text-2xl font-bold mono ${card.color}`}>
                            <CountUp value={card.value} decimals={card.decimals ?? 2} />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{card.suffix}</div>
                        {/* Mini sparkline bar */}
                        <div className="progress-bar mt-3">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, parseFloat(card.value) * 8)}%` }}
                                transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                                style={{ background: `linear-gradient(90deg, ${card.colorHex}60, ${card.colorHex})` }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/40">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700/40 bg-slate-800/25">
                            {[
                                { key: 'processId', label: 'Process' },
                                { key: 'completionTime', label: 'Completion' },
                                { key: 'turnaroundTime', label: 'Turnaround' },
                                { key: 'waitingTime', label: 'Waiting' },
                            ].map(col => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-300 transition-colors select-none"
                                    onClick={() => toggleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <SortIcon col={col.key} />
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 text-center">Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((m, i) => {
                            const color = getColor(m.processId);
                            const isBest = m.waitingTime === minWait;
                            const isWorst = m.waitingTime === maxWait && metrics.length > 1;
                            const waitFraction = waitRange > 0 ? (m.waitingTime - minWait) / waitRange : 0;

                            return (
                                <motion.tr
                                    key={m.processId}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.05 }}
                                    className={`
                                        border-b border-slate-700/25 transition-colors
                                        ${isBest ? 'bg-yellow-500/5 hover:bg-yellow-500/8' : 'hover:bg-slate-800/35'}
                                    `}
                                >
                                    {/* Process */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-offset-1 ring-offset-transparent"
                                                style={{ backgroundColor: color, ringColor: color + '40' }}
                                            />
                                            <span className="font-mono font-bold text-sm" style={{ color }}>{m.processId}</span>
                                        </div>
                                    </td>

                                    {/* Completion */}
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-slate-400 mono text-sm">{m.completionTime}</span>
                                    </td>

                                    {/* Turnaround */}
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-white font-semibold mono text-sm">{m.turnaroundTime}</span>
                                    </td>

                                    {/* Waiting with heat bar */}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Heat bar */}
                                            <div className="w-14 h-1.5 rounded-full bg-slate-700/50 overflow-hidden hidden sm:block">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${waitFraction * 100}%`,
                                                        background: `linear-gradient(90deg, #34d399, #fb923c ${waitFraction * 100}%, #f87171)`,
                                                    }}
                                                />
                                            </div>
                                            <span className="font-bold mono text-sm" style={{ color }}>{m.waitingTime}</span>
                                        </div>
                                    </td>

                                    {/* Badge */}
                                    <td className="px-4 py-3 text-center">
                                        {isBest && (
                                            <span className="badge badge-gold">
                                                <Trophy size={9} /> Best
                                            </span>
                                        )}
                                        {isWorst && !isBest && (
                                            <span className="badge" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                                Slow
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer note */}
            <p className="text-[10px] text-slate-600 mt-3 text-right">Click column headers to sort · Heat bar shows relative waiting time</p>
        </div>
    );
}
