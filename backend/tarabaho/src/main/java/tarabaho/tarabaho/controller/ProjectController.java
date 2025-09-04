package tarabaho.tarabaho.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tarabaho.tarabaho.entity.Graduate;
import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.service.GraduateService;
import tarabaho.tarabaho.service.PortfolioService;
import tarabaho.tarabaho.service.ProjectService;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Project Controller", description = "Handles project creation, retrieval, and deletion")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private GraduateService graduateService;

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Operation(summary = "Get projects by portfolio ID", description = "Retrieves all projects for a portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Projects retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to portfolio")
    })
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<?> getProjects(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(portfolioId, username); // Verify portfolio access
            List<Project> projects = projectService.getProjectsByPortfolioId(portfolioId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Create a new project", description = "Creates a project for the authenticated graduate's portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            portfolioService.getPortfolio(project.getPortfolio().getId(), username); // Verify portfolio access
            Portfolio portfolio = portfolioRepository.findById(project.getPortfolio().getId())
                .orElseThrow(() -> new Exception("Portfolio not found with id: " + project.getPortfolio().getId()));
            if (!portfolio.getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to portfolio.");
            }
            project.setPortfolio(portfolio); // Link to owned portfolio
            Project savedProject = projectService.saveProject(project);
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a project", description = "Deletes a project by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied to delete project"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            String username = authentication.getName();
            Graduate graduate = graduateService.findByUsername(username)
                .orElseThrow(() -> new Exception("Graduate not found."));
            Project project = projectService.getProjectById(id); // Assume method exists
            portfolioService.getPortfolio(project.getPortfolio().getId(), username); // Verify portfolio access
            if (!project.getPortfolio().getGraduate().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to delete project.");
            }
            projectService.deleteProject(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⚠️ " + e.getMessage());
        }
    }
}