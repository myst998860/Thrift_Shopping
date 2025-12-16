package com.event.controller.Admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.event.model.Donation;
import com.event.repository.DonationRepo;

@RequestMapping("/donations")
@RestController
public class DonationController {

    @Autowired
    private DonationRepo donationRepo;

    // ✅ Get all donations
    @GetMapping
    public List<Donation> getAllDonations() {
        return donationRepo.findAll();
    }

    // ✅ Get a single donation by ID
    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        return donationRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

                    Donation saved = donationRepo.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete donation by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        if (!donationRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        donationRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Filter donations by city and/or condition
    @GetMapping("/filter")
    public List<Donation> filterDonations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String overallCondition
    ) {
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
}
