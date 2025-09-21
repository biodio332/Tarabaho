package tarabaho.tarabaho.dto;

import java.util.List;
import java.util.Map;

import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Project;

public class CompletePublicPortfolioResponse {
    private PortfolioRequest portfolio;
    private Map<String, Object> graduate;
    private List<Certificate> certificates;
    private List<Project> projects;
    
    public CompletePublicPortfolioResponse(PortfolioRequest portfolio, 
                                         Map<String, Object> graduate, 
                                         List<Certificate> certificates, 
                                         List<Project> projects) {
        this.portfolio = portfolio;
        this.graduate = graduate;
        this.certificates = certificates;
        this.projects = projects;
    }
    
    // Getters
    public PortfolioRequest getPortfolio() { return portfolio; }
    public Map<String, Object> getGraduate() { return graduate; }
    public List<Certificate> getCertificates() { return certificates; }
    public List<Project> getProjects() { return projects; }
    
    // Setters
    public void setPortfolio(PortfolioRequest portfolio) { this.portfolio = portfolio; }
    public void setGraduate(Map<String, Object> graduate) { this.graduate = graduate; }
    public void setCertificates(List<Certificate> certificates) { this.certificates = certificates; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
}