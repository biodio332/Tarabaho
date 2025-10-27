// Repository
package tarabaho.tarabaho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tarabaho.tarabaho.entity.ContactInquiry;

@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {

}