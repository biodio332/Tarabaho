package tarabaho.tarabaho.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import tarabaho.tarabaho.entity.Portfolio;
import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.repository.GraduateRepository;
import tarabaho.tarabaho.repository.PortfolioRepository;
import tarabaho.tarabaho.repository.ProjectRepository;

@Service
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private GraduateRepository graduateRepository;

    @Autowired
    private SupabaseRestStorageService storageService;

    /**
     * Retrieves all projects for a portfolio.
     * @param portfolioId Portfolio ID
     * @return List of projects
     */
    public List<Project> getProjectsByPortfolioId(Long portfolioId) {
        logger.debug("Fetching projects for portfolio ID: {}", portfolioId);
        List<Project> projects = projectRepository.findByPortfolioId(portfolioId);
        logger.info("Retrieved {} projects for portfolio ID: {}", projects.size(), portfolioId);
        return projects;
    }

    /**
     * Adds a new project with optional image upload
     * @param portfolioId Portfolio ID
     * @param title Project title
     * @param description Project description
     * @param imageUrls Comma-separated image URLs
     * @param startDate Project start date
     * @param endDate Project end date
     * @param projectImageFile Optional project image file
     * @return Saved Project
     * @throws Exception if validation fails or portfolio not found
     */
    @Transactional
    public Project addProject(
            Long portfolioId,
            String title,
            String description,
            String imageUrls,
            String startDate,
            String endDate,
            MultipartFile projectImageFile
    ) throws Exception {
        logger.debug("Adding project for portfolio ID: {}", portfolioId);
        
        // Validate portfolio
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new Exception("Portfolio not found with id: " + portfolioId));
        
        // Validate required fields
        if (title == null || title.trim().isEmpty()) {
            throw new Exception("Project title is required.");
        }

        Project project = new Project();
        project.setPortfolio(portfolio);
        project.setTitle(title);
        project.setDescription(description);
        project.setImageUrls(imageUrls);
        
        // Parse dates if provided
        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                project.setStartDate(LocalDateTime.parse(startDate));
            } catch (Exception e) {
                logger.warn("Invalid startDate format: {}", startDate);
            }
        }
        
        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                project.setEndDate(LocalDateTime.parse(endDate));
            } catch (Exception e) {
                logger.warn("Invalid endDate format: {}", endDate);
            }
        }

        // Handle image file upload
        if (projectImageFile != null && !projectImageFile.isEmpty()) {
            String publicUrl = storageService.uploadFile(projectImageFile, "projects");
            project.setProjectImageFilePath(publicUrl);
            logger.debug("Uploaded project image: {}", publicUrl);
        }

        // Save the project - JPA will automatically add it to portfolio's collection due to bidirectional relationship
        Project savedProject = projectRepository.save(project);
        logger.info("Project added successfully, ID: {}", savedProject.getId());
        return savedProject;
    }

    /**
     * Updates an existing project with optional image upload
     * @param projectId Project ID
     * @param portfolioId Portfolio ID
     * @param title Project title
     * @param description Project description
     * @param imageUrls Comma-separated image URLs
     * @param startDate Project start date
     * @param endDate Project end date
     * @param projectImageFile Optional project image file
     * @return Updated Project
     * @throws Exception if project or portfolio not found
     */
    @Transactional
    public Project updateProject(
            Long projectId,
            Long portfolioId,
            String title,
            String description,
            String imageUrls,
            String startDate,
            String endDate,
            MultipartFile projectImageFile
    ) throws Exception {
        logger.debug("Updating project ID: {}", projectId);
        
        // Find existing project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with id: " + projectId));

        // Validate portfolio
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new Exception("Portfolio not found with id: " + portfolioId));
        
        // Ensure project belongs to the portfolio
        if (!project.getPortfolio().getId().equals(portfolioId)) {
            throw new Exception("Project does not belong to the specified portfolio.");
        }

        // Validate required fields
        if (title == null || title.trim().isEmpty()) {
            throw new Exception("Project title is required.");
        }

        // Store old image path before updating
        String oldImagePath = project.getProjectImageFilePath();

        // Update fields
        project.setPortfolio(portfolio);
        project.setTitle(title);
        project.setDescription(description);
        project.setImageUrls(imageUrls);
        
        // Parse dates if provided
        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                project.setStartDate(LocalDateTime.parse(startDate));
            } catch (Exception e) {
                logger.warn("Invalid startDate format: {}", startDate);
            }
        }
        
        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                project.setEndDate(LocalDateTime.parse(endDate));
            } catch (Exception e) {
                logger.warn("Invalid endDate format: {}", endDate);
            }
        }

        // Handle image file upload
        if (projectImageFile != null && !projectImageFile.isEmpty()) {
            // Delete old file from Supabase if exists and different from new one
            if (oldImagePath != null && !oldImagePath.trim().isEmpty()) {
                String oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                try {
                    storageService.deleteFile("projects", oldFileName);
                    logger.debug("Deleted old project image from Supabase: {}", oldFileName);
                } catch (HttpClientErrorException e) {
                    if (e.getStatusCode().value() == 404) {
                        logger.debug("Old project image not found in Supabase (already deleted?): {}", oldFileName);
                    } else {
                        logger.error("Failed to delete old project image from Supabase: {}", e.getMessage());
                    }
                } catch (Exception e) {
                    logger.error("Unexpected error deleting old project image from Supabase: {}", e.getMessage());
                }
            }
            
            String publicUrl = storageService.uploadFile(projectImageFile, "projects");
            project.setProjectImageFilePath(publicUrl);
            logger.debug("Updated project image: {}", publicUrl);
        }

        Project updatedProject = projectRepository.save(project);
        logger.info("Project updated successfully, ID: {}", updatedProject.getId());
        return updatedProject;
    }

    /**
     * Retrieves a project by ID
     * @param id Project ID
     * @return Project entity
     * @throws Exception if project not found
     */
    public Project getProjectById(Long id) throws Exception {
        logger.debug("Fetching project ID: {}", id);
        Optional<Project> project = projectRepository.findById(id);
        if (project.isPresent()) {
            logger.info("Project found, ID: {}", id);
            return project.get();
        } else {
            logger.warn("Project not found, ID: {}", id);
            throw new Exception("Project not found with id: " + id);
        }
    }

    /**
     * Deletes a project and its associated image file
     * @param id Project ID
     * @throws Exception if project not found or deletion fails
     */
    @Transactional
    public void deleteProject(Long id) throws Exception {
        logger.debug("Starting deletion of project ID: {}", id);
        
        // Find the project with its portfolio relationship loaded
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new Exception("Project not found with id: " + id));
        
        logger.debug("Found project ID: {}, portfolio ID: {}", id, project.getPortfolio().getId());

        // Store the image path before deletion
        String imagePath = project.getProjectImageFilePath();
        logger.debug("Project image path: {}", imagePath);

        // Get the portfolio (should be already loaded since it's a @ManyToOne relationship)
        Portfolio portfolio = project.getPortfolio();
        if (portfolio == null) {
            logger.error("Project ID {} has no associated portfolio", id);
            throw new Exception("Project has no associated portfolio");
        }

        // Remove the project from the portfolio's collection
        // This will trigger orphanRemoval = true and delete the project
        boolean removed = portfolio.getProjects().removeIf(p -> p.getId().equals(id));
        if (removed) {
            logger.debug("Removed project ID {} from portfolio ID {} collection", id, portfolio.getId());
        } else {
            logger.warn("Project ID {} not found in portfolio ID {} collection", id, portfolio.getId());
        }

        try {
            // Save the portfolio - this will trigger the cascade delete due to orphanRemoval = true
            portfolioRepository.save(portfolio);
            logger.debug("Portfolio saved, project ID {} should be deleted via orphan removal", id);
        } catch (Exception e) {
            logger.error("Failed to save portfolio during project deletion. Error: {}", e.getMessage(), e);
            throw new Exception("Failed to delete project: " + e.getMessage(), e);
        }

        // Verify the project was actually deleted from the database
        boolean stillExists = projectRepository.existsById(id);
        if (stillExists) {
            logger.error("Project ID {} still exists in database after orphan removal", id);
            // Fallback: try direct deletion
            try {
                projectRepository.deleteById(id);
                logger.debug("Fallback: Direct deletion of project ID {} succeeded", id);
            } catch (Exception deleteEx) {
                logger.error("Fallback deletion also failed for project ID {}: {}", id, deleteEx.getMessage(), deleteEx);
                throw new Exception("Failed to delete project via both orphan removal and direct deletion: " + deleteEx.getMessage(), deleteEx);
            }
        } else {
            logger.debug("Confirmed: Project ID {} successfully deleted via orphan removal", id);
        }

        // Now delete the image file if it exists (non-transactional)
        if (imagePath != null && !imagePath.trim().isEmpty()) {
            try {
                String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                storageService.deleteFile("projects", fileName);
                logger.debug("Deleted project image from Supabase: {}", fileName);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() == 404) {
                    logger.debug("Project image not found in Supabase (already deleted?): {}", imagePath);
                } else {
                    logger.warn("Failed to delete project image from Supabase but entity was deleted: {}", e.getMessage());
                }
            } catch (Exception e) {
                logger.warn("Unexpected error deleting project image from Supabase but entity was deleted: {}", e.getMessage());
            }
        }

        logger.info("Project deletion completed successfully, ID: {}", id);
    }

    /**
     * Deletes all projects for a portfolio and their associated image files
     * @param portfolioId Portfolio ID
     */
    @Transactional
    public void deleteProjectsByPortfolioId(Long portfolioId) {
        logger.debug("Deleting all projects for portfolio ID: {}", portfolioId);
        
        // Get the portfolio
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found: " + portfolioId));

        // Collect image paths before clearing the collection
        List<String> imagePaths = portfolio.getProjects().stream()
                .map(Project::getProjectImageFilePath)
                .filter(path -> path != null && !path.trim().isEmpty())
                .collect(Collectors.toList());
        
        logger.debug("Found {} projects to delete for portfolio ID: {}", portfolio.getProjects().size(), portfolioId);

        // Clear the projects collection - orphanRemoval = true will delete all projects
        portfolio.getProjects().clear();
        
        try {
            portfolioRepository.save(portfolio);
            logger.debug("Portfolio saved, all {} project entities should be deleted via orphan removal", imagePaths.size());
        } catch (Exception e) {
            logger.error("Failed to save portfolio during batch project deletion. Error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete project entities: " + e.getMessage(), e);
        }

        // Verify deletion
        long remainingProjects = projectRepository.countByPortfolioId(portfolioId);
        if (remainingProjects > 0) {
            logger.warn("Warning: {} projects still exist after orphan removal for portfolio ID: {}", remainingProjects, portfolioId);
            // Fallback: use the custom query method
            projectRepository.deleteAllByPortfolioId(portfolioId);
        }

        logger.info("Deleted {} projects for portfolio ID: {}", imagePaths.size(), portfolioId);

        // Delete image files
        for (String imagePath : imagePaths) {
            try {
                String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                storageService.deleteFile("projects", fileName);
                logger.debug("Deleted project image from Supabase: {}", fileName);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() == 404) {
                    logger.debug("Project image not found in Supabase: {}", imagePath);
                } else {
                    logger.warn("Failed to delete project image from Supabase: {}", e.getMessage());
                }
            } catch (Exception e) {
                logger.warn("Unexpected error deleting project image: {}", e.getMessage());
            }
        }
    }

    /**
     * Gets projects by graduate ID through portfolio association
     * @param graduateId Graduate ID
     * @return List of projects
     */
    public List<Project> getProjectsByGraduateId(Long graduateId) {
        logger.debug("Fetching projects for graduate ID: {}", graduateId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByGraduateId(graduateId);
        List<Project> allProjects = portfolioOpt.stream()
                .flatMap(portfolio -> projectRepository.findByPortfolioId(portfolio.getId()).stream())
                .collect(Collectors.toList());
        logger.info("Retrieved {} projects for graduate ID: {}", allProjects.size(), graduateId);
        return allProjects;
    }
}