package tarabaho.tarabaho.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.ProjectService;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Project Controller", description = "Handles project creation, retrieval, update, and deletion with image upload")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectService projectService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private PortfolioService portfolioService;

    @Operation(summary = "Get projects by portfolio ID", description = "Retrieves all projects for a portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Projects retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to portfolio")
    })
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<?> getProjects(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            logger.debug("Fetching projects for portfolio ID: {}", portfolioId);
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            
            String username = authentication.getName();
            
            // Verify portfolio access - this method should handle graduate lookup internally
            portfolioService.getPortfolio(portfolioId, username);
            
            List<Project> projects = projectService.getProjectsByPortfolioId(portfolioId);
            logger.info("Retrieved {} projects for portfolio ID: {}", projects.size(), portfolioId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Failed to fetch projects: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Add a new project", description = "Creates a new project for the authenticated graduate's portfolio with optional image upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProject(
            @RequestPart("portfolioId") String portfolioIdStr,
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "imageUrls", required = false) String imageUrls,
            @RequestPart(value = "startDate", required = false) String startDate,
            @RequestPart(value = "endDate", required = false) String endDate,
            @RequestPart(value = "projectImageFile", required = false) MultipartFile projectImageFile,
            Authentication authentication
    ) {
        try {
            logger.debug("Adding project for portfolio ID: {}, title: {}", portfolioIdStr, title);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }

            // Parse portfolio ID
            Long portfolioId;
            try {
                portfolioId = Long.parseLong(portfolioIdStr);
            } catch (NumberFormatException e) {
                logger.warn("Invalid portfolioId format: {}", portfolioIdStr);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid portfolioId format.");
            }

            String username = authentication.getName();
            
            // Verify portfolio access - this should validate ownership
            portfolioService.getPortfolio(portfolioId, username);

            Project project = projectService.addProject(
                portfolioId, title, description, imageUrls, startDate, endDate, projectImageFile
            );
            
            logger.info("Project added successfully, ID: {}", project.getId());
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            logger.error("Failed to add project: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update a project", description = "Updates an existing project with optional image upload")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Project or portfolio not found")
    })
    @PutMapping(value = "/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProject(
            @PathVariable Long projectId,
            @RequestPart("portfolioId") String portfolioIdStr,
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "imageUrls", required = false) String imageUrls,
            @RequestPart(value = "startDate", required = false) String startDate,
            @RequestPart(value = "endDate", required = false) String endDate,
            @RequestPart(value = "projectImageFile", required = false) MultipartFile projectImageFile,
            Authentication authentication
    ) {
        try {
            logger.debug("Updating project ID: {}, portfolio ID: {}", projectId, portfolioIdStr);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }

            // Parse portfolio ID
            Long portfolioId;
            try {
                portfolioId = Long.parseLong(portfolioIdStr);
            } catch (NumberFormatException e) {
                logger.warn("Invalid portfolioId format: {}", portfolioIdStr);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid portfolioId format.");
            }

            String username = authentication.getName();
            
            // Verify project ownership through portfolio access
            Project existingProject = projectService.getProjectById(projectId);
            portfolioService.getPortfolio(existingProject.getPortfolio().getId(), username);

            Project updatedProject = projectService.updateProject(
                projectId, portfolioId, title, description, imageUrls, startDate, endDate, projectImageFile
            );
            
            logger.info("Project updated successfully, ID: {}", updatedProject.getId());
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            logger.error("Failed to update project: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a project", description = "Deletes a project by ID including associated image file")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to delete project"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication authentication) {
        try {
            logger.debug("Deleting project ID: {}", id);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }

            String username = authentication.getName();

            Project project = projectService.getProjectById(id);
            portfolioService.getPortfolio(project.getPortfolio().getId(), username);

            projectService.deleteProject(id);
            logger.info("Project deleted successfully, ID: {}", id);
            return ResponseEntity.ok("Project deleted successfully");
        } catch (Exception e) {
            logger.error("Failed to delete project: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get a project by ID", description = "Retrieves a specific project by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project returned successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProjectById(
            @PathVariable Long projectId,
            Authentication authentication
    ) {
        try {
            logger.debug("Fetching project ID: {}", projectId);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }

            String username = authentication.getName();
            Project project = projectService.getProjectById(projectId);
            
            // Verify access through portfolio
            portfolioService.getPortfolio(project.getPortfolio().getId(), username);

            logger.info("Project retrieved successfully, ID: {}", projectId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            logger.error("Failed to fetch project: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project not found: " + e.getMessage());
        }
    }

    @Operation(summary = "Get projects by graduate ID", description = "Retrieves all projects for a graduate through their portfolios")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Projects retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/graduate/{graduateId}")
    public ResponseEntity<?> getProjectsByGraduateId(
            @PathVariable Long graduateId,
            Authentication authentication
    ) {
        try {
            logger.debug("Fetching projects for graduate ID: {}", graduateId);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                    .orElseThrow(() -> new Exception("Graduate not found for username: " + username));

            if (!graduate.getId().equals(graduateId)) {
                logger.warn("Access denied - graduate ID mismatch: {}", graduateId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }

            List<Project> projects = projectService.getProjectsByGraduateId(graduateId);
            logger.info("Retrieved {} projects for graduate ID: {}", projects.size(), graduateId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Failed to fetch projects for graduate: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {
        logger.error("Unhandled exception in ProjectController: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal server error: " + ex.getMessage());
    }
}