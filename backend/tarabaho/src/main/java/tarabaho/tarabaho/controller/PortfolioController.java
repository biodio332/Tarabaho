package tarabaho.tarabaho.controller;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import tarabaho.tarabaho.entity.ContinuingEducation;
import tarabaho.tarabaho.entity.Experience;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.ProfessionalMembership;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.entity.Reference;
import tarabaho.tarabaho.entity.Skill;
import tarabaho.tarabaho.entity.Visibility;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.ProjectService;
import tarabaho.tarabaho.dto.ShareInfo;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Portfolio Controller", description = "Handles portfolio creation, retrieval, visibility updates, and admin stats")
public class PortfolioController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private ProjectService projectService;

    

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
            logger.debug("Fetching portfolio for graduate ID: {}", graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null) {
                logger.warn("No portfolio found for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("⚠️ No portfolio found for graduate ID: " + graduateId);
            }
            
            logger.info("Portfolio retrieved successfully, ID: {}", portfolio.getId());
            return ResponseEntity.ok(portfolio);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
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
            logger.debug("Creating portfolio for graduate ID: {}", portfolioRequest.getGraduateId());
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                logger.warn("Graduate not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found.");
            }
            
            Graduate graduate = graduateOpt.get();
            if (portfolioRequest.getGraduateId() == null || !graduate.getId().equals(portfolioRequest.getGraduateId())) {
                logger.warn("Access denied for graduate ID: {}", portfolioRequest.getGraduateId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("⚠️ Access denied to create portfolio.");
            }

            // Validate PortfolioRequest
            validatePortfolioRequest(portfolioRequest);
            
           

            PortfolioRequest savedPortfolio = portfolioService.createPortfolio(graduate.getId(), portfolioRequest, username);
            logger.info("Portfolio created successfully, ID: {}", savedPortfolio.getId());
            return ResponseEntity.ok(savedPortfolio);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
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
            logger.debug("Deleting portfolio for graduate ID: {}", graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                logger.warn("Graduate not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found for username: " + username);
            }
            
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                logger.warn("Access denied to delete portfolio for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied to delete portfolio.");
            }
            
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null) {
                logger.warn("No portfolio found for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ No portfolio found for graduate ID: " + graduateId);
            }
            
            portfolioService.deletePortfolio(portfolio.getId(), username);
            logger.info("Portfolio deleted successfully, ID: {}", portfolio.getId());
            return ResponseEntity.ok("Portfolio and associated certificates deleted successfully.");
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
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
            logger.debug("Fetching portfolio ID: {}", id);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            PortfolioRequest portfolio = portfolioService.getPortfolio(id, username);
            
            logger.info("Portfolio retrieved successfully, ID: {}", portfolio.getId());
            return ResponseEntity.ok(portfolio);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
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
            logger.debug("Setting visibility for portfolio ID: {} to {}", id, visibility);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            portfolioService.setVisibility(id, visibility, username);
            
            logger.info("Visibility set successfully for portfolio ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    @Operation(summary = "Add project to portfolio", description = "Adds a project to the specified portfolio with optional image upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or file"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PostMapping(value = "/graduate/{graduateId}/portfolio/{portfolioId}/project", consumes = "multipart/form-data")
    public ResponseEntity<?> addProjectToPortfolio(
            @PathVariable Long graduateId,
            @PathVariable Long portfolioId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "imageUrls", required = false) String imageUrls,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "projectImageFile", required = false) MultipartFile projectImageFile,
            Authentication authentication) {
        try {
            logger.debug("Adding project to portfolio ID: {}, graduate ID: {}", portfolioId, graduateId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                logger.warn("Graduate not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found for username: " + username);
            }
            
            Graduate graduate = graduateOpt.get();
            if (!graduate.getId().equals(graduateId)) {
                logger.warn("Access denied for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied.");
            }
            
            // Verify portfolio access
            portfolioService.getPortfolio(portfolioId, username);
            
            if (title == null || title.trim().isEmpty()) {
                logger.warn("Project title is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Project title is required.");
            }
            
            Project project = projectService.addProject(
                portfolioId, title, description, imageUrls, startDate, endDate, projectImageFile
            );
            
            logger.info("Project added to portfolio ID: {}, Project ID: {}", portfolioId, project.getId());
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
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
            logger.debug("Updating portfolio ID: {}", portfolioId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            Optional<Graduate> graduateOpt = graduateService.findByUsername(username);
            if (!graduateOpt.isPresent()) {
                logger.warn("Graduate not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Graduate not found.");
            }
            
            Graduate graduate = graduateOpt.get();
            if (portfolioRequest.getGraduateId() == null || !graduate.getId().equals(portfolioRequest.getGraduateId())) {
                logger.warn("Access denied for graduate ID: {}", portfolioRequest.getGraduateId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ Access denied to update portfolio.");
            }

            // Validate PortfolioRequest
            validatePortfolioRequest(portfolioRequest);
            
            PortfolioRequest updatedPortfolio = portfolioService.updatePortfolio(portfolioId, portfolioRequest, username);
            logger.info("Portfolio updated successfully, ID: {}", updatedPortfolio.getId());
            return ResponseEntity.ok(updatedPortfolio);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    // Helper method to validate PortfolioRequest
    private void validatePortfolioRequest(PortfolioRequest portfolioRequest) {
        if (portfolioRequest.getFullName() == null || portfolioRequest.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        
        if (portfolioRequest.getEmail() != null && !portfolioRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format.");
        }

        // Validate related entities
        if (portfolioRequest.getSkills() != null) {
            for (Skill skill : portfolioRequest.getSkills()) {
                if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Skill name is required.");
                }
                if (skill.getType() == null) {
                    throw new IllegalArgumentException("Skill type is required.");
                }
            }
        }
        
        if (portfolioRequest.getExperiences() != null) {
            for (Experience experience : portfolioRequest.getExperiences()) {
                if (experience.getJobTitle() == null || experience.getJobTitle().trim().isEmpty()) {
                    throw new IllegalArgumentException("Experience job title is required.");
                }
            }
        }
        
        if (portfolioRequest.getProjectIds() != null) {
            for (Long projectId : portfolioRequest.getProjectIds()) {
                try {
                    projectService.getProjectById(projectId);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Project not found with ID: " + projectId);
                }
            }
        }
        
        if (portfolioRequest.getAwardsRecognitions() != null) {
            for (AwardRecognition award : portfolioRequest.getAwardsRecognitions()) {
                if (award.getTitle() == null || award.getTitle().trim().isEmpty()) {
                    throw new IllegalArgumentException("Award title is required.");
                }
            }
        }
        
        if (portfolioRequest.getContinuingEducations() != null) {
            for (ContinuingEducation education : portfolioRequest.getContinuingEducations()) {
                if (education.getCourseName() == null || education.getCourseName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Continuing education course name is required.");
                }
            }
        }
        
        if (portfolioRequest.getProfessionalMemberships() != null) {
            for (ProfessionalMembership membership : portfolioRequest.getProfessionalMemberships()) {
                if (membership.getOrganization() == null || membership.getOrganization().trim().isEmpty()) {
                    throw new IllegalArgumentException("Professional membership organization is required.");
                }
            }
        }
        
        if (portfolioRequest.getReferences() != null) {
            for (Reference reference : portfolioRequest.getReferences()) {
                if (reference.getName() == null || reference.getName().trim().isEmpty()) {
                    throw new IllegalArgumentException("Reference name is required.");
                }
                if (reference.getEmail() != null && !reference.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                    throw new IllegalArgumentException("Invalid reference email format.");
                }
            }
        }
    }
    @Operation(summary = "Get portfolio share token", description = "Returns the share token and URL for sharing the portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Share token retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping("/graduate/{graduateId}/portfolio/share-token")
    public ResponseEntity<?> getPortfolioShareToken(@PathVariable Long graduateId, Authentication authentication) {
        try {
            logger.debug("Fetching share token for graduate ID: {}", graduateId);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            
            // ← USE SERVICE: Get portfolio first to verify access
            PortfolioRequest portfolio = portfolioService.getPortfolioByGraduateId(graduateId, username);
            if (portfolio == null) {
                logger.warn("Portfolio not found or access denied for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("⚠️ Portfolio not found or access denied.");
            }
            
            // ← NEW SERVICE METHOD: Get share info (we'll add this to PortfolioService)
            ShareInfo shareInfo = portfolioService.getShareInfo(graduateId, username);
            
            logger.info("Share token retrieved successfully for portfolio ID: {}", portfolio.getId());
            return ResponseEntity.ok(shareInfo);
            
        } catch (Exception e) {
            logger.error("Error generating share token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }

    // ← NEW: Public access with share token (uses ONLY service)
    @Operation(summary = "Get public portfolio with share token", description = "Access public portfolio using graduate ID and share token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Public portfolio retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Missing share token"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found or access denied")
    })
    @GetMapping("/public/graduate/{graduateId}/portfolio")
    @CrossOrigin(origins = {"https://tarabaho.vercel.app", "http://localhost:5173"}, allowCredentials = "false")
    public ResponseEntity<?> getPublicPortfolioByShareToken(
            @PathVariable Long graduateId, 
            @RequestParam(value = "share", required = false) String shareToken) {
        try {
            logger.debug("Fetching public portfolio for graduate ID: {}, share token provided: {}", 
                graduateId, shareToken != null ? "yes" : "no");
            
            // Validate share token presence
            if (shareToken == null || shareToken.trim().isEmpty()) {
                logger.warn("Share token required for public portfolio access");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("⚠️ Share token is required to access this portfolio.");
            }
            
            // ← USE SERVICE: All validation and logic in service
            PortfolioRequest portfolio = portfolioService.getPublicPortfolioByShareToken(graduateId, shareToken);
            
            if (portfolio == null) {
                logger.warn("Public portfolio access denied for graduate ID: {}", graduateId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("⚠️ Portfolio not found or access denied.");
            }
            
            logger.info("Public portfolio accessed successfully, ID: {}", portfolio.getId());
            return ResponseEntity.ok(portfolio);
            
        } catch (Exception e) {
            logger.error("Unexpected error accessing public portfolio: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
    @Operation(summary = "Regenerate portfolio share token", description = "Generate a new share token (invalidates old links)")
    @PostMapping("/graduate/{graduateId}/portfolio/regenerate-token")
    public ResponseEntity<?> regenerateShareToken(@PathVariable Long graduateId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            ShareInfo newShareInfo = portfolioService.regenerateShareToken(graduateId, username);
            
            return ResponseEntity.ok(newShareInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error regenerating token.");
        }
    }
}