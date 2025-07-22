/*package tarabaho.tarabaho.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tarabaho.tarabaho.entity.Admin;
import tarabaho.tarabaho.entity.User;
import tarabaho.tarabaho.entity.Worker;
import tarabaho.tarabaho.repository.AdminRepository;
import tarabaho.tarabaho.repository.UserRepository;
import tarabaho.tarabaho.repository.WorkerRepository;
import tarabaho.tarabaho.service.PasswordEncoderService;

@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoderService passwordEncoderService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting password migration...");

        // Migrate User passwords
        System.out.println("Migrating User passwords...");
        int userCount = 0;
        for (User user : userRepository.findAll()) {
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                System.out.println("Hashing password for User: " + user.getUsername());
                user.setPassword(passwordEncoderService.encodePassword(user.getPassword()));
                userRepository.save(user);
                userCount++;
            }
        }
        System.out.println("Migrated " + userCount + " User passwords.");

        // Migrate Worker passwords
        System.out.println("Migrating Worker passwords...");
        int workerCount = 0;
        for (Worker worker : workerRepository.findAll()) {
            if (worker.getPassword() != null && !worker.getPassword().startsWith("$2a$")) {
                System.out.println("Hashing password for Worker: " + worker.getUsername());
                worker.setPassword(passwordEncoderService.encodePassword(worker.getPassword()));
                workerRepository.save(worker);
                workerCount++;
            }
        }
        System.out.println("Migrated " + workerCount + " Worker passwords.");

        // Migrate Admin passwords
        System.out.println("Migrating Admin passwords...");
        int adminCount = 0;
        for (Admin admin : adminRepository.findAll()) {
            if (admin.getPassword() != null && !admin.getPassword().startsWith("$2a$")) {
                System.out.println("Hashing password for Admin: " + admin.getUsername());
                admin.setPassword(passwordEncoderService.encodePassword(admin.getPassword()));
                adminRepository.save(admin);
                adminCount++;
            }
        }
        System.out.println("Migrated " + adminCount + " Admin passwords.");

        System.out.println("Password migration completed.");
    }
}*/