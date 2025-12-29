package com.event.controller.Admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.event.service.CloudinaryService;
import com.event.service.EmailService;
import com.event.dto.UserAddDTO;
import com.event.model.Partner;
import com.event.repository.PartnerRepo;

@RequestMapping("admin/partners")
@RestController
public class PartnerController {
	
	
	@Autowired
	private PartnerRepo partnerRepo;
	    
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private EmailService emailService;
	  
	@GetMapping
	public List<UserAddDTO> listPartners() {
	    List<Partner> partners = partnerRepo.findAll();
	    return partners.stream().map(partner -> {
	    	
	        UserAddDTO dto = new UserAddDTO();
	        dto.setUser_id(partner.getUser_id());
	        dto.setFullname(partner.getFullname());
	        dto.setEmail(partner.getEmail());
	        dto.setPhoneNumber(partner.getPhoneNumber());
	        dto.setRole(partner.getRole());
	        dto.setCompany(partner.getCompany());
	        dto.setPanCard(partner.getPanCard());
	        dto.setBusinessTranscripts(partner.getBusinessTranscripts());
	        dto.setJoinDate(partner.getJoinDate());
	        dto.setStatus(partner.getStatus());
	        return dto;
	    }).collect(Collectors.toList());
	    
	    
	}

//	    
//	@PostMapping("/new")
//	public ResponseEntity<String> savePartner(@RequestBody Partner partner) {
//	    try {
//	        // Encode the password before saving
//	        String encodedPassword = passwordEncoder.encode(partner.getPassword());
//	        partner.setPassword(encodedPassword);
//	        
//
//	        partnerRepo.save(partner);
//	        return ResponseEntity.ok("Partner added successfully");
//	    } catch (Exception e) {
//	        return ResponseEntity.status(500).body("Error adding partner: " + e.getMessage());
//	    }
//	}
	
	@PostMapping("/new")
	public ResponseEntity<?> savePartner(
	        @ModelAttribute Partner partner,
	        @RequestParam("panCardImage") MultipartFile panCardImage,
	        @RequestParam("businessTranscriptsImage") MultipartFile businessTranscriptsImage) {

	    try {

	        // 1️⃣ Upload panCardImage
	        if (panCardImage != null && !panCardImage.isEmpty()) {
	            String uploadedUrl = cloudinaryService.uploadFile(panCardImage, "partner/panCard");
	            partner.setPanCard(uploadedUrl);
	        }

	        // 2️⃣ Upload Business Transcript
	        if (businessTranscriptsImage != null && !businessTranscriptsImage.isEmpty()) {
	            String uploadedUrl = cloudinaryService.uploadFile(businessTranscriptsImage, "partner/businessTranscripts");
	            partner.setbusinessTranscripts(uploadedUrl);
	        }

	        // 3️⃣ Encrypt Password
	        String encodedPassword = passwordEncoder.encode(partner.getPassword());
	        partner.setPassword(encodedPassword);

	        // 4️⃣ Save Partner
	        partnerRepo.save(partner);
	        
	

	        return ResponseEntity.ok("Partner registered successfully");

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("Error adding partner: " + e.getMessage());
	    }
	}

	
	@PutMapping("/approve/{userId}")
	public ResponseEntity<?> approvePartner(@PathVariable Long userId) {
	    try {
	        Optional<Partner> partnerOpt = partnerRepo.findById(userId); // make sure ID matches Partner entity
	        if (partnerOpt.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body("Partner not found with id: " + userId);
	        }

	        Partner partner = partnerOpt.get();
	        partner.setStatus("Verified"); // use 'Verified' if that’s what frontend expects
	        partnerRepo.save(partner);
	        
	        try {
	            String email = partner.getEmail();
	            if (email != null && !email.isBlank()) {
	                String subject = "NGO Partner Approval Notification";
	                String message = "Hello " + partner.getFullname() + ",\n\n" +
	                                 "Congratulations! Your submission to become an NGO partner with us has been accepted. " +
	                                 "You are now a verified partner.\n\n" +
	                                 "Thank you for joining our community.\n\n" +
	                                 "Best regards,\nYour Organization Name";

	                emailService.sendEmail(email, subject, message);
	            }
	        } catch (Exception emailEx) {
	            System.err.println("❌ Error sending approval email: " + emailEx.getMessage());
	            emailEx.printStackTrace();
	        }

	        return ResponseEntity.ok().body(partner); // return the updated partner
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Error approving partner: " + e.getMessage());
	    }
	}


	    
	    @DeleteMapping("/delete/{userId}")
	    public ResponseEntity<Void> deletePartner(@PathVariable Long userId) {
	        if ( partnerRepo.existsById(userId)) {
	        	 partnerRepo.deleteById(userId);
	            return ResponseEntity.noContent().build();
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    }
	    
	    @GetMapping("/{userId}")
	    public ResponseEntity<UserAddDTO> getPartnerById(@PathVariable Long userId) {
	        Optional<Partner> partnerOpt = partnerRepo.findById(userId);
	        if (partnerOpt.isPresent()) {
	            Partner partner = partnerOpt.get();
	            UserAddDTO dto = new UserAddDTO();
	            dto.setUser_id(partner.getUser_id());
	            dto.setFullname(partner.getFullname());
	            dto.setEmail(partner.getEmail());
	            dto.setPhoneNumber(partner.getPhoneNumber());
	            dto.setRole(partner.getRole());
	            dto.setCompany(partner.getCompany());
	            dto.setPanCard(partner.getPanCard());
	            dto.setBusinessTranscripts(partner.getBusinessTranscripts());
	            dto.setStatus(partner.getStatus());
	            return ResponseEntity.ok(dto);
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    }

	    // Update partner by ID
	    @PutMapping("/edit/{userId}")
	    public ResponseEntity<UserAddDTO> editPartner(
	            @PathVariable Long userId,
	            @RequestBody UserAddDTO userAddDTO
	    ) {
	        Optional<Partner> partnerOpt = partnerRepo.findById(userId);
	        if (!partnerOpt.isPresent()) {
	            return ResponseEntity.notFound().build();
	        }

	        Partner partner = partnerOpt.get();
	        partner.setFullname(userAddDTO.getFullname());
	        partner.setEmail(userAddDTO.getEmail());
	        partner.setPhoneNumber(userAddDTO.getPhoneNumber());
	        partner.setRole(userAddDTO.getRole());
	        partner.setCompany(userAddDTO.getCompany());
	        partner.setPanCard(userAddDTO.getPanCard());
	        partner.setBusinessTranscripts(userAddDTO.getBusinessTranscripts());

	        Partner updated = partnerRepo.save(partner);

	        UserAddDTO dto = new UserAddDTO();
	        dto.setUser_id(updated.getUser_id());
	        dto.setFullname(updated.getFullname());
	        dto.setEmail(updated.getEmail());
	        dto.setPhoneNumber(updated.getPhoneNumber());
	        dto.setRole(updated.getRole());
	        dto.setCompany(updated.getCompany());
	        dto.setPanCard(updated.getPanCard());
	        dto.setBusinessTranscripts(updated.getBusinessTranscripts());

	        return ResponseEntity.ok(dto);
	    }

	 
	    
}
	

