package com.houseexpenses.repository;

import com.houseexpenses.model.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    Page<Alert> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Alert> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndIsReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.userId = :userId AND a.isRead = false")
    int markAllAsRead(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.id = :id AND a.userId = :userId")
    int markAsRead(@Param("id") UUID id, @Param("userId") UUID userId);
}
