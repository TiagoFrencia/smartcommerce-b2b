package com.smartcommerce.backend.controller;

import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.backend.service.CsvImportService;
import com.smartcommerce.iam.domain.repository.UserRepository;
import com.smartcommerce.iam.infrastructure.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class ImportController {

    private final CsvImportService csvImportService;
    private final UserRepository userRepository;

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importData(@RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

        int count = csvImportService.processCsv(file, user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Importación exitosa");
        response.put("ordersImported", count);

        return ResponseEntity.ok(response);
    }
}
