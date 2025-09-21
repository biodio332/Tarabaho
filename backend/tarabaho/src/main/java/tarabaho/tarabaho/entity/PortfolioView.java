package tarabaho.tarabaho.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "portfolio_views")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler","portfolio.graduate"})
public class PortfolioView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "portfolio_id", nullable = false)
    @JsonBackReference
    private Portfolio portfolio;
    
    @Column(name = "view_date")
    private LocalDateTime viewDate;

    @Column(name = "session_id", length = 64)
    private String sessionId;


    public PortfolioView() {
        // Default constructor - JPA needs this to create entities
    }
    
    public PortfolioView(Portfolio portfolio, String sessionId) {
        this.portfolio = portfolio;
        this.sessionId = sessionId;
        this.viewDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        viewDate = LocalDateTime.now();
    }

    // Equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PortfolioView that = (PortfolioView) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public LocalDateTime getViewDate() { return viewDate; }
    public void setViewDate(LocalDateTime viewDate) { this.viewDate = viewDate; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}