package tarabaho.tarabaho.dto;

import java.util.ArrayList;
import java.util.List;

import tarabaho.tarabaho.entity.AwardRecognition;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.entity.Experience;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.entity.Skill;
import tarabaho.tarabaho.entity.Visibility;

public class PortfolioRequest {
    private Long id; // Added for response DTO
    private Long graduateId; // Added for response DTO
    private String professionalSummary;
    private String primaryCourseType;
    private String scholarScheme;
    private String designTemplate;
    private String customSectionJson;
    private Visibility visibility;
    private String avatar;
    private String fullName;
    private String professionalTitle;
    private String ncLevel;
    private String trainingCenter;
    private String scholarshipType;
    private String trainingDuration;
    private String tesdaRegistrationNumber;
    private String email;
    private String phone;
    private String website;
    private String portfolioCategory;
    private String preferredWorkLocation;
    private String workScheduleAvailability;
    private String salaryExpectations;
    private List<Skill> skills = new ArrayList<>();
    private List<Experience> experiences = new ArrayList<>();
    private List<Long> projectIds = new ArrayList<>();
    private List<AwardRecognition> awardsRecognitions = new ArrayList<>();
    private List<ContinuingEducation> continuingEducations = new ArrayList<>();
    private List<ProfessionalMembership> professionalMemberships = new ArrayList<>();
    private List<Reference> references = new ArrayList<>();
    private List<Long> certificateIds = new ArrayList<>(); // For creation/updating
    private List<Certificate> certificates = new ArrayList<>(); // For viewing

    // Constructor for mapping from Portfolio entity (for viewing)
    public PortfolioRequest(Portfolio portfolio) {
        this.id = portfolio.getId();
        this.graduateId = portfolio.getGraduate() != null ? portfolio.getGraduate().getId() : null;
        this.professionalSummary = portfolio.getProfessionalSummary();
        this.primaryCourseType = portfolio.getPrimaryCourseType();
        this.scholarScheme = portfolio.getScholarScheme();
        this.designTemplate = portfolio.getDesignTemplate();
        this.customSectionJson = portfolio.getCustomSectionJson();
        this.visibility = portfolio.getVisibility();
        this.avatar = portfolio.getAvatar();
        this.fullName = portfolio.getFullName();
        this.professionalTitle = portfolio.getProfessionalTitle();
        this.ncLevel = portfolio.getNcLevel();
        this.trainingCenter = portfolio.getTrainingCenter();
        this.scholarshipType = portfolio.getScholarshipType();
        this.trainingDuration = portfolio.getTrainingDuration();
        this.tesdaRegistrationNumber = portfolio.getTesdaRegistrationNumber();
        this.email = portfolio.getEmail();
        this.phone = portfolio.getPhone();
        this.website = portfolio.getWebsite();
        this.portfolioCategory = portfolio.getPortfolioCategory();
        this.preferredWorkLocation = portfolio.getPreferredWorkLocation();
        this.workScheduleAvailability = portfolio.getWorkScheduleAvailability();
        this.salaryExpectations = portfolio.getSalaryExpectations();
        this.skills = portfolio.getSkills() != null ? portfolio.getSkills() : new ArrayList<>();
        this.experiences = portfolio.getExperiences() != null ? portfolio.getExperiences() : new ArrayList<>();
        this.projectIds = portfolio.getProjects() != null ?
                portfolio.getProjects().stream().map(Project::getId).toList() : new ArrayList<>();
        this.awardsRecognitions = portfolio.getAwardsRecognitions() != null ?
                portfolio.getAwardsRecognitions() : new ArrayList<>();
        this.continuingEducations = portfolio.getContinuingEducations() != null ?
                portfolio.getContinuingEducations() : new ArrayList<>();
        this.professionalMemberships = portfolio.getProfessionalMemberships() != null ?
                portfolio.getProfessionalMemberships() : new ArrayList<>();
        this.references = portfolio.getReferences() != null ? portfolio.getReferences() : new ArrayList<>();
        // Certificates will be set separately in the service
    }

    // Default constructor
    public PortfolioRequest() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGraduateId() { return graduateId; }
    public void setGraduateId(Long graduateId) { this.graduateId = graduateId; }
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
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
    public List<Long> getProjectIds() { return projectIds; }
    public void setProjectIds(List<Long> projectIds) { this.projectIds = projectIds; }
    public List<AwardRecognition> getAwardsRecognitions() { return awardsRecognitions; }
    public void setAwardsRecognitions(List<AwardRecognition> awardsRecognitions) { this.awardsRecognitions = awardsRecognitions; }
    public List<ContinuingEducation> getContinuingEducations() { return continuingEducations; }
    public void setContinuingEducations(List<ContinuingEducation> continuingEducations) { this.continuingEducations = continuingEducations; }
    public List<ProfessionalMembership> getProfessionalMemberships() { return professionalMemberships; }
    public void setProfessionalMemberships(List<ProfessionalMembership> professionalMemberships) { this.professionalMemberships = professionalMemberships; }
    public List<Reference> getReferences() { return references; }
    public void setReferences(List<Reference> references) { this.references = references; }
    public List<Long> getCertificateIds() { return certificateIds; }
    public void setCertificateIds(List<Long> certificateIds) { this.certificateIds = certificateIds; }
    public List<Certificate> getCertificates() { return certificates; }
    public void setCertificates(List<Certificate> certificates) { this.certificates = certificates; }
}