import React, { useState, useEffect } from 'react';
import { X, Copy, Mail, Check } from 'lucide-react';
import { draftEmail } from '../services/aiService';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    recommendation: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, userId, recommendation }) => {
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId && recommendation) {
            generateDraft();
        } else {
            // Reset state when closed
            setSubject('');
            setBody('');
            setError(null);
            setCopied(false);
        }
    }, [isOpen, userId, recommendation]);

    const generateDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await draftEmail(userId, recommendation);
            setSubject(response.subject);
            setBody(response.body);
        } catch (err) {
            console.error(err);
            setError('Error generando el borrador. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        const fullText = `Asunto: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                    <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        Redacción de Correo Asistida por IA
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Analizando estrategia y redactando correo...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl border border-red-100">
                            <p>{error}</p>
                            <button
                                onClick={generateDraft}
                                className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Asunto</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Cuerpo del Correo</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-gray-700 leading-relaxed"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all transform active:scale-95 ${copied
                                            ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        }`}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailModal;
