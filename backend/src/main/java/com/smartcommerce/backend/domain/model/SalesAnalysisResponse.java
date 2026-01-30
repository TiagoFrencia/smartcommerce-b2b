package com.smartcommerce.backend.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record SalesAnalysisResponse(
        @JsonProperty("resumen_ejecutivo") String resumenEjecutivo,
        @JsonProperty("score_oportunidad") Integer scoreOportunidad,
        List<String> alertas,
        @JsonProperty("accion_recomendada") String accionRecomendada) {
}
