package tarabaho.tarabaho.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Admin;
import tarabaho.tarabaho.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.isVerified = true")
    List<User> findAllVerified();
    List<Admin> findAllByEmail(String email);
    List<Admin> findAllByPhoneNumber(String phoneNumber);
}