package com.smartcommerce.backend.service;

import com.smartcommerce.backend.domain.model.*;
import com.smartcommerce.backend.domain.repository.*;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvImportService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    /**
     * Ejecuta una lógica de 'Upsert' (Actualizar o Insertar).
     * Si detecta un cliente nuevo en el CSV, lo crea automáticamente y lo vincula
     * al usuario actual para reducir la fricción en el onboarding.
     *
     * @param file Archivo CSV con los datos de las órdenes
     * @param user Usuario autenticado que realiza la importación
     * @return Número de órdenes importadas exitosamente
     */
    @Transactional
    public int processCsv(MultipartFile file, User user) {
        log.info("Starting CSV import process for user: {}", user.getEmail());
        int importedOrdersCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header
                }

                String[] data = line.split(",");
                // Expected Format: Date, Client Name, Product Name, Quantity, Unit Price
                // Minimum 5 columns now
                if (data.length < 5) {
                    log.warn("Skipping invalid line (not enough columns): {}", line);
                    continue;
                }

                try {
                    String dateStr = data[0].trim();
                    String clientName = data[1].trim();
                    String productName = data[2].trim();
                    int quantity = Integer.parseInt(data[3].trim());
                    BigDecimal price = new BigDecimal(data[4].trim());

                    // Parse Date
                    LocalDateTime orderDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE).atStartOfDay();

                    // Find or Create Client
                    Client client = clientRepository.findByNameAndUser(clientName, user)
                            .orElseGet(() -> {
                                log.info("Creating new client '{}' for user '{}'", clientName, user.getEmail());
                                return clientRepository.save(Client.builder()
                                        .name(clientName)
                                        .user(user)
                                        .tier("Bronze") // Default
                                        .build());
                            });

                    // Find or Create Product
                    Product product = productRepository.findByName(productName)
                            .orElseGet(() -> createGenericProduct(productName, price));

                    // Create Order
                    Order order = Order.builder()
                            .user(user)
                            .client(client) // Link to Client
                            .total(price.multiply(BigDecimal.valueOf(quantity)))
                            .status(OrderStatus.COMPLETED)
                            .items(new ArrayList<>())
                            .createdAt(orderDate)
                            .build();

                    // Create Order Item
                    OrderItem item = OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(quantity)
                            .price(price)
                            .build();

                    order.getItems().add(item);

                    orderRepository.save(order);
                    importedOrdersCount++;

                } catch (Exception e) {
                    log.error("Error processing line: {}", line, e);
                    throw new RuntimeException("Error processing CSV line: " + line, e);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }

        log.info("Successfully imported {} orders", importedOrdersCount);
        return importedOrdersCount;
    }

    private Product createGenericProduct(String name, BigDecimal price) {
        // Create a generic product if it doesn't exist
        return productRepository.save(Product.builder()
                .name(name)
                .sku("SKU-" + name.toUpperCase().replaceAll("\\s+", "-") + "-" + System.currentTimeMillis())
                .description("Imported Product")
                .price(price)
                .stockQuantity(1000) // Default high stock
                .build());
    }
}
