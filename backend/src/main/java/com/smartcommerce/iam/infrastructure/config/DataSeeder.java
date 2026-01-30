package com.smartcommerce.iam.infrastructure.config;

import lombok.extern.slf4j.Slf4j;

import com.smartcommerce.iam.domain.model.Role;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.RoleRepository;
import com.smartcommerce.iam.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@smartcommerce.com}")
    private String adminEmail;

    @Value("${app.admin.password:123456}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        Optional<User> userOptional = userRepository.findByEmail(adminEmail);

        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            existingUser.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(existingUser);
            log.info("✅ Usuario Admin actualizado/creado: {}", adminEmail);
        } else {
            // Ensure Role exists
            String roleName = "ROLE_ADMIN"; // Standard Spring Security role naming convention
            Role adminRole = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName("Admin")
                    .lastName("User")
                    .roles(new HashSet<>(Collections.singletonList(adminRole)))
                    .enabled(true)
                    .build();

            userRepository.save(adminUser);
            log.info("✅ Usuario Admin actualizado/creado: {}", adminEmail);
        }
    }
}
