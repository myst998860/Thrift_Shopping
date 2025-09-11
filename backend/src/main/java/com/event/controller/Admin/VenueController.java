package com.event.controller.Admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.event.dto.VenueDTO;
import com.event.model.Partner;
import com.event.model.Venue;
import com.event.repository.PartnerRepo;
import com.event.repository.VenueRepo;

@RequestMapping("/venues")
@RestController
public class VenueController {

    @Autowired
    private VenueRepo venueRepo;

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

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public Venue addVenueByAdmin(@RequestBody VenueDTO request) {
        Partner partner = partnerRepo.findById(request.getPartnerId())
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        Venue venue = new Venue();
        venue.setVenueName(request.getVenueName());
        venue.setLocation(request.getLocation());
        venue.setMapLocationUrl(request.getMapLocationUrl());
        venue.setPrice(request.getPrice());
        venue.setMinBookingHours(request.getMinBookingHours());
        venue.setCapacity(request.getCapacity());
        venue.setOpeningTime(request.getOpeningTime());
        venue.setClosingTime(request.getClosingTime());
        venue.setDescription(request.getDescription());
        venue.setAmenities(request.getAmenities());
        venue.setStatus(request.getStatus());
        venue.setImageUrl(request.getImageUrl());
        venue.setCategory(request.getCategory()); // Set category
        venue.setPartner(partner);
        partner.getVenues().add(venue);
        return venueRepo.save(venue);
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

    @PutMapping("/edit/{id}")
    public ResponseEntity<VenueDTO> updateVenue(
            @PathVariable Long id,
            @RequestBody VenueDTO payload
    ) {
        return venueRepo.findById(id)
                .map(existing -> {
                    existing.setVenueName(payload.getVenueName());
                    existing.setLocation(payload.getLocation());
                    existing.setMapLocationUrl(payload.getMapLocationUrl());
                    existing.setPrice(payload.getPrice());
                    existing.setMinBookingHours(payload.getMinBookingHours());
                    existing.setCapacity(payload.getCapacity());
                    existing.setOpeningTime(payload.getOpeningTime());
                    existing.setClosingTime(payload.getClosingTime());
                    existing.setDescription(payload.getDescription());
                    existing.setAmenities(payload.getAmenities());
                    existing.setStatus(payload.getStatus());
                    existing.setImageUrl(payload.getImageUrl());
                    existing.setCategory(payload.getCategory()); // Set category

                    Venue saved = venueRepo.save(existing);
                    VenueDTO dto = VenueDTO.fromVenue(saved);
                    dto.setPartnerId(saved.getPartner() != null ? saved.getPartner().getUser_id() : null);
                    dto.setCategory(saved.getCategory()); // Set category
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter")
    public List<VenueDTO> filterVenues(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location
    ) {
        List<Venue> venues;

        if (category != null && location != null) {
            venues = venueRepo.findByCategoryIgnoreCaseAndLocationIgnoreCase(category, location);
        } else if (category != null) {
            venues = venueRepo.findByCategoryIgnoreCase(category);
        } else if (location != null) {
            venues = venueRepo.findByLocationIgnoreCase(location);
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
