package com.houseexpenses.repository;

import com.houseexpenses.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Page<Expense> findByUserIdOrderByExpenseDateDesc(UUID userId, Pageable pageable);

    @Query(value = "SELECT e.* FROM expenses e " +
           "JOIN categories c ON e.category_id = c.id " +
           "WHERE e.user_id = :userId " +
           "AND c.is_active = true " +
           "AND (CAST(:startDate AS date) IS NULL OR e.expense_date >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR e.expense_date <= :endDate) " +
           "AND (CAST(:categoryId AS uuid) IS NULL OR e.category_id = :categoryId) " +
           "AND (CAST(:subCategoryId AS uuid) IS NULL OR e.subcategory_id = :subCategoryId) " +
           "ORDER BY e.expense_date DESC",
           countQuery = "SELECT COUNT(*) FROM expenses e " +
           "JOIN categories c ON e.category_id = c.id " +
           "WHERE e.user_id = :userId " +
           "AND c.is_active = true " +
           "AND (CAST(:startDate AS date) IS NULL OR e.expense_date >= :startDate) " +
           "AND (CAST(:endDate AS date) IS NULL OR e.expense_date <= :endDate) " +
           "AND (CAST(:categoryId AS uuid) IS NULL OR e.category_id = :categoryId) " +
           "AND (CAST(:subCategoryId AS uuid) IS NULL OR e.subcategory_id = :subCategoryId)",
           nativeQuery = true)
    Page<Expense> findByFilters(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") UUID categoryId,
            @Param("subCategoryId") UUID subCategoryId,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId " +
           "AND e.category.id = :categoryId " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumByCategoryAndDateRange(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId " +
           "AND e.subCategory.id = :subCategoryId " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumBySubCategoryAndDateRange(
            @Param("userId") UUID userId,
            @Param("subCategoryId") UUID subCategoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.subCategory.id, SUM(e.amount), COUNT(e), MAX(e.expenseDate) FROM Expense e " +
           "WHERE e.userId = :userId AND e.subCategory IS NOT NULL " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "GROUP BY e.subCategory.id")
    List<Object[]> sumBySubCategoryGrouped(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category.id, SUM(e.amount) FROM Expense e " +
           "WHERE e.userId = :userId " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "GROUP BY e.category.id")
    List<Object[]> sumByCategory(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.userId = :userId " +
           "AND e.category.isActive = true " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findByUserIdAndActiveCategoryAndExpenseDateBetween(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
