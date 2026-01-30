package com.smartcommerce.iam.controller;

import lombok.extern.slf4j.Slf4j;

import com.smartcommerce.iam.domain.dto.auth.JwtResponse;
import com.smartcommerce.iam.domain.dto.auth.LoginRequest;
import com.smartcommerce.iam.domain.dto.auth.SignupRequest;
import com.smartcommerce.iam.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.debug("AuthController login hit with email: {}", loginRequest.getEmail());
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            log.debug("Authentication successful for: {}", loginRequest.getEmail());
            return ResponseEntity.ok(jwtResponse);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("Bad credentials for email: {}", loginRequest.getEmail());
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Credenciales incorrectas"));
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            authService.registerUser(signUpRequest);
            return ResponseEntity.ok(java.util.Map.of("message", "User registered successfully!"));
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Error: " + e.getMessage()));
        }
    }
}
