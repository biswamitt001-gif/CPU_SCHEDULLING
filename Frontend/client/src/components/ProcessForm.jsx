// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, Download, Upload, Cpu } from 'lucide-react';

// Curated process color palette
const PROCESS_COLORS = [
    { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8', dot: '#38bdf8' },   // cyan
    { bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.4)', text: '#a78bfa', dot: '#a78bfa' }, // violet
    { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)', text: '#34d399', dot: '#34d399' },   // emerald
    { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fb923c', dot: '#fb923c' },   // orange
    { bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)', text: '#f87171', dot: '#f87171' }, // red
    { bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)', text: '#facc15', dot: '#facc15' },   // yellow
    { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', text: '#ec4899', dot: '#ec4899' },   // pink
    { bg: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.4)', text: '#0ea5e9', dot: '#0ea5e9' },   // sky
];

const SAMPLE_SETS = {
    'Sample A': [
        { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
        { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
        { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 2 },
        { id: 'P4', arrivalTime: 3, burstTime: 2, priority: 4 },
    ],
    'Sample B': [
        { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 2 },
        { id: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
        { id: 'P3', arrivalTime: 4, burstTime: 6, priority: 3 },
        { id: 'P4', arrivalTime: 6, burstTime: 2, priority: 1 },
        { id: 'P5', arrivalTime: 8, burstTime: 8, priority: 4 },
    ],
};

export default function ProcessForm({ processes, setProcesses }) {
    const addProcess = () => {
        const newId = `P${processes.length + 1}`;
        setProcesses([...processes, { id: newId, arrivalTime: 0, burstTime: 1, priority: 1 }]);
    };

    const updateProcess = (index, field, value) => {
        const updated = [...processes];
        updated[index] = { ...updated[index], [field]: Number(value) };
        setProcesses(updated);
    };

    const removeProcess = (index) => {
        const filtered = processes.filter((_, i) => i !== index);
        setProcesses(filtered.map((p, i) => ({ ...p, id: `P${i + 1}` })));
    };

    const loadSample = (sampleName) => {
        setProcesses(SAMPLE_SETS[sampleName]);
    };

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Cpu className="text-violet-400" size={16} />
                    </div>
                    <h2 className="text-base font-semibold text-white">Processes</h2>
                    <span className="badge badge-blue">{processes.length}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {Object.keys(SAMPLE_SETS).map(name => (
                        <button
                            key={name}
                            onClick={() => loadSample(name)}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-all hover:bg-white/5"
                        >
                            <Download size={12} /> {name}
                        </button>
                    ))}
                    <button
                        onClick={addProcess}
                        disabled={processes.length >= 15}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >
                        <Plus size={14} /> Add Process
                    </button>
                </div>
            </div>

            {/* Column headers */}
            {processes.length > 0 && (
                <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-3 px-3 mb-2">
                    <div />
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 text-center">Arrival</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 text-center">Burst</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 text-center">Priority</div>
                    <div />
                </div>
            )}

            {/* Process list */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                    {processes.map((p, i) => {
                        const color = PROCESS_COLORS[i % PROCESS_COLORS.length];
                        const maxBurst = Math.max(...processes.map(x => x.burstTime), 1);
                        const barWidth = Math.max(5, (p.burstTime / maxBurst) * 100);

                        return (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-xl border overflow-hidden"
                                style={{ borderColor: color.border, background: color.bg }}
                            >
                                <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-3 items-center px-3 py-2.5">
                                    {/* ID */}
                                    <div className="font-mono font-bold text-sm text-center" style={{ color: color.text }}>
                                        {p.id}
                                    </div>

                                    {/* Arrival */}
                                    <input
                                        type="number"
                                        min="0"
                                        value={p.arrivalTime}
                                        onChange={(e) => updateProcess(i, 'arrivalTime', e.target.value)}
                                        className="input-field"
                                    />

                                    {/* Burst with bar */}
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            value={p.burstTime}
                                            onChange={(e) => updateProcess(i, 'burstTime', e.target.value)}
                                            className="input-field"
                                        />
                                        {/* mini burst bar */}
                                        <div className="progress-bar absolute bottom-0 left-0 right-0 rounded-none">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${barWidth}%`, backgroundColor: color.text }}
                                            />
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <input
                                        type="number"
                                        min="1"
                                        value={p.priority}
                                        onChange={(e) => updateProcess(i, 'priority', e.target.value)}
                                        className="input-field"
                                    />

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeProcess(i)}
                                        className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        aria-label={`Remove ${p.id}`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {processes.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-slate-600"
                    >
                        <Upload size={28} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No processes. Load a sample or add one manually.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
