package tarabaho.tarabaho.dto;

import java.util.List;
import tarabaho.tarabaho.entity.*;

public class PortfolioDTO {
    private Long id;
    private Long graduateId;
    private String fullName;
    private String email;
    private String professionalSummary;
    private String primaryCourseType;
    private String scholarScheme;
    private String designTemplate;
    private String customSectionJson;
    private Visibility visibility;
    private String avatar;
    private String professionalTitle;
    private String ncLevel;
    private String trainingCenter;
    private String scholarshipType;
    private String trainingDuration;
    private String tesdaRegistrationNumber;
    private String phone;
    private String website;
    private String portfolioCategory;
    private String preferredWorkLocation;
    private String workScheduleAvailability;
    private String salaryExpectations;
    private List<Skill> skills;
    private List<Experience> experiences;
    private List<Project> projects;
    private List<AwardRecognition> awardsRecognitions;
    private List<ContinuingEducation> continuingEducations;
    private List<ProfessionalMembership> professionalMemberships;
    private List<Reference> references;
    private List<PortfolioView> portfolioViews;

    // Constructor to map from Portfolio entity
    public PortfolioDTO(Portfolio portfolio) {
        this.id = portfolio.getId();
        this.graduateId = portfolio.getGraduate() != null ? portfolio.getGraduate().getId() : null;
        this.fullName = portfolio.getFullName();
        this.email = portfolio.getEmail();
        this.professionalSummary = portfolio.getProfessionalSummary();
        this.primaryCourseType = portfolio.getPrimaryCourseType();
        this.scholarScheme = portfolio.getScholarScheme();
        this.designTemplate = portfolio.getDesignTemplate();
        this.customSectionJson = portfolio.getCustomSectionJson();
        this.visibility = portfolio.getVisibility();
        this.avatar = portfolio.getAvatar();
        this.professionalTitle = portfolio.getProfessionalTitle();
        this.ncLevel = portfolio.getNcLevel();
        this.trainingCenter = portfolio.getTrainingCenter();
        this.scholarshipType = portfolio.getScholarshipType();
        this.trainingDuration = portfolio.getTrainingDuration();
        this.tesdaRegistrationNumber = portfolio.getTesdaRegistrationNumber();
        this.phone = portfolio.getPhone();
        this.website = portfolio.getWebsite();
        this.portfolioCategory = portfolio.getPortfolioCategory();
        this.preferredWorkLocation = portfolio.getPreferredWorkLocation();
        this.workScheduleAvailability = portfolio.getWorkScheduleAvailability();
        this.salaryExpectations = portfolio.getSalaryExpectations();
        this.skills = portfolio.getSkills();
        this.experiences = portfolio.getExperiences();
        this.projects = portfolio.getProjects();
        this.awardsRecognitions = portfolio.getAwardsRecognitions();
        this.continuingEducations = portfolio.getContinuingEducations();
        this.professionalMemberships = portfolio.getProfessionalMemberships();
        this.references = portfolio.getReferences();
        this.portfolioViews = portfolio.getPortfolioViews();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGraduateId() { return graduateId; }
    public void setGraduateId(Long graduateId) { this.graduateId = graduateId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String professionalSummary) { this.professionalSummary = professionalSummary; }
    public String getPrimaryCourseType() { return primaryCourseType; }
    public void setPrimaryCourseType(String primaryCourseType) { this.primaryCourseType = primaryCourseType; }
    public String getScholarScheme() { return scholarScheme; }
    public void setScholarScheme(String scholarScheme) { this.scholarScheme = scholarScheme; }
    public String getDesignTemplate() { return designTemplate; }
    public void setDesignTemplate(String designTemplate) { this.designTemplate = designTemplate; }
    public String getCustomSectionJson() { return customSectionJson; }
    public void setCustomSectionJson(String customSectionJson) { this.customSectionJson = customSectionJson; }
    public Visibility getVisibility() { return visibility; }
    public void setVisibility(Visibility visibility) { this.visibility = visibility; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getProfessionalTitle() { return professionalTitle; }
    public void setProfessionalTitle(String professionalTitle) { this.professionalTitle = professionalTitle; }
    public String getNcLevel() { return ncLevel; }
    public void setNcLevel(String ncLevel) { this.ncLevel = ncLevel; }
    public String getTrainingCenter() { return trainingCenter; }
    public void setTrainingCenter(String trainingCenter) { this.trainingCenter = trainingCenter; }
    public String getScholarshipType() { return scholarshipType; }
    public void setScholarshipType(String scholarshipType) { this.scholarshipType = scholarshipType; }
    public String getTrainingDuration() { return trainingDuration; }
    public void setTrainingDuration(String trainingDuration) { this.trainingDuration = trainingDuration; }
    public String getTesdaRegistrationNumber() { return tesdaRegistrationNumber; }
    public void setTesdaRegistrationNumber(String tesdaRegistrationNumber) { this.tesdaRegistrationNumber = tesdaRegistrationNumber; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getPortfolioCategory() { return portfolioCategory; }
    public void setPortfolioCategory(String portfolioCategory) { this.portfolioCategory = portfolioCategory; }
    public String getPreferredWorkLocation() { return preferredWorkLocation; }
    public void setPreferredWorkLocation(String preferredWorkLocation) { this.preferredWorkLocation = preferredWorkLocation; }
    public String getWorkScheduleAvailability() { return workScheduleAvailability; }
    public void setWorkScheduleAvailability(String workScheduleAvailability) { this.workScheduleAvailability = workScheduleAvailability; }
    public String getSalaryExpectations() { return salaryExpectations; }
    public void setSalaryExpectations(String salaryExpectations) { this.salaryExpectations = salaryExpectations; }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }
    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }
    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
    public List<AwardRecognition> getAwardsRecognitions() { return awardsRecognitions; }
    public void setAwardsRecognitions(List<AwardRecognition> awardsRecognitions) { this.awardsRecognitions = awardsRecognitions; }
    public List<ContinuingEducation> getContinuingEducations() { return continuingEducations; }
    public void setContinuingEducations(List<ContinuingEducation> continuingEducations) { this.continuingEducations = continuingEducations; }
    public List<ProfessionalMembership> getProfessionalMemberships() { return professionalMemberships; }
    public void setProfessionalMemberships(List<ProfessionalMembership> professionalMemberships) { this.professionalMemberships = professionalMemberships; }
    public List<Reference> getReferences() { return references; }
    public void setReferences(List<Reference> references) { this.references = references; }
    public List<PortfolioView> getPortfolioViews() { return portfolioViews; }
    public void setPortfolioViews(List<PortfolioView> portfolioViews) { this.portfolioViews = portfolioViews; }
}