package tarabaho.tarabaho.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "graduates")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Graduate{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = true)
    private String phoneNumber;

    private String address;

    private String biography;

    private LocalDate birthday;

    private String profilePicture;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false; // Verification status, default to false

    @Column(nullable = true)
    private Double latitude; // For geolocation-based urgent job notifications

    @Column(nullable = true)
    private Double longitude; // For geolocation-based urgent job notifications

    @Column(nullable = true)
    private Double averageResponseTime; // Average time to respond to job requests (in minutes)

   
    

    @OneToMany(mappedBy = "graduate", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("graduate-certificates")
    private List<Certificate> certificates = new ArrayList<>();

    // Ensure default values before persisting or updating
    @PrePersist
    @PreUpdate
    private void ensureDefaults() {
        if (this.isVerified == null) {
            this.isVerified = false;
        }
    }

    // Equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Graduate graduate = (Graduate) o;
        return Objects.equals(id, graduate.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }
    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getAverageResponseTime() { return averageResponseTime; }
    public void setAverageResponseTime(Double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
    public List<Certificate> getCertificates() { return certificates; }
    public void setCertificates(List<Certificate> certificates) { this.certificates = certificates; }
}