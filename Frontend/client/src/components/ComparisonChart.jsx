import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity, History } from 'lucide-react';

const ALGO_COLORS = {
    FCFS: '#38bdf8',
    SJF: '#34d399',
    SRTF: '#a78bfa',
    RR: '#fb923c',
    PRIORITY: '#f87171',
};

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
                <p className="text-slate-300 font-semibold mb-2 truncate max-w-[180px]">{label}</p>
                {payload.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-400">{p.name}:</span>
                        <span className="font-bold font-mono" style={{ color: p.color }}>{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export default function ComparisonChart({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="glass-panel p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Activity className="text-purple-400" size={16} />
                    </div>
                    <h2 className="text-base font-semibold text-white">History Comparison</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                    <History size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No history yet. Run simulations to compare.</p>
                    <p className="text-xs mt-1 text-slate-700">(Requires MongoDB connection)</p>
                </div>
            </div>
        );
    }

    const data = history.slice(0, 10).reverse().map((run) => ({
        name: `${run.algorithm} ${new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        algo: run.algorithm,
        Wait: parseFloat(run.results.averageWaitingTime.toFixed(2)),
        Turnaround: parseFloat(run.results.averageTurnaroundTime.toFixed(2)),
    }));

    return (
        <div className="glass-panel p-6 mt-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Activity className="text-purple-400" size={16} />
                </div>
                <h2 className="text-base font-semibold text-white">History Comparison</h2>
                <span className="badge badge-blue">{data.length} runs</span>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={6} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            angle={-20}
                            textAnchor="end"
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dx={-8}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#94a3b8' }}
                        />
                        <Bar dataKey="Wait" name="Avg Wait" fill="#fb923c" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="Turnaround" name="Avg Turnaround" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
