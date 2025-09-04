package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tarabaho.tarabaho.entity.CategoryRequest;

public interface CategoryRequestRepository extends JpaRepository<CategoryRequest, Long> {
    // NEW: Method to find category requests by graduate ID, used to retrieve a graduate's requests
    List<CategoryRequest> findByGraduateId(Long graduateId);

    // NEW: Method to find category requests by status, used to retrieve pending requests for admins
    List<CategoryRequest> findByStatus(String status);

    // NEW: Method to find category requests by graduate ID and category ID, used to prevent duplicate requests
    List<CategoryRequest> findByGraduateIdAndCategoryId(Long graduateId, Long categoryId);

    List<CategoryRequest> findByGraduateIdAndStatus(Long graduateId, String status);
}