package com.smartcommerce.backend.domain.repository;

import com.smartcommerce.backend.domain.model.Client;
import com.smartcommerce.backend.domain.model.SalesAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesAnalysisRepository extends JpaRepository<SalesAnalysis, Long> {
    List<SalesAnalysis> findByClientOrderByCreatedAtDesc(Client client);

    List<SalesAnalysis> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
