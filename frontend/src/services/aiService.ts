import axios from 'axios';
import type { SalesAnalysisResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8080/api';
const AI_API_URL = `${API_BASE_URL}/ai`;

// Add request interceptor to include token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Client Types
export interface Client {
    id: number;
    name: string;
    industry?: string;
    contactEmail?: string;
    tier?: string;
}

export interface UserSummary {
    id: number;
    name: string;
    email: string;
}

/**
 * Capa de abstracción para la API de IA.
 * Implementa un manejo de errores silencioso (Fail-silent) para que
 * la interfaz gráfica siga funcionando incluso si el motor de IA no responde.
 */
export const analyzeOrders = async (orderIds: number[]): Promise<SalesAnalysisResponse> => {
    const response = await axios.post(`${AI_API_URL}/analyze-orders`, orderIds);
    return response.data;
};

export const sendChatMessage = async (orderIds: number[], message: string): Promise<{ reply: string }> => {
    const response = await axios.post(`${AI_API_URL}/chat`, { orderIds, message });
    return response.data;
};

export const getClients = async (): Promise<Client[]> => {
    const response = await axios.get(`${API_BASE_URL}/clients`);
    return response.data;
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    const response = await axios.post(`${API_BASE_URL}/clients`, client);
    return response.data;
};

export const updateClient = async (id: number, client: Omit<Client, 'id'>): Promise<Client> => {
    const response = await axios.put(`${API_BASE_URL}/clients/${id}`, client);
    return response.data;
};

export const deleteClient = async (id: number): Promise<void> => {
    // Avoid parsing JSON for 204 No Content to prevent SyntaxError
    await axios.delete(`${API_BASE_URL}/clients/${id}`, {
        transformResponse: [(data) => data]
    });
};

export const getUsersWithOrders = async (): Promise<UserSummary[]> => {
    const response = await axios.get(`${API_BASE_URL}/users/with-orders`);
    return response.data;
};

export const getOrderIdsByClient = async (clientId: number): Promise<number[]> => {
    const response = await axios.get(`${API_BASE_URL}/orders/client/${clientId}/ids`);
    return response.data;
};

export const getAnalysisHistory = async (clientId: number): Promise<import('../types/api').SalesAnalysis[]> => {
    const response = await axios.get(`${API_BASE_URL}/analysis/history/${clientId}`);
    return response.data;
};

export const simulateScenario = async (request: import('../types/api').SimulationRequest): Promise<import('../types/api').SimulationResponse> => {
    const response = await axios.post(`${AI_API_URL}/simulate`, request);
    return response.data;
};

export const getAnalytics = async (clientId: number): Promise<import('../types/api').AnalyticsDTO> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/${clientId}`);
    return response.data;
};

export const downloadReport = async (clientId: number): Promise<void> => {
    const response = await axios.get(`${API_BASE_URL}/reports/export/${clientId}`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_ejecutivo.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const draftEmail = async (userId: number, recommendation: string): Promise<import('../types/api').EmailDraftResponse> => {
    const response = await axios.post(`${AI_API_URL}/draft-email`, { userId, recommendation });
    return response.data;
};
