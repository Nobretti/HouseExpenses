package com.houseexpenses.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private UUID id;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(length = 10)
    @Builder.Default
    private String locale = "pt-PT";

    @Column(name = "monthly_budget_limit")
    private Double monthlyBudgetLimit;

    @Column(name = "annual_budget_limit")
    private Double annualBudgetLimit;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
