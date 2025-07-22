package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import tarabaho.tarabaho.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name);
}