package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tarabaho.tarabaho.entity.CategoryRequest;

public interface CategoryRequestRepository extends JpaRepository<CategoryRequest, Long> {
    // NEW: Method to find category requests by worker ID, used to retrieve a worker's requests
    List<CategoryRequest> findByWorkerId(Long workerId);

    // NEW: Method to find category requests by status, used to retrieve pending requests for admins
    List<CategoryRequest> findByStatus(String status);

    // NEW: Method to find category requests by worker ID and category ID, used to prevent duplicate requests
    List<CategoryRequest> findByWorkerIdAndCategoryId(Long workerId, Long categoryId);

    List<CategoryRequest> findByWorkerIdAndStatus(Long workerId, String status);
}