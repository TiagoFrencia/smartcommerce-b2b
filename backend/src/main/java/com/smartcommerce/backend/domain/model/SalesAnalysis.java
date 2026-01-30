package com.smartcommerce.backend.domain.model;

import jakarta.persistence.*;
import lombok.*;
import com.smartcommerce.backend.domain.model.Client;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @ToString.Exclude
    private Client client;

    @Column(nullable = false)
    private int score;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String executiveSummary;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String recommendation;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sales_analysis_alerts", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "alert")
    @Builder.Default
    private List<String> alerts = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
