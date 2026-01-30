import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, AlertTriangle, CheckCircle, Brain, TrendingUp, LogOut, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { analyzeOrders, getOrderIdsByClient, getAnalytics } from '../services/aiService';
import type { SalesAnalysisResponse, SalesAnalysis, AnalyticsDTO } from '../types/api';
import SpendingChart from './SpendingChart';
import TrendChart from './TrendChart';
import ChatWidget from './ChatWidget';
import ClientSelector from './ClientSelector';
import HistoryPanel from './HistoryPanel';
import SimulationPanel from './SimulationPanel';
import ExportButton from './ExportButton';
import DataImporter from './DataImporter';
import ActionCard from './ActionCard';

/**
 * Orquestador principal de la vista.
 * Gestiona el estado global de la selección de clientes y sincroniza las métricas
 * en tiempo real evitando el parpadeo (flickering) de datos.
 */
const Dashboard: React.FC = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useDarkMode();
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<SalesAnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [orderIds, setOrderIds] = useState<number[]>([]);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsDTO | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    /**
     * Limpia preventivamente el estado del cliente seleccionado al detectar una eliminación
     * para evitar condiciones de carrera (Race Conditions) y errores 404 en la API.
     */
    const handleClientSelect = async (clientId: number | null) => {
        if (clientId === null) {
            setSelectedClientId(null);
            setData(null);
            setAnalyticsData(null);
            setOrderIds([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);
        setAnalyticsData(null);
        setSelectedClientId(clientId);
        try {
            // Import dynamically or assume it's available. logic update:
            // getOrderIdsByUserId -> getOrderIdsByClient
            // getAnalytics -> getAnalytics(clientId)
            const [ids, analytics] = await Promise.all([
                getOrderIdsByClient(clientId),
                getAnalytics(clientId)
            ]);
            setOrderIds(ids);
            setAnalyticsData(analytics);
        } catch (err) {
            setError('Error al cargar datos del cliente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (orderIds.length === 0) {
            setError('No hay órdenes para analizar. Seleccione un cliente con historial.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await analyzeOrders(orderIds);
            setData(result);
        } catch (err) {
            setError('Error al conectar con el servicio de IA. Asegúrate de que el backend esté corriendo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySelect = (analysis: SalesAnalysis) => {
        setData({
            resumen_ejecutivo: analysis.executiveSummary,
            score_oportunidad: analysis.score,
            alertas: analysis.alerts,
            accion_recomendada: analysis.recommendation
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'bg-green-100 text-green-800 border-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        if (score > 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    };

    return (
        <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-8 py-4 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                Dashboard de Inteligencia B2B
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Análisis predictivo estratégico</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Hola, {user.firstName || user.email.split('@')[0]}</span>
                                <span className="text-xs text-slate-400 capitalize">{user.roles?.[0] || 'Admin'}</span>
                            </div>
                        )}
                        {selectedClientId && (
                            <ExportButton userId={selectedClientId} disabled={loading} />
                        )}
                        <button
                            onClick={toggleTheme}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            title={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-indigo-600" />
                            )}
                        </button>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="md:col-span-2 space-y-6">
                        <ClientSelector onClientSelect={handleClientSelect} />

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || orderIds.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:shadow-indigo-900/20"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Analizando Datos...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-6 h-6" />
                                    {orderIds.length > 0 ? `Analizar ${orderIds.length} Ventas con IA` : 'Seleccione un Cliente'}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        {selectedClientId && (
                            <>
                                <HistoryPanel userId={selectedClientId} onSelect={handleHistorySelect} />
                                <div className="animate-fade-in-up delay-100">
                                    <SimulationPanel userId={selectedClientId} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3 mb-8 animate-bounce-short">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {analyticsData && (
                    <div className="mb-10 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Métricas Clave
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SpendingChart data={analyticsData.salesByCategory} />
                            <TrendChart data={analyticsData.monthlySales} />
                        </div>
                    </div>
                )}

                {data && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {/* Score Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Score de Oportunidad
                            </h3>
                            <div className={`w-36 h-36 rounded-full flex items-center justify-center text-5xl font-extrabold border-[6px] transition-all duration-1000 ${getScoreColor(data.score_oportunidad)}`}>
                                {data.score_oportunidad}<span className="text-lg text-opacity-50 font-normal self-end mb-8 ml-1">/10</span>
                            </div>
                            <p className="mt-6 text-sm text-slate-400 font-medium">Probabilidad de Cierre</p>
                        </div>

                        {/* Alerts Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 md:col-span-2 lg:col-span-2 transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Alertas y Puntos de Atención
                            </h3>
                            {data.alertas && data.alertas.length > 0 ? (
                                <div className="space-y-3">
                                    {data.alertas.map((alerta, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm">
                                            <div className="min-w-[6px] h-[6px] rounded-full bg-amber-500 mt-2"></div>
                                            <span className="font-medium text-sm leading-relaxed">{alerta}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-green-600 dark:text-green-300 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5" /> No se detectaron riesgos críticos.
                                </p>
                            )}
                        </div>

                        {/* Executive Summary */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 md:col-span-3 lg:col-span-2 transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                Resumen Ejecutivo
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 leading-relaxed text-justify relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-lg opacity-20"></div>
                                {data.resumen_ejecutivo}
                            </div>
                        </div>

                        {/* Recommendation */}
                        <ActionCard
                            recommendation={data.accion_recomendada}
                            userId={selectedClientId || 0}
                        />
                    </div>
                )}

                {/* Contextual Chat Widget */}
                {orderIds.length > 0 && <ChatWidget orderIds={orderIds} />}

                {/* Admin Tools Section */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <span className="text-xl">⚡</span> Herramientas Administrativas
                    </h3>
                    <div className="max-w-3xl">
                        <DataImporter />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
