package com.event.controller.Admin;

import com.event.model.Program;
import com.event.model.Partner;
import com.event.model.Donation;
import com.event.repository.ProgramRepo;
import com.event.service.CloudinaryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.event.repository.DonationRepo;
import com.event.repository.PartnerRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/programs")
@RestController
public class ProgramController {

    @Autowired
    private ProgramRepo programRepo;

    @Autowired
    private DonationRepo donationRepo;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PartnerRepo partnerRepo; // ✅ Added to fetch Partner

    // ---------------- GET ALL PROGRAMS ----------------
    @GetMapping
    public ResponseEntity<List<Program>> getAllPrograms(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(programRepo.findAll()); // Public view
        }

        try {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String role = jsonNode.has("role") ? jsonNode.get("role").asText() : null;
            Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : null;

            // Partner should only see their own programs
            if ("partner".equalsIgnoreCase(role) && userId != null) {
                List<Program> all = programRepo.findAll();
                List<Program> partnerPrograms = all.stream()
                        .filter(p -> p.getPartner() != null && p.getPartner().getUser_id().equals(userId))
                        .collect(Collectors.toList());
                return ResponseEntity.ok(partnerPrograms);
            }

            return ResponseEntity.ok(programRepo.findAll()); // Admin / public view
        } catch (Exception e) {
            return ResponseEntity.ok(programRepo.findAll()); // fallback
        }
    }


    // ---------------- GET PROGRAM BY ID WITH DONATION COUNT ----------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getProgramById(@PathVariable Long id) {
        Program program = programRepo.findById(id).orElse(null);
        if (program == null) {
            return ResponseEntity.notFound().build();
        }

        int totalDonations = donationRepo.findByProgram(program).size();

        return ResponseEntity.ok(Map.of(
                "program", program,
                "totalDonations", totalDonations));
    }
    
    @GetMapping("/partner/{partnerId}/count")
    public ResponseEntity<?> getProgramCount(@PathVariable Long partnerId) {
        Partner partner = partnerRepo.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        int count = programRepo.countByPartner(partner); // simple and reliable

        return ResponseEntity.ok(Map.of("count", count));
    }


    // ---------------- CREATE NEW PROGRAM ----------------
    @PostMapping("/add")
    @PreAuthorize("hasRole('PARTNER')")
    public ResponseEntity<?> createProgram(
            @ModelAttribute Program program,
            @RequestParam("file") MultipartFile file) {

        // 1️⃣ Partner validation
        if (program.getPartner() == null || program.getPartner().getUser_id() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Partner information missing. Include { 'partner': { 'user_id': X } } in your request."));
        }

        Long partnerId = program.getPartner().getUser_id();
        Partner partner = partnerRepo.findById(partnerId).orElse(null);
        if (partner == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Partner not found with ID " + partnerId));
        }
        program.setPartner(partner);

        // 2️⃣ Upload the file to Cloudinary
        if (file != null && !file.isEmpty()) {
            System.out.println("Uploading file: " + file.getOriginalFilename() + ", size: " + file.getSize());
            try {
                String uploadedUrl = cloudinaryService.uploadFile(file, "programs");
                System.out.println("Uploaded URL: " + uploadedUrl);

                // 3️⃣ Store the uploaded URL in program_image field
                program.setProgram_image(uploadedUrl);

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "error", "Failed to upload file " + file.getOriginalFilename() + ": " + e.getMessage()));
            }
        } else {
            System.out.println("No file uploaded");
        }

        // 4️⃣ Save Program to database
        Program saved = programRepo.save(program);

        // 5️⃣ Return response with uploaded file URL
        Map<String, Object> response = new HashMap<>();
        response.put("program", saved);

        return ResponseEntity.ok(response);
    }

    // ---------------- PARTNER ADD PROGRAM ----------------
    // @PostMapping("/add")
    // @PreAuthorize("hasRole('PARTNER')")
    // public ResponseEntity<?> addProgramByPartner(
    // @RequestBody Program program,
    // Authentication authentication) {

    // // ✅ Automatically get logged-in partner user
    // String partnerEmail = authentication.getName();
    // Partner partner = partnerRepo.findByEmail(partnerEmail)
    // .orElse(null);

    // if (partner == null) {
    // return ResponseEntity.badRequest().body(Map.of("error", "Partner not found
    // for email: " + partnerEmail));
    // }

    // program.setPartner(partner);
    // Program saved = programRepo.save(program);

    // return ResponseEntity.ok(saved);
    // }

    // ---------------- UPDATE PROGRAM ----------------
    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('PARTNER')")
    public ResponseEntity<Program> updateProgram(@PathVariable Long id,
            @RequestBody Program updatedProgram) {
        return programRepo.findById(id)
                .map(existing -> {
                    existing.setProgramTitle(updatedProgram.getProgramTitle());
                    existing.setDescription(updatedProgram.getDescription());
                    existing.setCategory(updatedProgram.getCategory());
                    existing.setProgramImage(updatedProgram.getProgramImage());
                    existing.setStartDate(updatedProgram.getStartDate());
                    existing.setEndDate(updatedProgram.getEndDate());
                    existing.setProgramLocation(updatedProgram.getProgramLocation());
                    existing.setTargetItemsToCollect(updatedProgram.getTargetItemsToCollect());
                    existing.setEstimatedBeneficiaries(updatedProgram.getEstimatedBeneficiaries());
                    existing.setProgramGoal(updatedProgram.getProgramGoal());
                    existing.setName(updatedProgram.getName());
                    existing.setRole(updatedProgram.getRole());
                    existing.setObjective(updatedProgram.getObjective());

                    Program saved = programRepo.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------- DELETE PROGRAM ----------------
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('PARTNER')")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        if (!programRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        programRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- FILTER PROGRAMS ----------------
    @GetMapping("/filter")
    public List<Program> filterPrograms(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String programLocation) {
        if (category != null && programLocation != null) {
            return programRepo.findByCategoryIgnoreCaseAndProgramLocationIgnoreCase(category, programLocation);
        } else if (category != null) {
            return programRepo.findByCategoryIgnoreCase(category);
        } else if (programLocation != null) {
            return programRepo.findByProgramLocationIgnoreCase(programLocation);
        } else {
            return programRepo.findAll();
        }
    }

    // ---------------- GET TOTAL DONATIONS FOR A PROGRAM ----------------
    @GetMapping("/{id}/donation-count")
    public ResponseEntity<?> getDonationCount(@PathVariable Long id) {
        Program program = programRepo.findById(id).orElse(null);
        if (program == null) {
            return ResponseEntity.notFound().build();
        }

        int totalDonations = donationRepo.findByProgram(program).size();
        return ResponseEntity.ok(Map.of(
                "programId", program.getProgramId(),
                "programTitle", program.getProgramTitle(),
                "totalDonations", totalDonations));
    }
}

// package com.event.controller.Admin;
//
// import com.event.model.Program;
// import com.event.repository.ProgramRepo;
//
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;
//
// import java.util.List;
//
// @RequestMapping("/programs")
// @RestController
// public class ProgramController {
//
// @Autowired
// private ProgramRepo programRepo;
//
// // ✅ Get all programs (public or admin)
// @GetMapping
// public List<Program> getAllPrograms() {
// return programRepo.findAll();
// }
//
// // ✅ Get a single program by ID
// @GetMapping("/{id}")
// public ResponseEntity<Program> getProgramById(@PathVariable Long id) {
// return programRepo.findById(id)
// .map(ResponseEntity::ok)
// .orElse(ResponseEntity.notFound().build());
// }
//
// // ✅ Public endpoint to create a program (optional: if donors create
// programs)
// @PostMapping("/new")
// public Program createProgram(@RequestBody Program program) {
// return programRepo.save(program);
// }
//
// // ✅ Admin can manually add a program
// @PostMapping("/add")
// @PreAuthorize("hasRole('PARTNER')")
// public Program addProgramByAdmin(@RequestBody Program program) {
// return programRepo.save(program);
// }
//
// // ✅ Update existing program
// @PutMapping("/edit/{id}")
// @PreAuthorize("hasRole('PARTNER')")
// public ResponseEntity<Program> updateProgram(
// @PathVariable Long id,
// @RequestBody Program updatedProgram
// ) {
// return programRepo.findById(id)
// .map(existing -> {
// existing.setProgramTitle(updatedProgram.getProgramTitle());
// existing.setDescription(updatedProgram.getDescription());
// existing.setCategory(updatedProgram.getCategory());
// existing.setProgramImage(updatedProgram.getProgramImage());
// existing.setStartDate(updatedProgram.getStartDate());
// existing.setEndDate(updatedProgram.getEndDate());
// existing.setProgramLocation(updatedProgram.getProgramLocation());
// existing.setTargetItemsToCollect(updatedProgram.getTargetItemsToCollect());
// existing.setEstimatedBeneficiaries(updatedProgram.getEstimatedBeneficiaries());
// existing.setProgramGoal(updatedProgram.getProgramGoal());
// existing.setName(updatedProgram.getName());
// existing.setRole(updatedProgram.getRole());
// existing.setObjective(updatedProgram.getObjective());
//
// Program saved = programRepo.save(existing);
// return ResponseEntity.ok(saved);
// })
// .orElse(ResponseEntity.notFound().build());
// }
//
// // ✅ Delete program by ID
// @DeleteMapping("/delete/{id}")
// @PreAuthorize("hasRole('PARTNER')")
// public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
// if (!programRepo.existsById(id)) {
// return ResponseEntity.notFound().build();
// }
// programRepo.deleteById(id);
// return ResponseEntity.noContent().build();
// }
//
// // ✅ Optional: filter programs by category or location
// @GetMapping("/filter")
// public List<Program> filterPrograms(
// @RequestParam(required = false) String category,
// @RequestParam(required = false) String programLocation
// ) {
// if (category != null && programLocation != null) {
// return
// programRepo.findByCategoryIgnoreCaseAndProgramLocationIgnoreCase(category,
// programLocation);
// } else if (category != null) {
// return programRepo.findByCategoryIgnoreCase(category);
// } else if (programLocation != null) {
// return programRepo.findByProgramLocationIgnoreCase(programLocation);
// } else {
// return programRepo.findAll();
// }
// }
// }
