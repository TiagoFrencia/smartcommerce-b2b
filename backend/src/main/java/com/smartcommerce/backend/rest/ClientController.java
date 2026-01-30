package com.smartcommerce.backend.rest;

import com.smartcommerce.backend.domain.dto.ClientDTO;
import com.smartcommerce.backend.domain.model.Client;
import com.smartcommerce.backend.domain.repository.ClientRepository;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador principal para la gestión de cartera.
 * Implementa aislamiento lógico de datos (Multi-tenancy) asegurando que
 * cada usuario solo acceda a sus propios clientes.
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final com.smartcommerce.backend.domain.repository.OrderRepository orderRepository;
    private final com.smartcommerce.backend.domain.repository.SalesAnalysisRepository salesAnalysisRepository;

    @Operation(summary = "Obtener mis clientes", description = "Devuelve la lista de clientes asociados al usuario autenticado")
    @GetMapping
    public ResponseEntity<List<ClientDTO>> getMyClients() {
        User user = getAuthenticatedUser();
        List<Client> clients = clientRepository.findByUser(user);
        List<ClientDTO> dtos = clients.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "Crear nuevo cliente", description = "Registra un nuevo cliente en la cartera del usuario")
    @PostMapping
    public ResponseEntity<ClientDTO> createClient(@RequestBody ClientDTO request) {
        User user = getAuthenticatedUser();

        // Check if exists
        if (clientRepository.findByNameAndUser(request.getName(), user).isPresent()) {
            throw new IllegalArgumentException("Client with this name already exists in your portfolio");
        }

        Client client = Client.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .contactEmail(request.getContactEmail())
                .tier(request.getTier() != null ? request.getTier() : "Bronze") // Default tier
                .user(user)
                .build();

        Client savedClient = clientRepository.save(client);
        return ResponseEntity.ok(mapToDTO(savedClient));
    }

    @Operation(summary = "Actualizar cliente", description = "Actualiza los datos de un cliente existente")
    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(@PathVariable Long id, @RequestBody ClientDTO request) {
        User user = getAuthenticatedUser();
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Validate ownership
        if (!client.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this client");
        }

        client.setName(request.getName());
        client.setIndustry(request.getIndustry());
        client.setContactEmail(request.getContactEmail());
        if (request.getTier() != null) {
            client.setTier(request.getTier());
        }

        Client updatedClient = clientRepository.save(client);
        return ResponseEntity.ok(mapToDTO(updatedClient));
    }

    @Operation(summary = "Eliminar cliente", description = "Elimina un cliente y todos sus datos relacionados (pedidos, análisis) de forma permanente")
    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Validate ownership
        if (!client.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this client");
        }

        // 1. Delete SalesAnalysis associated with this client
        List<com.smartcommerce.backend.domain.model.SalesAnalysis> analyses = salesAnalysisRepository
                .findByClientOrderByCreatedAtDesc(client);
        salesAnalysisRepository.deleteAll(analyses);

        // 2. Delete Orders associated with this client
        List<com.smartcommerce.backend.domain.model.Order> orders = orderRepository.findByClientId(client.getId());
        orderRepository.deleteAll(orders);

        // 3. Delete the Client
        clientRepository.delete(client);

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByEmail(currentPrincipalName)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ClientDTO mapToDTO(Client client) {
        return ClientDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .industry(client.getIndustry())
                .contactEmail(client.getContactEmail())
                .tier(client.getTier())
                .build();
    }
}
