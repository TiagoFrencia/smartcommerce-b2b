package com.smartcommerce.backend.service;

import com.smartcommerce.backend.domain.dto.OrderItemRequest;
import com.smartcommerce.backend.domain.dto.OrderRequest;
import com.smartcommerce.backend.domain.model.*;
import com.smartcommerce.backend.domain.repository.OrderRepository;
import com.smartcommerce.backend.domain.repository.ProductRepository;
import com.smartcommerce.backend.exception.InsufficientStockException;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public com.smartcommerce.backend.domain.dto.order.OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .total(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            // Calculate price
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.getItems().add(orderItem);
        }

        order.setTotal(total);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    private com.smartcommerce.backend.domain.dto.order.OrderResponse mapToOrderResponse(Order order) {
        List<com.smartcommerce.backend.domain.dto.order.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> com.smartcommerce.backend.domain.dto.order.OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        return com.smartcommerce.backend.domain.dto.order.OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .total(order.getTotal())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
