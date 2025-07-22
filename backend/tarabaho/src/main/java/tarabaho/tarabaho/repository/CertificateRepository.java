package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Worker;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByWorkerId(Long workerId);
    List<Certificate> findByWorker(Worker worker);
}