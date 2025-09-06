    package tarabaho.tarabaho.service;

    import java.util.List;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import tarabaho.tarabaho.entity.Graduate;
    import tarabaho.tarabaho.entity.Portfolio;
    import tarabaho.tarabaho.entity.Skill;
    import tarabaho.tarabaho.entity.Visibility;
    import tarabaho.tarabaho.repository.GraduateRepository;
    import tarabaho.tarabaho.repository.PortfolioRepository;
    import tarabaho.tarabaho.repository.SkillRepository;

    @Service
    public class SkillService {

        @Autowired
        private SkillRepository skillRepository;

        @Autowired
        private PortfolioRepository portfolioRepository;

        @Autowired
        private GraduateRepository graduateRepository;

        @Transactional
        public Skill saveSkill(Long portfolioId, Skill skill, String username) {
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
                throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
            }
            skill.setPortfolio(portfolio);
            return skillRepository.save(skill);
        }

        public List<Skill> getSkillsByPortfolioId(Long portfolioId, String username) {
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
            Graduate graduate = graduateRepository.findByUsername(username);
            if (portfolio.getVisibility() == Visibility.PRIVATE && (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId()))) {
                throw new IllegalArgumentException("Access denied to private portfolio.");
            }
            return skillRepository.findByPortfolioId(portfolioId);
        }

        @Transactional
        public Skill updateSkill(Long skillId, Skill updatedSkill, String username) {
            Skill existingSkill = skillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found with id: " + skillId));
            Portfolio portfolio = existingSkill.getPortfolio();
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
                throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
            }
            existingSkill.setName(updatedSkill.getName());
            existingSkill.setType(updatedSkill.getType());
            existingSkill.setProficiencyLevel(updatedSkill.getProficiencyLevel());
            return skillRepository.save(existingSkill);
        }

        @Transactional
        public void deleteSkill(Long skillId, String username) {
            Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found with id: " + skillId));
            Portfolio portfolio = skill.getPortfolio();
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
                throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
            }
            skillRepository.delete(skill);
        }
        @Transactional
        public List<Skill> replaceSkills(Long portfolioId, List<Skill> skills, String username) {
            System.out.println("SkillService: Replacing skills for portfolio ID: " + portfolioId);
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("Portfolio not found with id: " + portfolioId));
            Graduate graduate = graduateRepository.findByUsername(username);
            if (graduate == null || !portfolio.getGraduate().getId().equals(graduate.getId())) {
                System.out.println("SkillService: Access denied: User does not own this portfolio");
                throw new IllegalArgumentException("Access denied: User does not own this portfolio.");
            }
            // Delete existing skills
            skillRepository.deleteByPortfolioId(portfolioId);
            // Save new skills
            skills.forEach(skill -> skill.setPortfolio(portfolio));
            return skillRepository.saveAll(skills);
        }
    }