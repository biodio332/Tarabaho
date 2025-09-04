package tarabaho.tarabaho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByGraduateId(Long graduateId);
    List<Certificate> findByGraduate(Graduate graduate);
    List<Certificate> findByPortfolioId(Long portfolioId);
}