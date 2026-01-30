package com.smartcommerce.backend.controller;

import com.smartcommerce.backend.domain.dto.UserSummary;
import com.smartcommerce.backend.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final OrderRepository orderRepository;

    @GetMapping("/with-orders")
    public ResponseEntity<List<UserSummary>> getUsersWithOrders() {
        return ResponseEntity.ok(orderRepository.findUsersWithOrders());
    }
}
