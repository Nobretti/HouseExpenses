package com.houseexpenses.repository;

import com.houseexpenses.model.Category;
import com.houseexpenses.model.Category.ExpenseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByUserIdAndIsActiveTrueOrderByDisplayOrder(UUID userId);

    List<Category> findByUserIdAndExpenseTypeAndIsActiveTrueOrderByDisplayOrder(UUID userId, ExpenseType expenseType);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.subCategories WHERE c.userId = :userId AND c.isActive = true ORDER BY c.displayOrder")
    List<Category> findByUserIdWithSubCategories(@Param("userId") UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
}
