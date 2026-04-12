import { Cpu, Zap, Activity } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="glass-panel sticky top-4 z-50 px-6 py-3 mx-4 md:mx-8 mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="pulse-ring relative bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 p-2.5 rounded-xl border border-cyan-500/30">
                        <Cpu className="text-cyan-400" size={22} />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight leading-none">
                        <span className="text-white">Sched</span><span className="shimmer-text">Sim</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">CPU Scheduler</p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <Zap size={13} className="text-yellow-400" />
                    <span className="text-xs">5 Algorithms</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                    <Activity size={13} className="text-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">All Systems Ready</span>
                </div>
                <div className="w-px h-4 bg-slate-700" />
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    aria-label="GitHub"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>
            </div>
        </nav>
    );
}
