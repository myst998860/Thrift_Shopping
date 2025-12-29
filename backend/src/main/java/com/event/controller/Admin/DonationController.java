package com.event.controller.Admin;

import java.util.List;
<<<<<<< Updated upstream
=======
import java.util.Map;
>>>>>>> Stashed changes
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.event.model.Donation;
<<<<<<< Updated upstream
import com.event.repository.DonationRepo;
=======
import com.event.model.Program;
import com.event.repository.DonationRepo;
import com.event.repository.ProgramRepo;
import com.event.service.EmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

>>>>>>> Stashed changes

@RequestMapping("/donations")
@RestController
public class DonationController {

    @Autowired
    private DonationRepo donationRepo;

<<<<<<< Updated upstream
    // ✅ Get all donations
    @GetMapping
    public List<Donation> getAllDonations() {
        return donationRepo.findAll();
    }

    // ✅ Get a single donation by ID
=======
    @Autowired
    private ProgramRepo programRepo; // ✅ Needed to link donations to programs

    @Autowired
    private EmailService emailService;

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
                // Fetch all programs for this partner
                List<Program> partnerPrograms = programRepo.findAll().stream()
                        .filter(p -> p.getPartner() != null && p.getPartner().getUser_id().equals(userId))
                        .collect(Collectors.toList());

                // Fetch donations linked to these programs
                return donationRepo.findAll().stream()
                        .filter(d -> d.getProgram() != null && partnerPrograms.contains(d.getProgram()))
                        .collect(Collectors.toList());
            }

            return donationRepo.findAll(); // Admin / public view
        } catch (Exception e) {
            return donationRepo.findAll(); // fallback
        }
    }



//     @GetMapping
// public List<Donation> getAllDonations() {
//     Pageable firstFive = PageRequest.of(0, 1); // first page, 5 records
//     Page<Donation> page = donationRepo.findAll(firstFive); // use pageable version
//     return page.getContent(); // get List<Donation>
// }
    // ---------------- GET DONATION BY ID ----------------
>>>>>>> Stashed changes
    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        return donationRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

