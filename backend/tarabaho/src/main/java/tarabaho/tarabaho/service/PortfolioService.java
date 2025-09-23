package tarabaho.tarabaho.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import tarabaho.tarabaho.dto.CompletePublicPortfolioResponse;
import tarabaho.tarabaho.dto.PortfolioRequest;
import tarabaho.tarabaho.dto.PublicPortfolioSearchResult;
import tarabaho.tarabaho.dto.ShareInfo;
import tarabaho.tarabaho.entity.AwardRecognition;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.entity.Experience;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.entity.Skill;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.repository.AwardRecognitionRepository;
import tarabaho.tarabaho.repository.CertificateRepository;
import tarabaho.tarabaho.repository.ContinuingEducationRepository;
import tarabaho.tarabaho.repository.ExperienceRepository;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.repository.ProfessionalMembershipRepository;
import tarabaho.tarabaho.repository.ProjectRepository;
import tarabaho.tarabaho.repository.ReferenceRepository;
import tarabaho.tarabaho.repository.SkillRepository;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AwardRecognitionRepository awardRecognitionRepository;

    @Autowired
    private ContinuingEducationRepository continuingEducationRepository;

    @Autowired
    private ProfessionalMembershipRepository professionalMembershipRepository;

    @Autowired
    private ReferenceRepository referenceRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private PortfolioViewService portfolioViewService;

    // Added for project cleanup
    @Autowired
    private ProjectService projectService;

    @PersistenceContext
    private EntityManager entityManager;

    private String generateShareToken() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    public PortfolioRequest getPortfolioByGraduateId(Long graduateId, String username) {
        System.out.println("PortfolioService: Fetching portfolio for graduate ID: " + graduateId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateId(graduateId);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: No portfolio found for graduate ID: " + graduateId);
            return null;
        }

        Portfolio portfolio = portfolioOpt.get();
        if (portfolio.getVisibility() == Visibility.PRIVATE) {
            if (username == null) {
                System.out.println("PortfolioService: No authenticated user for private portfolio");
                return null;
            }
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null) {
                System.out.println("PortfolioService: Graduate not found for username: " + username);
                throw new IllegalArgumentException("Graduate not found for username: " + username);
            }
            if (!portfolio.getGraduate().getUsername().equals(username)) {
                System.out.println("PortfolioService: Unauthorized access to private portfolio");
                return null;
            }
        }

        PortfolioRequest portfolioRequest = new PortfolioRequest(portfolio);
        List<Certificate> certificates = certificateRepository.findByGraduateId(graduateId);
        portfolioRequest.setCertificates(certificates);
        System.out.println("PortfolioService: Retrieved portfolio with " + certificates.size() + " certificates");

        return portfolioRequest;
    }

    public PortfolioRequest createPortfolio(Long graduateId, PortfolioRequest portfolioRequest, String username) throws Exception {
        System.out.println("PortfolioService: Creating portfolio for graduate ID: " + graduateId);
        Graduate graduate = graduateRepository.findById(graduateId)
                .orElseThrow(() -> new Exception("Graduate not found with id: " + graduateId));

     
        if (!graduate.getUsername().equals(username)) {
            System.out.println("PortfolioService: Unauthorized attempt to create portfolio");
            throw new Exception("Unauthorized: Cannot create portfolio for another graduate.");
        }

        if (portfolioRepository.findByGraduateId(graduateId).isPresent()) {
            System.out.println("PortfolioService: Portfolio already exists for graduate ID: " + graduateId);
            throw new Exception("Portfolio already exists for this graduate.");
        }

        Portfolio portfolio = new Portfolio();
        portfolio.setGraduate(graduate);
        portfolio.setProfessionalSummary(portfolioRequest.getProfessionalSummary());
        portfolio.setPrimaryCourseType(portfolioRequest.getPrimaryCourseType());
        portfolio.setScholarScheme(portfolioRequest.getScholarScheme());
        portfolio.setDesignTemplate(portfolioRequest.getDesignTemplate());
        portfolio.setCustomSectionJson(portfolioRequest.getCustomSectionJson());
        portfolio.setVisibility(portfolioRequest.getVisibility());
        portfolio.setAvatar(portfolioRequest.getAvatar());
        portfolio.setFullName(portfolioRequest.getFullName());
        portfolio.setProfessionalTitle(portfolioRequest.getProfessionalTitle());
        portfolio.setNcLevel(portfolioRequest.getNcLevel());
        portfolio.setTrainingCenter(portfolioRequest.getTrainingCenter());
        portfolio.setScholarshipType(portfolioRequest.getScholarshipType());
        portfolio.setTrainingDuration(portfolioRequest.getTrainingDuration());
        portfolio.setTesdaRegistrationNumber(portfolioRequest.getTesdaRegistrationNumber());
        portfolio.setEmail(portfolioRequest.getEmail());
        portfolio.setPhone(portfolioRequest.getPhone());
        portfolio.setWebsite(portfolioRequest.getWebsite());
        portfolio.setPortfolioCategory(portfolioRequest.getPortfolioCategory());
        portfolio.setPreferredWorkLocation(portfolioRequest.getPreferredWorkLocation());
        portfolio.setWorkScheduleAvailability(portfolioRequest.getWorkScheduleAvailability());
        portfolio.setSalaryExpectations(portfolioRequest.getSalaryExpectations());

        String shareToken = generateShareToken();
        portfolio.setShareToken(shareToken);
        System.out.println("PortfolioService: Generated share token: " + shareToken);

        // Initialize collections
        List<Skill> skills = portfolioRequest.getSkills() != null ? portfolioRequest.getSkills() : new ArrayList<>();
        skills.forEach(skill -> skill.setPortfolio(portfolio));
        portfolio.setSkills(skills);

        List<Experience> experiences = portfolioRequest.getExperiences() != null ? portfolioRequest.getExperiences() : new ArrayList<>();
        experiences.forEach(exp -> exp.setPortfolio(portfolio));
        portfolio.setExperiences(experiences);

        List<Project> projects = portfolioRequest.getProjectIds() != null ? 
            projectRepository.findAllById(portfolioRequest.getProjectIds()) : new ArrayList<>();
        projects.forEach(project -> project.setPortfolio(portfolio));
        portfolio.setProjects(projects);

        List<AwardRecognition> awards = portfolioRequest.getAwardsRecognitions() != null ? 
            portfolioRequest.getAwardsRecognitions() : new ArrayList<>();
        awards.forEach(award -> award.setPortfolio(portfolio));
        portfolio.setAwardsRecognitions(awards);

        List<ContinuingEducation> educations = portfolioRequest.getContinuingEducations() != null ? 
            portfolioRequest.getContinuingEducations() : new ArrayList<>();
        educations.forEach(edu -> edu.setPortfolio(portfolio));
        portfolio.setContinuingEducations(educations);

        List<ProfessionalMembership> memberships = portfolioRequest.getProfessionalMemberships() != null ? 
            portfolioRequest.getProfessionalMemberships() : new ArrayList<>();
        memberships.forEach(mem -> mem.setPortfolio(portfolio));
        portfolio.setProfessionalMemberships(memberships);

        List<Reference> references = portfolioRequest.getReferences() != null ? 
            portfolioRequest.getReferences() : new ArrayList<>();
        references.forEach(ref -> ref.setPortfolio(portfolio));
        portfolio.setReferences(references);
        /* 
        List<PortfolioView> portfolioViews = portfolioRequest.getPortfolioViews() != null ? 
            portfolioRequest.getPortfolioViews() : new ArrayList<>();
        portfolioViews.forEach(view -> view.setPortfolio(portfolio));
        portfolio.setPortfolioViews(portfolioViews);
        */
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        System.out.println("PortfolioService: Portfolio created, ID: " + savedPortfolio.getId());

        // Update certificates with portfolioId only for explicitly included certificates
        if (portfolioRequest.getCertificateIds() != null && !portfolioRequest.getCertificateIds().isEmpty()) {
            for (Long certificateId : portfolioRequest.getCertificateIds()) {
                Optional<Certificate> certificateOpt = certificateRepository.findById(certificateId);
                if (certificateOpt.isPresent()) {
                    Certificate certificate = certificateOpt.get();
                    if (certificate.getGraduate().getId().equals(graduateId)) {
                        certificate.setPortfolioId(savedPortfolio.getId());
                        certificateRepository.save(certificate);
                        System.out.println("PortfolioService: Linked certificate ID: " + certificateId + " to portfolio ID: " + savedPortfolio.getId());
                    }
                }
            }
        }

        PortfolioRequest response = new PortfolioRequest(savedPortfolio);
        response.setCertificates(certificateRepository.findByGraduateId(graduateId));
        return response;
    }

    @Transactional
    public void deletePortfolio(Long portfolioId, String username) throws Exception {
        System.out.println("PortfolioService: Deleting portfolio ID: " + portfolioId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findById(portfolioId);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: Portfolio not found with ID: " + portfolioId);
            throw new Exception("Portfolio not found with id: " + portfolioId);
        }

        Portfolio portfolio = portfolioOpt.get();
        Graduate graduate = portfolio.getGraduate();
        if (!graduate.getUsername().equals(username)) {
            System.out.println("PortfolioService: Unauthorized attempt to delete portfolio");
            throw new Exception("Unauthorized: Cannot delete portfolio for another graduate.");
        }

        // Delete portfolio-related certificates (only those with matching portfolio_id)
        certificateService.deleteCertificatesByPortfolioId(portfolioId);
        
        // Added: Delete portfolio-related projects (only those with matching portfolio_id)
        projectService.deleteProjectsByPortfolioId(portfolioId);

        // Clear collections to trigger orphan removal
        portfolio.getSkills().clear();
        portfolio.getExperiences().clear();
        portfolio.getProjects().clear();
        portfolio.getAwardsRecognitions().clear();
        portfolio.getContinuingEducations().clear();
        portfolio.getProfessionalMemberships().clear();
        portfolio.getReferences().clear();
        portfolio.getPortfolioViews().clear();

        // Save to persist cleared collections
        portfolioRepository.save(portfolio);
        entityManager.flush();

        // Delete portfolio
        portfolioRepository.deleteById(portfolioId);
        System.out.println("PortfolioService: Portfolio deleted, ID: " + portfolioId);
    }

    @Transactional
    public void deletePortfolioByGraduateId(Long graduateId, String username) throws Exception {
        System.out.println("PortfolioService: Fetching portfolio for graduate ID: " + graduateId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateId(graduateId);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: Portfolio not found for graduate ID: " + graduateId);
            throw new Exception("Portfolio not found for graduate ID: " + graduateId);
        }
        deletePortfolio(portfolioOpt.get().getId(), username);
    }

    public void setVisibility(Long portfolioId, Visibility visibility, String username) throws Exception {
        System.out.println("PortfolioService: Setting visibility for portfolio ID: " + portfolioId + " to " + visibility);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findById(portfolioId);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: Portfolio not found with ID: " + portfolioId);
            throw new Exception("Portfolio not found with id: " + portfolioId);
        }

        Portfolio portfolio = portfolioOpt.get();
        Graduate graduate = portfolio.getGraduate();
        if (!graduate.getUsername().equals(username)) {
            System.out.println("PortfolioService: Unauthorized attempt to set visibility for portfolio ID: " + portfolioId);
            throw new Exception("Unauthorized: Cannot set visibility for another graduate's portfolio.");
        }

        if (visibility != Visibility.PUBLIC && visibility != Visibility.PRIVATE) {
            System.out.println("PortfolioService: Invalid visibility value: " + visibility);
            throw new Exception("Invalid visibility value. Must be PUBLIC or PRIVATE.");
        }

        portfolio.setVisibility(visibility);
        portfolioRepository.save(portfolio);
        System.out.println("PortfolioService: Visibility set to " + visibility + " for portfolio ID: " + portfolioId);
    }

    // Added: Method for ProjectController to validate portfolio access
    public PortfolioRequest getPortfolio(Long portfolioId, String username) throws Exception {
        System.out.println("PortfolioService: Fetching portfolio ID: " + portfolioId);
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> {
                System.out.println("PortfolioService: Portfolio not found with ID: " + portfolioId);
                return new Exception("Portfolio not found with id: " + portfolioId);
            });

        if (portfolio.getVisibility() == Visibility.PRIVATE) {
            if (username == null) {
                System.out.println("PortfolioService: No authenticated user for private portfolio");
                throw new Exception("Unauthorized: No authenticated user for private portfolio.");
            }
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
                System.out.println("PortfolioService: Unauthorized access to private portfolio");
                throw new Exception("Unauthorized: Cannot access private portfolio of another graduate.");
            }
        }

        PortfolioRequest portfolioRequest = new PortfolioRequest(portfolio);
        portfolioRequest.setCertificates(certificateRepository.findByGraduateId(portfolio.getGraduate().getId()));
        System.out.println("PortfolioService: Retrieved portfolio with ID: " + portfolioId);
        return portfolioRequest;
    }

    @Transactional
    public PortfolioRequest updatePortfolio(Long portfolioId, PortfolioRequest portfolioRequest, String username) throws Exception {
        System.out.println("PortfolioService: Updating portfolio ID: " + portfolioId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findById(portfolioId);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: Portfolio not found with ID: " + portfolioId);
            throw new Exception("Portfolio not found with id: " + portfolioId);
        }

        Portfolio portfolio = portfolioOpt.get();
        Graduate graduate = portfolio.getGraduate();
        if (!graduate.getUsername().equals(username)) {
            System.out.println("PortfolioService: Unauthorized attempt to update portfolio");
            throw new Exception("Unauthorized: Cannot update portfolio for another graduate.");
        }

        // Update portfolio fields
        portfolio.setProfessionalSummary(portfolioRequest.getProfessionalSummary() != null ? portfolioRequest.getProfessionalSummary() : "");
        portfolio.setPrimaryCourseType(portfolioRequest.getPrimaryCourseType() != null ? portfolioRequest.getPrimaryCourseType() : "");
        portfolio.setScholarScheme(portfolioRequest.getScholarScheme() != null ? portfolioRequest.getScholarScheme() : "");
        portfolio.setDesignTemplate(portfolioRequest.getDesignTemplate() != null ? portfolioRequest.getDesignTemplate() : "");
        portfolio.setCustomSectionJson(portfolioRequest.getCustomSectionJson() != null ? portfolioRequest.getCustomSectionJson() : "");
        portfolio.setVisibility(portfolioRequest.getVisibility() != null ? portfolioRequest.getVisibility() : Visibility.PRIVATE);
        portfolio.setAvatar(portfolioRequest.getAvatar() != null ? portfolioRequest.getAvatar() : "");
        portfolio.setFullName(portfolioRequest.getFullName() != null ? portfolioRequest.getFullName() : "");
        portfolio.setProfessionalTitle(portfolioRequest.getProfessionalTitle() != null ? portfolioRequest.getProfessionalTitle() : "");
        portfolio.setNcLevel(portfolioRequest.getNcLevel() != null ? portfolioRequest.getNcLevel() : "");
        portfolio.setTrainingCenter(portfolioRequest.getTrainingCenter() != null ? portfolioRequest.getTrainingCenter() : "");
        portfolio.setScholarshipType(portfolioRequest.getScholarshipType() != null ? portfolioRequest.getScholarshipType() : "");
        portfolio.setTrainingDuration(portfolioRequest.getTrainingDuration() != null ? portfolioRequest.getTrainingDuration() : "");
        portfolio.setTesdaRegistrationNumber(portfolioRequest.getTesdaRegistrationNumber() != null ? portfolioRequest.getTesdaRegistrationNumber() : "");
        portfolio.setEmail(portfolioRequest.getEmail() != null ? portfolioRequest.getEmail() : "");
        portfolio.setPhone(portfolioRequest.getPhone() != null ? portfolioRequest.getPhone() : "");
        portfolio.setWebsite(portfolioRequest.getWebsite() != null ? portfolioRequest.getWebsite() : "");
        portfolio.setPortfolioCategory(portfolioRequest.getPortfolioCategory() != null ? portfolioRequest.getPortfolioCategory() : "");
        portfolio.setPreferredWorkLocation(portfolioRequest.getPreferredWorkLocation() != null ? portfolioRequest.getPreferredWorkLocation() : "");
        portfolio.setWorkScheduleAvailability(portfolioRequest.getWorkScheduleAvailability() != null ? portfolioRequest.getWorkScheduleAvailability() : "");
        portfolio.setSalaryExpectations(portfolioRequest.getSalaryExpectations() != null ? portfolioRequest.getSalaryExpectations() : "");

        

        // Update skills
        List<Skill> incomingSkills = portfolioRequest.getSkills() != null ? portfolioRequest.getSkills() : new ArrayList<>();
        System.out.println("PortfolioService: Updating skills for portfolio ID: " + portfolioId + ", incoming skills: " + incomingSkills.size());
        List<Skill> existingSkills = portfolio.getSkills();
        existingSkills.removeIf(skill -> incomingSkills.stream()
                .noneMatch(incomingSkill -> skill.getId() != null && incomingSkill.getId() != null && skill.getId().equals(incomingSkill.getId())));
        for (Skill incomingSkill : incomingSkills) {
            if (incomingSkill.getName() == null || incomingSkill.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Skill name is required");
            }
            Skill skill = existingSkills.stream()
                    .filter(s -> incomingSkill.getId() != null && s.getId() != null && s.getId().equals(incomingSkill.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        Skill newSkill = new Skill();
                        newSkill.setPortfolio(portfolio);
                        existingSkills.add(newSkill);
                        return newSkill;
                    });
            skill.setName(incomingSkill.getName());
            skill.setType(incomingSkill.getType());
            skill.setProficiencyLevel(incomingSkill.getProficiencyLevel());
        }
        skillRepository.saveAll(existingSkills);
        entityManager.flush();

        // Update experiences
        List<Experience> incomingExperiences = portfolioRequest.getExperiences() != null ? portfolioRequest.getExperiences() : new ArrayList<>();
        System.out.println("PortfolioService: Updating experiences for portfolio ID: " + portfolioId + ", incoming experiences: " + incomingExperiences.size());
        List<Experience> existingExperiences = portfolio.getExperiences();
        existingExperiences.removeIf(exp -> incomingExperiences.stream()
                .noneMatch(incomingExp -> exp.getId() != null && incomingExp.getId() != null && exp.getId().equals(incomingExp.getId())));
        for (Experience incomingExp : incomingExperiences) {
            if (incomingExp.getJobTitle() == null || incomingExp.getJobTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Experience job title is required");
            }
            Experience experience = existingExperiences.stream()
                    .filter(e -> incomingExp.getId() != null && e.getId() != null && e.getId().equals(incomingExp.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        Experience newExp = new Experience();
                        newExp.setPortfolio(portfolio);
                        existingExperiences.add(newExp);
                        return newExp;
                    });
            experience.setJobTitle(incomingExp.getJobTitle());
            experience.setEmployer(incomingExp.getEmployer());
            experience.setDescription(incomingExp.getDescription() != null ? incomingExp.getDescription() : "");
            experience.setStartDate(incomingExp.getStartDate());
            experience.setEndDate(incomingExp.getEndDate());
        }
        experienceRepository.saveAll(existingExperiences);
        entityManager.flush();

        // Update awards
        List<AwardRecognition> incomingAwards = portfolioRequest.getAwardsRecognitions() != null ? portfolioRequest.getAwardsRecognitions() : new ArrayList<>();
        System.out.println("PortfolioService: Updating awards for portfolio ID: " + portfolioId + ", incoming awards: " + incomingAwards.size());
        List<AwardRecognition> existingAwards = portfolio.getAwardsRecognitions();
        existingAwards.removeIf(award -> incomingAwards.stream()
                .noneMatch(incomingAward -> award.getId() != null && incomingAward.getId() != null && award.getId().equals(incomingAward.getId())));
        for (AwardRecognition incomingAward : incomingAwards) {
            if (incomingAward.getTitle() == null || incomingAward.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Award title is required");
            }
            AwardRecognition award = existingAwards.stream()
                    .filter(a -> incomingAward.getId() != null && a.getId() != null && a.getId().equals(incomingAward.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        AwardRecognition newAward = new AwardRecognition();
                        newAward.setPortfolio(portfolio);
                        existingAwards.add(newAward);
                        return newAward;
                    });
            award.setTitle(incomingAward.getTitle());
            award.setIssuer(incomingAward.getIssuer());
            award.setDateReceived(incomingAward.getDateReceived());
        }
        awardRecognitionRepository.saveAll(existingAwards);
        entityManager.flush();

        // Update continuing education
        List<ContinuingEducation> incomingEducations = portfolioRequest.getContinuingEducations() != null ? portfolioRequest.getContinuingEducations() : new ArrayList<>();
        System.out.println("PortfolioService: Updating continuing educations for portfolio ID: " + portfolioId + ", incoming educations: " + incomingEducations.size());
        List<ContinuingEducation> existingEducations = portfolio.getContinuingEducations();
        existingEducations.removeIf(edu -> incomingEducations.stream()
                .noneMatch(incomingEdu -> edu.getId() != null && incomingEdu.getId() != null && edu.getId().equals(incomingEdu.getId())));
        for (ContinuingEducation incomingEdu : incomingEducations) {
            if (incomingEdu.getCourseName() == null || incomingEdu.getCourseName().trim().isEmpty()) {
                throw new IllegalArgumentException("Course name is required");
            }
            ContinuingEducation education = existingEducations.stream()
                    .filter(e -> incomingEdu.getId() != null && e.getId() != null && e.getId().equals(incomingEdu.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        ContinuingEducation newEdu = new ContinuingEducation();
                        newEdu.setPortfolio(portfolio);
                        existingEducations.add(newEdu);
                        return newEdu;
                    });
            education.setCourseName(incomingEdu.getCourseName());
            education.setInstitution(incomingEdu.getInstitution());
            education.setCompletionDate(incomingEdu.getCompletionDate());
        }
        continuingEducationRepository.saveAll(existingEducations);
        entityManager.flush();

        // Update professional memberships
        List<ProfessionalMembership> incomingMemberships = portfolioRequest.getProfessionalMemberships() != null ? portfolioRequest.getProfessionalMemberships() : new ArrayList<>();
        System.out.println("PortfolioService: Updating professional memberships for portfolio ID: " + portfolioId + ", incoming memberships: " + incomingMemberships.size());
        List<ProfessionalMembership> existingMemberships = portfolio.getProfessionalMemberships();
        existingMemberships.removeIf(mem -> incomingMemberships.stream()
                .noneMatch(incomingMem -> mem.getId() != null && incomingMem.getId() != null && mem.getId().equals(incomingMem.getId())));
        for (ProfessionalMembership incomingMem : incomingMemberships) {
            if (incomingMem.getOrganization() == null || incomingMem.getOrganization().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization is required");
            }
            ProfessionalMembership membership = existingMemberships.stream()
                    .filter(m -> incomingMem.getId() != null && m.getId() != null && m.getId().equals(incomingMem.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        ProfessionalMembership newMem = new ProfessionalMembership();
                        newMem.setPortfolio(portfolio);
                        existingMemberships.add(newMem);
                        return newMem;
                    });
            membership.setOrganization(incomingMem.getOrganization());
            membership.setMembershipType(incomingMem.getMembershipType());
            membership.setStartDate(incomingMem.getStartDate());
        }
        professionalMembershipRepository.saveAll(existingMemberships);
        entityManager.flush();

        // Update references
        List<Reference> incomingReferences = portfolioRequest.getReferences() != null ? portfolioRequest.getReferences() : new ArrayList<>();
        System.out.println("PortfolioService: Updating references for portfolio ID: " + portfolioId + ", incoming references: " + incomingReferences.size());
        List<Reference> existingReferences = portfolio.getReferences();
        existingReferences.removeIf(ref -> incomingReferences.stream()
                .noneMatch(incomingRef -> ref.getId() != null && incomingRef.getId() != null && ref.getId().equals(incomingRef.getId())));
        for (Reference incomingRef : incomingReferences) {
            if (incomingRef.getName() == null || incomingRef.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Reference name is required");
            }
            Reference reference = existingReferences.stream()
                    .filter(r -> incomingRef.getId() != null && r.getId() != null && r.getId().equals(incomingRef.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        Reference newRef = new Reference();
                        newRef.setPortfolio(portfolio);
                        existingReferences.add(newRef);
                        return newRef;
                    });
            reference.setName(incomingRef.getName());
            reference.setRelationship(incomingRef.getRelationship());
            reference.setEmail(incomingRef.getEmail());
            reference.setPhone(incomingRef.getPhone());
        }
        referenceRepository.saveAll(existingReferences);
        entityManager.flush();
        /* 
        // Update portfolio views
        List<PortfolioView> incomingPortfolioViews = portfolioRequest.getPortfolioViews() != null ? portfolioRequest.getPortfolioViews() : new ArrayList<>();
        System.out.println("PortfolioService: Updating portfolio views for portfolio ID: " + portfolioId + ", incoming views: " + incomingPortfolioViews.size());
        List<PortfolioView> existingPortfolioViews = portfolio.getPortfolioViews();
        existingPortfolioViews.removeIf(view -> incomingPortfolioViews.stream()
                .noneMatch(incomingView -> view.getId() != null && incomingView.getId() != null && view.getId().equals(incomingView.getId())));
        for (PortfolioView incomingView : incomingPortfolioViews) {
            PortfolioView view = existingPortfolioViews.stream()
                    .filter(v -> incomingView.getId() != null && v.getId() != null && v.getId().equals(incomingView.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        PortfolioView newView = new PortfolioView();
                        newView.setPortfolio(portfolio);
                        existingPortfolioViews.add(newView);
                        return newView;
                    });
            view.setViewTimestamp(incomingView.getViewTimestamp());
        }
        portfolioRepository.save(portfolio); // Save portfolio to persist portfolioViews
        entityManager.flush();
        */
        // Update certificate associations
        List<Long> incomingCertificateIds = portfolioRequest.getCertificateIds() != null ? portfolioRequest.getCertificateIds() : new ArrayList<>();
        System.out.println("PortfolioService: Updating certificates for portfolio ID: " + portfolioId + ", incoming certificate IDs: " + incomingCertificateIds.size());
        
        // Fetch all certificates for the graduate to preserve their portfolio_id if not in incomingCertificateIds
        List<Certificate> graduateCertificates = certificateRepository.findByGraduateId(graduate.getId());
        for (Certificate certificate : graduateCertificates) {
            if (incomingCertificateIds.contains(certificate.getId())) {
                // Link certificate to portfolio if included in request
                if (!portfolioId.equals(certificate.getPortfolioId())) {
                    certificate.setPortfolioId(portfolioId);
                    certificateRepository.save(certificate);
                    System.out.println("PortfolioService: Linked certificate ID: " + certificate.getId() + " to portfolio ID: " + portfolioId);
                }
            } else if (portfolioId.equals(certificate.getPortfolioId())) {
                // Unlink certificate from this portfolio if it was previously linked but not included in request
                certificate.setPortfolioId(null);
                certificateRepository.save(certificate);
                System.out.println("PortfolioService: Unlinked certificate ID: " + certificate.getId() + " from portfolio ID: " + portfolioId);
            }
            // Certificates not in incomingCertificateIds and not linked to this portfolio retain their portfolio_id (null or other)
        }
        entityManager.flush();

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        System.out.println("PortfolioService: Portfolio updated, ID: " + savedPortfolio.getId());

        PortfolioRequest response = new PortfolioRequest(savedPortfolio);
        response.setCertificates(certificateRepository.findByGraduateId(graduate.getId()));
        return response;
    }
    // ← NEW: Get share info for authenticated user
    public ShareInfo getShareInfo(Long graduateId, String username) {
        System.out.println("PortfolioService: Getting share info for graduate ID: " + graduateId);
        
        // Verify user owns this portfolio
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateId(graduateId);
        if (!portfolioOpt.isPresent()) {
            throw new IllegalArgumentException("Portfolio not found for graduate ID: " + graduateId);
        }
        
        Portfolio portfolio = portfolioOpt.get();
        Graduate graduate = portfolio.getGraduate();
        if (!graduate.getUsername().equals(username)) {
            throw new IllegalArgumentException("Unauthorized: Cannot access share token for another graduate.");
        }
        
        // Generate share token if none exists
        if (portfolio.getShareToken() == null || portfolio.getShareToken().trim().isEmpty()) {
            String newToken = generateShareToken();
            portfolio.setShareToken(newToken);
            portfolioRepository.save(portfolio);
            System.out.println("PortfolioService: Generated new share token: " + newToken);
        }
        
        String shareToken = portfolio.getShareToken();
        String shareUrl = String.format("https://tarabaho.vercel.app/portfolio/%d?share=%s", 
            graduateId, shareToken);
        
        return new ShareInfo(shareToken, shareUrl);
    }

    public CompletePublicPortfolioResponse getPublicPortfolioByShareToken(Long graduateId, String shareToken,String viewId) {
        System.out.println("PortfolioService: Validating public access for graduate ID: " + graduateId);
        System.out.println("=== PORTFOLIO SERVICE DEBUG ===");
        System.out.println("Graduate ID: " + graduateId);
        System.out.println("Share Token: " + (shareToken != null ? shareToken.substring(0, Math.min(8, shareToken.length())) + "..." : "NULL"));
        System.out.println("View ID received: " + (viewId != null ? viewId : "NULL"));
        System.out.println("=== END DEBUG ===");
        
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateIdAndShareToken(graduateId, shareToken);
        if (!portfolioOpt.isPresent()) {
            System.out.println("PortfolioService: Invalid share token for graduate ID: " + graduateId);
            return null;
        }
        
        Portfolio portfolio = portfolioOpt.get();
        if (portfolio.getVisibility() != Visibility.PUBLIC) {
            System.out.println("PortfolioService: Portfolio is not public: " + graduateId);
            return null;
        }
        // ← NEW: Record the view!
        boolean viewRecorded = portfolioViewService.recordView(portfolio, viewId);
        String viewPreview = viewId != null ? viewId.substring(0, 8) + "..." : "no-view";
        System.out.println("PortfolioService: View recorded: " + (viewRecorded ? "NEW" : "DUPLICATE") + 
                        " (view: " + viewPreview + ")");
        // Create base portfolio request
        PortfolioRequest portfolioRequest = new PortfolioRequest(portfolio);
        
        // Create public graduate data
        Graduate originalGraduate = portfolio.getGraduate();
        Map<String, Object> publicGraduate = new HashMap<>();
        publicGraduate.put("id", originalGraduate.getId());
        publicGraduate.put("fullName", (originalGraduate.getFirstName() != null ? originalGraduate.getFirstName() : "") + 
                                (originalGraduate.getLastName() != null ? " " + originalGraduate.getLastName() : ""));
        publicGraduate.put("profilePicture", originalGraduate.getProfilePicture());
        
        // Get related data
        List<Certificate> publicCertificates = certificateRepository.findByGraduateId(graduateId);
        List<Project> publicProjects = projectRepository.findByPortfolioId(portfolio.getId());
        
        // Log access
        logPortfolioView(portfolio.getId(), "share-token:" + shareToken.substring(0, 8));
        
        return new CompletePublicPortfolioResponse(portfolioRequest, publicGraduate, publicCertificates, publicProjects);
    }

    

    // ← NEW: Log portfolio views (simple version)
    private void logPortfolioView(Long portfolioId, String accessMethod) {
        System.out.println("Portfolio view - ID: " + portfolioId + ", Method: " + accessMethod + 
                          ", Time: " + java.time.LocalDateTime.now());
        // TODO: Save to PortfolioView entity if you want analytics
    }

    public ShareInfo regenerateShareToken(Long graduateId, String username) {
        System.out.println("PortfolioService: Regenerating share token for graduate ID: " + graduateId);
        
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateId(graduateId);
        if (!portfolioOpt.isPresent()) {
            throw new IllegalArgumentException("Portfolio not found.");
        }
        
        Portfolio portfolio = portfolioOpt.get();
        Graduate graduate = portfolio.getGraduate();
        if (!graduate.getUsername().equals(username)) {
            throw new IllegalArgumentException("Unauthorized.");
        }
        
        // Generate NEW token
        String newToken = generateShareToken();
        portfolio.setShareToken(newToken);
        portfolioRepository.save(portfolio);
        
        String shareUrl = String.format("https://tarabaho.vercel.app/portfolio/%d?share=%s", graduateId, newToken);
        
        return new ShareInfo(newToken, shareUrl);
    }
    
    @Transactional
    public List<PublicPortfolioSearchResult> searchPublicPortfolios(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<Portfolio> portfolios = portfolioRepository.searchPublicPortfolios(query);
        return portfolios.stream()
                .map(PublicPortfolioSearchResult::new)
                .collect(Collectors.toList());
    }
}