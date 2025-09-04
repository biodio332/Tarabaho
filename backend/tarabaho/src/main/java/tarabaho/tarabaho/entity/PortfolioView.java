package tarabaho.tarabaho.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    private LocalDateTime viewTimestamp;

    // Optional: Add anonymous viewer info if needed, but minimize for privacy
    // private String viewerIpHash; // Commented out to avoid privacy issues

    @PrePersist
    protected void onCreate() {
        viewTimestamp = LocalDateTime.now();
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
    public LocalDateTime getViewTimestamp() { return viewTimestamp; }
    public void setViewTimestamp(LocalDateTime viewTimestamp) { this.viewTimestamp = viewTimestamp; }
}