package com.smartlostfound.config;

import com.smartlostfound.entity.*;
import com.smartlostfound.repository.CategoryRepository;
import com.smartlostfound.repository.ItemReportRepository;
import com.smartlostfound.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemReportRepository itemReportRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.admin.initial-email:admin@smartlostfound.com}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.admin.initial-password:Admin@123456}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${app.admin.initial-name:Platform Administrator}")
    private String adminFullName;

    @org.springframework.beans.factory.annotation.Value("${app.admin.reset-password-on-startup:false}")
    private boolean adminResetPasswordOnStartup;

    public DataInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ItemReportRepository itemReportRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.itemReportRepository = itemReportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            initUsersAndSampleData();
        } catch (Exception e) {
            logger.warn("DataInitializer skipped or already populated: {}", e.getMessage());
        }
    }

    private void initUsersAndSampleData() {
        // 1. Seed or Recover Admin Account
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            User newAdmin = new User();
            newAdmin.setEmail(adminEmail);
            newAdmin.setPasswordHash(passwordEncoder.encode(adminPassword));
            newAdmin.setFullName(adminFullName);
            newAdmin.setPhoneNumber("+1 (555) 019-2834");
            newAdmin.setRole("ROLE_ADMIN");
            newAdmin.setEnabled(true);
            admin = userRepository.save(newAdmin);
            logger.info("Bootstrapping default Admin account: {}", adminEmail);
        } else if (adminResetPasswordOnStartup) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin = userRepository.save(admin);
            logger.info("Admin password reset on startup executed for: {}", adminEmail);
        }

        // 2. Seed Demo User 1 (Alex)
        User alex = userRepository.findByEmail("alex.morgan@example.com").orElseGet(() -> {
            User user = new User();
            user.setEmail("alex.morgan@example.com");
            user.setPasswordHash(passwordEncoder.encode("User@123456"));
            user.setFullName("Alex Morgan");
            user.setPhoneNumber("+1 (555) 234-5678");
            user.setRole("ROLE_USER");
            user.setEnabled(true);
            logger.info("Bootstrapping demo user: alex.morgan@example.com");
            return userRepository.save(user);
        });

        // 3. Seed Demo User 2 (Sarah)
        User sarah = userRepository.findByEmail("sarah.jenkins@example.com").orElseGet(() -> {
            User user = new User();
            user.setEmail("sarah.jenkins@example.com");
            user.setPasswordHash(passwordEncoder.encode("User@123456"));
            user.setFullName("Sarah Jenkins");
            user.setPhoneNumber("+1 (555) 876-5432");
            user.setRole("ROLE_USER");
            user.setEnabled(true);
            logger.info("Bootstrapping demo user: sarah.jenkins@example.com");
            return userRepository.save(user);
        });

        // 4. Seed categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Electronics", "Smartphones, laptops, tablets, headphones, chargers, cameras", "Smartphone"));
            categoryRepository.save(new Category("Wallets & Purses", "Wallets, purses, cardholders, coin pouches, money clips", "Wallet"));
            categoryRepository.save(new Category("Keys & Keychains", "Car keys, house keys, bike locks, smart fobs, access cards", "Key"));
            categoryRepository.save(new Category("Bags & Luggage", "Backpacks, suitcases, gym bags, duffle bags, briefcases", "Briefcase"));
            categoryRepository.save(new Category("Identity & Documents", "Passports, national IDs, driver licenses, student badges", "FileText"));
            categoryRepository.save(new Category("Jewelry & Watches", "Rings, necklaces, bracelets, smartwatches, luxury watches", "Watch"));
            categoryRepository.save(new Category("Clothing & Accessories", "Jackets, scarves, sunglasses, hats, umbrellas, shoes", "Shirt"));
            categoryRepository.save(new Category("Pets", "Dogs, cats, birds, collars with tags", "Heart"));
            categoryRepository.save(new Category("Other Belongings", "Books, stationery, sporting equipment, water bottles", "Package"));
            logger.info("Bootstrapped 9 default item categories");
        }

        // 5. Seed initial sample listings if repository is empty
        if (itemReportRepository.count() == 0) {
            Category electronics = categoryRepository.findByName("Electronics").orElse(null);
            Category wallets = categoryRepository.findByName("Wallets & Purses").orElse(null);
            Category keys = categoryRepository.findByName("Keys & Keychains").orElse(null);

            if (electronics != null) {
                // Lost iPhone by Alex
                ItemReport lostPhone = new ItemReport();
                lostPhone.setTitle("Lost Midnight Black iPhone 15 Pro");
                lostPhone.setType(ItemType.LOST);
                lostPhone.setCategory(electronics);
                lostPhone.setUser(alex);
                lostPhone.setDescription("Lost my iPhone 15 Pro 256GB in midnight black with a matte dark green silicone protective case and camera protector.");
                lostPhone.setDistinguishingCharacteristics("Lock screen has a mountain sunrise wallpaper. Small hairline scratch near the volume rocker button.");
                lostPhone.setCity("Seattle");
                lostPhone.setLocationAddress("Westlake Station, 4th & Pine St");
                lostPhone.setIncidentDate(LocalDate.now().minusDays(2));
                lostPhone.setStatus(ItemStatus.OPEN);
                lostPhone.setModerationStatus(ModerationStatus.APPROVED);
                lostPhone.setContactEmail("alex.morgan@example.com");
                lostPhone.setContactPhone("+1 (555) 234-5678");
                itemReportRepository.save(lostPhone);

                // Found iPhone by Sarah (Matches with Alex's lost phone!)
                ItemReport foundPhone = new ItemReport();
                foundPhone.setTitle("Found Black Apple iPhone with Green Protective Case");
                foundPhone.setType(ItemType.FOUND);
                foundPhone.setCategory(electronics);
                foundPhone.setUser(sarah);
                foundPhone.setDescription("Found a black modern iPhone with a dark green protective case on the bench near the transit entrance.");
                foundPhone.setDistinguishingCharacteristics("Phone has passcode locked screen with mountain photography background.");
                foundPhone.setCity("Seattle");
                foundPhone.setLocationAddress("Westlake Station Transit Platform");
                foundPhone.setIncidentDate(LocalDate.now().minusDays(2));
                foundPhone.setStatus(ItemStatus.OPEN);
                foundPhone.setModerationStatus(ModerationStatus.APPROVED);
                foundPhone.setContactEmail("sarah.jenkins@example.com");
                foundPhone.setContactPhone("+1 (555) 876-5432");
                itemReportRepository.save(foundPhone);
            }

            if (wallets != null) {
                ItemReport lostWallet = new ItemReport();
                lostWallet.setTitle("Lost Brown Leather Bellroy Bi-fold Wallet");
                lostWallet.setType(ItemType.LOST);
                lostWallet.setCategory(wallets);
                lostWallet.setUser(alex);
                lostWallet.setDescription("Lost cognac brown genuine leather bi-fold wallet containing driver license and commuter card.");
                lostWallet.setDistinguishingCharacteristics("Embossed with small owl logo on the bottom right corner.");
                lostWallet.setCity("Seattle");
                lostWallet.setLocationAddress("Pike Place Market near Public Market Center clock");
                lostWallet.setIncidentDate(LocalDate.now().minusDays(4));
                lostWallet.setStatus(ItemStatus.OPEN);
                lostWallet.setModerationStatus(ModerationStatus.APPROVED);
                lostWallet.setContactEmail("alex.morgan@example.com");
                lostWallet.setContactPhone("+1 (555) 234-5678");
                itemReportRepository.save(lostWallet);
            }

            if (keys != null) {
                ItemReport foundKeys = new ItemReport();
                foundKeys.setTitle("Found Set of Car & Apartment Keys with Blue Carabiner");
                foundKeys.setType(ItemType.FOUND);
                foundKeys.setCategory(keys);
                foundKeys.setUser(sarah);
                foundKeys.setDescription("Found three brass keys and a Honda smart key fob attached to an anodized blue climbing carabiner.");
                foundKeys.setDistinguishingCharacteristics("Has a miniature red Swiss army knife attached.");
                foundKeys.setCity("Bellevue");
                foundKeys.setLocationAddress("Bellevue Downtown Park near the reflecting pool");
                foundKeys.setIncidentDate(LocalDate.now().minusDays(1));
                foundKeys.setStatus(ItemStatus.OPEN);
                foundKeys.setModerationStatus(ModerationStatus.APPROVED);
                foundKeys.setContactEmail("sarah.jenkins@example.com");
                foundKeys.setContactPhone("+1 (555) 876-5432");
                itemReportRepository.save(foundKeys);
            }

            logger.info("Seeded initial realistic demonstration listings and matching pair.");
        }
    }
}
