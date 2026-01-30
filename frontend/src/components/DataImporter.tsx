import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';

const DataImporter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8080/api/data/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setStatus('success');
            setMessage(`¡Éxito! Se han importado ${response.data.ordersImported} órdenes.`);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('error');
            setMessage('Error al importar el archivo. Verifica el formato e inténtalo de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "Fecha,Cliente,Producto,Cantidad,Precio Unitario\n2023-01-15,Empresa Demo S.A.,Laptop Pro X1,5,1200.00\n2023-02-20,Empresa Demo S.A.,Monitor 4K,10,350.50\n2023-03-10,Tech Corp,Teclado Mecánico,20,85.00";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'plantilla_ventas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 transition-all hover:shadow-xl duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Importar Ventas Históricas
            </h3>

            <div className="space-y-4">
                <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300 ${file ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-violet-400'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />

                    {file ? (
                        <>
                            <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2" />
                            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-gray-400 dark:text-slate-500 mb-2" />
                            <p className="font-medium text-gray-600 dark:text-slate-300">Arrastra tu archivo CSV aquí o haz clic para seleccionar</p>
                            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Soporta: .csv</p>
                        </>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={downloadTemplate}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla CSV
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {uploading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Cargar Datos
                            </>
                        )}
                    </button>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200 animate-fade-in-up">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Importación Completada</p>
                            <p className="text-sm opacity-90">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200 animate-bounce-short">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Error en la Importación</p>
                            <p className="text-sm opacity-90">{message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataImporter;
