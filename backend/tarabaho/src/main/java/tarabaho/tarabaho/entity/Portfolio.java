    package tarabaho.tarabaho.entity;

    import java.util.ArrayList;
    import java.util.List;

    import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
    import com.fasterxml.jackson.annotation.JsonInclude;

    import jakarta.persistence.CascadeType;
    import jakarta.persistence.Column;
    import jakarta.persistence.Entity;
    import jakarta.persistence.EnumType;
    import jakarta.persistence.Enumerated;
    import jakarta.persistence.FetchType;
    import jakarta.persistence.GeneratedValue;
    import jakarta.persistence.GenerationType;
    import jakarta.persistence.Id;
    import jakarta.persistence.JoinColumn;
    import jakarta.persistence.ManyToOne;
    import jakarta.persistence.OneToMany;
    import jakarta.persistence.Table;

    @Entity
    @Table(name = "portfolios")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public class Portfolio {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "graduate_id", nullable = false)
        private Graduate graduate;

        @Column(nullable = false)
        private String fullName;

        @Column
        private String email;

        @Column
        private String professionalSummary;

        @Column
        private String primaryCourseType;

        @Column
        private String scholarScheme;

        @Column
        private String designTemplate;

        @Column
        private String customSectionJson;

        @Enumerated(EnumType.STRING)
        @Column
        private Visibility visibility;

        @Column
        private String avatar;

        @Column
        private String professionalTitle;

        @Column
        private String ncLevel;

        @Column
        private String trainingCenter;

        @Column
        private String scholarshipType;

        @Column
        private String trainingDuration;

        @Column
        private String tesdaRegistrationNumber;

        @Column
        private String phone;

        @Column
        private String website;

        @Column
        private String portfolioCategory;

        @Column
        private String preferredWorkLocation;

        @Column
        private String workScheduleAvailability;

        @Column
        private String salaryExpectations;

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<Skill> skills = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<Experience> experiences = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<Project> projects = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<AwardRecognition> awardsRecognitions = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<ContinuingEducation> continuingEducations = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<ProfessionalMembership> professionalMemberships = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<Reference> references = new ArrayList<>();

        @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        private List<PortfolioView> portfolioViews = new ArrayList<>();

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Graduate getGraduate() { return graduate; }
        public void setGraduate(Graduate graduate) { this.graduate = graduate; }
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
        public void setSkills(List<Skill> skills) { this.skills = (skills != null) ? skills : new ArrayList<>(); }
        public List<Experience> getExperiences() { return experiences; }
        public void setExperiences(List<Experience> experiences) { this.experiences = (experiences != null) ? experiences : new ArrayList<>(); }
        public List<Project> getProjects() { return projects; }
        public void setProjects(List<Project> projects) { this.projects = (projects != null) ? projects : new ArrayList<>(); }
        public List<AwardRecognition> getAwardsRecognitions() { return awardsRecognitions; }
        public void setAwardsRecognitions(List<AwardRecognition> awardsRecognitions) { 
            this.awardsRecognitions = (awardsRecognitions != null) ? awardsRecognitions : new ArrayList<>(); 
        }
        public List<ContinuingEducation> getContinuingEducations() { return continuingEducations; }
        public void setContinuingEducations(List<ContinuingEducation> continuingEducations) { 
            this.continuingEducations = (continuingEducations != null) ? continuingEducations : new ArrayList<>(); 
        }
        public List<ProfessionalMembership> getProfessionalMemberships() { return professionalMemberships; }
        public void setProfessionalMemberships(List<ProfessionalMembership> professionalMemberships) { 
            this.professionalMemberships = (professionalMemberships != null) ? professionalMemberships : new ArrayList<>(); 
        }
        public List<Reference> getReferences() { return references; }
        public void setReferences(List<Reference> references) { this.references = (references != null) ? references : new ArrayList<>(); }
        public List<PortfolioView> getPortfolioViews() { return portfolioViews; }
        public void setPortfolioViews(List<PortfolioView> portfolioViews) { 
            this.portfolioViews = (portfolioViews != null) ? portfolioViews : new ArrayList<>(); 
        }
    }