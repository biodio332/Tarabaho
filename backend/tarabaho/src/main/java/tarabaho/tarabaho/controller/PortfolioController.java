package tarabaho.tarabaho.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import tarabaho.tarabaho.service.CertificateService;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.ProjectService;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Portfolio Controller", description = "Handles portfolio creation, retrieval, visibility updates, and admin stats")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CertificateService certificateService;

    @Operation(summary = "Get portfolio by graduate ID", description = "Retrieves the portfolio associated with the given graduate ID if accessible")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping("/graduate/{graduateId}/portfolio")
    public ResponseEntity<?> getPortfolioByGraduateId(@PathVariable Long graduateId, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Fetching portfolio for graduate ID: " + graduateId);
            String username = authentication != null ? authentication.getName() : null;
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null) {
                System.out.println("PortfolioController: No portfolio found for graduate ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("⚠️ No portfolio found for graduate ID: " + graduateId);
            }
            System.out.println("PortfolioController: Portfolio retrieved, ID: " + portfolio.getId());
            return ResponseEntity.ok(portfolio);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Create a new portfolio", description = "Creates a portfolio for the authenticated graduate. Requires at least one verification certificate.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or portfolio already exists"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to create portfolio"),
        @ApiResponse(responseCode = "404", description = "Graduate not found")
    })
    @PostMapping
    public ResponseEntity<?> createPortfolio(@RequestBody PortfolioRequest portfolioRequest, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Creating portfolio for graduate ID: " + portfolioRequest.getGraduateId());
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("PortfolioController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found.");
            }
            Graduate graduate = graduateOpt.get();
            if (portfolioRequest.getGraduateId() == null || !graduate.getId().equals(portfolioRequest.getGraduateId())) {
                System.out.println("PortfolioController: Access denied for graduate ID: " + portfolioRequest.getGraduateId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("⚠️ Access denied to create portfolio.");
            }
            // Validate PortfolioRequest
            if (portfolioRequest.getFullName() == null || portfolioRequest.getFullName().trim().isEmpty()) {
                System.out.println("PortfolioController: Full name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Full name is required.");
            }
            if (portfolioRequest.getEmail() != null && !portfolioRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                System.out.println("PortfolioController: Invalid email format");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid email format.");
            }
            // Validate related entities
            if (portfolioRequest.getSkills() != null) {
                for (Skill skill : portfolioRequest.getSkills()) {
                    if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Skill name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill name is required.");
                    }
                    if (skill.getType() == null) {
                        System.out.println("PortfolioController: Skill type is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill type is required.");
                    }
                }
            }
            if (portfolioRequest.getExperiences() != null) {
                for (Experience experience : portfolioRequest.getExperiences()) {
                    if (experience.getJobTitle() == null || experience.getJobTitle().trim().isEmpty()) {
                        System.out.println("PortfolioController: Experience job title is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Experience job title is required.");
                    }
                }
            }
            if (portfolioRequest.getProjectIds() != null) {
                for (Long projectId : portfolioRequest.getProjectIds()) {
                    Optional<Project> projectOpt = Optional.ofNullable(projectService.getProjectById(projectId));
                    if (!projectOpt.isPresent()) {
                        System.out.println("PortfolioController: Project not found with ID: " + projectId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Project not found with ID: " + projectId);
                    }
                }
            }
            if (portfolioRequest.getAwardsRecognitions() != null) {
                for (AwardRecognition award : portfolioRequest.getAwardsRecognitions()) {
                    if (award.getTitle() == null || award.getTitle().trim().isEmpty()) {
                        System.out.println("PortfolioController: Award title is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Award title is required.");
                    }
                }
            }
            if (portfolioRequest.getContinuingEducations() != null) {
                for (ContinuingEducation education : portfolioRequest.getContinuingEducations()) {
                    if (education.getCourseName() == null || education.getCourseName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Continuing education course name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Continuing education course name is required.");
                    }
                }
            }
            if (portfolioRequest.getProfessionalMemberships() != null) {
                for (ProfessionalMembership membership : portfolioRequest.getProfessionalMemberships()) {
                    if (membership.getOrganization() == null || membership.getOrganization().trim().isEmpty()) {
                        System.out.println("PortfolioController: Professional membership organization is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Professional membership organization is required.");
                    }
                }
            }
            if (portfolioRequest.getReferences() != null) {
                for (Reference reference : portfolioRequest.getReferences()) {
                    if (reference.getName() == null || reference.getName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Reference name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Reference name is required.");
                    }
                    if (reference.getEmail() != null && !reference.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                        System.out.println("PortfolioController: Invalid reference email format");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid reference email format.");
                    }
                }
            }
            // Check verification status
            List<Certificate> certificates = certificateService.getCertificatesByGraduateId(graduate.getId());
            if (certificates.isEmpty()) {
                System.out.println("PortfolioController: Graduate not verified (no certificates)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("⚠️ Graduate must be verified with at least one certificate.");
            }
            PortfolioRequest savedPortfolio = portfolioService.createPortfolio(graduate.getId(), portfolioRequest, username);
            System.out.println("PortfolioController: Portfolio created, ID: " + savedPortfolio.getId());
            return ResponseEntity.ok(savedPortfolio);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete portfolio by graduate ID", description = "Deletes the portfolio and associated certificates for the authenticated graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio and associated certificates deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to delete portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio or graduate not found")
    })
    @DeleteMapping("/graduate/{graduateId}/portfolio")
    public ResponseEntity<?> deletePortfolioByGraduateId(@PathVariable Long graduateId, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Deleting portfolio for graduate ID: " + graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("PortfolioController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found for username: " + username);
            }
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                System.out.println("PortfolioController: Access denied to delete portfolio for graduate ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied to delete portfolio.");
            }
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null) {
                System.out.println("PortfolioController: No portfolio found for graduate ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ No portfolio found for graduate ID: " + graduateId);
            }
            portfolioService.deletePortfolio(portfolio.getId(), username);
            System.out.println("PortfolioController: Portfolio deleted, ID: " + portfolio.getId());
            return ResponseEntity.ok("Portfolio and associated certificates deleted successfully.");
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Get portfolio by ID", description = "Retrieves a portfolio if accessible by the authenticated graduate or admin")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getPortfolio(@PathVariable Long id, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Fetching portfolio ID: " + id);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("PortfolioController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found.");
            }
            Graduate graduate = graduateOpt.get();
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduate.getId(), username);
            if (portfolio == null) {
                System.out.println("PortfolioController: No portfolio found for graduate ID: " + graduate.getId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ No portfolio found for graduate ID: " + graduate.getId());
            }
            System.out.println("PortfolioController: Portfolio retrieved, ID: " + portfolio.getId());
            return ResponseEntity.ok(portfolio);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Set portfolio visibility", description = "Sets the visibility of a portfolio to PUBLIC or PRIVATE")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Visibility set successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to set visibility"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PostMapping("/{id}/visibility")
    public ResponseEntity<?> setVisibility(@PathVariable Long id, @RequestBody Visibility visibility, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Setting visibility for portfolio ID: " + id);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            portfolioService.setVisibility(id, visibility, username);
            System.out.println("PortfolioController: Visibility set for portfolio ID: " + id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
    /* 
    @Operation(summary = "Get top portfolios", description = "Retrieves top viewed portfolios for admin dashboard")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Top portfolios retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied (not admin)")
    })
    @GetMapping("/admin/top")
    public ResponseEntity<?> getTopPortfolios(Authentication authentication) {
        try {
            System.out.println("PortfolioController: Fetching top portfolios");
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            List<Object[]> topPortfolios = portfolioService.getTopPortfolios();
            List<Object[]> response = topPortfolios.stream()
                    .map(p -> new Object[]{((Portfolio) p[0]).getId(), (Long) p[1]})
                    .collect(Collectors.toList());
            System.out.println("PortfolioController: Retrieved " + response.size() + " top portfolios");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
    */
    @Operation(summary = "Add project to portfolio", description = "Adds a project to the specified portfolio with an optional file upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or file"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PostMapping("/graduate/{graduateId}/portfolio/{portfolioId}/project")
    public ResponseEntity<?> addProject(
            @PathVariable Long graduateId,
            @PathVariable Long portfolioId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        try {
            System.out.println("PortfolioController: Adding project to portfolio ID: " + portfolioId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("PortfolioController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found for username: " + username);
            }
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                System.out.println("PortfolioController: Access denied for graduate ID: " + graduateId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied.");
            }
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null || !portfolio.getId().equals(portfolioId)) {
                System.out.println("PortfolioController: Portfolio not found or access denied for ID: " + portfolioId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ Portfolio not found or access denied.");
            }
            if (title == null || title.trim().isEmpty()) {
                System.out.println("PortfolioController: Project title is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Project title is required.");
            }
            Project project = new Project();
            project.setPortfolio(new Portfolio());
            project.getPortfolio().setId(portfolioId);
            project.setTitle(title);
            project.setDescription(description);
            if (file != null && !file.isEmpty()) {
                String imageUrls = saveFile(file, portfolioId);
                project.setImageUrls(imageUrls);
            }
            projectService.saveProject(project);
            System.out.println("PortfolioController: Project added to portfolio ID: " + portfolioId);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    // Helper method to save file
    private String saveFile(MultipartFile file, Long portfolioId) {
        // Implement file storage logic (e.g., save to Supabase or filesystem)
        // Example: Save to uploads/projects/portfolioId/filename
        // Return the file path or URL
        throw new UnsupportedOperationException("File saving logic not implemented");
    }
    
    @Operation(summary = "Update a portfolio", description = "Updates the portfolio for the authenticated graduate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PutMapping("/{portfolioId}")
    public ResponseEntity<?> updatePortfolio(@PathVariable Long portfolioId, @RequestBody PortfolioRequest portfolioRequest, Authentication authentication) {
        try {
            System.out.println("PortfolioController: Updating portfolio ID: " + portfolioId);
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("PortfolioController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                System.out.println("PortfolioController: Graduate not found for username: " + username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found.");
            }
            Graduate graduate = graduateOpt.get();
            if (portfolioRequest.getGraduateId() == null || !graduate.getId().equals(portfolioRequest.getGraduateId())) {
                System.out.println("PortfolioController: Access denied for graduate ID: " + portfolioRequest.getGraduateId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied to update portfolio.");
            }
            // Validate PortfolioRequest
            if (portfolioRequest.getFullName() == null || portfolioRequest.getFullName().trim().isEmpty()) {
                System.out.println("PortfolioController: Full name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Full name is required.");
            }
            if (portfolioRequest.getEmail() != null && !portfolioRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                System.out.println("PortfolioController: Invalid email format");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid email format.");
            }
            // Validate related entities
            if (portfolioRequest.getSkills() != null) {
                for (Skill skill : portfolioRequest.getSkills()) {
                    if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Skill name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill name is required.");
                    }
                    if (skill.getType() == null) {
                        System.out.println("PortfolioController: Skill type is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill type is required.");
                    }
                }
            }
            if (portfolioRequest.getExperiences() != null) {
                for (Experience experience : portfolioRequest.getExperiences()) {
                    if (experience.getJobTitle() == null || experience.getJobTitle().trim().isEmpty()) {
                        System.out.println("PortfolioController: Experience job title is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Experience job title is required.");
                    }
                }
            }
            if (portfolioRequest.getProjectIds() != null) {
                for (Long projectId : portfolioRequest.getProjectIds()) {
                    Optional<Project> projectOpt = Optional.ofNullable(projectService.getProjectById(projectId));
                    if (!projectOpt.isPresent()) {
                        System.out.println("PortfolioController: Project not found with ID: " + projectId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Project not found with ID: " + projectId);
                    }
                }
            }
            if (portfolioRequest.getAwardsRecognitions() != null) {
                for (AwardRecognition award : portfolioRequest.getAwardsRecognitions()) {
                    if (award.getTitle() == null || award.getTitle().trim().isEmpty()) {
                        System.out.println("PortfolioController: Award title is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Award title is required.");
                    }
                }
            }
            if (portfolioRequest.getContinuingEducations() != null) {
                for (ContinuingEducation education : portfolioRequest.getContinuingEducations()) {
                    if (education.getCourseName() == null || education.getCourseName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Continuing education course name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Continuing education course name is required.");
                    }
                }
            }
            if (portfolioRequest.getProfessionalMemberships() != null) {
                for (ProfessionalMembership membership : portfolioRequest.getProfessionalMemberships()) {
                    if (membership.getOrganization() == null || membership.getOrganization().trim().isEmpty()) {
                        System.out.println("PortfolioController: Professional membership organization is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Professional membership organization is required.");
                    }
                }
            }
            if (portfolioRequest.getReferences() != null) {
                for (Reference reference : portfolioRequest.getReferences()) {
                    if (reference.getName() == null || reference.getName().trim().isEmpty()) {
                        System.out.println("PortfolioController: Reference name is required");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Reference name is required.");
                    }
                    if (reference.getEmail() != null && !reference.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                        System.out.println("PortfolioController: Invalid reference email format");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Invalid reference email format.");
                    }
                }
            }
            PortfolioRequest updatedPortfolio = portfolioService.updatePortfolio(portfolioId, portfolioRequest, username);
            System.out.println("PortfolioController: Portfolio updated, ID: " + updatedPortfolio.getId());
            return ResponseEntity.ok(updatedPortfolio);
        } catch (IllegalArgumentException e) {
            System.out.println("PortfolioController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("PortfolioController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}
