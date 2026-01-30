import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpendingChartProps {
    data: Record<string, number>;
}

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#8B5CF6', '#6366F1'];

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    // Calcular el Total
    const totalValue = data ? Object.values(data).reduce((acc, curr) => acc + curr, 0) : 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 h-96 transition-colors duration-300 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribución de Gasto</h3>
            <div className="relative flex-1 flex justify-center items-center min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined, name: any) => [value ? `$${value.toLocaleString()}` : '0', name]}
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f3f4f6',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#f3f4f6' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Central Label (Overlay) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Total</span>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {formatCurrency(totalValue)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SpendingChart;
