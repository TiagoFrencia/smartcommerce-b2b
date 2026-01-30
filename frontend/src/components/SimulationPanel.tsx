import React, { useState } from 'react';
import { simulateScenario } from '../services/aiService';
import type { SimulationResponse } from '../types/api';
import { Sparkles, DollarSign, Calendar } from 'lucide-react';

interface SimulationPanelProps {
    userId: number;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ userId }) => {
    const [discount, setDiscount] = useState<number>(10);
    const [duration, setDuration] = useState<number>(12);
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<SimulationResponse | null>(null);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await simulateScenario({
                userId,
                discountPercentage: discount,
                contractDurationMonths: duration
            });
            setResult(response);
        } catch (error) {
            console.error("Error simulating scenario:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <h3 className="text-gray-800 dark:text-white font-bold mb-6 flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Simulador de Escenarios
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Descuento Propuesto: <span className="font-bold text-indigo-600 dark:text-indigo-400">{discount}%</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={discount}
                        onChange={(e) => setDiscount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        style={{ backgroundSize: `${(discount / 50) * 100}% 100%` }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Duración del Contrato
                    </label>
                    <select
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                    >
                        <option value={12}>12 Meses (1 Año)</option>
                        <option value={24}>24 Meses (2 Años)</option>
                        <option value={36}>36 Meses (3 Años)</option>
                    </select>
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Simular Impacto
                        </>
                    )}
                </button>
            </div>

            {result && (
                <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-700/50 dark:to-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3 border-b border-indigo-100 dark:border-indigo-800 pb-2">
                        <span className="text-sm font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Probabilidad</span>
                        <span className={`text-2xl font-extrabold ${result.acceptanceProbability > 70 ? 'text-green-600 dark:text-green-400' : result.acceptanceProbability > 40 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                            {result.acceptanceProbability}%
                        </span>
                    </div>

                    <div className="mb-3">
                        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Impacto Financiero</span>
                        <p className={`font-bold ${result.financialImpact.toLowerCase().includes('rentable') ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-slate-300'}`}>
                            {result.financialImpact}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Análisis</span>
                        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mt-1">
                            {result.explanation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationPanel;