<<<<<<< Updated upstream
    // ✅ Create a new donation (public endpoint for donors)
    @PostMapping("/new")
    public Donation createDonation(@RequestBody Donation donation) {
        return donationRepo.save(donation);
    }

    // ✅ Admin can manually add a donation record
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public Donation addDonationByAdmin(@RequestBody Donation donation) {
        return donationRepo.save(donation);
    }

    // ✅ Update existing donation
    @PutMapping("/edit/{id}")
    public ResponseEntity<Donation> updateDonation(
            @PathVariable Long id,
            @RequestBody Donation updatedDonation
    ) {
        return donationRepo.findById(id)
                .map(existing -> {
=======
    // ---------------- CREATE NEW DONATION ----------------
//    @PostMapping("/new")
//    public Donation createDonation(@RequestBody Donation donation) {
//        // If the donation has a programId, fetch the Program and link it
//        if (donation.getProgram() != null && donation.getProgram().getProgramId() != null) {
//            Long programId = donation.getProgram().getProgramId();
//            Program program = programRepo.findById(programId).orElse(null);
//            if (program != null) {
//                donation.setProgram(program);
//            }
//        }

//        Donation savedDonation = donationRepo.save(donation);

//        // Send emails after saving donation
//        emailService.sendDonationEmails(savedDonation);

//        return savedDonation;
//    }
   @PostMapping("/new")
   public Donation createDonation(@RequestBody Donation donation) {
       // Link program if provided
       if (donation.getProgram() != null && donation.getProgram().getProgramId() != null) {
           Long programId = donation.getProgram().getProgramId();
           Program program = programRepo.findById(programId).orElse(null);
           if (program != null) {
               donation.setProgram(program);
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

       return savedDonation;
   }

    // @PostMapping("/new")
    // public Donation createDonation(@RequestBody Donation donation) {
    //     try {
    //         ObjectMapper mapper = new ObjectMapper();
    //         String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(donation);
    //         System.out.println("=== RAW JSON FROM FRONTEND (after binding) ===");
    //         System.out.println(json);
    //         System.out.println("==============================================");
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }

    //     Donation savedDonation = donationRepo.save(donation);
    //     return savedDonation;
    // }

   // CHANGE STATUS
   @PutMapping("/{id}/status/{status}")
   public ResponseEntity<?> updateDonationStatus(
           @PathVariable Long id,
           @PathVariable String status
   ) {

       Donation donation = donationRepo.findById(id)
               .orElseThrow(() -> new RuntimeException("Donation not found"));

       // update status
       donation.setStatus(status.toLowerCase());
       donationRepo.save(donation);

       // send email
       String email = donation.getEmail();
       if (email != null && !email.isBlank()) {

           switch (status.toLowerCase()) {
               case "confirmed":
                   emailService.sendEmail(
                           email,
                           "Donation Confirmed",
                           "Hello " + donation.getFullName() + ",\n\nYour donation has been confirmed."
                   );
                   break;

               case "pickedup":
               case "picked_up":
                   emailService.sendEmail(
                           email,
                           "Donation Picked Up",
                           "Hello " + donation.getFullName() + ",\n\nYour donation was picked up."
                   );
                   break;

               case "delivered":
                   emailService.sendEmail(
                           email,
                           "Donation Delivered",
                           "Hello " + donation.getFullName() + ",\n\nYour donated items were delivered."
                   );
                   break;

               case "cancelled":
               case "canceled":
                   emailService.sendEmail(
                           email,
                           "Donation Cancelled",
                           "Hello " + donation.getFullName() + ",\n\nYour donation was cancelled."
                   );
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
                    Donation saved = donationRepo.save(existing);
=======
                    // ✅ Update program link if provided
                    if (programId != null) {
                        Program program = programRepo.findById(programId).orElse(null);
                        existing.setProgram(program);
                    }

                    Donation saved = donationRepo.save(existing);
//                    
//                    try {
//                        String newStatus = updatedDonation.getStatus();   // ✅ FIXED
//
//                        String email = saved.getEmail();
//                        if (email != null && !email.isBlank() && newStatus != null) {
//
//                            switch (newStatus.toLowerCase()) {
//
//                                case "confirmed":
//                                    emailService.sendEmail(
//                                            email,
//                                            "Donation Confirmed",
//                                            "Hello " + saved.getFullName() +
//                                            ",\n\nYour donation request has been confirmed. Thank you!"
//                                    );
//                                    break;
//
//                                case "pickedup":
//                                case "picked_up":
//                                    emailService.sendEmail(
//                                            email,
//                                            "Donation Picked Up",
//                                            "Hello " + saved.getFullName() +
//                                            ",\n\nYour donation has been successfully picked up!"
//                                    );
//                                    break;
//
//                                case "delivered":
//                                    emailService.sendEmail(
//                                            email,
//                                            "Donation Delivered",
//                                            "Hello " + saved.getFullName() +
//                                            ",\n\nYour donated items have been delivered. Thank you for helping!"
//                                    );
//                                    break;
//
//                                case "cancelled":
//                                case "canceled":
//                                    emailService.sendEmail(
//                                            email,
//                                            "Donation Cancelled",
//                                            "Hello " + saved.getFullName() +
//                                            ",\n\nYour donation request has been cancelled."
//                                    );
//                                    break;
//
//                                default:
//                                    // no email for other statuses
//                                    break;
//                            }
//                        }
//                    } catch (Exception e) {
//                        System.err.println("❌ Error sending status update email: " + e.getMessage());
//                    }
>>>>>>> Stashed changes
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

<<<<<<< Updated upstream
    // ✅ Delete donation by ID
=======
    // ---------------- DELETE DONATION ----------------
>>>>>>> Stashed changes
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        if (!donationRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        donationRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

<<<<<<< Updated upstream
    // ✅ Filter donations by city and/or condition
    @GetMapping("/filter")
    public List<Donation> filterDonations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String overallCondition
    ) {
=======
    // ---------------- FILTER DONATIONS ----------------
    @GetMapping("/filter")
    public List<Donation> filterDonations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String overallCondition) {

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}
=======

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
                "totalDonations", totalDonations
        ));
    }
}


//package com.event.controller.Admin;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import com.event.model.Donation;
//import com.event.repository.DonationRepo;
//import com.event.service.EmailService;
//
//@RequestMapping("/donations")
//@RestController
//public class DonationController {
//
//    @Autowired
//    private DonationRepo donationRepo;
//
//    @Autowired
//    private EmailService emailService; // ✅ Inject EmailService
//
//    // ✅ Get all donations
//    @GetMapping
//    public List<Donation> getAllDonations() {
//        return donationRepo.findAll();
//    }
//
//    // ✅ Get a single donation by ID
//    @GetMapping("/{id}")
//    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
//        return donationRepo.findById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    // ✅ Create a new donation (public endpoint for donors)
//    @PostMapping("/new")
//    public Donation createDonation(@RequestBody Donation donation) {
//        Donation savedDonation = donationRepo.save(donation);
//
//        // ✅ Send emails after saving donation
//        emailService.sendDonationEmails(savedDonation);
//
//        return savedDonation;
//    }
//
//    // ✅ Admin can manually add a donation record
//    @PostMapping("/add")
//    @PreAuthorize("hasRole('ADMIN')")
//    public Donation addDonationByAdmin(@RequestBody Donation donation) {
//        return donationRepo.save(donation);
//    }
//
//    // ✅ Update existing donation
//    @PutMapping("/edit/{id}")
//    public ResponseEntity<Donation> updateDonation(
//            @PathVariable Long id,
//            @RequestBody Donation updatedDonation
//    ) {
//        return donationRepo.findById(id)
//                .map(existing -> {
//                    existing.setFullName(updatedDonation.getFullName());
//                    existing.setEmail(updatedDonation.getEmail());
//                    existing.setPhoneNumber(updatedDonation.getPhoneNumber());
//                    existing.setStreetAddress(updatedDonation.getStreetAddress());
//                    existing.setCity(updatedDonation.getCity());
//                    existing.setZipCode(updatedDonation.getZipCode());
//                    existing.setShirtsAndTops(updatedDonation.isShirtsAndTops());
//                    existing.setDressesAndSkirts(updatedDonation.isDressesAndSkirts());
//                    existing.setShoes(updatedDonation.isShoes());
//                    existing.setPantsAndJeans(updatedDonation.isPantsAndJeans());
//                    existing.setJacketsAndCoats(updatedDonation.isJacketsAndCoats());
//                    existing.setAccessories(updatedDonation.isAccessories());
//                    existing.setChildrensClothing(updatedDonation.isChildrensClothing());
//                    existing.setUndergarments(updatedDonation.isUndergarments());
//                    existing.setEstimatedQuantity(updatedDonation.getEstimatedQuantity());
//                    existing.setOverallCondition(updatedDonation.getOverallCondition());
//                    existing.setDescription(updatedDonation.getDescription());
//                    existing.setPreferredPickupDate(updatedDonation.getPreferredPickupDate());
//                    existing.setPickupInstructions(updatedDonation.getPickupInstructions());
//
//                    Donation saved = donationRepo.save(existing);
//                    return ResponseEntity.ok(saved);
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    // ✅ Delete donation by ID
//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
//        if (!donationRepo.existsById(id)) {
//            return ResponseEntity.notFound().build();
//        }
//        donationRepo.deleteById(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    // ✅ Filter donations by city and/or condition
//    @GetMapping("/filter")
//    public List<Donation> filterDonations(
//            @RequestParam(required = false) String city,
//            @RequestParam(required = false) String overallCondition
//    ) {
//        if (city != null && overallCondition != null) {
//            return donationRepo.findByCityIgnoreCaseAndOverallConditionIgnoreCase(city, overallCondition);
//        } else if (city != null) {
//            return donationRepo.findByCityIgnoreCase(city);
//        } else if (overallCondition != null) {
//            return donationRepo.findByOverallConditionIgnoreCase(overallCondition);
//        } else {
//            return donationRepo.findAll();
//        }
//    }
//}
//
//
//
>>>>>>> Stashed changes
