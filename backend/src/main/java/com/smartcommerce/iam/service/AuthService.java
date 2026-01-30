package com.smartcommerce.iam.service;

import lombok.extern.slf4j.Slf4j;

import com.smartcommerce.iam.domain.dto.auth.JwtResponse;
import com.smartcommerce.iam.domain.dto.auth.LoginRequest;
import com.smartcommerce.iam.domain.dto.auth.SignupRequest;
import com.smartcommerce.iam.domain.model.Role;
import com.smartcommerce.iam.domain.model.User;
import com.smartcommerce.iam.domain.repository.RoleRepository;
import com.smartcommerce.iam.domain.repository.UserRepository;
import com.smartcommerce.iam.infrastructure.security.jwt.JwtUtils;
import com.smartcommerce.iam.infrastructure.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtils jwtUtils;

        @Transactional
        public void registerUser(SignupRequest signUpRequest) {
                if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
                        throw new RuntimeException("Error: Email is already in use!");
                }

                // Create new user's account
                User user = User.builder()
                                .firstName(signUpRequest.getUsername()) // Mapping username to firstName
                                .lastName("") // Defaulting lastName to empty
                                .email(signUpRequest.getEmail())
                                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                                .enabled(true)
                                .build();

                Set<Role> roles = new HashSet<>();

                // Default role: ROLE_USER
                Role userRole = roleRepository.findByName("ROLE_USER")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);

                user.setRoles(roles);
                userRepository.save(user);
        }

        public JwtResponse authenticateUser(LoginRequest loginRequest) {
                log.debug("AuthService.authenticateUser called for: {}", loginRequest.getEmail());
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                return new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getEmail(),
                                roles);
        }
}
