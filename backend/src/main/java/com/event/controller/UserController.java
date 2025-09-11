package com.event.controller;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.event.dto.UserAddDTO;
import com.event.model.Admin;
import com.event.model.Partner;
import com.event.model.User;

import com.event.repository.UserRepo;

@RestController
@RequestMapping("/profile")
public class UserController {

    @Autowired private UserRepo userRepo;

    @GetMapping
    public ResponseEntity<UserAddDTO> getProfile(Authentication authentication) {
        String email = authentication.getName(); // Extracted from JWT
        Optional<User> userOpt = userRepo.findByEmail(email);

        return userOpt.map(user -> {
            UserAddDTO dto = new UserAddDTO();
            dto.setUser_id(user.getUser_id());
            dto.setFullname(user.getFullname());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            if (user instanceof Partner) {
                Partner p = (Partner) user;
                dto.setCompany(p.getCompany());
                dto.setPanCard(p.getPanCard());
                dto.setBusinessTranscripts(p.getBusinessTranscripts());
            }
            if (user instanceof Admin) {
            	Admin a = (Admin) user;
                dto.setFullname(a.getFullname());
                dto.setEmail(a.getEmail());
               
            }
            return ResponseEntity.ok(dto);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping
    public ResponseEntity<UserAddDTO> updateProfile(
            Authentication authentication,
            @RequestBody UserAddDTO userAddDTO) {

        String email = authentication.getName(); // Extracted from JWT
        Optional<User> userOpt = userRepo.findByEmail(email);

        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // Update common fields
        user.setFullname(userAddDTO.getFullname());
        user.setPhoneNumber(userAddDTO.getPhoneNumber());

        // Update partner-specific fields if user is a Partner
        if (user instanceof Partner) {
            Partner partner = (Partner) user;
            partner.setCompany(userAddDTO.getCompany());
            partner.setPanCard(userAddDTO.getPanCard());
            partner.setBusinessTranscripts(userAddDTO.getBusinessTranscripts());
        }

        userRepo.save(user);

        // Prepare response DTO
        UserAddDTO dto = new UserAddDTO();
        dto.setUser_id(user.getUser_id());
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        if (user instanceof Partner) {
            Partner partner = (Partner) user;
            dto.setCompany(partner.getCompany());
            dto.setPanCard(partner.getPanCard());
            dto.setBusinessTranscripts(partner.getBusinessTranscripts());
        }

        return ResponseEntity.ok(dto);
    }

    
}


