package tarabaho.tarabaho.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tarabaho.tarabaho.dto.PortfolioRequest;
import tarabaho.tarabaho.entity.Certificate;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Project;
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
}