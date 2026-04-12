// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Monitor, Download, RefreshCw, CheckCircle, AlertCircle, Cpu, Clock, Zap, GitBranch, Star, Layers, BarChart2, Table2, ChevronDown, ChevronUp, Activity } from 'lucide-react';

const ALGO_META = {
    FCFS: { name: 'First Come First Serve', color: '#38bdf8', icon: <Clock size={14} />, short: 'FCFS' },
    SJF: { name: 'Shortest Job First', color: '#34d399', icon: <Layers size={14} />, short: 'SJF' },
    SRTF: { name: 'Shortest Remaining Time', color: '#a78bfa', icon: <GitBranch size={14} />, short: 'SRTF' },
    RR: { name: 'Round Robin', color: '#fb923c', icon: <Cpu size={14} />, short: 'RR' },
    PRIORITY: { name: 'Priority Scheduling', color: '#f87171', icon: <Star size={14} />, short: 'Priority' },
};

const PROCESS_COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f87171', '#facc15', '#ec4899', '#0ea5e9', '#c084fc', '#4ade80', '#f97316', '#60a5fa', '#fb7185', '#a3e635', '#22d3ee'];

function AlgoResultCard({ algo, result, processMetadata, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const meta = ALGO_META[algo] || { name: algo, color: '#94a3b8', icon: <Activity size={14} />, short: algo };

    if (!result) {
        return (
            <div className="glass-panel p-4 border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    <span className="font-semibold">{meta.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">Engine error</span>
                </div>
            </div>
        );
    }

    const results = result.results || {};
    const metrics = results.metrics || [];
    const avgWait = results.averageWaitingTime;
    const avgTAT = results.averageTurnaroundTime;
    const gantt = results.ganttChart || [];
    const maxTime = gantt.length ? Math.max(...gantt.map(g => g.endTime)) : 0;
    const throughput = maxTime > 0 ? (metrics.length / maxTime).toFixed(3) : '0';

    return (
        <div className="rounded-xl border overflow-hidden transition-all" style={{ borderColor: meta.color + '30', background: `linear-gradient(135deg, ${meta.color}08 0%, transparent 100%)` }}>
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
                <div className="p-1.5 rounded-lg" style={{ background: meta.color + '20', border: `1px solid ${meta.color}30` }}>
                    <span style={{ color: meta.color }}>{meta.icon}</span>
                </div>
                <span className="font-semibold text-sm text-white flex-1 text-left">{meta.name}</span>

                {/* Inline stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs">
                    <div className="text-center">
                        <div className="text-slate-500 uppercase tracking-wider" style={{ fontSize: '9px' }}>Avg Wait</div>
                        <div className="font-bold mono" style={{ color: meta.color }}>{avgWait?.toFixed(2) ?? '—'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-500 uppercase tracking-wider" style={{ fontSize: '9px' }}>Avg TAT</div>
                        <div className="font-bold mono text-white">{avgTAT?.toFixed(2) ?? '—'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-500 uppercase tracking-wider" style={{ fontSize: '9px' }}>Throughput</div>
                        <div className="font-bold mono text-emerald-400">{throughput}</div>
                    </div>
                </div>
                <span className="text-slate-500 ml-2">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Mini Gantt */}
                            {gantt.length > 0 && (
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Execution Timeline — {maxTime} units</div>
                                    <div className="flex h-8 rounded-lg overflow-hidden border border-slate-700/50">
                                        {gantt.map((block, i) => {
                                            const pIdx = parseInt(block.processId.replace(/\D/g, '')) - 1;
                                            const color = PROCESS_COLORS[pIdx % PROCESS_COLORS.length];
                                            const width = ((block.endTime - block.startTime) / maxTime * 100).toFixed(2);
                                            return (
                                                <div
                                                    key={i}
                                                    style={{ width: `${width}%`, backgroundColor: color + 'bb', flexShrink: 0 }}
                                                    className="flex items-center justify-center border-r border-black/20 group relative"
                                                    title={`${block.processId} (${block.startTime}→${block.endTime})`}
                                                >
                                                    <span className="text-white font-bold text-[8px] select-none">{parseFloat(width) > 5 ? block.processId : ''}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Results mini-table */}
                            <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-700/30 text-slate-500 bg-slate-800/30">
                                            <th className="px-3 py-2 text-left">Process</th>
                                            <th className="px-3 py-2 text-left">Real Name</th>
                                            <th className="px-3 py-2 text-right">Completion</th>
                                            <th className="px-3 py-2 text-right">Turnaround</th>
                                            <th className="px-3 py-2 text-right">Waiting</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.map((m, i) => {
                                            const realProc = processMetadata?.find(p => p.id === m.processId);
                                            const pIdx = parseInt(m.processId.replace(/\D/g, '')) - 1;
                                            const color = PROCESS_COLORS[pIdx % PROCESS_COLORS.length];
                                            return (
                                                <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-3 py-1.5 font-mono font-bold" style={{ color }}>{m.processId}</td>
                                                    <td className="px-3 py-1.5 text-slate-400 truncate max-w-[100px]">{realProc?.realName || '—'}</td>
                                                    <td className="px-3 py-1.5 text-right text-slate-400 mono">{m.completionTime}</td>
                                                    <td className="px-3 py-1.5 text-right text-white font-semibold mono">{m.turnaroundTime}</td>
                                                    <td className="px-3 py-1.5 text-right font-bold mono" style={{ color }}>{m.waitingTime}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BestAlgoSummary({ comparisons }) {
    const valid = comparisons.filter(c => {
        const r = c.results?.results;
        return r?.averageWaitingTime != null && !isNaN(r.averageWaitingTime);
    });
    if (valid.length === 0) return null;

    const bestWait = valid.reduce((b, c) => c.results.results.averageWaitingTime < b.results.results.averageWaitingTime ? c : b);
    const bestTAT = valid.reduce((b, c) => c.results.results.averageTurnaroundTime < b.results.results.averageTurnaroundTime ? c : b);

    // Best throughput: most processes / total time
    const withThroughput = valid.map(c => {
        const gantt = c.results.results?.ganttChart || [];
        const maxT = gantt.length ? Math.max(...gantt.map(g => g.endTime)) : 0;
        const n = c.results.results?.metrics?.length || 0;
        return { ...c, throughput: maxT > 0 ? n / maxT : 0 };
    });
    const bestTP = withThroughput.reduce((b, c) => c.throughput > b.throughput ? c : b);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="stat-card p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Zap size={13} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Best Avg Waiting</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400 mono">{bestWait.results.results.averageWaitingTime.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 mt-1">via <span className="text-slate-300 font-medium">{ALGO_META[bestWait.algorithm]?.short || bestWait.algorithm}</span></div>
            </div>
            <div className="stat-card p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <CheckCircle size={13} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Best Turnaround</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400 mono">{bestTAT.results.results.averageTurnaroundTime.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 mt-1">via <span className="text-slate-300 font-medium">{ALGO_META[bestTAT.algorithm]?.short || bestTAT.algorithm}</span></div>
            </div>
            <div className="stat-card p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Activity size={13} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Best Throughput</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mono">{bestTP.throughput.toFixed(3)}</div>
                <div className="text-[10px] text-slate-500 mt-1">via <span className="text-slate-300 font-medium">{ALGO_META[bestTP.algorithm]?.short || bestTP.algorithm}</span></div>
            </div>
        </div>
    );
}

export default function LiveScan({ scanData, onRefresh, onDownload, isPolling }) {
    const hasScan = scanData?.hasScan;

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30">
                        <Monitor className="text-green-400" size={20} />
                        {isPolling && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">Live PC Analysis</h2>
                        <p className="text-xs text-slate-500">Real processes → All 5 algorithms simultaneously</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        <RefreshCw size={12} className={isPolling ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30"
                    >
                        <Download size={13} />
                        Download Scanner
                    </button>
                </div>
            </div>

            {/* Instructions (no scan yet) */}
            {!hasScan && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/30 flex-shrink-0">1</span>
                            Download &amp; Run the Scanner
                        </h3>
                        <ol className="space-y-3 ml-7">
                            {[
                                { step: 'Click "Download Scanner" above', detail: 'Saves SchedSim-Scanner.zip to your Downloads folder' },
                                { step: 'Extract the ZIP file', detail: 'You\'ll find Run-Scanner.bat and SchedSim-Scanner.ps1' },
                                { step: 'Double-click Run-Scanner.bat', detail: 'Runs with PowerShell, scans your top CPU processes' },
                                { step: 'Return here and click "Refresh"', detail: 'Results appear automatically below' },
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-cyan-500 font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                                    <div>
                                        <p className="text-sm text-slate-200 font-medium">{item.step}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {Object.values(ALGO_META).map(m => (
                            <div key={m.short} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                                <span style={{ color: m.color }}>{m.icon}</span>
                                <span className="text-xs text-slate-300 font-medium">{m.short}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-200">The scanner only reads CPU process names and times — no personal data is collected.</p>
                    </div>
                </div>
            )}

            {/* Scan Results */}
            {hasScan && (
                <div>
                    {/* Scan info bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-5 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                        <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-300 font-medium">
                            {scanData.processCount} real processes scanned from <span className="font-bold">{scanData.machineName}</span>
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                            {scanData.scannedAt ? new Date(scanData.scannedAt).toLocaleTimeString() : ''}
                        </span>
                    </div>

                    {/* Process chip list */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {scanData.processMetadata?.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-slate-700/40 bg-slate-800/30">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROCESS_COLORS[i % PROCESS_COLORS.length] }} />
                                <span className="font-mono font-bold text-slate-300">{p.id}</span>
                                <span className="text-slate-500 truncate max-w-[80px]">{p.realName}</span>
                                {p.memoryMB && <span className="text-slate-600">{p.memoryMB}MB</span>}
                            </div>
                        ))}
                    </div>

                    {/* Best algorithm summary */}
                    <BestAlgoSummary comparisons={scanData.comparisons || []} />

                    {/* All 5 algorithm results */}
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">All Algorithm Results — Expand to view details</div>
                        {(scanData.comparisons || []).map((comp, i) => (
                            <AlgoResultCard
                                key={comp.algorithm}
                                algo={comp.algorithm}
                                result={comp}
                                processMetadata={scanData.processMetadata}
                                defaultOpen={i === 0}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
