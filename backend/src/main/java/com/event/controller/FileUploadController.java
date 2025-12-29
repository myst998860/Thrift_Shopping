package com.event.controller;

import com.event.model.Program;
import com.event.model.Venue;
import com.event.model.User;
import com.event.repository.ProgramRepo;
import com.event.repository.VenueRepo;
import com.event.repository.UserRepo;
import com.event.service.CloudinaryService;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProgramRepo programRepo;

    @Autowired
    private VenueRepo venueRepo;

    @Autowired
    private UserRepo userRepo;

    // ---------------- Upload Program Image ----------------
    @PostMapping("/program/{programId}")
    public ResponseEntity<?> uploadProgramImage(
            @PathVariable Long programId,
            @RequestParam("file") MultipartFile file) {
        try {
            Program program = programRepo.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Program not found"));
            
            String imageUrl = cloudinaryService.uploadProgramImage(file);
            program.setProgramImage(imageUrl);
            programRepo.save(program);

            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload program image");
        }
    }
    
    

    // ---------------- Upload Venue Image ----------------
    @PostMapping("/venue/{venueId}")
    public ResponseEntity<?> uploadVenueImage(
            @PathVariable Long venueId,
            @RequestParam("files") MultipartFile[] files) { // accept multiple files
        try {
            Venue venue = venueRepo.findById(venueId)
                    .orElseThrow(() -> new RuntimeException("Venue not found"));

            if (files != null && files.length > 0) {
                List<String> uploadedUrls = new ArrayList<>();
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String uploadedUrl = cloudinaryService.uploadFile(file, "venues"); // upload each file
                        uploadedUrls.add(uploadedUrl);
                    }
                }

                // Add to existing images if needed
                List<String> existingImages = venue.getImageUrls();
                if (existingImages == null) existingImages = new ArrayList<>();
                existingImages.addAll(uploadedUrls);
                venue.setImageUrls(existingImages);

                venueRepo.save(venue);
                return ResponseEntity.ok(uploadedUrls);
            } else {
                return ResponseEntity.badRequest().body("No files provided");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload venue image");
        }
    }

    // ---------------- Upload User Document ----------------
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> uploadUserDocument(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String fileUrl = cloudinaryService.uploadUserDocument(file);
            // Example: saving to PAN card field, adjust as needed
            user.setPanCard(fileUrl);
            userRepo.save(user);

            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload user document");
        }
    }
}
