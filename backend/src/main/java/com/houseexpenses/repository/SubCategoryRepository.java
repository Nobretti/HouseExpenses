package com.houseexpenses.repository;

import com.houseexpenses.model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, UUID> {

    List<SubCategory> findByCategoryIdAndIsActiveTrueOrderByDisplayOrder(UUID categoryId);

    boolean existsByCategoryIdAndNameIgnoreCase(UUID categoryId, String name);
}
