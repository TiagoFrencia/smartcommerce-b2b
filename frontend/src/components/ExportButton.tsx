import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { downloadReport } from '../services/aiService';

interface ExportButtonProps {
    userId: number;
    disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ userId, disabled }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (disabled || downloading) return;

        setDownloading(true);
        try {
            await downloadReport(userId);
        } catch (error) {
            console.error('Error downloading report with Blob, trying fallback...', error);
            // Fallback: Try opening direct URL since it is now public
            window.open(`http://localhost:8080/api/reports/export/${userId}`, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={disabled || downloading}
            className={`
                flex items-center gap-2 px-4 py-2 
                bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300
                rounded-lg font-medium shadow-sm 
                hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/50
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${downloading ? 'cursor-wait' : ''}
            `}
            title="Descargar Informe Ejecutivo PDF"
        >
            {downloading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : (
                <FileText className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{downloading ? 'Descargando...' : 'Reporte PDF'}</span>
            {!downloading && <Download className="w-3 h-3 opacity-50" />}
        </button>
    );
};

export default ExportButton;
