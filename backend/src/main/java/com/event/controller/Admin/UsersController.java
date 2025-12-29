package com.event.controller.Admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.event.dto.UserAddDTO;
import com.event.dto.UserLocationDTO;
import com.event.model.Admin;
import com.event.model.Attendee;
import com.event.model.Partner;
import com.event.model.User;

import com.event.repository.UserRepo;

@RestController
@RequestMapping("/admin/users")
public class UsersController {

    @Autowired
    private UserRepo userRepo;
    
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/new")
    public ResponseEntity<UserAddDTO> saveUser(@RequestBody UserAddDTO dto) {
        User user;

        switch (dto.getRole().toUpperCase()) {
            case "PARTNER":
                Partner partner = new Partner();
                partner.setCompany(dto.getCompany());
                user = partner;
                break;
            case "ADMIN":
                user = new Admin();
                break;
            case "ATTENDEE":
                user = new Attendee();
                break;
            default:
                return ResponseEntity.badRequest().build(); 
        }

        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setFullname(dto.getFullname());
        user.setLocation(dto.getLocation());
        user.setRole(dto.getRole().toUpperCase());
        user.setJoinDate(LocalDateTime.now());
        user.setStatus(dto.getStatus());
        

        User saved = userRepo.save(user);

        // Map saved user entity back to DTO
        UserAddDTO responseDto = new UserAddDTO();
        responseDto.setUser_id(saved.getUser_id());  // assuming you have this field
        responseDto.setFullname(saved.getFullname());
        responseDto.setEmail(saved.getEmail());
        responseDto.setLocation(saved.getLocation());
        responseDto.setPhoneNumber(saved.getPhoneNumber());
        responseDto.setRole(saved.getRole());
        responseDto.setJoinDate(saved.getJoinDate());
        responseDto.setStatus(saved.getStatus());

        if (saved instanceof Partner) {
            Partner savedPartner = (Partner) saved;
            responseDto.setCompany(savedPartner.getCompany());
            responseDto.setPanCard(savedPartner.getPanCard());  // if applicable
            responseDto.setBusinessTranscripts(savedPartner.getBusinessTranscripts()); // if applicable
        }

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public List<UserAddDTO> listUsers() {
        List<User> users = userRepo.findAll();
        List<UserAddDTO> dtos = users.stream().map(user -> {
            UserAddDTO dto = new UserAddDTO();
            dto.setUser_id(user.getUser_id());
            dto.setFullname(user.getFullname());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            dto.setJoinDate(user.getJoinDate()); 
            dto.setStatus(user.getStatus());
            

            if (user instanceof Partner) {
                Partner partner = (Partner) user;
                dto.setCompany(partner.getCompany());
                dto.setPanCard(partner.getPanCard());
                dto.setBusinessTranscripts(partner.getBusinessTranscripts());
            }

            return dto;
        }).collect(Collectors.toList());
        return dtos;
    }
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        if (userRepo.existsById(userId)) {
            userRepo.deleteById(userId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserAddDTO> getById(@PathVariable Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserAddDTO dto = new UserAddDTO();
            dto.setUser_id(user.getUser_id());
            dto.setFullname(user.getFullname());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            dto.setStatus(user.getStatus());

            if (user instanceof Partner) {
                Partner partner = (Partner) user;
                dto.setCompany(partner.getCompany());
                dto.setPanCard(partner.getPanCard());
                dto.setBusinessTranscripts(partner.getBusinessTranscripts());
            }

            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update user by ID
    @PutMapping("/edit/{userId}")
    public ResponseEntity<UserAddDTO> editUser(@PathVariable Long userId, @RequestBody UserAddDTO userAddDTO) {
        Optional<User> existingUserOpt = userRepo.findById(userId);
        if (!existingUserOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = existingUserOpt.get();
        existingUser.setFullname(userAddDTO.getFullname());
        existingUser.setEmail(userAddDTO.getEmail());
        existingUser.setLocation(userAddDTO.getLocation());
        existingUser.setPhoneNumber(userAddDTO.getPhoneNumber());
        existingUser.setRole(userAddDTO.getRole());
        existingUser.setStatus(userAddDTO.getStatus());

        if (existingUser instanceof Partner) {
            Partner partner = (Partner) existingUser;
            partner.setCompany(userAddDTO.getCompany());
            partner.setPanCard(userAddDTO.getPanCard());
            partner.setBusinessTranscripts(userAddDTO.getBusinessTranscripts());
        }

        User updatedUser = userRepo.save(existingUser);
        UserAddDTO updatedDTO = new UserAddDTO();
        updatedDTO.setUser_id(updatedUser.getUser_id());
        updatedDTO.setFullname(updatedUser.getFullname());
        updatedDTO.setEmail(updatedUser.getEmail());
        updatedDTO.setPhoneNumber(updatedUser.getPhoneNumber());
        updatedDTO.setRole(updatedUser.getRole());
        updatedDTO.setStatus(updatedUser.getStatus());

        if (updatedUser instanceof Partner) {
            Partner partner = (Partner) updatedUser;
            updatedDTO.setCompany(partner.getCompany());
            updatedDTO.setPanCard(partner.getPanCard());
            updatedDTO.setBusinessTranscripts(partner.getBusinessTranscripts());
        }

        return ResponseEntity.ok(updatedDTO);
    }
    
    @PutMapping("/update-location/{userId}")
    public ResponseEntity<?> updateLocation(@PathVariable Long userId, @RequestBody UserLocationDTO dto) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (!userOpt.isPresent()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setLocation(dto.getLocation());
        userRepo.save(user);

        return ResponseEntity.ok("Location updated");
    }
    
    
//    @GetMapping("/me")
//    public ResponseEntity<UserAddDTO> getCurrentUser(@AuthenticationPrincipal User currentUser) {
//        if (currentUser == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        UserAddDTO dto = new UserAddDTO();
//        dto.setUser_id(currentUser.getUser_id());
//        dto.setFullname(currentUser.getFullname());
//        dto.setEmail(currentUser.getEmail());
//        dto.setPhoneNumber(currentUser.getPhoneNumber());
//        dto.setRole(currentUser.getRole());
//        dto.setStatus(currentUser.getStatus());
//        dto.setLocation(currentUser.getLocation());
//
//        if (currentUser instanceof Partner) {
//            Partner partner = (Partner) currentUser;
//            dto.setCompany(partner.getCompany());
//            dto.setPanCard(partner.getPanCard());
//            dto.setBusinessTranscripts(partner.getBusinessTranscripts());
//        }
//
//        return ResponseEntity.ok(dto);
//    }
    


    
    @GetMapping("/users/me")
    public ResponseEntity<UserAddDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName(); // usually username/email
        Optional<User> userOpt = userRepo.findByEmail(email);

        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User currentUser = userOpt.get();
        UserAddDTO dto = new UserAddDTO();
        dto.setUser_id(currentUser.getUser_id());
        dto.setFullname(currentUser.getFullname());
        dto.setEmail(currentUser.getEmail());
        dto.setPhoneNumber(currentUser.getPhoneNumber());
        dto.setRole(currentUser.getRole());
        dto.setStatus(currentUser.getStatus());
        dto.setLocation(currentUser.getLocation());

        if (currentUser instanceof Partner) {
            Partner partner = (Partner) currentUser;
            dto.setCompany(partner.getCompany());
            dto.setPanCard(partner.getPanCard());
            dto.setBusinessTranscripts(partner.getBusinessTranscripts());
        }

        return ResponseEntity.ok(dto);
    }


}
        
        
    

    
 


