import { Settings, Clock, Cpu, GitBranch, Layers, Star } from 'lucide-react';

const ALGOS = [
    {
        id: 'FCFS',
        name: 'First Come First Serve',
        short: 'FCFS',
        icon: <Clock size={18} />,
        color: 'text-cyan-400',
        bg: 'from-cyan-500/10 to-cyan-500/5',
        border: 'border-cyan-500/30',
        type: 'Non-Preemptive',
        desc: 'Processes execute in arrival order. Simple but may cause convoy effect.',
    },
    {
        id: 'SJF',
        name: 'Shortest Job First',
        short: 'SJF',
        icon: <Layers size={18} />,
        color: 'text-emerald-400',
        bg: 'from-emerald-500/10 to-emerald-500/5',
        border: 'border-emerald-500/30',
        type: 'Non-Preemptive',
        desc: 'Picks the shortest burst-time job. Optimal average waiting time.',
    },
    {
        id: 'SRTF',
        name: 'Shortest Remaining Time',
        short: 'SRTF',
        icon: <GitBranch size={18} />,
        color: 'text-violet-400',
        bg: 'from-violet-500/10 to-violet-500/5',
        border: 'border-violet-500/30',
        type: 'Preemptive',
        desc: 'Preemptive SJF. Context switches when a shorter job arrives.',
    },
    {
        id: 'RR',
        name: 'Round Robin',
        short: 'RR',
        icon: <Cpu size={18} />,
        color: 'text-orange-400',
        bg: 'from-orange-500/10 to-orange-500/5',
        border: 'border-orange-500/30',
        type: 'Preemptive',
        desc: 'Each process gets a fixed time quantum. Fair and widely used.',
    },
    {
        id: 'PRIORITY',
        name: 'Priority Scheduling',
        short: 'Priority',
        icon: <Star size={18} />,
        color: 'text-rose-400',
        bg: 'from-rose-500/10 to-rose-500/5',
        border: 'border-rose-500/30',
        type: 'Non-Preemptive',
        desc: 'Highest-priority process runs first (lower number = higher priority).',
    },
];

export default function AlgorithmSelector({ algorithm, setAlgorithm, timeQuantum, setTimeQuantum }) {
    const selected = ALGOS.find(a => a.id === algorithm);

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Settings className="text-cyan-400" size={16} />
                </div>
                <h2 className="text-base font-semibold text-white">Algorithm</h2>
            </div>

            <div className="space-y-2">
                {ALGOS.map(algo => (
                    <button
                        key={algo.id}
                        onClick={() => setAlgorithm(algo.id)}
                        className={`algo-card w-full text-left p-3 flex items-center gap-3 ${algorithm === algo.id ? 'selected' : ''}`}
                    >
                        <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${algo.bg} border ${algorithm === algo.id ? algo.border : 'border-transparent'}`}>
                            <span className={algo.color}>{algo.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{algo.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-500">{algo.type}</span>
                            </div>
                        </div>
                        {algorithm === algo.id && (
                            <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400`} />
                        )}
                    </button>
                ))}
            </div>

            {selected && (
                <div className={`mt-4 p-3 rounded-xl bg-gradient-to-br ${selected.bg} border ${selected.border}`}>
                    <p className="text-xs text-slate-300 leading-relaxed">{selected.desc}</p>
                </div>
            )}

            {algorithm === 'RR' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                        Time Quantum: <span className="text-orange-400 font-mono font-bold">{timeQuantum}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={timeQuantum}
                        onChange={(e) => setTimeQuantum(Number(e.target.value))}
                        className="w-full accent-orange-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                        <span>1</span><span>10</span><span>20</span>
                    </div>
                </div>
            )}
        </div>
    );
}
