package com.smartcommerce.backend.controller;

import com.smartcommerce.backend.domain.dto.OrderRequest;

import com.smartcommerce.backend.service.OrderService;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;
        private final UserRepository userRepository;
        private final com.smartcommerce.backend.domain.repository.OrderRepository orderRepository;

        @PostMapping
        public ResponseEntity<com.smartcommerce.backend.domain.dto.order.OrderResponse> createOrder(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody OrderRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.smartcommerce.backend.domain.dto.order.OrderResponse createdOrder = orderService.createOrder(
                                user.getId(),
                                request);
                return ResponseEntity.ok(createdOrder);
        }

        @org.springframework.web.bind.annotation.GetMapping("/user/{userId}/ids")
        public ResponseEntity<java.util.List<Long>> getOrderIdsByUser(
                        @org.springframework.web.bind.annotation.PathVariable Long userId) {
                return ResponseEntity.ok(orderRepository.findOrderIdsByUserId(userId));
        }

        @org.springframework.web.bind.annotation.GetMapping("/client/{clientId}/ids")
        public ResponseEntity<java.util.List<Long>> getOrderIdsByClient(
                        @org.springframework.web.bind.annotation.PathVariable Long clientId) {
                return ResponseEntity.ok(orderRepository.findOrderIdsByClientId(clientId));
        }
}
