package com.smartcommerce.backend.domain.repository;

import com.smartcommerce.backend.domain.model.Client;
import com.smartcommerce.iam.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUser(User user);

    Optional<Client> findByNameAndUser(String name, User user);
}
