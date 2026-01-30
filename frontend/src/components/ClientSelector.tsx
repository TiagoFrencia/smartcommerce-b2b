import React, { useEffect, useState } from 'react';
import { getClients, createClient, updateClient, deleteClient, type Client } from '../services/aiService';
import { Plus, X, Settings, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface ClientSelectorProps {
    onClientSelect: (clientId: number | null) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ onClientSelect }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false); // Used for Create and Edit
    const [showManageModal, setShowManageModal] = useState(false);

    // Form State (Create / Edit)
    const [isEditing, setIsEditing] = useState(false);
    const [currentClientId, setCurrentClientId] = useState<number | null>(null);
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete Confirmation
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await getClients();
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = Number(e.target.value);
        setSelectedClientId(clientId);
        onClientSelect(clientId);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setNewClientName('');
        setNewClientEmail('');
        setCurrentClientId(null);
        setShowCreateModal(true);
    };

    const openEditModal = (client: Client) => {
        setIsEditing(true);
        setNewClientName(client.name);
        setNewClientEmail(client.contactEmail || '');
        setCurrentClientId(client.id);
        setShowCreateModal(true);
        setShowManageModal(false); // Close manage modal
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing && currentClientId) {
                // Update
                const updatedClient = await updateClient(currentClientId, {
                    name: newClientName,
                    contactEmail: newClientEmail
                });
                // Update local list
                setClients(prev => prev.map(c => c.id === currentClientId ? updatedClient : c));
                // If the selected client was updated, reflect changes? No need to re-select explicitly but UI updates.
            } else {
                // Create
                const newClient = await createClient({
                    name: newClientName,
                    contactEmail: newClientEmail
                });
                await fetchClients(); // Refresh full list
                setSelectedClientId(newClient.id);
                onClientSelect(newClient.id);
            }
            setShowCreateModal(false);
            if (isEditing) setShowManageModal(true); // Re-open manage modal if we were editing
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Error al guardar cliente. Verifique los datos o si ya existe.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (client: Client) => {
        setClientToDelete(client);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await deleteClient(clientToDelete.id);

            // If deleted client was selected, deselect
            // Check against both selectedClientId state (which might be '' or number)
            if (selectedClientId === clientToDelete.id) {
                setSelectedClientId('');
                onClientSelect(null);
            } else {
                // Only filter if we didn't deselect (though filtering is always good to keep list in sync)
                setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            }

            // Always update the list locally to remove the item instantly
            if (selectedClientId === clientToDelete.id) {
                setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            }

            setClientToDelete(null);
        } catch (error) {
            console.error("Error deleting client:", error);
            // Don't alert if it's just a 204 issue that wasn't caught, 
            // but we expect deleteClient to handle it now.
            // Only alert on real errors
            alert("Error al eliminar cliente.");
        }
    };

    if (loading) {
        return <div className="text-gray-400 text-sm">Cargando clientes...</div>;
    }

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="client-select" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Seleccionar Cliente (Cartera)
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowManageModal(true)}
                        className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm font-medium"
                        title="Gestionar mis clientes"
                    >
                        <Settings className="w-3 h-3" />
                        Gestionar
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-3 h-3" /> Nuevo
                    </button>
                </div>
            </div>

            <div className="relative group">
                <select
                    id="client-select"
                    value={selectedClientId}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white transition-all hover:border-indigo-300 cursor-pointer appearance-none"
                >
                    <option value="" disabled className="dark:bg-slate-800">-- Elija un cliente --</option>
                    {clients.length === 0 && <option value="" disabled className="dark:bg-slate-800">No tienes clientes aún</option>}
                    {clients.map((client) => (
                        <option key={client.id} value={client.id} className="dark:bg-slate-800">
                            {client.name} {client.contactEmail ? `(${client.contactEmail})` : ''}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Manage Clients Modal */}
            {showManageModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-hidden flex flex-col transition-colors duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Gestionar Mis Clientes
                            </h3>
                            <button onClick={() => setShowManageModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2">
                            {clients.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay clientes registrados.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {clients.map(client => (
                                        <li key={client.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-slate-200">{client.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">{client.contactEmail || 'Sin email'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(client)}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(client)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => { setShowManageModal(false); openCreateModal(); }}
                                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Registrar Nuevo Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Client Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                            </h3>
                            <button onClick={() => { setShowCreateModal(false); if (isEditing) setShowManageModal(true); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Ej: Tech Solutions Inc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email de Contacto (Opcional)</label>
                                <input
                                    type="email"
                                    value={newClientEmail}
                                    onChange={(e) => setNewClientEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="contacto@empresa.com"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); if (isEditing) setShowManageModal(true); }}
                                    className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cliente')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {clientToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transition-colors duration-300">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Eliminar Cliente?</h3>
                        <p className="text-gray-600 dark:text-slate-300 text-sm mb-6">
                            Estás a punto de eliminar a <strong>{clientToDelete.name}</strong>.
                            <br /><br />
                            <span className="font-bold text-red-600 dark:text-red-400">ESTA ACCIÓN ES IRREVERSIBLE.</span>
                            <br />
                            Se borrarán todos sus pedidos y análisis históricos.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setClientToDelete(null)}
                                className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-lg shadow-red-600/30"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSelector;
