package com.event.controller.Admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.event.dto.VenueDTO;
import com.event.model.Partner;
import com.event.model.Venue;
import com.event.repository.PartnerRepo;
import com.event.repository.VenueRepo;
import com.event.service.CloudinaryService;
import java.io.IOException;

@RequestMapping("/venues")
@RestController
public class VenueController {

    @Autowired
    private VenueRepo venueRepo;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PartnerRepo partnerRepo;

    @GetMapping
    public List<VenueDTO> getVenues(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            boolean isPartner = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_PARTNER"));

            if (isPartner) {
                Partner partner = partnerRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Partner not found"));
                return venueRepo.findByPartner(partner).stream()
                        .map(VenueDTO::fromVenue)
                        .peek(dto -> {
                            dto.setPartnerId(partner.getUser_id());
                            dto.setCategory(partner.getVenues().stream()
                                    .filter(v -> v.getVenue_id().equals(dto.getVenue_id()))
                                    .map(Venue::getCategory)
                                    .findFirst().orElse(null));
                        })
                        .collect(Collectors.toList());
            }
        }

        return venueRepo.findAll().stream()
                .map(VenueDTO::fromVenue)
                .peek(dto -> {
                    Partner partner = venueRepo.findById(dto.getVenue_id())
                            .map(Venue::getPartner)
                            .orElse(null);
                    if (partner != null) {
                        dto.setPartnerId(partner.getUser_id());
                        dto.setCategory(venueRepo.findById(dto.getVenue_id())
                                .map(Venue::getCategory)
                                .orElse(null));
                    }
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/new")
    public Venue saveVenue(@RequestBody Venue venue, Authentication authentication) {
        String email = authentication.getName();
        Partner partner = partnerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        venue.setPartner(partner);
        partner.getVenues().add(venue);
        return venueRepo.save(venue);
    }

    // @PostMapping("/add")
    // @PreAuthorize("hasRole('ADMIN')")
    // public ResponseEntity<?> addVenueByAdmin(
    // @RequestPart("venue") VenueDTO request,
    // @RequestPart(value = "file", required = false) MultipartFile file) throws
    // java.io.IOException {
    //
    // try {
    // Venue venue = new Venue();
    // venue.setVenueName(request.getVenueName());
    // venue.setLocation(request.getLocation());
    // venue.setMapLocationUrl(request.getMapLocationUrl());
    // venue.setPrice(request.getPrice());
    // venue.setMinBookingHours(request.getMinBookingHours());
    // venue.setBrand(request.getBrand());
    // venue.setSize(request.getSize());
    // venue.setQuality(request.getQuality());
    // venue.setOpeningTime(request.getOpeningTime());
    // venue.setClosingTime(request.getClosingTime());
    // venue.setDescription(request.getDescription());
    // venue.setAmenities(request.getAmenities());
    // venue.setStatus(request.getStatus());
    // venue.setCategory(request.getCategory());
    //
    // // 1️⃣ Upload file to Cloudinary if present
    // if (file != null && !file.isEmpty()) {
    // System.out.println("Uploading file: " + file.getOriginalFilename() + ", size:
    // " + file.getSize());
    // String uploadedUrl = cloudinaryService.uploadFile(file, "venues"); // folder
    // "venues"
    // System.out.println("Uploaded URL: " + uploadedUrl);
    // venue.setImageUrl(uploadedUrl);
    // }
    //
    // // 2️⃣ Save Venue
    // Venue saved = venueRepo.save(venue);
    //
    // // 3️⃣ Return response
    // Map<String, Object> response = new HashMap<>();
    // response.put("venue", saved);
    // return ResponseEntity.ok(response);
    //
    // } catch (IOException e) {
    // e.printStackTrace();
    // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    // .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
    // }
    // }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addVenueByAdmin(
            @RequestPart("venue") VenueDTO request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        try {
            Venue venue = new Venue();
            venue.setVenueName(request.getVenueName());
            venue.setLocation(request.getLocation());
            venue.setMapLocationUrl(request.getMapLocationUrl());
            venue.setPrice(request.getPrice());
            venue.setMinBookingHours(request.getMinBookingHours());
            venue.setBrand(request.getBrand());
            venue.setSize(request.getSize());
            venue.setQuality(request.getQuality());
            venue.setOpeningTime(request.getOpeningTime());
            venue.setClosingTime(request.getClosingTime());
            venue.setDescription(request.getDescription());
            venue.setAmenities(request.getAmenities());
            venue.setStatus(request.getStatus());
            venue.setCategory(request.getCategory());

            if (files != null && files.length > 0) {
                List<String> uploadedUrls = new ArrayList<>();
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String uploadedUrl = cloudinaryService.uploadFile(file, "venues");
                        uploadedUrls.add(uploadedUrl);
                    }
                }
                venue.setImageUrls(uploadedUrls);
            }

            Venue saved = venueRepo.save(venue);
            Map<String, Object> response = new HashMap<>();
            response.put("venue", saved);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Something went wrong: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDTO> getVenue(@PathVariable Long id) {
        return venueRepo.findById(id)
                .map(venue -> {
                    VenueDTO dto = VenueDTO.fromVenue(venue);
                    dto.setPartnerId(venue.getPartner() != null ? venue.getPartner().getUser_id() : null);
                    dto.setCategory(venue.getCategory()); // Set category
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueDTO> updateVenue(
            @PathVariable Long id,
            @RequestPart("venue") VenueDTO payload,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return venueRepo.findById(id)
                .map(existing -> {
                    existing.setVenueName(payload.getVenueName());
                    existing.setLocation(payload.getLocation());
                    existing.setMapLocationUrl(payload.getMapLocationUrl());
                    existing.setPrice(payload.getPrice());
                    existing.setMinBookingHours(payload.getMinBookingHours());
                    existing.setBrand(payload.getBrand());
                    existing.setSize(payload.getSize());
                    existing.setQuality(payload.getQuality());
                    existing.setOpeningTime(payload.getOpeningTime());
                    existing.setClosingTime(payload.getClosingTime());
                    existing.setDescription(payload.getDescription());
                    existing.setAmenities(payload.getAmenities());
                    existing.setStatus(payload.getStatus());
                    existing.setCategory(payload.getCategory());
                    // 1. Get the list of images the user wants to keep/manage (from payload)
                    List<String> updatedImageUrls = new ArrayList<>();
                    if (payload.getImageUrls() != null) {
                        updatedImageUrls.addAll(payload.getImageUrls());
                    }

                    // 2. Handle new image uploads and add them to the list
                    if (files != null && files.length > 0) {
                        for (MultipartFile file : files) {
                            if (!file.isEmpty()) {
                                try {
                                    String uploadedUrl = cloudinaryService.uploadFile(file, "venues");
                                    updatedImageUrls.add(uploadedUrl);
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                            }
                        }
                    }

                    // 3. Update the entity
                    existing.setImageUrls(updatedImageUrls);

                    Venue saved = venueRepo.save(existing);
                    VenueDTO dto = VenueDTO.fromVenue(saved);
                    dto.setPartnerId(saved.getPartner() != null ? saved.getPartner().getUser_id() : null);
                    dto.setCategory(saved.getCategory());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter")
    public List<VenueDTO> filterVenues(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {
        List<Venue> venues;

        if (category != null && location != null) {
            venues = venueRepo.findByCategoryIgnoreCase(category);
        } else if (category != null) {
            venues = venueRepo.findByCategoryIgnoreCase(category);

        } else {
            venues = venueRepo.findAll();
        }

        return venues.stream()
                .map(VenueDTO::fromVenue)
                .peek(dto -> dto.setCategory(
                        venueRepo.findById(dto.getVenue_id())
                                .map(Venue::getCategory)
                                .orElse(null)))
                .collect(Collectors.toList());
    }
}
