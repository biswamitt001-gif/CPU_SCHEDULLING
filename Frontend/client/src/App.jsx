import { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ProcessForm from './components/ProcessForm';
import AlgorithmSelector from './components/AlgorithmSelector';
import GanttChart from './components/GanttChart';
import ResultsTable from './components/ResultsTable';
import ComparisonChart from './components/ComparisonChart';
import LiveScan from './components/LiveScan';
import { computeSchedule, getHistory, getScanResult, downloadScanner } from './api';
import {
  Play, RotateCcw, BarChart2, Table2, History,
  AlertCircle, X, Monitor, ChevronRight
} from 'lucide-react';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: BarChart2 },
  { id: 'results', label: 'Results', icon: Table2 },
  { id: 'history', label: 'History', icon: History },
  { id: 'pcscan', label: 'Live PC Scan', icon: Monitor, green: true },
];

/* ── Toast ─────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm"
    >
      <div className="glass-panel border-red-500/30 px-5 py-4 shadow-2xl flex items-start gap-3 w-full">
        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">{message}</p>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0">
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Skeleton loader ────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse pt-4">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-4 w-4 bg-slate-700 rounded" />
          <div className="h-4 w-36 bg-slate-700 rounded" />
          <div className="h-4 w-16 bg-slate-700 rounded-full ml-2" />
        </div>
        <div className="h-16 bg-slate-800/50 rounded-xl mb-6" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-5 w-10 bg-slate-700 rounded-full" />)}
        </div>
      </div>
      <div className="glass-panel p-6">
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[1, 2, 3].map(i => <div key={i} className="h-24 stat-card bg-slate-800/30" />)}
        </div>
        <div className="h-40 bg-slate-800/30 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Empty results state ────────────────────────────────── */
function EmptyState({ tab, onRunClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel p-12 text-center mt-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
        <BarChart2 size={24} className="text-slate-600" />
      </div>
      <p className="text-slate-400 font-medium mb-1">No simulation results yet</p>
      <p className="text-xs text-slate-600 mb-5">Configure your processes, select an algorithm, then run</p>
      <button
        onClick={onRunClick}
        className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 hover:border-cyan-500/50 px-4 py-2 rounded-lg"
      >
        <Play size={12} fill="currentColor" /> Run Simulation
        <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}

/* ── Main App ───────────────────────────────────────────── */
export default function App() {
  const [processes, setProcesses] = useState([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 2 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 1 },
  ]);

  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  // PC Scan
  const [scanData, setScanData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [hasScanOnce, setHasScanOnce] = useState(false);
  const pollRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try { setHistory(await getHistory()); }
    catch { /* MongoDB offline — silently ignore */ }
  }, []);

  const fetchScanResult = useCallback(async () => {
    try {
      const data = await getScanResult();
      setScanData(data);
      if (data?.hasScan) {
        setHasScanOnce(true);
        setIsPolling(false);
        clearInterval(pollRef.current);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Poll on PC Scan tab
  useEffect(() => {
    if (activeTab === 'pcscan') {
      fetchScanResult();
      if (!hasScanOnce) {
        setIsPolling(true);
        pollRef.current = setInterval(fetchScanResult, 3000);
      }
    } else {
      clearInterval(pollRef.current);
      setIsPolling(false);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, hasScanOnce, fetchScanResult]);

  const handleSimulate = async () => {
    if (!processes.length) { setError('Add at least one process first.'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await computeSchedule({ algorithm, timeQuantum, processes });
      setResults(data.results);
      setActiveTab('timeline');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Simulation failed. Is the Java engine running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProcesses([
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 2 },
      { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 1 },
    ]);
    setResults(null);
    setError(null);
    setActiveTab('timeline');
  };

  const handleRefreshScan = () => {
    setIsPolling(true);
    setHasScanOnce(false);
    clearInterval(pollRef.current);
    fetchScanResult();
    pollRef.current = setInterval(fetchScanResult, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <Navbar />

      <main className="px-4 md:px-8">
        {/* ── Top section: Sidebar + Processes ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 mb-5">

          {/* Left sidebar */}
          <div className="space-y-4">
            <AlgorithmSelector
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              timeQuantum={timeQuantum}
              setTimeQuantum={setTimeQuantum}
            />

            {/* CTA buttons */}
            <div className="glass-panel p-4 space-y-3">
              <button
                id="run-simulation-btn"
                onClick={handleSimulate}
                disabled={loading || !processes.length}
                className="
                                    btn-run w-full flex items-center justify-center gap-2
                                    bg-gradient-to-r from-cyan-600 to-blue-600
                                    hover:from-cyan-500 hover:to-blue-500
                                    disabled:from-slate-700 disabled:to-slate-700
                                    text-white font-bold py-3.5 rounded-xl
                                    shadow-lg shadow-cyan-900/40
                                    transition-all active:scale-[0.98]
                                    disabled:cursor-not-allowed disabled:opacity-50
                                "
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Simulating…
                  </>
                ) : (
                  <>
                    <Play size={17} fill="white" />
                    Run Simulation
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="
                                    w-full flex items-center justify-center gap-2
                                    bg-slate-800/70 hover:bg-slate-700/70
                                    text-slate-400 hover:text-white
                                    font-medium py-2.5 rounded-xl
                                    border border-slate-700/60 hover:border-slate-500
                                    transition-all
                                "
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          {/* Process form */}
          <ProcessForm processes={processes} setProcesses={setProcesses} />
        </div>

        {/* ── Tab bar ─────────────────────────────── */}
        <div className="glass-panel-sm px-3 py-2 mb-5 flex items-center gap-1 w-fit border border-slate-700/40">
          {TABS.map(({ id, label, icon: Icon, green }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-btn flex items-center gap-1.5 ${activeTab === id ? 'active' : ''} ${green ? 'tab-pcscan' : ''}`}
            >
              <Icon size={13} />
              {label}
              {id === 'pcscan' && isPolling && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              )}
              {id === 'pcscan' && scanData?.hasScan && !isPolling && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Live PC Scan */}
          {activeTab === 'pcscan' && (
            <motion.div
              key="pcscan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LiveScan
                scanData={scanData}
                onRefresh={handleRefreshScan}
                onDownload={downloadScanner}
                isPolling={isPolling}
              />
            </motion.div>
          )}

          {/* Simulation tabs */}
          {activeTab !== 'pcscan' && loading && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton />
            </motion.div>
          )}

          {activeTab === 'timeline' && !loading && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {results
                ? <GanttChart ganttData={results.ganttChart} />
                : <EmptyState tab="timeline" onRunClick={handleSimulate} />
              }
            </motion.div>
          )}

          {activeTab === 'results' && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {results
                ? <ResultsTable
                  metrics={results.metrics}
                  averages={{
                    averageTurnaroundTime: results.averageTurnaroundTime,
                    averageWaitingTime: results.averageWaitingTime,
                  }}
                />
                : <EmptyState tab="results" onRunClick={handleSimulate} />
              }
            </motion.div>
          )}

          {activeTab === 'history' && !loading && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ComparisonChart history={history} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {error && <Toast key="toast" message={error} onClose={() => setError(null)} />}
      </AnimatePresence>
    </div>
  );
}
