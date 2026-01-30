import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import EmailModal from './EmailModal';

interface ActionCardProps {
    recommendation: string;
    userId: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ recommendation, userId }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    return (
        <>
            <div className="bg-violet-50 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 md:col-span-3 lg:col-span-1 transform transition hover:scale-[1.02] duration-300">
                <h3 className="font-bold mb-4 flex items-center justify-between text-lg border-b border-violet-200 dark:border-slate-700 pb-2 text-violet-900 dark:text-violet-300">
                    <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        Acción Estratégica
                    </span>
                    <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white px-3 py-1 rounded-lg text-sm transition-all shadow-sm"
                        title="Redactar correo con IA"
                    >
                        <span>📧</span>
                        <span className="font-medium">Redactar</span>
                    </button>
                </h3>
                <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {recommendation}
                </p>
                <div className="mt-4 pt-4 border-t border-violet-200 dark:border-slate-700 text-center">
                    <span className="text-xs uppercase tracking-widest text-violet-400 dark:text-violet-500 font-bold">Generado por IA</span>
                </div>
            </div>

            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                userId={userId}
                recommendation={recommendation}
            />
        </>
    );
};

export default ActionCard;
