package tarabaho.tarabaho.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tarabaho.tarabaho.entity.Skill;
import tarabaho.tarabaho.service.SkillService;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/skills")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Skill Controller", description = "Handles CRUD operations for skills in a portfolio")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @Operation(summary = "Add a skill to a portfolio", description = "Adds a skill to the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skill added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> addSkill(@PathVariable Long portfolioId, @RequestBody Skill skill, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            Skill savedSkill = skillService.saveSkill(portfolioId, skill, authentication.getName());
            return ResponseEntity.ok(savedSkill);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Get skills for a portfolio", description = "Retrieves all skills for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skills retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied to private portfolio"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping
    public ResponseEntity<?> getSkills(@PathVariable Long portfolioId, Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : null;
            List<Skill> skills = skillService.getSkillsByPortfolioId(portfolioId, username);
            return ResponseEntity.ok(skills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Update a skill", description = "Updates a skill in the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skill updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Skill not found")
    })
    @PutMapping("/{skillId}")
    public ResponseEntity<?> updateSkill(@PathVariable Long portfolioId, @PathVariable Long skillId, @RequestBody Skill skill, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            Skill updatedSkill = skillService.updateSkill(skillId, skill, authentication.getName());
            return ResponseEntity.ok(updatedSkill);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Delete a skill", description = "Deletes a skill from the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skill deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Skill not found")
    })
    @DeleteMapping("/{skillId}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long portfolioId, @PathVariable Long skillId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            skillService.deleteSkill(skillId, authentication.getName());
            return ResponseEntity.ok("Skill deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        }
    }

    @Operation(summary = "Replace all skills for a portfolio", description = "Replaces all skills for the specified portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skills replaced successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @PutMapping
    public ResponseEntity<?> replaceSkills(@PathVariable Long portfolioId, @RequestBody List<Skill> skills, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("SkillController: Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated.");
            }
            // Validate skills
            for (Skill skill : skills) {
                if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                    System.out.println("SkillController: Skill name is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill name is required.");
                }
                if (skill.getType() == null) {
                    System.out.println("SkillController: Skill type is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ Skill type is required.");
                }
            }
            List<Skill> updatedSkills = skillService.replaceSkills(portfolioId, skills, authentication.getName());
            System.out.println("SkillController: Skills replaced for portfolio ID: " + portfolioId);
            return ResponseEntity.ok(updatedSkills);
        } catch (IllegalArgumentException e) {
            System.out.println("SkillController: Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("⚠️ " + e.getMessage());
        } catch (Exception e) {
            System.out.println("SkillController: Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Unexpected error: " + e.getMessage());
        }
    }
}