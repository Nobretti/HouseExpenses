package com.houseexpenses.repository;

import com.houseexpenses.model.Budget;
import com.houseexpenses.model.Budget.BudgetPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserId(UUID userId);

    List<Budget> findByUserIdAndPeriod(UUID userId, BudgetPeriod period);

    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.category.id = :categoryId " +
           "AND (b.subCategory IS NULL OR b.subCategory.id = :subCategoryId) AND b.period = :period")
    Optional<Budget> findByUserIdAndCategoryAndSubCategoryAndPeriod(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("subCategoryId") UUID subCategoryId,
            @Param("period") BudgetPeriod period);

    Optional<Budget> findByUserIdAndCategoryIdAndSubCategoryIsNullAndPeriod(
            UUID userId, UUID categoryId, BudgetPeriod period);

    @Query("SELECT b FROM Budget b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.subCategory WHERE b.userId = :userId")
    List<Budget> findByUserIdWithDetails(@Param("userId") UUID userId);
}
