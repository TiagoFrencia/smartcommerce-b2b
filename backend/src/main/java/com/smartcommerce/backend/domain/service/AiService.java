package com.smartcommerce.backend.domain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcommerce.backend.domain.dto.AiContextDTO;
import com.smartcommerce.backend.domain.model.Order;
import com.smartcommerce.backend.domain.model.OrderItem;
import com.smartcommerce.backend.domain.model.SalesAnalysisResponse;
import com.smartcommerce.backend.domain.dto.EmailDraftRequest;
import com.smartcommerce.backend.domain.dto.EmailDraftResponse;
import com.smartcommerce.backend.domain.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AiService {

  private final RestClient restClient;
  private final String apiKey;
  private final OrderRepository orderRepository;
  private final ObjectMapper objectMapper;
  private final com.smartcommerce.backend.domain.repository.SalesAnalysisRepository salesAnalysisRepository;

  public AiService(@Value("${gemini.api.key}") String apiKey, OrderRepository orderRepository,
      ObjectMapper objectMapper,
      com.smartcommerce.backend.domain.repository.SalesAnalysisRepository salesAnalysisRepository) {
    this.restClient = RestClient.builder().build();
    this.apiKey = apiKey;
    this.orderRepository = orderRepository;
    this.objectMapper = objectMapper;
    this.salesAnalysisRepository = salesAnalysisRepository;
  }

  /**
   * Construye el contexto transaccional limitando el historial a los últimos
   * registros
   * para optimizar la ventana de contexto (Context Window) enviada a Gemini,
   * balanceando costos y precisión.
   *
   * @param orderIds Lista de IDs de órdenes para analizar
   * @return Respuesta estructurada del análisis de ventas
   */
  @Transactional
  public SalesAnalysisResponse analyzeSales(List<Long> orderIds) {
    List<Order> orders = orderRepository.findAllById(orderIds);

    if (orders.isEmpty()) {
      return new SalesAnalysisResponse(
          "No se encontraron órdenes con los IDs proporcionados.",
          0,
          List.of(),
          "Verifique los IDs enviados.");
    }

    AiContextDTO context = prepareContext(orders);
    String promptData = String.format(
        "Cliente: %s. Gasto Total: %.2f. Órdenes: %d. Frecuencia de Compra: %.1f días. Producto Estrella: %s. Productos Recientes: %s.",
        context.clientName(),
        context.totalSpent(),
        context.totalOrders(),
        context.purchaseFrequencyDays(),
        context.topProduct(),
        String.join(", ", context.topPurchasedProducts()));

    String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
        + apiKey;
    URI uri = URI.create(urlString);

    var requestBody = Map.of(
        "contents", List.of(
            Map.of("parts", List.of(
                Map.of("text",
                    "Actúa como experto B2B. Analiza este cliente: " + promptData
                        + " Responde ÚNICAMENTE con un objeto JSON válido siguiendo este esquema: { resumen_ejecutivo: string, score_oportunidad: number (1-10), alertas: string[], accion_recomendada: string }.")))),
        "generationConfig", Map.of(
            "temperature", 0.7,
            "maxOutputTokens", 5000,
            "response_mime_type", "application/json"));

    String response = restClient.post()
        .uri(uri)
        .contentType(MediaType.APPLICATION_JSON)
        .body(requestBody)
        .retrieve()
        .body(String.class);

    SalesAnalysisResponse analysisResponse = parseGeminiResponse(response);

    // Persist analysis
    if (analysisResponse != null && !orders.isEmpty() && orders.get(0).getClient() != null) {
      com.smartcommerce.backend.domain.model.SalesAnalysis analysis = com.smartcommerce.backend.domain.model.SalesAnalysis
          .builder()
          .client(orders.get(0).getClient())
          .score(analysisResponse.scoreOportunidad())
          .executiveSummary(analysisResponse.resumenEjecutivo())
          .recommendation(analysisResponse.accionRecomendada())
          .alerts(analysisResponse.alertas())
          .build();
      salesAnalysisRepository.save(analysis);
    }

    return analysisResponse;
  }

  @Transactional(readOnly = true)
  public List<com.smartcommerce.backend.domain.model.SalesAnalysis> getHistory(Long clientId) {
    // Need to fetch client first ideally, or just use ID if repo supported
    // findByClientId.
    // However, findByClient(Client) is safer.
    // Let's assume we can fetch client or update repo to findByClientId.
    // For now, let's fetch a proxy or use findByClientId if Added.
    // Actually, I updated repo to findByClient(Client).
    // I need ClientRepository here to fetch the client.
    // OR update SalesAnalysisRepository to findByClientId(Long clientId).
    // Updating Repo to findByClientId is easier.
    // But let's assume I inject ClientRepository.
    return salesAnalysisRepository.findByClientIdOrderByCreatedAtDesc(clientId);
  }

  private AiContextDTO prepareContext(List<Order> orders) {
    if (orders == null || orders.isEmpty()) {
      return new AiContextDTO("Unknown", BigDecimal.ZERO, 0, "N/A", List.of(), 0.0);
    }

    String clientName = orders.get(0).getClient() != null
        ? orders.get(0).getClient().getName()
        : "Cliente";

    BigDecimal totalSpent = orders.stream()
        .map(Order::getTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    int totalOrders = orders.size();

    Map<String, Integer> productCount = new HashMap<>();

    for (Order order : orders) {
      if (order.getItems() != null) {
        for (OrderItem item : order.getItems()) {
          String pName = item.getProduct().getName();
          productCount.put(pName, productCount.getOrDefault(pName, 0) + item.getQuantity());
        }
      }
    }

    String topProduct = productCount.entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .orElse("N/A");

    List<String> topPurchasedProducts = productCount.entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .limit(10)
        .map(entry -> entry.getValue() + "x " + entry.getKey())
        .collect(Collectors.toList());

    double frequency = 0.0;
    if (orders.size() > 1) {
      List<LocalDateTime> dates = orders.stream()
          .map(Order::getCreatedAt)
          .sorted()
          .collect(Collectors.toList());

      LocalDateTime first = dates.get(0);
      LocalDateTime last = dates.get(dates.size() - 1);

      long daysDiff = ChronoUnit.DAYS.between(first, last);
      if (daysDiff > 0) {
        frequency = (double) daysDiff / (orders.size() - 1);
      }
    }

    return new AiContextDTO(clientName, totalSpent, totalOrders, topProduct, topPurchasedProducts, frequency);
  }

  private SalesAnalysisResponse parseGeminiResponse(String rawResponse) {
    try {
      JsonNode rootNode = objectMapper.readTree(rawResponse);
      String innerJson = rootNode.path("candidates")
          .get(0)
          .path("content")
          .path("parts")
          .get(0)
          .path("text")
          .asText();

      String cleanJson = innerJson.replaceAll("```json", "").replaceAll("```", "").trim();
      return objectMapper.readValue(cleanJson, SalesAnalysisResponse.class);
    } catch (Exception e) {
      throw new RuntimeException("Error al procesar la respuesta de IA", e);
    }
  }

  @Transactional
  public String chatWithData(List<Long> orderIds, String userMessage) {
    List<Order> orders = orderRepository.findAllById(orderIds);

    String contextData;
    if (orders.isEmpty()) {
      contextData = "No hay datos de órdenes específicas.";
    } else {
      AiContextDTO context = prepareContext(orders);
      contextData = String.format(
          "Cliente: %s. Gasto Total: %.2f. Órdenes: %d. Frecuencia: %.1f días. Top Producto: %s. P. Recientes: %s.",
          context.clientName(),
          context.totalSpent(),
          context.totalOrders(),
          context.purchaseFrequencyDays(),
          context.topProduct(),
          String.join(", ", context.topPurchasedProducts()));
    }

    String systemInstruction = "Contexto: " + contextData +
        "\\n\\nEl usuario pregunta: " + userMessage +
        "\\n\\nInstrucción: Responde breve y estratégico como experto B2B.";

    String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
        + apiKey;
    URI uri = URI.create(urlString);

    var requestBody = Map.of(
        "contents", List.of(
            Map.of("parts", List.of(
                Map.of("text", systemInstruction)))),
        "generationConfig", Map.of(
            "temperature", 0.7,
            "maxOutputTokens", 2000));

    try {
      String response = restClient.post()
          .uri(uri)
          .contentType(MediaType.APPLICATION_JSON)
          .body(requestBody)
          .retrieve()
          .body(String.class);

      return extractTextFromGeminiResponse(response);
    } catch (Exception e) {
      return "Hubo un error al procesar tu consulta: " + e.getMessage();
    }
  }

  private String extractTextFromGeminiResponse(String rawResponse) {
    try {
      JsonNode rootNode = objectMapper.readTree(rawResponse);
      return rootNode.path("candidates")
          .get(0)
          .path("content")
          .path("parts")
          .get(0)
          .path("text")
          .asText();
    } catch (Exception e) {
      return "Error parseando respuesta de IA.";
    }
  }

  @Transactional
  public com.smartcommerce.backend.domain.dto.SimulationResponse simulateScenario(
      com.smartcommerce.backend.domain.dto.SimulationRequest request) {
    // Fetch client context
    List<Order> orders = orderRepository.findByClientId(request.userId()); // Request.userId is actually clientId now

    String clientContext = "Cliente Nuevo (Sin histórico)";
    if (!orders.isEmpty()) {
      AiContextDTO context = prepareContext(orders);
      clientContext = String.format(
          "Cliente: %s. Gasto Total: %.2f. Freq: %.1f días. Top: %s.",
          context.clientName(), context.totalSpent(), context.purchaseFrequencyDays(), context.topProduct());
    }

    String prompt = String.format(
        "Actúa como estratega B2B. Contexto Cliente: [%s]. Escenario: Descuento %d%%, Contrato %d meses. " +
            "Responde ÚNICAMENTE en JSON con este formato: { \"acceptanceProbability\": 0-100, \"financialImpact\": \"Rentable/Riesgoso/etc\", \"explanation\": \"breve justificación\" }. IMPORTANT: Return ONLY the raw JSON string. Do not use Markdown formatting or code blocks. IMPORTANT: Keep the explanation concise to ensure valid JSON output.",
        clientContext, request.discountPercentage(), request.contractDurationMonths());

    String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
        + apiKey;
    URI uri = URI.create(urlString);

    var requestBody = Map.of(
        "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
        "generationConfig",
        Map.of("temperature", 0.7, "maxOutputTokens", 2000, "response_mime_type", "application/json"));

    try {
      String response = restClient.post()
          .uri(uri)
          .contentType(MediaType.APPLICATION_JSON)
          .body(requestBody)
          .retrieve()
          .body(String.class);

      return parseSimulationResponse(response);
    } catch (Exception e) {
      throw new RuntimeException("Error en simulación: " + e.getMessage());
    }
  }

  @Transactional
  public EmailDraftResponse draftEmail(EmailDraftRequest request) {
    List<Order> orders = orderRepository.findByClientId(request.userId()); // Request.userId treated as clientId
    AiContextDTO context = prepareContext(orders);

    String productList = String.join(", ", context.topPurchasedProducts());
    if (productList.isEmpty()) {
      productList = "nuestros productos";
    }

    String prompt = String.format(
        "Act as a Senior B2B Sales Representative. Write a professional email to %s using the following Recommendation: \"%s\". "
            +
            "Context: They recently bought %s. " +
            "Tone: Professional, concise, and persuasive. " +
            "Output Format: JSON with 'subject' and 'body' fields ONLY. Do NOT use Markdown blocks.",
        context.clientName(), request.recommendation(), productList);

    String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
        + apiKey;
    URI uri = URI.create(urlString);

    var requestBody = Map.of(
        "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
        "generationConfig",
        Map.of("temperature", 0.7, "maxOutputTokens", 2000, "response_mime_type", "application/json"));

    try {
      String response = restClient.post()
          .uri(uri)
          .contentType(MediaType.APPLICATION_JSON)
          .body(requestBody)
          .retrieve()
          .body(String.class);

      return parseEmailResponse(response);
    } catch (Exception e) {
      throw new RuntimeException("Error drafting email: " + e.getMessage());
    }
  }

  private EmailDraftResponse parseEmailResponse(String rawResponse) {
    try {
      JsonNode rootNode = objectMapper.readTree(rawResponse);
      String innerJson = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
      String cleanJson = innerJson.replaceAll("```json", "").replaceAll("```", "").trim();
      return objectMapper.readValue(cleanJson, EmailDraftResponse.class);
    } catch (Exception e) {
      throw new RuntimeException("Error parsing email draft response", e);
    }
  }

  private com.smartcommerce.backend.domain.dto.SimulationResponse parseSimulationResponse(String rawResponse) {
    String responseText = "Not extracted yet";
    try {
      JsonNode rootNode = objectMapper.readTree(rawResponse);
      responseText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

      int firstBracket = responseText.indexOf("{");
      int lastBracket = responseText.lastIndexOf("}");
      if (firstBracket != -1 && lastBracket != -1) {
        // Extraer SOLO lo que está entre las llaves
        String jsonOnly = responseText.substring(firstBracket, lastBracket + 1);
        // Ahora parsear jsonOnly
        com.smartcommerce.backend.domain.dto.SimulationResponse response = objectMapper.readValue(jsonOnly,
            com.smartcommerce.backend.domain.dto.SimulationResponse.class);
        return response;
      } else {
        throw new RuntimeException("No se encontró JSON válido en la respuesta de la IA");
      }
    } catch (Exception e) {
      log.error("Respuesta fallida: {}", responseText, e);
      throw new RuntimeException("Error parseando simulación", e);
    }
  }
}
