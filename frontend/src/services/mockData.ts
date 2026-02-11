import type { SalesAnalysisResponse, SalesAnalysis, SimulationResponse, AnalyticsDTO, EmailDraftResponse } from '../types/api';
import type { Client, UserSummary } from './aiService';

export const mockClients: Client[] = [
    { id: 1, name: "TechSolutions CR", industry: "Tecnología", contactEmail: "contacto@techsolutions.cr", tier: "Gold" },
    { id: 2, name: "Distribuidora El Sol", industry: "Retail", contactEmail: "ventas@elsol.com", tier: "Silver" },
    { id: 3, name: "Constructora Moderna", industry: "Construcción", contactEmail: "info@cmoderna.com", tier: "Platinum" },
    { id: 4, name: "Farmacias Saludables", industry: "Salud", contactEmail: "adquisiciones@fsalud.com", tier: "Silver" },
    { id: 5, name: "Importadora Global", industry: "Logística", contactEmail: "global@import.com", tier: "Gold" }
];

export const mockUsers: UserSummary[] = [
    { id: 1, name: "Juan Pérez", email: "juan.perez@techsolutions.cr" },
    { id: 2, name: "María González", email: "maria.gonzalez@elsol.com" },
    { id: 3, name: "Carlos Rodríguez", email: "carlos.r@cmoderna.com" },
    { id: 4, name: "Ana Ramírez", email: "ana.ramirez@fsalud.com" },
    { id: 5, name: "Luis Fernandez", email: "luis.f@import.com" }
];

export const mockOrderIds: number[] = [1001, 1002, 1003, 1004, 1005];

export const mockAnalysisResponse: SalesAnalysisResponse = {
    resumen_ejecutivo: "El cliente muestra una tendencia de compra creciente del 15% en el último trimestre. Se detecta interés en nuevas líneas de productos premium.",
    score_oportunidad: 85,
    alertas: ["Posible churn por retraso en entrega reciente", "Oportunidad de upsell en licencias de software"],
    accion_recomendada: "Ofrecer descuento del 10% en renovación anual y presentar el nuevo módulo de analítica."
};

export const mockChatResponse = {
    reply: "Basado en el historial de pedidos, este cliente prefiere entregas a principios de mes. Recomiendo contactarlo el próximo lunes con una oferta personalizada."
};

export const mockAnalysisHistory: SalesAnalysis[] = [
    {
        id: 101,
        userId: 1,
        score: 85,
        executiveSummary: "Tendencia positiva. Alto potencial de renovación.",
        recommendation: "Ofrecer plan anual.",
        alerts: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
    },
    {
        id: 102,
        userId: 1,
        score: 72,
        executiveSummary: "Estabilidad en compras. Sin cambios significativos.",
        recommendation: "Mantener contacto regular.",
        alerts: ["Ligera disminución en volumen"],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
    }
];

export const mockSimulationResponse: SimulationResponse = {
    acceptanceProbability: 78,
    financialImpact: "+$12,500 USD anual",
    explanation: "El descuento propuesto del 15% es atractivo para el cliente dado su historial de sensibilidad al precio, y la duración de 24 meses asegura un flujo de caja constante."
};

export const mockAnalytics: AnalyticsDTO = {
    salesByCategory: {
        "Hardware": 45000,
        "Software": 32000,
        "Servicios": 15000,
        "Soporte": 8000
    },
    monthlySales: {
        "Ene": 12000,
        "Feb": 15000,
        "Mar": 11000,
        "Abr": 18000,
        "May": 22000,
        "Jun": 20000
    }
};

export const mockEmailDraft: EmailDraftResponse = {
    subject: "Propuesta exclusiva para renovación de servicios - TechSolutions CR",
    body: "Estimado Juan,\n\nEspero que este correo te encuentre bien. Analizando su historial con nosotros, hemos preparado una oferta especial para la renovación de sus servicios...\n\nQuedo atento a tus comentarios.\n\nSaludos,\nTu Ejecutivo de Cuenta"
};
