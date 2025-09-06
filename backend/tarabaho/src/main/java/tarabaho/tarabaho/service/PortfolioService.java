package tarabaho.tarabaho.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import tarabaho.tarabaho.dto.PortfolioRequest;
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

    @PersistenceContext
    private EntityManager entityManager;

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

        portfolio.setSkills(skillRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setExperiences(experienceRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setProjects(projectRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setAwardsRecognitions(awardRecognitionRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setContinuingEducations(continuingEducationRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setProfessionalMemberships(professionalMembershipRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setReferences(referenceRepository.findByPortfolioId(portfolio.getId()));

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

        List<Certificate> certificates = certificateRepository.findByGraduateId(graduateId);
        if (certificates.isEmpty()) {
            System.out.println("PortfolioService: Graduate not verified (no certificates)");
            throw new Exception("Graduate must be verified with at least one certificate before creating a portfolio.");
        }

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

        if (portfolioRequest.getSkills() != null) {
            portfolioRequest.getSkills().forEach(skill -> skill.setPortfolio(portfolio));
            portfolio.setSkills(portfolioRequest.getSkills());
        }
        if (portfolioRequest.getExperiences() != null) {
            portfolioRequest.getExperiences().forEach(experience -> experience.setPortfolio(portfolio));
            portfolio.setExperiences(portfolioRequest.getExperiences());
        }
        if (portfolioRequest.getProjectIds() != null) {
            List<Project> projects = projectRepository.findAllById(portfolioRequest.getProjectIds());
            projects.forEach(project -> project.setPortfolio(portfolio));
            portfolio.setProjects(projects);
        }
        if (portfolioRequest.getAwardsRecognitions() != null) {
            portfolioRequest.getAwardsRecognitions().forEach(award -> award.setPortfolio(portfolio));
            portfolio.setAwardsRecognitions(portfolioRequest.getAwardsRecognitions());
        }
        if (portfolioRequest.getContinuingEducations() != null) {
            portfolioRequest.getContinuingEducations().forEach(education -> education.setPortfolio(portfolio));
            portfolio.setContinuingEducations(portfolioRequest.getContinuingEducations());
        }
        if (portfolioRequest.getProfessionalMemberships() != null) {
            portfolioRequest.getProfessionalMemberships().forEach(membership -> membership.setPortfolio(portfolio));
            portfolio.setProfessionalMemberships(portfolioRequest.getProfessionalMemberships());
        }
        if (portfolioRequest.getReferences() != null) {
            portfolioRequest.getReferences().forEach(reference -> reference.setPortfolio(portfolio));
            portfolio.setReferences(portfolioRequest.getReferences());
        }

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        System.out.println("PortfolioService: Portfolio created, ID: " + savedPortfolio.getId());

        // Update certificates with portfolioId
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

        // Delete portfolio-related certificates
        certificateService.deleteCertificatesByPortfolioId(portfolioId);

        // Delete portfolio
        portfolioRepository.deleteById(portfolioId);
        System.out.println("PortfolioService: Portfolio deleted, ID: " + portfolioId);
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

        portfolio.setSkills(skillRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setExperiences(experienceRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setProjects(projectRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setAwardsRecognitions(awardRecognitionRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setContinuingEducations(continuingEducationRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setProfessionalMemberships(professionalMembershipRepository.findByPortfolioId(portfolio.getId()));
        portfolio.setReferences(referenceRepository.findByPortfolioId(portfolio.getId()));

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

    // Merge portfolio to ensure it's managed
    Portfolio managedPortfolio = entityManager.merge(portfolio);
    entityManager.detach(portfolio); // Detach original to avoid stale references

    // Update skills
    if (portfolioRequest.getSkills() != null) {
        System.out.println("PortfolioService: Updating skills for portfolio ID: " + portfolioId);
        // Get existing skills
        List<Skill> existingSkills = managedPortfolio.getSkills();
        // Create a map of incoming skills by ID (or name if ID is null)
        Map<Long, Skill> incomingSkillMap = portfolioRequest.getSkills().stream()
            .collect(Collectors.toMap(
                skill -> skill.getId() != null ? skill.getId() : 0L, // Use 0L for new skills
                skill -> skill,
                (s1, s2) -> s1 // Handle duplicates by keeping first
            ));

        // Remove skills not in the incoming request
        List<Skill> skillsToRemove = existingSkills.stream()
            .filter(skill -> !incomingSkillMap.containsKey(skill.getId()))
            .collect(Collectors.toList());
        existingSkills.removeAll(skillsToRemove);

        // Update or add skills
        List<Skill> skillsToSave = new ArrayList<>();
        for (Skill incomingSkill : portfolioRequest.getSkills()) {
            if (incomingSkill.getName() == null || incomingSkill.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Skill name is required");
            }
            if (incomingSkill.getId() != null && incomingSkill.getId() != 0L) {
                // Update existing skill
                Optional<Skill> existingSkillOpt = existingSkills.stream()
                    .filter(skill -> skill.getId().equals(incomingSkill.getId()))
                    .findFirst();
                if (existingSkillOpt.isPresent()) {
                    Skill existingSkill = existingSkillOpt.get();
                    existingSkill.setName(incomingSkill.getName());
                    existingSkill.setType(incomingSkill.getType());
                    existingSkill.setProficiencyLevel(incomingSkill.getProficiencyLevel());
                    skillsToSave.add(existingSkill);
                } else {
                    // ID provided but not found; treat as new
                    Skill newSkill = new Skill();
                    newSkill.setName(incomingSkill.getName());
                    newSkill.setType(incomingSkill.getType());
                    newSkill.setProficiencyLevel(incomingSkill.getProficiencyLevel());
                    newSkill.setPortfolio(managedPortfolio);
                    skillsToSave.add(newSkill);
                }
            } else {
                // Add new skill
                Skill newSkill = new Skill();
                newSkill.setName(incomingSkill.getName());
                newSkill.setType(incomingSkill.getType());
                newSkill.setProficiencyLevel(incomingSkill.getProficiencyLevel());
                newSkill.setPortfolio(managedPortfolio);
                skillsToSave.add(newSkill);
            }
        }

        // Save all skills
        List<Skill> savedSkills = skillRepository.saveAll(skillsToSave);
        // Update the managed collection
        managedPortfolio.getSkills().clear();
        managedPortfolio.getSkills().addAll(savedSkills);
        entityManager.flush();
    } else {
        managedPortfolio.getSkills().clear();
        entityManager.flush();
    }

    // Update experiences
    if (portfolioRequest.getExperiences() != null) {
        System.out.println("PortfolioService: Updating experiences for portfolio ID: " + portfolioId);
        List<Experience> existingExperiences = managedPortfolio.getExperiences();
        Map<Long, Experience> incomingExperienceMap = portfolioRequest.getExperiences().stream()
            .collect(Collectors.toMap(
                exp -> exp.getId() != null ? exp.getId() : 0L,
                exp -> exp,
                (e1, e2) -> e1
            ));

        List<Experience> experiencesToRemove = existingExperiences.stream()
            .filter(exp -> !incomingExperienceMap.containsKey(exp.getId()))
            .collect(Collectors.toList());
        existingExperiences.removeAll(experiencesToRemove);

        List<Experience> experiencesToSave = new ArrayList<>();
        for (Experience incomingExp : portfolioRequest.getExperiences()) {
            if (incomingExp.getJobTitle() == null || incomingExp.getJobTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Experience job title is required");
            }
            if (incomingExp.getId() != null && incomingExp.getId() != 0L) {
                Optional<Experience> existingExpOpt = existingExperiences.stream()
                    .filter(exp -> exp.getId().equals(incomingExp.getId()))
                    .findFirst();
                if (existingExpOpt.isPresent()) {
                    Experience existingExp = existingExpOpt.get();
                    existingExp.setJobTitle(incomingExp.getJobTitle());
                    existingExp.setEmployer(incomingExp.getEmployer());
                    existingExp.setDescription(incomingExp.getDescription() != null ? incomingExp.getDescription() : "");
                    existingExp.setStartDate(incomingExp.getStartDate());
                    existingExp.setEndDate(incomingExp.getEndDate());
                    experiencesToSave.add(existingExp);
                } else {
                    Experience newExp = new Experience();
                    newExp.setJobTitle(incomingExp.getJobTitle());
                    newExp.setEmployer(incomingExp.getEmployer());
                    newExp.setDescription(incomingExp.getDescription() != null ? incomingExp.getDescription() : "");
                    newExp.setStartDate(incomingExp.getStartDate());
                    newExp.setEndDate(incomingExp.getEndDate());
                    newExp.setPortfolio(managedPortfolio);
                    experiencesToSave.add(newExp);
                }
            } else {
                Experience newExp = new Experience();
                newExp.setJobTitle(incomingExp.getJobTitle());
                newExp.setEmployer(incomingExp.getEmployer());
                newExp.setDescription(incomingExp.getDescription() != null ? incomingExp.getDescription() : "");
                newExp.setStartDate(incomingExp.getStartDate());
                newExp.setEndDate(incomingExp.getEndDate());
                newExp.setPortfolio(managedPortfolio);
                experiencesToSave.add(newExp);
            }
        }

        List<Experience> savedExperiences = experienceRepository.saveAll(experiencesToSave);
        managedPortfolio.getExperiences().clear();
        managedPortfolio.getExperiences().addAll(savedExperiences);
        entityManager.flush();
    } else {
        managedPortfolio.getExperiences().clear();
        entityManager.flush();
    }

    // Update awards
    if (portfolioRequest.getAwardsRecognitions() != null) {
        System.out.println("PortfolioService: Updating awards for portfolio ID: " + portfolioId);
        List<AwardRecognition> existingAwards = managedPortfolio.getAwardsRecognitions();
        Map<Long, AwardRecognition> incomingAwardMap = portfolioRequest.getAwardsRecognitions().stream()
            .collect(Collectors.toMap(
                award -> award.getId() != null ? award.getId() : 0L,
                award -> award,
                (a1, a2) -> a1
            ));

        List<AwardRecognition> awardsToRemove = existingAwards.stream()
            .filter(award -> !incomingAwardMap.containsKey(award.getId()))
            .collect(Collectors.toList());
        existingAwards.removeAll(awardsToRemove);

        List<AwardRecognition> awardsToSave = new ArrayList<>();
        for (AwardRecognition incomingAward : portfolioRequest.getAwardsRecognitions()) {
            if (incomingAward.getTitle() == null || incomingAward.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Award title is required");
            }
            if (incomingAward.getId() != null && incomingAward.getId() != 0L) {
                Optional<AwardRecognition> existingAwardOpt = existingAwards.stream()
                    .filter(award -> award.getId().equals(incomingAward.getId()))
                    .findFirst();
                if (existingAwardOpt.isPresent()) {
                    AwardRecognition existingAward = existingAwardOpt.get();
                    existingAward.setTitle(incomingAward.getTitle());
                    existingAward.setIssuer(incomingAward.getIssuer());
                    existingAward.setDateReceived(incomingAward.getDateReceived());
                    awardsToSave.add(existingAward);
                } else {
                    AwardRecognition newAward = new AwardRecognition();
                    newAward.setTitle(incomingAward.getTitle());
                    newAward.setIssuer(incomingAward.getIssuer());
                    newAward.setDateReceived(incomingAward.getDateReceived());
                    newAward.setPortfolio(managedPortfolio);
                    awardsToSave.add(newAward);
                }
            } else {
                AwardRecognition newAward = new AwardRecognition();
                newAward.setTitle(incomingAward.getTitle());
                newAward.setIssuer(incomingAward.getIssuer());
                newAward.setDateReceived(incomingAward.getDateReceived());
                newAward.setPortfolio(managedPortfolio);
                awardsToSave.add(newAward);
            }
        }

        List<AwardRecognition> savedAwards = awardRecognitionRepository.saveAll(awardsToSave);
        managedPortfolio.getAwardsRecognitions().clear();
        managedPortfolio.getAwardsRecognitions().addAll(savedAwards);
        entityManager.flush();
    } else {
        managedPortfolio.getAwardsRecognitions().clear();
        entityManager.flush();
    }

    // Update continuing education
    if (portfolioRequest.getContinuingEducations() != null) {
        System.out.println("PortfolioService: Updating continuing educations for portfolio ID: " + portfolioId);
        List<ContinuingEducation> existingEducations = managedPortfolio.getContinuingEducations();
        Map<Long, ContinuingEducation> incomingEducationMap = portfolioRequest.getContinuingEducations().stream()
            .collect(Collectors.toMap(
                edu -> edu.getId() != null ? edu.getId() : 0L,
                edu -> edu,
                (e1, e2) -> e1
            ));

        List<ContinuingEducation> educationsToRemove = existingEducations.stream()
            .filter(edu -> !incomingEducationMap.containsKey(edu.getId()))
            .collect(Collectors.toList());
        existingEducations.removeAll(educationsToRemove);

        List<ContinuingEducation> educationsToSave = new ArrayList<>();
        for (ContinuingEducation incomingEdu : portfolioRequest.getContinuingEducations()) {
            if (incomingEdu.getCourseName() == null || incomingEdu.getCourseName().trim().isEmpty()) {
                throw new IllegalArgumentException("Course name is required");
            }
            if (incomingEdu.getId() != null && incomingEdu.getId() != 0L) {
                Optional<ContinuingEducation> existingEduOpt = existingEducations.stream()
                    .filter(edu -> edu.getId().equals(incomingEdu.getId()))
                    .findFirst();
                if (existingEduOpt.isPresent()) {
                    ContinuingEducation existingEdu = existingEduOpt.get();
                    existingEdu.setCourseName(incomingEdu.getCourseName());
                    existingEdu.setInstitution(incomingEdu.getInstitution());
                    existingEdu.setCompletionDate(incomingEdu.getCompletionDate());
                    educationsToSave.add(existingEdu);
                } else {
                    ContinuingEducation newEdu = new ContinuingEducation();
                    newEdu.setCourseName(incomingEdu.getCourseName());
                    newEdu.setInstitution(incomingEdu.getInstitution());
                    newEdu.setCompletionDate(incomingEdu.getCompletionDate());
                    newEdu.setPortfolio(managedPortfolio);
                    educationsToSave.add(newEdu);
                }
            } else {
                ContinuingEducation newEdu = new ContinuingEducation();
                newEdu.setCourseName(incomingEdu.getCourseName());
                newEdu.setInstitution(incomingEdu.getInstitution());
                newEdu.setCompletionDate(incomingEdu.getCompletionDate());
                newEdu.setPortfolio(managedPortfolio);
                educationsToSave.add(newEdu);
            }
        }

        List<ContinuingEducation> savedEducations = continuingEducationRepository.saveAll(educationsToSave);
        managedPortfolio.getContinuingEducations().clear();
        managedPortfolio.getContinuingEducations().addAll(savedEducations);
        entityManager.flush();
    } else {
        managedPortfolio.getContinuingEducations().clear();
        entityManager.flush();
    }

    // Update professional memberships
    if (portfolioRequest.getProfessionalMemberships() != null) {
        System.out.println("PortfolioService: Updating professional memberships for portfolio ID: " + portfolioId);
        List<ProfessionalMembership> existingMemberships = managedPortfolio.getProfessionalMemberships();
        Map<Long, ProfessionalMembership> incomingMembershipMap = portfolioRequest.getProfessionalMemberships().stream()
            .collect(Collectors.toMap(
                mem -> mem.getId() != null ? mem.getId() : 0L,
                mem -> mem,
                (m1, m2) -> m1
            ));

        List<ProfessionalMembership> membershipsToRemove = existingMemberships.stream()
            .filter(mem -> !incomingMembershipMap.containsKey(mem.getId()))
            .collect(Collectors.toList());
        existingMemberships.removeAll(membershipsToRemove);

        List<ProfessionalMembership> membershipsToSave = new ArrayList<>();
        for (ProfessionalMembership incomingMem : portfolioRequest.getProfessionalMemberships()) {
            if (incomingMem.getOrganization() == null || incomingMem.getOrganization().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization is required");
            }
            if (incomingMem.getId() != null && incomingMem.getId() != 0L) {
                Optional<ProfessionalMembership> existingMemOpt = existingMemberships.stream()
                    .filter(mem -> mem.getId().equals(incomingMem.getId()))
                    .findFirst();
                if (existingMemOpt.isPresent()) {
                    ProfessionalMembership existingMem = existingMemOpt.get();
                    existingMem.setOrganization(incomingMem.getOrganization());
                    existingMem.setMembershipType(incomingMem.getMembershipType());
                    existingMem.setStartDate(incomingMem.getStartDate());
                    membershipsToSave.add(existingMem);
                } else {
                    ProfessionalMembership newMem = new ProfessionalMembership();
                    newMem.setOrganization(incomingMem.getOrganization());
                    newMem.setMembershipType(incomingMem.getMembershipType());
                    newMem.setStartDate(incomingMem.getStartDate());
                    newMem.setPortfolio(managedPortfolio);
                    membershipsToSave.add(newMem);
                }
            } else {
                ProfessionalMembership newMem = new ProfessionalMembership();
                newMem.setOrganization(incomingMem.getOrganization());
                newMem.setMembershipType(incomingMem.getMembershipType());
                newMem.setStartDate(incomingMem.getStartDate());
                newMem.setPortfolio(managedPortfolio);
                membershipsToSave.add(newMem);
            }
        }

        List<ProfessionalMembership> savedMemberships = professionalMembershipRepository.saveAll(membershipsToSave);
        managedPortfolio.getProfessionalMemberships().clear();
        managedPortfolio.getProfessionalMemberships().addAll(savedMemberships);
        entityManager.flush();
    } else {
        managedPortfolio.getProfessionalMemberships().clear();
        entityManager.flush();
    }

    // Update references
    if (portfolioRequest.getReferences() != null) {
        System.out.println("PortfolioService: Updating references for portfolio ID: " + portfolioId);
        List<Reference> existingReferences = managedPortfolio.getReferences();
        Map<Long, Reference> incomingReferenceMap = portfolioRequest.getReferences().stream()
            .collect(Collectors.toMap(
                ref -> ref.getId() != null ? ref.getId() : 0L,
                ref -> ref,
                (r1, r2) -> r1
            ));

        List<Reference> referencesToRemove = existingReferences.stream()
            .filter(ref -> !incomingReferenceMap.containsKey(ref.getId()))
            .collect(Collectors.toList());
        existingReferences.removeAll(referencesToRemove);

        List<Reference> referencesToSave = new ArrayList<>();
        for (Reference incomingRef : portfolioRequest.getReferences()) {
            if (incomingRef.getName() == null || incomingRef.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Reference name is required");
            }
            if (incomingRef.getId() != null && incomingRef.getId() != 0L) {
                Optional<Reference> existingRefOpt = existingReferences.stream()
                    .filter(ref -> ref.getId().equals(incomingRef.getId()))
                    .findFirst();
                if (existingRefOpt.isPresent()) {
                    Reference existingRef = existingRefOpt.get();
                    existingRef.setName(incomingRef.getName());
                    existingRef.setRelationship(incomingRef.getRelationship());
                    existingRef.setEmail(incomingRef.getEmail());
                    existingRef.setPhone(incomingRef.getPhone());
                    referencesToSave.add(existingRef);
                } else {
                    Reference newRef = new Reference();
                    newRef.setName(incomingRef.getName());
                    newRef.setRelationship(incomingRef.getRelationship());
                    newRef.setEmail(incomingRef.getEmail());
                    newRef.setPhone(incomingRef.getPhone());
                    newRef.setPortfolio(managedPortfolio);
                    referencesToSave.add(newRef);
                }
            } else {
                Reference newRef = new Reference();
                newRef.setName(incomingRef.getName());
                newRef.setRelationship(incomingRef.getRelationship());
                newRef.setEmail(incomingRef.getEmail());
                newRef.setPhone(incomingRef.getPhone());
                newRef.setPortfolio(managedPortfolio);
                referencesToSave.add(newRef);
            }
        }

        List<Reference> savedReferences = referenceRepository.saveAll(referencesToSave);
        managedPortfolio.getReferences().clear();
        managedPortfolio.getReferences().addAll(savedReferences);
        entityManager.flush();
    } else {
        managedPortfolio.getReferences().clear();
        entityManager.flush();
    }

    // Update certificate associations
    if (portfolioRequest.getCertificateIds() != null) {
        certificateRepository.findByPortfolioId(portfolioId).forEach(certificate -> {
            certificate.setPortfolioId(null);
            certificateRepository.save(certificate);
        });
        entityManager.flush();
        for (Long certificateId : portfolioRequest.getCertificateIds()) {
            Optional<Certificate> certificateOpt = certificateRepository.findById(certificateId);
            if (certificateOpt.isPresent()) {
                Certificate certificate = certificateOpt.get();
                if (certificate.getGraduate().getId().equals(graduate.getId())) {
                    certificate.setPortfolioId(portfolioId);
                    certificateRepository.save(certificate);
                }
            }
        }
        entityManager.flush();
    }

    Portfolio savedPortfolio = portfolioRepository.save(managedPortfolio);
    System.out.println("PortfolioService: Portfolio updated, ID: " + savedPortfolio.getId());

    PortfolioRequest response = new PortfolioRequest(savedPortfolio);
    response.setCertificates(certificateRepository.findByGraduateId(graduate.getId()));
    return response;
}
}