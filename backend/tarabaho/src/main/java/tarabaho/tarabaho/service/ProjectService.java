package tarabaho.tarabaho.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tarabaho.tarabaho.entity.Project;
import tarabaho.tarabaho.repository.ProjectRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    /**
     * Retrieves all projects for a portfolio.
     * @param portfolioId Portfolio ID
     * @return List of projects
     * @throws IllegalArgumentException if no projects found
     */
    public List<Project> getProjectsByPortfolioId(Long portfolioId) {
        List<Project> projects = projectRepository.findByPortfolioId(portfolioId);
        if (projects.isEmpty()) {
            throw new IllegalArgumentException("No projects found for portfolio id: " + portfolioId);
        }
        return projects;
    }

    /**
     * Saves a new or updates an existing project.
     * @param project Project entity
     * @return Saved Project
     * @throws IllegalArgumentException if portfolio not found or invalid data
     */
    @Transactional
    public Project saveProject(Project project) {
        if (project.getPortfolio() == null || project.getPortfolio().getId() == null) {
            throw new IllegalArgumentException("Portfolio must be associated with the project.");
        }
        if (projectRepository.findByPortfolioId(project.getPortfolio().getId()).isEmpty()) {
            throw new IllegalArgumentException("Portfolio not found for project association.");
        }
        if (project.getId() != null && !projectRepository.existsById(project.getId())) {
            throw new IllegalArgumentException("Project not found for update.");
        }
        // Validate required fields (e.g., title, description)
        if (project.getTitle() == null || project.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Project title is required.");
        }
        return projectRepository.save(project);
    }

    /**
     * Retrieves a project by ID.
     * @param id Project ID
     * @return Project entity
     * @throws IllegalArgumentException if project not found
     */
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
    }

    /**
     * Deletes a project, enforcing existence.
     * @param id Project ID
     * @throws IllegalArgumentException if project not found
     */
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }
}