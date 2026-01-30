package com.smartcommerce.backend.domain.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartcommerce.backend.domain.dto.AnalyticsDTO;
import com.smartcommerce.backend.domain.model.Order;
import com.smartcommerce.backend.domain.model.OrderItem;
import com.smartcommerce.backend.domain.model.SalesAnalysis;
import com.smartcommerce.backend.domain.repository.OrderRepository;
import com.smartcommerce.backend.domain.repository.SalesAnalysisRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final com.smartcommerce.backend.domain.repository.ClientRepository clientRepository;
    private final SalesAnalysisRepository salesAnalysisRepository;
    private final OrderRepository orderRepository;
    private final AnalyticsService analyticsService;

    @Transactional(readOnly = true)
    public byte[] generateExecutiveReport(Long clientId) throws DocumentException, IOException {
        com.smartcommerce.backend.domain.model.Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        List<SalesAnalysis> analysisHistory = salesAnalysisRepository.findByClientIdOrderByCreatedAtDesc(clientId);
        SalesAnalysis latestAnalysis = analysisHistory.isEmpty() ? null : analysisHistory.get(0);

        AnalyticsDTO analytics = analyticsService.getAnalytics(clientId);
        List<Order> orders = orderRepository.findByClientId(clientId);

        // 1. Calculate Data
        double totalSpent = orders.stream()
                .map(Order::getTotal)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        String mainCategory = "N/A";
        if (analytics.getSalesByCategory() != null && !analytics.getSalesByCategory().isEmpty()) {
            mainCategory = analytics.getSalesByCategory().entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");
        }

        List<ProductStats> topProducts = calculateTopProducts(orders);

        // 2. Build PDF
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter writer = PdfWriter.getInstance(document, out);

        // Footer event
        writer.setPageEvent(new FooterEvent());

        document.open();

        // Styles
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(50, 50, 150));
        Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

        // HEADER
        Paragraph header = new Paragraph("SmartCommerce B2B - Informe Estratégico de Inteligencia", titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        header.setSpacingAfter(10);
        document.add(header);

        Paragraph date = new Paragraph(
                "Generado el: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), textFont);
        date.setAlignment(Element.ALIGN_CENTER);
        date.setSpacingAfter(20);
        document.add(date);

        document.add(new Paragraph(" ")); // Spacer

        // SECTION 1: CUSTOMER PROFILE
        document.add(new Paragraph("1. Perfil del Cliente", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable profileTable = new PdfPTable(2);
        profileTable.setWidthPercentage(100);
        profileTable.setWidths(new float[] { 3f, 7f });

        addProfileRow(profileTable, "Cliente:", client.getName(), boldFont, textFont);
        addProfileRow(profileTable, "Industria:", client.getIndustry() != null ? client.getIndustry() : "N/A", boldFont,
                textFont);
        addProfileRow(profileTable, "Email Contacto:",
                client.getContactEmail() != null ? client.getContactEmail() : "N/A", boldFont, textFont);
        addProfileRow(profileTable, "Gasto Total Histórico:", String.format("$%,.2f", totalSpent), boldFont, textFont);
        addProfileRow(profileTable, "Categoría Principal:", mainCategory, boldFont, textFont);

        document.add(profileTable);
        document.add(new Paragraph(" "));

        // SECTION 2: AI ANALYSIS
        if (latestAnalysis != null) {
            document.add(new Paragraph("2. Análisis de Inteligencia Artificial", sectionFont));
            document.add(new Paragraph(" "));

            Paragraph score = new Paragraph("Oportunidad de Negocio: " + latestAnalysis.getScore() + "/10", boldFont);
            score.setSpacingAfter(5);
            document.add(score);

            document.add(new Paragraph("Resumen Ejecutivo:", boldFont));
            document.add(new Paragraph(latestAnalysis.getExecutiveSummary(), textFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Recomendación Estratégica:", boldFont));
            document.add(new Paragraph(latestAnalysis.getRecommendation(), textFont));
        } else {
            document.add(new Paragraph(
                    "2. Análisis de IA: No hay análisis previo disponible. Ejecute un análisis en el Dashboard.",
                    textFont));
        }
        document.add(new Paragraph(" "));

        // SECTION 3: SALES BREAKDOWN
        document.add(new Paragraph("3. Desglose de Ventas (Top 5 Productos)", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 6f, 2f, 2f });
        table.setHeaderRows(1);

        addTableHeader(table, "Producto", boldFont);
        addTableHeader(table, "Cantidad", boldFont);
        addTableHeader(table, "Total", boldFont);

        for (ProductStats p : topProducts) {
            table.addCell(new PdfPCell(new Phrase(p.name, textFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(p.quantity), textFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("$%,.2f", p.total), textFont)));
        }

        document.add(table);

        document.close();
        return out.toByteArray();
    }

    private void addProfileRow(PdfPTable table, String label, String value, Font bold, Font normal) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, bold));
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, normal));
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String header, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(header, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private List<ProductStats> calculateTopProducts(List<Order> orders) {
        Map<String, ProductStats> stats = new HashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                String name = item.getProduct().getName();
                double total = item.getPrice().doubleValue() * item.getQuantity();

                stats.computeIfAbsent(name, k -> new ProductStats(k, 0, 0.0));
                ProductStats current = stats.get(name);
                current.quantity += item.getQuantity();
                current.total += total;
            }
        }

        return stats.values().stream()
                .sorted((a, b) -> Double.compare(b.total, a.total))
                .limit(5)
                .collect(Collectors.toList());
    }

    private static class ProductStats {
        String name;
        int quantity;
        double total;

        ProductStats(String name, int quantity, double total) {
            this.name = name;
            this.quantity = quantity;
            this.total = total;
        }
    }

    class FooterEvent extends com.lowagie.text.pdf.PdfPageEventHelper {
        public void onEndPage(PdfWriter writer, Document document) {
            Font font = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_CENTER,
                    new Phrase("Generado automáticamente por SmartCommerce AI Engine", font),
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 10, 0);
        }
    }
}
