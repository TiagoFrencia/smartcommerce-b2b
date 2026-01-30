import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { getAnalysisHistory } from '../services/aiService';
import type { SalesAnalysis } from '../types/api';

interface HistoryPanelProps {
    userId: number;
    onSelect: (analysis: SalesAnalysis) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ userId, onSelect }) => {
    const [history, setHistory] = useState<SalesAnalysis[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await getAnalysisHistory(userId);
                setHistory(data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    if (loading) return <div className="text-gray-400 text-sm animate-pulse">Cargando historial...</div>;
    if (history.length === 0) return <div className="text-gray-400 text-sm italic">Sin análisis previos.</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Historial de Análisis</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 group flex items-center justify-between"
                    >
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                                {new Date(item.createdAt).toLocaleDateString()} - {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.score >= 8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    item.score > 5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    Score: {item.score}/10
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
