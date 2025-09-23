package tarabaho.tarabaho.dto;

import tarabaho.tarabaho.entity.Portfolio;

public class PublicPortfolioSearchResult {

    private Long graduateId;
    private String fullName;
    private String avatar;
    private String professionalTitle;
    private String primaryCourseType;
    private String professionalSummary;
    private String shareToken;

    public PublicPortfolioSearchResult() {}

    public PublicPortfolioSearchResult(Portfolio portfolio) {
        this.graduateId = portfolio.getGraduate().getId();
        this.fullName = portfolio.getFullName();
        this.avatar = portfolio.getAvatar();
        this.professionalTitle = portfolio.getProfessionalTitle();
        this.primaryCourseType = portfolio.getPrimaryCourseType();
        this.professionalSummary = (portfolio.getProfessionalSummary() != null && portfolio.getProfessionalSummary().length() > 150) ?
            portfolio.getProfessionalSummary().substring(0, 150) + "..." : portfolio.getProfessionalSummary();
        this.shareToken = portfolio.getShareToken();
    }

    // Getters and Setters
    public Long getGraduateId() { return graduateId; }
    public void setGraduateId(Long graduateId) { this.graduateId = graduateId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getProfessionalTitle() { return professionalTitle; }
    public void setProfessionalTitle(String professionalTitle) { this.professionalTitle = professionalTitle; }
    public String getPrimaryCourseType() { return primaryCourseType; }
    public void setPrimaryCourseType(String primaryCourseType) { this.primaryCourseType = primaryCourseType; }
    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String professionalSummary) { this.professionalSummary = professionalSummary; }
    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }
}