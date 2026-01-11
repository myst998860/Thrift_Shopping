package com.event.controller.Admin;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.event.model.Donation;
import com.event.model.Program;
import com.event.repository.DonationRepo;
import com.event.repository.ProgramRepo;
import com.event.repository.UserRepo;
import com.event.model.User;
import com.event.service.EmailService;
import com.event.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RequestMapping("/donations")
@RestController
public class DonationController {

    @Autowired
    private DonationRepo donationRepo;

    @Autowired
    private ProgramRepo programRepo; // ✅ Needed to link donations to programs

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // ---------------- GET ALL DONATIONS ----------------
    @GetMapping
    public List<Donation> getAllDonations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return donationRepo.findAll(); // Public or admin
        }

        try {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String role = jsonNode.has("role") ? jsonNode.get("role").asText() : null;
            Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : null;

            if ("partner".equalsIgnoreCase(role) && userId != null) {
                return donationRepo.findByProgramPartnerUserUserId(userId);
            }

            return donationRepo.findAll(); // Admin / public view
        } catch (Exception e) {
            return donationRepo.findAll(); // fallback
        }
    }

    // @GetMapping
    // public List<Donation> getAllDonations() {
    // Pageable firstFive = PageRequest.of(0, 1); // first page, 5 records
    // Page<Donation> page = donationRepo.findAll(firstFive); // use pageable
    // version
    // return page.getContent(); // get List<Donation>
    // }
    // ---------------- GET DONATION BY ID ----------------
    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        return donationRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------- CREATE NEW DONATION ----------------
    // @PostMapping("/new")
    // public Donation createDonation(@RequestBody Donation donation) {
    // // If the donation has a programId, fetch the Program and link it
    // if (donation.getProgram() != null && donation.getProgram().getProgramId() !=
    // null) {
    // Long programId = donation.getProgram().getProgramId();
    // Program program = programRepo.findById(programId).orElse(null);
    // if (program != null) {
    // donation.setProgram(program);
    // }
    // }

    // Donation savedDonation = donationRepo.save(donation);

    // // Send emails after saving donation
    // emailService.sendDonationEmails(savedDonation);

    // return savedDonation;
    // }
    @PostMapping("/new")
    public Donation createDonation(
            @RequestBody Donation donation,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Link program if provided
        if (donation.getProgram() != null && donation.getProgram().getProgramId() != null) {
            Long programId = donation.getProgram().getProgramId();
            Program program = programRepo.findById(programId).orElse(null);
            if (program != null) {
                donation.setProgram(program);

                // Update Program Stats
                int quantity = parseQuantity(donation.getEstimatedQuantity());
                int currentCollected = program.getItemsCollected() != null ? program.getItemsCollected() : 0;
                program.setItemsCollected(currentCollected + quantity);

                // Simple logic: 5 items = 1 person helped
                int peopleHelped = (currentCollected + quantity) / 5;
                program.setPeopleHelped(peopleHelped);

                programRepo.save(program);
            }
        }

        Donation savedDonation = donationRepo.save(donation);

        // Send email notifications
        try {
            emailService.sendDonationEmails(savedDonation);
        } catch (Exception e) {
            System.err.println("❌ Error sending donation emails: " + e.getMessage());
            e.printStackTrace();
        }

        // Send in-website notifications
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String[] parts = token.split("\\.");
                String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                ObjectMapper mapper = new ObjectMapper();
                JsonNode jsonNode = mapper.readTree(payload);
                Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : null;

                if (userId != null) {
                    notificationService.createDonationNotification(savedDonation, userId);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error sending donation in-app notification: " + e.getMessage());
            e.printStackTrace();
        }

        return savedDonation;
    }

    // @PostMapping("/new")
    // public Donation createDonation(@RequestBody Donation donation) {
    // try {
    // ObjectMapper mapper = new ObjectMapper();
    // String json =
    // mapper.writerWithDefaultPrettyPrinter().writeValueAsString(donation);
    // System.out.println("=== RAW JSON FROM FRONTEND (after binding) ===");
    // System.out.println(json);
    // System.out.println("==============================================");
    // } catch (Exception e) {
    // e.printStackTrace();
    // }

    // Donation savedDonation = donationRepo.save(donation);
    // return savedDonation;
    // }

    // CHANGE STATUS
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<?> updateDonationStatus(
            @PathVariable Long id,
            @PathVariable String status) {

        Donation donation = donationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        // update status
        donation.setStatus(status.toLowerCase());
        donationRepo.save(donation);

        // Notify Partner about status change
        try {
            notificationService.createDonationStatusNotification(donation, status);
        } catch (Exception e) {
            System.err.println("❌ Error sending status update notification: " + e.getMessage());
        }

        // send email
        String email = donation.getEmail();
        if (email != null && !email.isBlank()) {

            switch (status.toLowerCase()) {
                case "confirmed":
                    emailService.sendEmail(
                            email,
                            "Donation Confirmed",
                            "Hello " + donation.getFullName() + ",\n\nYour donation has been confirmed.");
                    break;

                case "pickedup":
                case "picked_up":
                    emailService.sendEmail(
                            email,
                            "Donation Picked Up",
                            "Hello " + donation.getFullName() + ",\n\nYour donation was picked up.");
                    break;

                case "delivered":
                    emailService.sendEmail(
                            email,
                            "Donation Delivered",
                            "Hello " + donation.getFullName() + ",\n\nYour donated items were delivered.");
                    break;

                case "cancelled":
                case "canceled":
                    emailService.sendEmail(
                            email,
                            "Donation Cancelled",
                            "Hello " + donation.getFullName() + ",\n\nYour donation was cancelled.");
                    break;
            }
        }

        return ResponseEntity.ok(donation);
    }

    // ---------------- ADMIN ADD DONATION ----------------
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public Donation addDonationByAdmin(@RequestBody Donation donation,
            @RequestParam(required = false) Long programId) {

        if (programId != null) {
            Program program = programRepo.findById(programId).orElse(null);
            donation.setProgram(program);
        }

        return donationRepo.save(donation);
    }

    // ---------------- UPDATE DONATION ----------------
    @PutMapping("/edit/{id}")
    public ResponseEntity<Donation> updateDonation(@PathVariable Long id,
            @RequestBody Donation updatedDonation,
            @RequestParam(required = false) Long programId) {
        return donationRepo.findById(id)
                .map(existing -> {
                    existing.setStatus(updatedDonation.getStatus());
                    existing.setFullName(updatedDonation.getFullName());
                    existing.setEmail(updatedDonation.getEmail());
                    existing.setPhoneNumber(updatedDonation.getPhoneNumber());
                    existing.setStreetAddress(updatedDonation.getStreetAddress());
                    existing.setCity(updatedDonation.getCity());
                    existing.setZipCode(updatedDonation.getZipCode());
                    existing.setShirtsAndTops(updatedDonation.isShirtsAndTops());
                    existing.setDressesAndSkirts(updatedDonation.isDressesAndSkirts());
                    existing.setShoes(updatedDonation.isShoes());
                    existing.setPantsAndJeans(updatedDonation.isPantsAndJeans());
                    existing.setJacketsAndCoats(updatedDonation.isJacketsAndCoats());
                    existing.setAccessories(updatedDonation.isAccessories());
                    existing.setChildrensClothing(updatedDonation.isChildrensClothing());
                    existing.setUndergarments(updatedDonation.isUndergarments());
                    existing.setEstimatedQuantity(updatedDonation.getEstimatedQuantity());
                    existing.setOverallCondition(updatedDonation.getOverallCondition());
                    existing.setDescription(updatedDonation.getDescription());
                    existing.setPreferredPickupDate(updatedDonation.getPreferredPickupDate());
                    existing.setPickupInstructions(updatedDonation.getPickupInstructions());

                    // ✅ Update program link if provided
                    if (programId != null) {
                        Program program = programRepo.findById(programId).orElse(null);
                        existing.setProgram(program);
                    }

                    Donation saved = donationRepo.save(existing);
                    //
                    // try {
                    // String newStatus = updatedDonation.getStatus(); // ✅ FIXED
                    //
                    // String email = saved.getEmail();
                    // if (email != null && !email.isBlank() && newStatus != null) {
                    //
                    // switch (newStatus.toLowerCase()) {
                    //
                    // case "confirmed":
                    // emailService.sendEmail(
                    // email,
                    // "Donation Confirmed",
                    // "Hello " + saved.getFullName() +
                    // ",\n\nYour donation request has been confirmed. Thank you!"
                    // );
                    // break;
                    //
                    // case "pickedup":
                    // case "picked_up":
                    // emailService.sendEmail(
                    // email,
                    // "Donation Picked Up",
                    // "Hello " + saved.getFullName() +
                    // ",\n\nYour donation has been successfully picked up!"
                    // );
                    // break;
                    //
                    // case "delivered":
                    // emailService.sendEmail(
                    // email,
                    // "Donation Delivered",
                    // "Hello " + saved.getFullName() +
                    // ",\n\nYour donated items have been delivered. Thank you for helping!"
                    // );
                    // break;
                    //
                    // case "cancelled":
                    // case "canceled":
                    // emailService.sendEmail(
                    // email,
                    // "Donation Cancelled",
                    // "Hello " + saved.getFullName() +
                    // ",\n\nYour donation request has been cancelled."
                    // );
                    // break;
                    //
                    // default:
                    // // no email for other statuses
                    // break;
                    // }
                    // }
                    // } catch (Exception e) {
                    // System.err.println("❌ Error sending status update email: " + e.getMessage());
                    // }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------- DELETE DONATION ----------------
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        if (!donationRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        donationRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- FILTER DONATIONS ----------------
    @GetMapping("/filter")
    public List<Donation> filterDonations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String overallCondition) {

        if (city != null && overallCondition != null) {
            return donationRepo.findByCityIgnoreCaseAndOverallConditionIgnoreCase(city, overallCondition);
        } else if (city != null) {
            return donationRepo.findByCityIgnoreCase(city);
        } else if (overallCondition != null) {
            return donationRepo.findByOverallConditionIgnoreCase(overallCondition);
        } else {
            return donationRepo.findAll();
        }
    }

    // ---------------- GET TOTAL DONATIONS FOR A PROGRAM ----------------
    @GetMapping("/program/{programId}/count")
    public ResponseEntity<?> getDonationCountForProgram(@PathVariable Long programId) {
        Program program = programRepo.findById(programId).orElse(null);
        if (program == null) {
            return ResponseEntity.notFound().build();
        }
        int totalDonations = donationRepo.findByProgram(program).size();
        return ResponseEntity.ok(Map.of(
                "program", program.getProgramTitle(),
                "totalDonations", totalDonations));
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getDonationCounts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Long> counts = new HashMap<>();
        counts.put("pending", 0L);
        counts.put("confirmed", 0L);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(counts);
        }

        try {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : null;
            String role = jsonNode.has("role") ? jsonNode.get("role").asText() : null;

            if (userId != null && "partner".equalsIgnoreCase(role)) {
                counts.put("pending", donationRepo.countByPartnerAndStatus(userId, "pending"));
                counts.put("confirmed",
                        donationRepo.countByPartnerAndStatus(userId, "confirmed"));
            } else if ("admin".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
                counts.put("pending", donationRepo.countByStatusIgnoreCase("pending"));
                counts.put("confirmed", donationRepo.countByStatusIgnoreCase("confirmed"));
                counts.put("assigned", donationRepo.countByStatusIgnoreCase("assigned_to_admin"));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(counts);
        }

        return ResponseEntity.ok(counts);
    }

    // ---------------- ASSIGN DONATION TO ADMIN ----------------
    @PutMapping("/{id}/assign-admin")
    public ResponseEntity<?> assignAdmin(@PathVariable Long id) {
        Donation donation = donationRepo.findById(id).orElse(null);
        if (donation == null)
            return ResponseEntity.notFound().build();

        // 1. Assign to an ADMIN (find first admin)
        // Assuming role name is "ADMIN" (uppercase)
        User admin = userRepo.findByRole("ADMIN").stream().findFirst().orElse(null);

        // If no "ADMIN" found, try "admin" just in case? Or rely on system config.
        if (admin == null) {
            admin = userRepo.findByRole("admin").stream().findFirst().orElse(null);
        }

        donation.setAssignedAdmin(admin);
        donation.setPickupFee(150.0);
        donation.setStatus("assigned_to_admin");
        donationRepo.save(donation);

        // 2. Notify Admin & Partner
        if (admin != null) {
            try {
                notificationService.createAssignedDonationNotification(donation, admin);
            } catch (Exception e) {
                System.err.println("Error notifying about assignment: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(donation);
    }

    // ---------------- PICKUP FEE PAYMENT SYSTEM ----------------

    @GetMapping("/pickup-fees/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminFeeSummary() {
        List<User> partners = userRepo.findByRole("PARTNER");
        if (partners.isEmpty()) {
            partners = userRepo.findByRole("partner");
        }

        List<Map<String, Object>> summary = partners.stream().map(p -> {
            List<Donation> partnerDonations = donationRepo.findByProgramPartnerUserUserId(p.getUser_id());

            double unpaid = partnerDonations.stream()
                    .filter(d -> d.getPickupPaymentStatus() == null
                            || "UNPAID".equalsIgnoreCase(d.getPickupPaymentStatus()))
                    .mapToDouble(d -> d.getPickupFee() != null ? d.getPickupFee()
                            : ("assigned_to_admin".equalsIgnoreCase(d.getStatus()) ? 150.0 : 0.0))
                    .sum();

            double requested = partnerDonations.stream()
                    .filter(d -> "REQUESTED".equalsIgnoreCase(d.getPickupPaymentStatus()))
                    .mapToDouble(d -> d.getPickupFee() != null ? d.getPickupFee() : 0.0)
                    .sum();

            double paid = partnerDonations.stream()
                    .filter(d -> "PAID".equalsIgnoreCase(d.getPickupPaymentStatus()))
                    .mapToDouble(d -> d.getPickupFee() != null ? d.getPickupFee() : 0.0)
                    .sum();

            Map<String, Object> map = new HashMap<>();
            map.put("partnerId", p.getUser_id());
            map.put("partnerName", p.getFullname());
            map.put("unpaidAmount", unpaid);
            map.put("requestedAmount", requested);
            map.put("paidAmount", paid);
            map.put("totalDue", unpaid + requested + paid);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/pickup-fees/admin/request/{partnerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> requestPayment(@PathVariable Long partnerId) {
        // Fetch ALL donations for partner to ensure consistent filtering with Summary
        // view
        List<Donation> partnerDonations = donationRepo.findByProgramPartnerUserUserId(partnerId);

        // Filter for UNPAID (or null status)
        List<Donation> unpaid = partnerDonations.stream()
                .filter(d -> d.getPickupPaymentStatus() == null
                        || "UNPAID".equalsIgnoreCase(d.getPickupPaymentStatus()))
                .collect(Collectors.toList());

        if (unpaid.isEmpty())
            return ResponseEntity.badRequest().body("No unpaid fees found for this partner");

        // Update status AND set fee if missing
        unpaid.forEach(d -> {
            d.setPickupPaymentStatus("REQUESTED");
            if (d.getPickupFee() == null
                    || (d.getPickupFee() == 0.0 && "assigned_to_admin".equalsIgnoreCase(d.getStatus()))) {
                d.setPickupFee(150.0);
            }
        });

        donationRepo.saveAll(unpaid);

        User partner = userRepo.findById(partnerId).orElse(null);
        if (partner != null) {
            notificationService.createPaymentRequestNotification(partner,
                    unpaid.stream().mapToDouble(d -> d.getPickupFee() != null ? d.getPickupFee() : 0.0).sum());
        }

        return ResponseEntity.ok("Payment requested successfully");
    }

    @PostMapping("/pickup-fees/partner/pay")
    @PreAuthorize("hasRole('PARTNER')")
    public ResponseEntity<?> markAsPaid(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            List<Donation> requested = donationRepo.findByProgramPartnerUserUserIdAndPickupPaymentStatus(userId,
                    "REQUESTED");
            if (requested.isEmpty())
                return ResponseEntity.badRequest().body("No requested fees found");

            requested.forEach(d -> d.setPickupPaymentStatus("PAID"));
            donationRepo.saveAll(requested);

            // Notify Admins
            notificationService.createPaymentSentNotification(userId,
                    requested.stream().mapToDouble(Donation::getPickupFee).sum());

            return ResponseEntity.ok("Payment marked as paid, pending admin verification");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
    }

    @PostMapping("/pickup-fees/admin/settle/{partnerId}/{action}") // action = accept/reject
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> settlePayment(@PathVariable Long partnerId, @PathVariable String action) {
        List<Donation> paidDonations = donationRepo.findByProgramPartnerUserUserIdAndPickupPaymentStatus(partnerId,
                "PAID");
        if (paidDonations.isEmpty())
            return ResponseEntity.badRequest().body("No paid donations found for verification");

        if ("accept".equalsIgnoreCase(action)) {
            // zero out on accept
            paidDonations.forEach(d -> {
                d.setPickupPaymentStatus("SETTLED");
                d.setPickupFee(0.0); // As requested: total pickup fee will be zero
            });
            donationRepo.saveAll(paidDonations);
            notificationService.createPaymentSettledNotification(partnerId, "ACCEPTED");
            return ResponseEntity.ok("Payment accepted and fees settled to zero");
        } else {
            paidDonations.forEach(d -> d.setPickupPaymentStatus("REQUESTED")); // Revert to requested
            donationRepo.saveAll(paidDonations);
            notificationService.createPaymentSettledNotification(partnerId, "REJECTED");
            return ResponseEntity.ok("Payment rejected and reverted to requested status");
        }
    }

    private Long getUserIdFromToken(String authHeader) throws Exception {
        String token = authHeader.substring(7);
        String[] parts = token.split("\\.");
        String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readTree(payload);
        return jsonNode.get("userId").asLong();
    }

    private int parseQuantity(String quantity) {
        if (quantity == null)
            return 0;
        try {
            // "6-15 Items" -> average ~10
            if (quantity.contains("-")) {
                String[] parts = quantity.split("-");
                String a = parts[0].replaceAll("[^0-9]", "");
                String b = parts[1].replaceAll("[^0-9]", "");
                if (!a.isEmpty() && !b.isEmpty()) {
                    return (Integer.parseInt(a) + Integer.parseInt(b)) / 2;
                }
            }
            String clean = quantity.replaceAll("[^0-9]", "");
            return clean.isEmpty() ? 0 : Integer.parseInt(clean);
        } catch (Exception e) {
            return 0;
        }
    }
}

// package com.event.controller.Admin;
//
// import java.util.List;
//
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;
//
// import com.event.model.Donation;
// import com.event.repository.DonationRepo;
// import com.event.service.EmailService;
//
// @RequestMapping("/donations")
// @RestController
// public class DonationController {
//
// @Autowired
// private DonationRepo donationRepo;
//
// @Autowired
// private EmailService emailService; // ✅ Inject EmailService
//
// // ✅ Get all donations
// @GetMapping
// public List<Donation> getAllDonations() {
// return donationRepo.findAll();
// }
//
// // ✅ Get a single donation by ID
// @GetMapping("/{id}")
// public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
// return donationRepo.findById(id)
// .map(ResponseEntity::ok)
// .orElse(ResponseEntity.notFound().build());
// }
//
// // ✅ Create a new donation (public endpoint for donors)
// @PostMapping("/new")
// public Donation createDonation(@RequestBody Donation donation) {
// Donation savedDonation = donationRepo.save(donation);
//
// // ✅ Send emails after saving donation
// emailService.sendDonationEmails(savedDonation);
//
// return savedDonation;
// }
//
// // ✅ Admin can manually add a donation record
// @PostMapping("/add")
// @PreAuthorize("hasRole('ADMIN')")
// public Donation addDonationByAdmin(@RequestBody Donation donation) {
// return donationRepo.save(donation);
// }
//
// // ✅ Update existing donation
// @PutMapping("/edit/{id}")
// public ResponseEntity<Donation> updateDonation(
// @PathVariable Long id,
// @RequestBody Donation updatedDonation
// ) {
// return donationRepo.findById(id)
// .map(existing -> {
// existing.setFullName(updatedDonation.getFullName());
// existing.setEmail(updatedDonation.getEmail());
// existing.setPhoneNumber(updatedDonation.getPhoneNumber());
// existing.setStreetAddress(updatedDonation.getStreetAddress());
// existing.setCity(updatedDonation.getCity());
// existing.setZipCode(updatedDonation.getZipCode());
// existing.setShirtsAndTops(updatedDonation.isShirtsAndTops());
// existing.setDressesAndSkirts(updatedDonation.isDressesAndSkirts());
// existing.setShoes(updatedDonation.isShoes());
// existing.setPantsAndJeans(updatedDonation.isPantsAndJeans());
// existing.setJacketsAndCoats(updatedDonation.isJacketsAndCoats());
// existing.setAccessories(updatedDonation.isAccessories());
// existing.setChildrensClothing(updatedDonation.isChildrensClothing());
// existing.setUndergarments(updatedDonation.isUndergarments());
// existing.setEstimatedQuantity(updatedDonation.getEstimatedQuantity());
// existing.setOverallCondition(updatedDonation.getOverallCondition());
// existing.setDescription(updatedDonation.getDescription());
// existing.setPreferredPickupDate(updatedDonation.getPreferredPickupDate());
// existing.setPickupInstructions(updatedDonation.getPickupInstructions());
//
// Donation saved = donationRepo.save(existing);
// return ResponseEntity.ok(saved);
// })
// .orElse(ResponseEntity.notFound().build());
// }
//
// // ✅ Delete donation by ID
// @DeleteMapping("/delete/{id}")
// public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
// if (!donationRepo.existsById(id)) {
// return ResponseEntity.notFound().build();
// }
// donationRepo.deleteById(id);
// return ResponseEntity.noContent().build();
// }
//
// // ✅ Filter donations by city and/or condition
// @GetMapping("/filter")
// public List<Donation> filterDonations(
// @RequestParam(required = false) String city,
// @RequestParam(required = false) String overallCondition
// ) {
// if (city != null && overallCondition != null) {
// return donationRepo.findByCityIgnoreCaseAndOverallConditionIgnoreCase(city,
// overallCondition);
// } else if (city != null) {
// return donationRepo.findByCityIgnoreCase(city);
// } else if (overallCondition != null) {
// return donationRepo.findByOverallConditionIgnoreCase(overallCondition);
// } else {
// return donationRepo.findAll();
// }
// }
// }
//
//
//
