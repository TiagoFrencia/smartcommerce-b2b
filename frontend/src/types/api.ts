export interface SalesAnalysisResponse {
    resumen_ejecutivo: string;
    score_oportunidad: number;
    alertas: string[];
    accion_recomendada: string;
}

export interface SalesAnalysis {
    id: number;
    userId: number;
    score: number;
    executiveSummary: string;
    recommendation: string;
    alerts: string[];
    createdAt: string;
}

export interface SimulationRequest {
    userId: number;
    discountPercentage: number;
    contractDurationMonths: number;
}

export interface SimulationResponse {
    acceptanceProbability: number;
    financialImpact: string;
    explanation: string;
}

export interface AnalyticsDTO {
    salesByCategory: Record<string, number>;
    monthlySales: Record<string, number>;
}

export interface EmailDraftRequest {
    userId: number;
    recommendation: string;
}

export interface EmailDraftResponse {
    subject: string;
    body: string;
}
